# remark-plugins

本站在 Nuxt Content 构建时处理这些 Markdown 扩展。

- `remark-demo.mjs` 将 `demo` 围栏展开成预览和带高亮的源码。示例包含围栏时，外层使用更多反引号。
- `remark-code-component.mjs` 将 `mermaid` 和 `music-abc` 围栏转换成图表与乐谱组件。
- `extract-article-slots.ts` 在高亮和公式处理完成后提取 `meta-copyright` 与 `meta-aside-名称`。将对应的 `meta-aside-名称` 写入文章的 `aside` 列表，即可显示侧栏卡片。

示例见 [Markdown 图表与代码](../content/previews/markdown-tools.md)。插件在 `nuxt.config.ts` 的 Markdown 配置和 `content:file:afterParse` 钩子中注册。
