---
title: Markdown 图表与代码
description: 预览流程图、可复制的命令和五线谱，并查看 Markdown 示例的源码。
tags: [Markdown, Mermaid]
aside: [toc, meta-aside-writing]
---

## 流程图

用 Mermaid 说明博客文章从写作到发布的过程。

```mermaid
flowchart LR
    draft[编写 Markdown] --> preview[本地预览]
    preview --> build[生成静态页面]
    build --> publish[发布]
```

## 复制命令

点击命令旁的复制按钮，或用 Tab 聚焦后按 Enter。比如运行 `pnpm generate`{copy} 生成静态站点。

下面是可以整段复制的 Bash 代码块。窄屏上可以切换自动换行。

```bash
pnpm install --frozen-lockfile
pnpm lint:source
pnpm generate
```

## 对照 Markdown 源码

切到「源码」可以看到下面这条笔记的完整写法。

```demo wrap
::alert{type="tip"}
写读书笔记时，若 8 道练习做对了 6 道，正确率就是 $6/8 = 75\%$。用 **粗体** 标出还需要复习的概念。
::
```

## 用 ABC 记谱

这段两小节的练习先向上走，再回到主音。源码里的竖线对应谱面上的小节线。

````demo
```music-abc
X:1
M:4/4
L:1/4
K:C
C D E G | F E D C |]
```
````

::meta-aside-writing{title="Markdown 写作" card}
在源码视图中可以复制完整示例，再替换成自己的内容。
::

::meta-copyright{title="示例许可"}
此页的原创 Markdown 示例可复制到自己的博客使用。
::
