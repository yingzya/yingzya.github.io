# remark-plugins

用于自定义 [remark](https://github.com/remarkjs/remark) / [unified](https://unifiedjs.com/) 插件，
在 Markdown 解析阶段扩展语法。

## 使用方式

在 `nuxt.config.ts` 的 `content.build.markdown.remarkPlugins` 中引用：

```ts
content: {
  build: {
    markdown: {
      remarkPlugins: {
        './remark-plugins/my-plugin': { /* options */ },
      },
    },
  },
}
```

参考：[Nuxt Content — Markdown 配置](https://content.nuxt.com/docs/advanced/remark)
