---
title: SSE
description: OcEasy项目SSE流式输出实战解析
date: 2026-08-03 12:22:56
updated: 2026-08-03 12:22:56
image: # 图片
categories: [经验分享]
---

### 什么是SSE？

**SSE（Server-Sent Events，服务器推送事件）** 是一种基于 HTTP 的长连接技术。
核心思想极其朴素：

> 普通的 HTTP 响应是"服务器一次性把整个 body 发完就断开"。
> SSE 则是**服务器保持连接不关闭，把数据分成一小块一小块持续发**。

OcEasy 用的是一种简化变体（也叫 **NDJSON over SSE** / 逐行 JSON）：

- 响应头标注 `Content-Type: text/event-stream`
- 响应体是**一行一个 JSON 对象**，行之间用 `\n` 换行符分隔
- 每次 `yield` 一行，数据就立刻到达浏览器，不等后面的行

**与 WebSocket 的区别**

| 特性     | SSE                     | WebSocket            |
| -------- | ----------------------- | -------------------- |
| 方向     | 服务器 → 客户端（单向） | 双向                 |
| 协议     | 纯 HTTP，无需升级       | 需要 101 协议升级    |
| 自动重连 | 浏览器原生支持          | 需自己实现           |
| 断点续传 | 容易（带游标）          | 较难                 |
| 适用场景 | 流式文本、进度、通知    | 游戏、实时协作、聊天 |

**聊天 AI 的逐字输出是 SSE 的典型场景**：只需要服务端往客户端推文本，不需要客户端往服务器推数据（发消息走普通 POST）。

### 架构

![img](https://assets.yangzy.top/ChatGPT%20Image%202026%E5%B9%B48%E6%9C%883%E6%97%A5%2012_47_39.webp)

> 即后端 LLM 每次生成一个 token → 包成 Packet → 序列化成"一行 JSON + 换行" → 立刻 flush 给浏览器；
> 前端用 `response.body` 的流式 reader 逐块读取 → 按换行切分 → JSON.parse → 累加到界面。

### 后端

这是流式聊天的 HTTP 端点。**注意返回值类型是 `StreamingResponse | ChatFullResponse`**，根据请求参数 `stream` 决定走流式还是非流式。

```python
# chat_backend.py:681
def stream_generator() -> Generator[str, None, None]:
    state_container = ChatStateContainer()
    try:
        for obj in handle_stream_message_objects(...):
            yield get_json_line(obj.model_dump())   # 每个对象 → 一行 JSON
    except Exception as e:
        yield json.dumps({"error": str(e)})
    finally:
        logger.debug("Stream generator finished")

return StreamingResponse(stream_generator(), media_type="text/event-stream")
```

**FastAPI 的 `StreamingResponse` 是流式输出的"发动机"**：

- 它接受一个**生成器（generator）**。
- 每次生成器 `yield` 一个字符串，FastAPI（底层是 Starlette）就把它**立即作为一块 HTTP chunk 发出去**，不会攒起来。
- 连接保持打开，直到生成器结束（`StopIteration`）或客户端断开。

这就是"后端不一次给完、前端能收到增量"的根源。

#### 序列化

```python
def get_json_line(
    json_dict: dict[str, Any], encoder: type[json.JSONEncoder] = OnyxJSONEncoder
) -> str:
    return json.dumps(json_dict, cls=encoder) + "\n"
```

- `json.dumps` 把 Pydantic 对象 `model_dump()` 后的字典序列化。
- **末尾加 `\n`**——这个换行符是前端的"消息分隔符"（协议关键）。
- 自定义 `OnyxJSONEncoder` 处理 `datetime`、`UUID` 等非原生 JSON 类型（`server/utils.py:20`）。

> 每个包在线上就是一行文本，例如：
> `{"placement":{"turn_index":0},"obj":{"type":"agent_response_delta","content":"你"}}`

#### 数据模型

```python
class Packet(BaseModel):
    placement: Placement                      # 定位信息（哪个 turn / 哪个模型）
    obj: Annotated[PacketObj, Field(discriminator="type")]   # 具体内容，按 type 区分
```

`PacketObj` 是一个**按 `type` 字段判别的联合类型**，几十种包包括：

| 包类型                     | 作用                                 |
| -------------------------- | ------------------------------------ |
| `agent_response_delta`     | **回答内容增量**（真正打字的包）     |
| `agent_response_start`     | 回答开始（携带最终文档、预处理耗时） |
| `reasoning_delta`          | 思考/推理内容增量                    |
| `search_tool_*_delta`      | 搜索工具参数/结果增量                |
| `tool_call_argument_delta` | 工具调用参数流式生成                 |
| `citation_info`            | 引用文献信息                         |
| `chat_heartbeat`           | 心跳（见第 6 节）                    |
| `stream_stop`              | 流结束（含 `stop_reason`）           |
| `error`                    | 错误（`StreamingError`）             |

> Pydantic 的 `discriminator="type"` 意味着**反序列化时前端必须带 `type` 字段**，
> 前端 `PacketType`（lib.tsx:92）是同样的判别联合。

#### 生成器链：包怎么从 LLM 流到 HTTP

调用链是层层嵌套的生成器，每一层把上层 `yield` 的东西**透传**给下层：

```
stream_generator (chat_backend.py:682)
   └─ handle_stream_message_objects (process_message.py:1752)
        └─ _stream_chat_turn (process_message.py:1528)
             └─ _run_models (process_message.py:1062)
                  └─ _read_stream (process_message.py:1496)  ← 实际对外 yield
```

`_stream_chat_turn`（process_message.py:1582-1661）的关键逻辑：

1. 在一个短命 DB session 里执行 `build_chat_turn`，把**准备阶段产生的包**（如 session id、message id）先 `yield` 出去；
2. 构造 `StreamBufferWriter`（流缓冲）；
3. 调用 `_run_models` 得到 run 流并 `yield from`。

**为什么先发准备阶段包？** 前端需要立刻知道"这条消息分配到了哪个 session / 哪个 message id"，才能在本地消息树上建出节点来承接后续的内容包。

#### 逐Token

这是"字一个个出来"的**最底层源头**：

```python
for packet in llm.stream(
    prompt=llm_msg_history,
    tools=tool_definitions,
    tool_choice=tool_choice,
    max_tokens=max_tokens,
    reasoning_effort=reasoning_effort,
    ...
):
    delta = packet.choice.delta

    if not answer_start:
        yield Packet(obj=AgentResponseStart(final_documents=..., ...))
        answer_start = True

    accumulated_answer += content_chunk                    # 后端也累加一份
    state_container.set_answer_tokens(accumulated_answer)  # 用于最终持久化
    yield Packet(
        placement=_current_placement(),
        obj=AgentResponseDelta(content=content_chunk),     # 每块一个增量包
    )
```

- `llm.stream()` 的实现封装在 `backend/onyx/llm/multi_llm.py:981`，底层是 **litellm** 的 `CustomStreamWrapper`（`multi_llm.py:992`），再往下是各家 LLM 的 HTTP 流。
- **每次迭代只有一个 token（或一小段）**。这就是"一个一个"的最小粒度。
- 回答开始前还有一个 `AgentResponseStart` 包，携带 `final_documents`（检索到的文档）和 `pre_answer_processing_seconds`（从发消息到开始作答的耗时）。
- 同时 `accumulated_answer += content_chunk`：后端维护一个**累积文本**，用于流结束后一次性持久化到数据库（前端是增量的，数据库要的是完整文本）。

#### 回答带引用

真实项目里回答文本中常带 `[1]`、`[2]` 这样的引文标记。
代码通过 `citation_processor.process_token(content_chunk)`（llm_step.py:1258）**逐 token 扫描**，把属于引文标记的部分拆出来单独发 `CitationInfo` 包，正文里的标记换成占位符。前端再把引文号和文档 ID 对应起来，渲染成可点击的 [1]。

#### 并发

>多个模型同时生产数据，一个writer统一收集和保存，一个reader负责把数据发给浏览器

`_run_models`（process_message.py:1062）是后端流式的"调度中心"。核心设计：

- **每个模型一个 worker 线程**（`_run_model`，process_message.py:1209），各自的 `Emitter` 把 Packet 推进一个共享的**无界队列** `merged_queue`；
- **一个 writer 线程**（`_drain_to_completion`）从队列 drain，负责两件事：
  1. 把每个包写入 `StreamBufferWriter`（供断线回放）；
  2. 转发给 reader 的 `tee` 队列；
- **reader 生成器**（`_read_stream`，process_message.py:1496）从 `tee` 里取包 yield 给 HTTP。

```
worker0 ──Emitter──▶ merged_queue ──┐
worker1 ──Emitter──▶ merged_queue ──┼─▶ writer线程 ──▶ tee队列 ──▶ reader → yield → HTTP
worker2 ──Emitter──▶ merged_queue ──┘      │
                                          └─▶ StreamBufferWriter（持久化缓冲）
```

几个关键点：

- **多生产者单消费者**：多个模型并发产包，但最终合成**一个** SSE 流（按到达顺序交错）。
- **reader 可以"死"而 writer 必须活**：客户端断开（GeneratorExit）时，reader 直接 return，但 writer 继续把剩余包写进缓冲（`process_message.py:1515-1523`），这样**断线的客户端重连后能回放到完整内容**。
- `reader_gone` 事件标记 reader 已离开，`tee` 队列停止累积无人消费的包，避免内存泄漏。

### 前端

#### 发消息

发消息：`sendMessage`（app/services/lib.tsx:145）

```ts
const response = await fetch(`/api/chat/send-chat-message`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body,
  signal,                       // ← 取消信号
});

if (!response.ok) { /* 抛错 */ }

yield* withoutHeartbeats(handleSSEStream<PacketType>(response, signal));
```

**最反直觉的一点**：`fetch` 在这里返回的是一个 `Response`，但 `await fetch(...)` **只等响应头**，不等 body。因为 `sendMessage` 是 `async function*`（异步生成器），它把 `Response` 交给 `handleSSEStream`，调用方再 `for await` 逐包消费。

`withoutHeartbeats`（lib.tsx:207）是一个过滤层：

```ts
async function* withoutHeartbeats(stream) {
  for await (const packet of stream) {
    if ("obj" in packet && packet.obj.type === "chat_heartbeat") continue;
    yield packet;
  }
}
```

心跳包不承载运行状态，消费端一律看不见它（心跳本身干什么，见下文）。

#### 核心解析器

```ts
export async function* handleSSEStream<T extends PacketType>(
  streamingResponse: Response,
  signal?: AbortSignal
): AsyncGenerator<T, void, unknown> {
  const reader = streamingResponse.body?.getReader();  // ① 取流的 reader
  const decoder = new TextDecoder();                    // ② 二进制 → 字符串
  let buffer = "";                                      // ③ 半包缓冲

  if (signal) {
    signal.addEventListener("abort", () => {
      reader?.cancel();                                 // ④ 中止 → 取消底层连接
    });
  }

  try {
    while (true) {
      const rawChunk = await reader?.read();            // ⑤ 异步读一块（可能几个包 or 半个包）
      const { done, value } = rawChunk;
      if (done) break;                                  // 流结束

      buffer += decoder.decode(value, { stream: true }); // ⑥ 关键：stream 模式解码

      const lines = buffer.split("\n");                 // ⑦ 按换行切
      buffer = lines.pop() || "";                       // ⑧ 最后不完整的一行留回 buffer

      for (const line of lines) {
        if (line.trim() === "") continue;
        try {
          const data = JSON.parse(line) as T;           // ⑨ 还原对象
          yield data;                                    // ⑩ 吐给调用方
        } catch (error) {
          // 某些工具结果会把多个 JSON 挤在一行，用正则兜底提取
          const jsonObjects = line.match(/\{[^{}]*\}/g);
          if (jsonObjects) {
            for (const jsonObj of jsonObjects) {
              try {
                yield JSON.parse(jsonObj) as T;
              } catch (innerError) { /* 忽略 */ }
            }
          }
        }
      }
    }

    // 流结束后处理 buffer 里残留的半行
    if (buffer.trim() !== "") {
      try { yield JSON.parse(buffer) as T; } catch { /* 忽略 */ }
    }
  } finally {
    // ⑪ 生成器被提前 break 时必须 cancel，否则连接永远挂着
    void reader?.cancel().catch(() => {});
  }
}
```

| 步骤                 | 原因                                                         |
| -------------------- | ------------------------------------------------------------ |
| ① `getReader()`      | `response.body` 是一个 `ReadableStream`，用 reader 才能**异步增量**读取，而不是 `await response.json()` 一次性拿完 |
| ② `TextDecoder`      | 网络传的是字节（Uint8Array），需要解码成字符串               |
| ③ `buffer`           | 网络数据可能**切在任意位置**（一个 JSON 的后半段），需要暂存"不完整的尾巴" |
| ④ `reader.cancel()`  | `AbortController` 触发时，必须主动 cancel 流，否则底层连接挂起（见第 5 节） |
| ⑥ `{ stream: true }` | **UTF-8 多字节字符可能被切到字节边界**，`stream:true` 让解码器缓存不完整字节、下次补全。不传会乱码！ |
| ⑦⑧ 按 `\n` 切行      | 协议规定一行一个 JSON。`split` 后最后一段没有换行符结尾，说明是**半包**，留回 buffer |
| ⑪ `finally` cancel   | 消费方 `break`/`return` 提前退出生成器时，只有 cancel 才会真正断开 SSE |

> 💡 步骤 ⑦⑧ 是**所有流式协议通用**的"粘包/半包处理"思路，在 WebSocket 消息、NDJSON 日志流、日志采集里都能见到。

#### 缓冲层

```ts
export class CurrentMessageFIFO {
  private stack: PacketType[] = [];
  isComplete: boolean = false;
  error: string | null = null;

  push(packetBunch) { this.stack.push(packetBunch); }
  nextPacket() { return this.stack.shift(); }   // FIFO：先入先出
  isEmpty() { return this.stack.length === 0; }
}

export async function updateCurrentMessageFIFO(stack, params) {
  try {
    for await (const packet of sendMessage(params)) {
      if (params.signal?.aborted) throw new Error("AbortError");
      stack.push(packet);
    }
  } catch (error) { /* 记入 stack.error */ }
  finally { stack.isComplete = true; }
}
```

为什么需要 FIFO？因为 **`for await` 的生产速度远快于 React 渲染速度**。

如果直接在每个包上 setState，React 会被几万个重渲染压垮。

FIFO 把"生产"（后台异步迭代，持续 push）和"消费"（主循环按帧取包渲染）解耦。

#### 消费循环

主循环 `while (!stack.isComplete || !stack.isEmpty())` 是前端流式消费的心脏：

```ts
const stack = new CurrentMessageFIFO();
updateCurrentMessageFIFO(stack, { signal, message, ... });

await delay(50);   // 给第一批包一点时间

while (!stack.isComplete || !stack.isEmpty()) {
  if (stack.isEmpty()) {
    if (pendingFlush) await flushViaRAF();   // 攒一批，下一帧统一刷新
    else await delay(0.5);                    // 空转等待生产方
  }

  if (!stack.isEmpty() && !controller.signal.aborted) {
    const packet = stack.nextPacket();
    updateChatStateAction(frozenSessionId, "streaming");  // 状态机：loading → streaming

    // —— 按包类型分流 ——
    if ((packet as MessageResponseIDInfo).user_message_id) {
      newUserMessageId = ...;   // 记下 user message id
    }
    if ((packet as MessageResponseIDInfo).reserved_assistant_message_id) {
      newAgentMessageId = ...;  // 记下预留的 assistant message id
    }
    if (Object.hasOwn(packet, "user_files")) { /* 用户文件包 */ }
    if (Object.hasOwn(packet, "file_ids")) { /* 生成图片 */ }
    else if (Object.hasOwn(packet, "error")) {
      // 单模型：throw 终止；多模型：把错误路由到具体模型的面板
    }
    else if (Object.hasOwn(packet, "message_id")) { /* 完整消息 */ }
    else if (Object.hasOwn(packet, "stop_reason")) { /* 流结束原因 */ }
    else if (Object.hasOwn(packet, "obj")) {
      const packetObj = (packet as Packet).obj;
      packets.push(typedPacket);        // ← AgentResponseDelta 都堆在这里
      packetsVersion++;
      singleModelDirty = true;
      // 引文 / 开始包单独处理
    }
    pendingFlush = true;
  }
}
flushPendingUpdates();
```

**按 `Object.hasOwn(packet, "xxx")` 判断包类型**——不同包有不同的顶层字段，这是项目里判别"这是哪种包"的惯用手法（对应后端 Pydantic 的判别联合）。

**渲染性能三件套**

**① `flushViaRAF` 批量刷新**

`requestAnimationFrame` 把一帧内的所有包**合并成一次** React 更新：

```ts
await delay(50);
while (...) {
  if (stack.isEmpty()) {
    if (pendingFlush) await flushViaRAF();  // 攒到下一帧再刷
  }
  ...
}
```

**② `packetCount` 代替数组做 memo（AgentMessage.tsx:73）**

React.memo 比较 props。`packets` 数组被**原地 push**（引用不变），所以 memo 直接比较数组会认为"没变"。项目用 `packetCount` 这个**原始数字**做比较：

```tsx
prev.packetCount === next.packetCount &&
prev.chatState.agent === next.chatState.agent &&
... // 其余字段
```

```ts
// useChatSessionController.ts:319 的注释点明了设计意图：
// "AgentMessage's memo compares packetCount, not the packets array."
node.packetCount = accumulated.length;
```

③ trailing flush：burst 结束不饿死最后几个包`useChatSessionController.ts:346`：如果距上次 flush 不足 100ms 就设一个 **120ms 的定时器**，保证"突发数据的最后几个包"即使等不到下一个包，也会被定时刷出来。

#### 渲染层

`AgentMessage` 拿到原始 packets 后交给这个 hook 处理成 UI 数据：

```ts
// 处理状态放在 ref 里：增量、同步、不触发双渲染
const stateRef = useRef<ProcessorState>(createInitialState(nodeId));
// 只有真正的 UI 状态才用 useState
const [renderComplete, setRenderComplete] = useState(false);

// 增量处理：只处理新到的包（避免重复处理已消费的）
if (rawPackets.length > stateRef.current.nextPacketIndex) {
  stateRef.current = processPackets(stateRef.current, rawPackets);
}
```

`processPackets`（packetProcessor.ts）遍历新包：

- `agent_response_delta` → 累加进 `potentialDisplayGroups` 的文本块；
- 工具类包 → 归类成 `toolGroups`（步骤/轮次分组，供时间线 UI 展示"思考了几步"）；
- `message_start` → 标记 `finalAnswerComing`；
- `stream_stop` → 标记 `stopPacketSeen` 和 `stopReason`；
- `citation_info` → 进 `citationMap`。

最终回答文本由 `displayGroups` 渲染成 Markdown，每次新 delta 到达 → `rawPackets.length` 增加 → 重新 `processPackets` → 重渲染。
**打字机效果 = 增量数据 + 高频重渲染**。

### 心跳机制

LLM 生成可能长时间"没动静"（比如调工具、检索文档），但 HTTP 长连接如果长时间没有数据，**中间代理/负载均衡可能把连接掐掉**。
心跳（`chat_heartbeat`）就是用来保活的。

#### 产生方（后端）

主 stream 的 reader 在**空闲超过 `CHAT_HEARTBEAT_INTERVAL_S`（默认 15 秒）**时发一个心跳包（process_message.py:1500-1508）：

```python
while True:
    try:
        item = tee.get(timeout=_CANCEL_POLL_INTERVAL_S)
    except queue.Empty:   # 队列空 = 没有真实包到来
        now = time.monotonic()
        if now - last_packet_yield >= CHAT_HEARTBEAT_INTERVAL_S:
            yield heartbeat_packet()          # 发个心跳保活
            last_packet_yield = now
        continue
    ...
```

`heartbeat_packet()`（streaming_models.py:496）：

```python
def heartbeat_packet() -> Packet:
    """Keepalive for silent stretches; carries no run state."""
    return Packet(placement=Placement(turn_index=0), obj=ChatHeartbeat())
```

`CHAT_HEARTBEAT_INTERVAL_S = int(os.environ.get("CHAT_HEARTBEAT_INTERVAL_S") or "15")`（chat_configs.py:35）——可用环境变量调整。

#### 消费方（前端）

- `withoutHeartbeats`（lib.tsx:207）在**发消息链路**里直接丢弃心跳；
- resume 链路里心跳被用作**liveness tick**（useChatSessionController.ts:341）：
  收到心跳说明连接还活着、会话还是当前焦点，用于决定是否继续刷新；
- 渲染层完全看不见心跳包。

### 断线重连与流回放

SSE 是单向长连接，任何网络抖动都可能断。OcEasy 用"**持久化缓冲 + 游标回放**"实现断线续传。

#### 后端

写路径：`_run_models` 的 writer 线程把每个包 `get_json_line` 后**同时**写入缓冲：

```python
# process_message.py:1650
for pre_run_packet in pre_run_packets:
    stream_buffer.append_line(get_json_line(pre_run_packet.model_dump()))
```

`append_line`（stream_buffer.py:80）攒到一定字节再批量 `flush`；`flush` 用 **zlib 压缩**后按 `chunk_count` 分块写进共享缓存（Redis），带 TTL：

```python
def flush(self) -> None:
    payload = zlib.compress("".join(self._pending).encode("utf-8"))
    self._cache.set(
        _chunk_key(self._chat_session_id, self._run_id, self._meta.chunk_count),
        payload,
        ex=CHAT_STREAM_BUFFER_TTL_S,
    )
```

关键属性：

- **`truncated`**：缓冲超上限（`CHAT_STREAM_BUFFER_MAX_BYTES`）就标记截断，降级为"不可恢复"；
- **`done`**：流正常结束后 `mark_done()`（stream_buffer.py:131），延长数据保留期，
  让刷新页面后的客户端能回放完整内容。

```python
def resume_chat_stream(
    session_id: UUID,
    cursor: int = Query(0, ge=0),     # 客户端上次读到哪
    user: User = Depends(...),
) -> StreamingResponse:
    ...
    run_id = get_processing_run_id(session_id, cache)
    if run_id is None or not has_stream_buffer(cache, session_id, run_id):
        raise OnyxError(NOT_FOUND, "No resumable run for this chat session")

    def stream_buffered_run() -> Generator[str, None, None]:
        chunk_cursor = cursor
        while True:
            read = read_stream_chunks(cache, session_id, run_id, chunk_cursor, ...)
            if read is None or read.gap: return      # 缓冲丢了 → 终止，客户端重新拉全量
            if read.blocks:
                yield "".join(read.blocks)           # 回放缓冲内容
                chunk_cursor = read.next_cursor
                continue
            if read.done: return                     # 正常结束
            if not is_chat_session_processing(session_id, cache):
                # writer 死了但没标 done → 再补一次 drain
                ...
            # 缓冲读完了 → 实时 tail 新的包
            time.sleep(CHAT_RESUME_POLL_INTERVAL_S)
            if now - last_emit >= CHAT_HEARTBEAT_INTERVAL_S:
                yield get_json_line(heartbeat_packet().model_dump())  # 轮询中也发心跳
    ...
```

设计要点：

- **缓冲在共享缓存里，任何 pod 都能服务**（注释："Serves any pod"）；
- 404（无可恢复 run）是正常业务信号，前端回退到重新拉取落库 session；
- 回放结束进入**实时 tail**：轮询新 chunk + 心跳保活。

#### 前端

```ts
export async function* resumeStream(chatSessionId, cursor, signal?) {
  const response = await fetch(
    `/api/chat/chat-session/${chatSessionId}/resume-stream?cursor=${cursor}`,
    { signal }
  );
  ...
  yield* handleSSEStream<PacketType>(response, signal);
}
```

页面刷新后，如果 session 有 `current_run` 且是 assistant 节点，就"粘"上去续读：

```ts
const abortController = new AbortController();
try {
  for await (const rawPacket of resumeStream(sessionId, 0, abortController.signal)) {
    if (!stillCurrent()) return;              // 用户已切走会话 → 停
    if (packet.obj.type === "chat_heartbeat") continue;
    accumulated.push(packet);
    // 每 100ms 或 trailing 120ms 刷一次到消息树
  }
} finally {
  abortController.abort();
  // 流结束后拉一次落库的完整 session 做"结算"
  const settled = await (await fetch(`/api/chat/get-chat-session/${sessionId}`)).json();
  updateSessionAndMessageTree(sessionId, processRawChatHistory(settled.messages, ...));
}
```

**"流式 + 落库"双保险**：在线期间用增量流；断线/刷新后用回放流；回放结束用落库数据最终对齐。
