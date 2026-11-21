---
title: 企业级 RAG 实现详解
description: OcEasy（Onyx/Danswer）RAG 实现详解。
date: 2026-08-03 16:39:06
updated: 2026-08-03 16:39:06
image: # 图片
categories: [实战项目]
tags: [RAG]
---

### 项目概览与技术栈

**OcEasy** 是一个 AI 面试准备项目：把职位描述（JD）、个人经历、面试记录转成结构化准备计划、逼真模拟面试和可执行的复盘建议。它内置了一个完整的企业级 RAG 知识库（「面试知识库」），底层就是企业级的Onyx RAG 引擎。

| 组件      | 技术                                                        | 作用                                   |
| --------- | ----------------------------------------------------------- | -------------------------------------- |
| 后端      | Python 3.13 / FastAPI / SQLAlchemy / Celery                 | API、任务编排                          |
| 关系库    | PostgreSQL                                                  | 文档元数据、权限、索引状态（事实来源） |
| 向量库    | **OpenSearch**（kNN + BM25）                                | 混合检索的文档索引                     |
| 缓存/消息 | Redis                                                       | 查询嵌入缓存、Celery broker            |
| 文件存储  | MinIO / S3（blob）                                          | 上传文件的原始内容、图片               |
| LLM       | LiteLLM 多 provider（OpenAI/Anthropic/本地 model_server）   | 生成、Contextual RAG、查询扩展         |
| 嵌入模型  | 本地 model_server 或云端 API（OpenAI/Cohere/Voyage/Vertex） | chunk / query 向量化                   |

**几个关键目录**（均在 `backend/onyx/` 下）：

- `connectors/` — 从 40+ 外部系统（Notion、Confluence、Gmail、GitHub…）拉文档
- `indexing/` — 索引管道：chunker → embedder → 向量库写入
- `document_index/opensearch/` — OpenSearch 适配层、查询 DSL 构建、schema
- `context/search/` — 检索编排：pipeline、search_runner、filters
- `chat/` — 生成阶段：LLM 工具循环、上下文注入、引用处理、压缩
- `tools/tool_implementations/search/` — **`internal_search` 工具（检索的核心入口）**
- `secondary_llm_flows/` — 检索前后的小型 LLM 流程（查询扩展、文档筛选）
- `prompts/` — 所有提示词模板

### RAG完整请求流

![img](https://assets.yangzy.top/rag.webp)

> 索引阶段把海量文档切成带向量的 chunk 存进 OpenSearch；检索阶段把「一句话提问」变成「多路查询 → 混合检索 → LLM 精筛」；生成阶段让 LLM 自主决定何时检索，并把检索结果以带编号的 JSON 形式喂回去，最终产出带引用的回答。

### 阶段一：文档入库与索引构建

入口 `run_indexing_pipeline` → `index_doc_batch`（`indexing/indexing_pipeline.py:1267`），对一批文档依次执行。完整顺序：

```python
# indexing_pipeline.py:1314-1524（已简化）
filtered_docs, failures = filter_fnc(document_batch)          # 1. 过滤空/超长文档
filtered_docs = _apply_document_ingestion_hook(filtered_docs)  # 2. 可扩展的接入钩子
context = adapter.prepare(...)                                  # 3. 元数据入库（Postgres）
indexable_docs = process_image_sections(...)                    # 4. 图片 → LLM 视觉摘要
chunks = chunker.chunk(indexable_docs)                          # 5. 切块
if enable_contextual_rag:
    chunks = add_contextual_summaries(chunks, llm, ...)         # 6. Contextual RAG（可选）
with embed_and_stream(chunks, embedder, ...) as (result, store):# 7. 批量嵌入
    write_chunks_to_vector_db_with_backoff(document_index, ...) # 8. 写入 OpenSearch
    adapter.post_index(...)                                     # 9. 更新 chunk 计数/哈希
```

#### Document 预处理（进入切块前）

`filter_documents`（`indexing_pipeline.py:617`）在切块前做三道门槛：

1. **无标题无内容** → 跳过（否则没有可检索信息）。
2. **超长文档**（`MAX_DOCUMENT_CHARS`，默认 512MB 字符）→ 跳过并记录失败，防止后面内存爆掉。
3. **图片 section**（`process_image_sections`，`indexing_pipeline.py:723`）：用视觉 LLM 把图片转成文字摘要存进 `section.text`，这样图片内容也能被检索。

另外有一个**增量去重**机制 `get_docs_to_update`（`indexing_pipeline.py:339`），两道闸门：

- **时间戳闸门**：connector 给的 `doc_updated_at` 没推进 → 直接跳过（快路径）。
- **内容哈希闸门**：时间没变时算 `content_hash()` 比对库里存的哈希，相同则跳过。
- 只有真正变化的文档才走后面的切块+嵌入，极大节省算力。

每个 connector（Notion、Google Drive 等）会定期轮询——每次可能拉回几万个文档。但其中 95% 都没改动过。如果每个文档都重新走「切块 → 嵌入 → 写 OpenSearch」，浪费大量算力和 API 费用。所以需要一种方法快速判断"这个文档和上次索引时是否完全一样"。

**两道闸门如何协作**

对于 connector 拉回来的每一篇文档，依次经过两道检查：

                            ┌────────────────────┐
                              │   这个文档带了       │
                              │   doc_updated_at？  │
                              └────────┬───────────┘
                                       │
                          ┌────────────┼────────────┐
                          │ 没带        │            │ 带了
                          ▼             │            ▼
                     跳过闸门1          │   和数据库里旧的 doc_updated_at 比较
                     （往下走）          │
                                        │     ┌──────────┬──────────┐
                                        │     │ 新 > 旧   │ 新 ≤ 旧  │
                                        │     ▼           ▼
                                        │  "时间推进了"   "时间没变"
                                        │  认定有变化！   大概率没改
                                        │  直接排队重索引   直接跳过
                                        │  跳过闸门2       （0次哈希计算，
                                        │  （不算哈希）     最快路径）
                                        │
                    ┌───────────────────┘
                    ▼
            ┌───────────────┐
            │ 闸门 2：算哈希 │  ← 到这里的文档：要么没带时间戳，要么带时间戳但闸门1放行了
            │ content_hash() │
            └───────┬───────┘
                    │
         ┌──────────┼──────────┐
         │ 哈希和库里的相同     │ 哈希不同
         ▼                     ▼
      "内容确实没变"         "内容确实变了"
        跳过                 排队重索引

源码实现：

```python
for doc in documents:
    # 判断：新时间戳 > 数据库里存的旧时间戳？
    timestamp_advanced = (新时间戳 存在 and 旧时间戳 存在 and 新 > 旧)

    # 闸门1：有时间戳、时间没推进 → 跳过（0 次哈希计算，最快）
    if doc 有时间戳 and 时间没推进:
        continue  # ← 什么都不做，下一个文档

    # 闸门2：只在"时间戳没推进"或"根本没时间戳"时启用
    content_hash = doc.content_hash()                   # ← 算哈希
    if 时间没推进:
        if 数据库里的旧哈希 == content_hash:           # ← 比对
            continue  # ← 时间也说你没变，跳

    # 走到这里：时间戳或哈希说"变了" → 排队重索引
    updatable_docs.append(doc)
```

#### Chunk

切块不是把文章按字符数硬裁，而是一套**三层协作**的流程。

**三层结构总览**

```
Chunker                          (chunker.py:124)   ← 顶层编排，算 token 预算
  └─ DocumentChunker             (chunking/document_chunker.py:25)  ← 迭代 section，调度切块器
       ├─ TextChunker            (text_section_chunker.py:22)       ← 正文切块（最重要）
       ├─ ImageChunker           (image_section_chunker.py)         ← 图片 section
       └─ TabularChunker         (tabular_section_chunker)          ← CSV/表格 section
```

核心类 `Chunker`（`indexing/chunker.py:124`），用 `chonkie.SentenceChunker` 按**句子感知**的方式切块（不是硬切字符，避免把一句话拦腰斩断）。

**第一步：Chunker算预算**

拿到一个文档后，第一件事不是切，而是**算清楚有多少 token 配额分给正文**。这个决定直接影响最终的文本布局。

用一个具体例子——一篇 Notion 页面《Q3 销售总结》：

```
文档标题: "Q3 销售总结"
文档作者: "张三"
文档标签: ["销售", "Q3", "2025"]
正文 section1: "本季度整体营收增长 20%，其中..."  ← 这段有 300 token
正文 section2: "华东区表现突出，达成了..."       ← 这段有 400 token
正文 section3: "总结与展望如下..."               ← 这段有 180 token
```

运算过程（`_handle_single_document`）：

```
① 标题截断为 blurb（128 token）→ title_prefix = "Q3 销售总结\n\n"
   title_tokens = len(tokenizer("Q3 销售总结\n\n")) = 6

② 元数据拼成两版后缀（(chunker.py:209-219)）：
   metadata_suffix_semantic = "\nMetadata:\n\t作者 - 张三\n\t标签 - 销售, Q3, 2025"
   metadata_suffix_keyword  = "\n张三 销售 Q3 2025"  ← 只取值，没有键名
   metadata_tokens = 12

③ 是否启动 Contextual RAG？
   - 全文 token = 300+400+180 = 880
   - 880 + 6(title) + 12(metadata) = 898 > 512 ← 一整个 chunk 放不下，需要 Contextual RAG
   - context_size = DEFAULT_CONTEXTUAL_RAG_RESERVED_TOKENS = 128

④ content_token_limit = 512 - 6 - 12 - 128 = 366 token

⑤ 自我兜底检查：
   - 366 ≤ 256(CHUNK_MIN_CONTENT)？ 否，够用，通过
   - 如果不够 → 放弃 Contextual RAG，也不要元数据前缀
   - 最后手段 → content_token_limit 退回 512，什么都不要，只存裸正文
```

**第二步：`TextChunker` 切正文**

正文 section 不是每段独立切——**它有一个跨 section 累积器**，目的是尽量把相邻的小 section 拼进同一个 chunk，避免碎片化。

```
初始化: accumulator = ""（空缓冲）

处理 section1（300 token）:
  300 ≤ 366 → 放得下，accumulator = "本季度整体营收增长 20%，其中..."

处理 section2（400 token）:
  accumulator 已有 300 token + section2 有 400 token = 700 > 366
  → 放不下！先把 accumulator 吐出为一个 chunk：Chunk1 = "本季度整体营收..."
  → 然后 section2 自己有 400 > 366 → 超大！走 _handle_oversized_section

      处理超大 section2（_handle_oversized_section, line 82）：
        用 SentenceChunker 按句子感知把这 400 token 切分：
        → chunk2a = "华东区表现突出，达成了目标 A。"       (200 token)
        → chunk2b = "此外在 B 领域也取得突破。"           (190 token)
        每个子块成为一个独立的 ChunkPayload

处理 section3（180 token）:
  accumulator 现在是空的，180 ≤ 366 → accumulator = "总结与展望如下..."

最后 flush: 出来 → Chunk3 = "总结与展望如下..."
```

**关键机制——SentenceChunker**（来自 `chonkie` 库）：它不是按字符硬裁，而是按句子边界切——尽量在句号/换行处下刀。如果 `STRICT_CHUNK_TOKEN_LIMIT` 开启，切完后还超限的分片会被 `split_text_by_tokens` 强制硬裁（`text_section_chunker.py:93-107`）。

**第三步：`ChunkPayload` 升级为 `DocAwareChunk`（section_chunker.py:41-67）**

上面每个 `ChunkPayload(text, links, ...)` 在 `DocumentChunker.chunk`（document_chunker.py:68-79）里被升级成完整的 `DocAwareChunk`，这一行代码做的是把所有文档级别的信息**复制粘贴到每个 chunk 上**：

```python
# section_chunker.py:51-67（已简化）
return DocAwareChunk(
    content=self.text,                              # ← body 正文
    title_prefix="Q3 销售总结\n\n",                  # ← 每个 chunk 都带同样的标题
    metadata_suffix_semantic="\nMetadata:\n...",    # ← 每个 chunk 都带同样的元数据
    metadata_suffix_keyword="\n张三 销售 Q3 2025",  # ← 关键词版元数据
    blurb=extract_blurb(self.text),                 # ← 首 128 token 做预览
    source_links={0: "http://...", 200: "http://..."},  # ← 点击引用直达原文
    mini_chunk_texts=["华东区表现...", "此外在B领域..."],  # ← 15-token 微块
)
```

**第四步：存进 OpenSearch 时的最终拼装**

索引写到 `content` 字段的不是原始正文——`generate_enriched_content_for_chunk_embedding`（`document_index/chunk_content_enrichment.py:11`）把这四个部分**顺序拼接**：

```
┌──────────────┐ ┌─────────────┐ ┌──────────────────┐ ┌────────────────┐ ┌─────────────────────┐
│ title_prefix │ │ doc_summary │ │    content       │ │ chunk_context  │ │metadata_suffix_     │
│ Q3销售总结\n\n│ │ (整篇文档摘要)│ │ 华东区表现突出... │ │ (chunk所在段落)│ │ semantic/keyword   │
└──────────────┘ └─────────────┘ └──────────────────┘ └────────────────┘ └─────────────────────┘
    6 token         ~50 token          200 token          ~64 token            12 token
```

**两版不同的后缀**（同文件:7-12）：

- `_semantic` 版（键=值格式）→ 喂给向量嵌入，语义更丰富
- `_keyword` 版（纯值串）→ 喂给 BM25 关键词检索，不浪费 token 在 "Metadata:" 这种无意义词上

检索命中后，`cleanup_content_for_chunks`（同文件:15-104）反向剥离这些前缀后缀，只把原始正文交还给用户和 LLM。

#### Contextual RAG

`add_contextual_summaries`（`indexing_pipeline.py:992`）在**索引期**（不是检索期）用 LLM 给每个 chunk 补一段"定位上下文"。提示词在 `prompts/contextual_retrieval.py`：

```
<document>{整篇文档}</document>
<chunk>{当前chunk}</chunk>
Please give a short succinct context to situate this chunk within the overall
document for the purposes of improving search retrieval of the chunk.
```

两件产物：

- `doc_summary`：整篇文档的摘要（放 chunk 开头）。
- `chunk_context`：这个 chunk 在文档里的定位说明（放 chunk 结尾）。

嵌入时把「标题 + doc_summary + content + chunk_context + 元数据」一起编码（`document_index/chunk_content_enrichment.py:11`），**检索时把这层上下文也带进向量空间**，从而解决"chunk 脱离上下文后语义模糊"的经典问题。检索命中后，`cleanup_content_for_chunks`（同文件:15）再把这些增强文本剥掉，只把原始内容给用户。

#### Embedding 嵌入

`DefaultIndexingEmbedder.embed_chunks`（`indexing/embedder.py:117`）：

1、把每个 chunk 拼成**实际要嵌入的文本**（上面说的增强内容即Contextua RAG）。

2、一批调 `embedding_model.encode(texts, text_type=EmbedTextType.PASSAGE)`。即将多个chunk一起送给Embedded模型，批量转换为向量。

3、文档标题单独嵌入一份（缓存在 dict 里复用）。即同一篇文档的标题只Embedding一次，后续的chunk直接复用这个标题向量。

单独嵌入即：假设 chunk 的增强文本是：

```
Redis 使用指南

本文介绍 Redis 的基本使用方法。

Redis 支持 String、Hash、List 等数据结构。

当前章节介绍 Redis 数据类型。
```

这一整个东西：`标题 + 摘要 + 正文 + 上下文`会生成一个`chunk_embedding`。但是系统还是会单独将标题拿出来再算一次，即再进行Embedding。

4、多通道模式：每个 chunk 还会给每个 mini-chunk 单独嵌入。

假设切出来的一个chunk是：

```txt
Redis 是一个高性能内存数据库。
Redis 支持 String、Hash、List、Set 等数据结构。
Redis 支持主从复制。
Redis 可以通过 RDB 和 AOF 实现持久化。
Redis Cluster 可以实现分布式存储。
```

正常情况下：

```txt
整个 chunk
    ↓
Embedding
    ↓
一个向量
```

但如果用户问：Redis 有哪些持久化方式？真正与该问题相关的其实只有：Redis 可以通过 RDB 和 AOF 实现持久化。但chunk里还有其他信息。

mini-chunk即将刚才的大chunk内部再分：

```txt
大 chunk
│
├── mini-chunk1
│   Redis 是一个高性能内存数据库。
│
├── mini-chunk2
│   Redis 支持 String、Hash、List、Set 等数据结构。
│
├── mini-chunk3
│   Redis 支持主从复制。
│
├── mini-chunk4
│   Redis 可以通过 RDB 和 AOF 实现持久化。
│
└── mini-chunk5
    Redis Cluster 可以实现分布式存储。
```

然后不光计算：

```txt
整个大 chunk
      ↓
chunk_embedding
```

还会计算：

```txt
mini-chunk1 → embedding
mini-chunk2 → embedding
mini-chunk3 → embedding
mini-chunk4 → embedding
mini-chunk5 → embedding
```

于是现在有：一个大向量＋多个小向量

**即大chunk负责整体语义，mini-chunk负责局部细节**

#### 写入OpenSearch

关于OpenSearch：

| 工具                       | 定位                                       |
| -------------------------- | ------------------------------------------ |
| MySQL                      | 关系型数据库                               |
| Elasticsearch / OpenSearch | 搜索引擎 + 搜索数据库                      |
| Milvus                     | 专门的向量数据库                           |
| Pinecone                   | 专门的托管向量数据库                       |
| **OpenSearch**             | **搜索引擎，同时支持很强的向量数据库能力** |

`write_chunks_to_vector_db_with_backoff`（`indexing/vector_db_insertion.py:31`）：

- 先整批写，失败再**逐文档写**（保证同一文档的 chunk 一次性写入，因为 `DocumentIndex.index()` 假设一个文档的 chunk 是连续的）。

- 底层 `OpenSearchDocumentIndex.index` → `_flush_chunks`：**先删掉该文档的旧 chunk 再写新的**（防止文档变短后留下孤儿 chunk），用 bulk 批量写入，冲突时刷新索引重试。

```txt
整体流程可以概括为：

Chunks + Embeddings
        ↓
批量写入 OpenSearch
        ↓
    是否成功？
     /     \
   是       否
   ↓        ↓
完成    按文档逐个重试
```

**1. 优先批量写入，失败后降级为逐文档写入**

正常情况下，系统会尽量将多个文档的 chunks 一次性写入 OpenSearch，以减少请求次数并提升索引吞吐量。

例如：

```
Document A → A1 A2 A3
Document B → B1 B2
Document C → C1 C2 C3
```

会优先按照一整个批次执行写入：

```
A1 A2 A3 B1 B2 C1 C2 C3
              ↓
          OpenSearch
```

如果整批写入失败，系统不会直接将整个批次判定为失败，而是降级为按文档分别重试：

```
Document A → 单独写入
Document B → 单独写入
Document C → 单独写入
```

这样即使某一篇文档存在异常，也不会影响其他文档正常进入索引。

这一设计兼顾了两点：

- 正常情况下通过批量写入提高性能；
- 异常情况下通过文档级重试实现故障隔离。

**2. 同一文档的 Chunk 必须连续处理**

`DocumentIndex.index()` 在处理 chunks 时，会假设属于同一篇文档的 chunks 在输入序列中是连续排列的。

例如：

```
A1
A2
A3
B1
B2
C1
C2
```

系统在检测到 `document_id` 从 A 变为 B 时，就可以认为：

```
Document A 的 chunks 已经全部收齐
```

随后将 A 的 chunks 一次性交给 `_flush_chunks` 写入 OpenSearch。

因此，输入顺序必须保持：

```
AAA BBB CCC
```

而不能出现：

```
A B A C B
```

否则系统可能在尚未收齐某篇文档全部 chunks 时就提前执行写入。

**3. 更新文档时先删除旧 Chunk，再写入新 Chunk**

`OpenSearchDocumentIndex._flush_chunks` 中一个非常重要的设计是：

```
先删除旧 chunks
再写入新 chunks
```

而不是简单覆盖已有记录。

这是为了避免文档更新后产生“孤儿 chunk”。

例如，一篇文档第一次建立索引时被切成 5 个 chunk：

```
Document A

A1
A2
A3
A4
A5
```

此时 OpenSearch 中保存了 5 条记录。

后来文档内容被删除了一部分，重新切分后只剩 3 个 chunk：

```
A1'
A2'
A3'
```

如果只覆盖前三个 chunk，那么 OpenSearch 中最终会变成：

```
A1'  新
A2'  新
A3'  新
A4   旧
A5   旧
```

其中 A4 和 A5 已经不存在于最新文档中，却仍然可能被检索出来。

因此，系统采用的是：

```
删除 Document A 的所有旧 chunks
              ↓
重新写入 A1' A2' A3'
```

最终 OpenSearch 中只保留当前版本的数据。

这种策略保证了：

> OpenSearch 中某篇文档对应的 chunks 始终与当前最新版本保持一致。

**4. 使用 Bulk API 提高写入效率**

真正执行插入时，系统不会逐条发送请求，而是通过 OpenSearch Bulk API 批量写入多个 chunk。

如果一个文档包含 100 个 chunk，逐条写入意味着需要大量独立请求：

```
A1 → 请求一次
A2 → 请求一次
A3 → 请求一次
...
A100 → 请求一次
```

使用 Bulk API 后，可以将多个写操作合并到一次批量请求中：

```
A1
A2
A3
...
A100
  ↓
Bulk Request
  ↓
OpenSearch
```

这样可以显著减少网络请求开销，提高大规模文档索引时的吞吐量。

**5. 索引冲突时刷新并重试**

在删除旧 chunks 并立即写入新 chunks 的过程中，OpenSearch 可能出现索引状态尚未完全同步或版本冲突等情况。

因此，当 bulk 写入出现冲突时，系统会执行：

```
写入
 ↓
发生冲突
 ↓
refresh index
 ↓
重新尝试写入
```

`refresh` 可以让 OpenSearch 更快地暴露最新的索引状态，再进行后续重试。

需要注意的是，系统并不会在每次写入时都主动 refresh，而是在发生冲突时进行补救，因为频繁刷新索引本身也会带来额外性能开销。

**整体流程**

完整的向量写入过程可以概括为：

```
Embedding 完成
      ↓
Chunks + Vectors
      ↓
批量写入 OpenSearch
      ↓
整批失败？
  /        \
否          是
↓           ↓
继续      按文档重试
             ↓
      DocumentIndex.index()
             ↓
      收集同一文档 chunks
             ↓
        _flush_chunks()
             ↓
    删除该文档旧 chunks
             ↓
     Bulk 写入新 chunks
             ↓
       发生冲突？
        /      \
      否        是
      ↓         ↓
    完成     refresh
                ↓
              retry
```

### 阶段二：检索召回

#### 混合检索

单个查询在 OpenSearch 层面是**混合检索**：向量 kNN + BM25 关键词同时跑，再归一化融合。
