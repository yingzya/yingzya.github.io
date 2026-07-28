# 🌧️ 雨落川

[![CI Status](https://github.com/yingzya/yingzya.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/yingzya/yingzya.github.io/actions)
[![Nuxt](https://img.shields.io/badge/Nuxt-4.x-00DC82?logo=nuxt.js)](https://nuxt.com/)
[![Vue](https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vue.js)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![pnpm](https://img.shields.io/badge/pnpm-10-222222?logo=pnpm)](https://pnpm.io/)
[![License](https://img.shields.io/badge/License-CC_BY--NC--SA_4.0-orange)](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-hans)

> 云青青兮欲雨，水澹澹兮生烟。

基于 **Nuxt 4** 的静态博客，由 GitHub Actions 自动构建并部署到 GitHub Pages。

- 🌐 博客地址：[blog.yangzy.top](https://blog.yangzy.top/)
- 🎨 主题来源：[Clarity / blog-v3](https://github.com/L33Z22L11/blog-v3)

---

## ✨ 特性

- 📝 **Markdown 写作** — 基于 `@nuxt/content`，支持 MDC 组件、KaTeX 数学公式、代码高亮
- 🎨 **亮/暗/自动 主题** — 支持三种色彩模式，自动跟随系统
- 📊 **文章统计** — 归档页按年份展示字数、篇数统计
- 📡 **Atom 订阅** — 内置 Atom Feed + OPML，方便 RSS 阅读器订阅
- 💬 **评论系统** — 集成自部署的 [Twikoo](https://twikoo.js.org/) 评论
- 🔍 **全文搜索** — 基于 MiniSearch 的客户端搜索
- 📱 **响应式布局** — 适配桌面、平板、手机三种屏幕
- 🚀 **SEO 优化** — 自动生成 sitemap、OG 标签、结构化数据
- 🤖 **自动部署** — GitHub Actions 推送即构建，无需手动操作

## 🛠️ 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Nuxt 4、Vue 3 |
| 语言 | TypeScript |
| 样式 | SCSS + CSS Variables |
| 内容 | @nuxt/content + MDC |
| 语法高亮 | Shiki |
| 数学公式 | KaTeX (remark-math + rehype-katex) |
| 构建 | Vite + Nitro |
| 包管理 | pnpm (workspace catalogs) |
| 代码规范 | ESLint (@antfu/eslint-config) + Stylelint + CSpell |
| 部署 | GitHub Actions → GitHub Pages |

## 🚀 快速开始

### 环境要求

- Node.js >= 22
- pnpm >= 10

### 本地开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

访问 http://localhost:3000 即可预览。

### 新建文章

```bash
pnpm new
```

交互式引导，选择分类、填写标签后自动生成 Markdown 文件。

### 本地构建

```bash
pnpm generate
```

构建产物输出到 `.output/public/`。

## 📁 项目结构

```
├── app/                    # Nuxt 应用层
│   ├── app.vue             # 根布局
│   ├── app.config.ts       # 运行时配置
│   ├── components/         # Vue 组件
│   │   ├── content/        #   MDC 富文本组件
│   │   ├── partial/        #   通用 UI 组件
│   │   ├── post/           #   文章相关组件
│   │   └── widget/         #   侧边栏小部件
│   ├── composables/        # 组合式函数
│   ├── pages/              # 页面路由
│   ├── stores/             # Pinia 状态管理
│   └── plugins/            # Nuxt 插件
├── content/                # 文章源文件 (.md)
│   └── posts/
│       ├── 2025/           # 按年份组织
│       └── 2026/
├── server/                 # Nitro 服务端
│   ├── api/                #   API 端点
│   └── routes/             #   Atom Feed 等路由
├── scripts/                # CLI 工具脚本
├── public/                 # 静态资源
├── blog.config.ts          # 博客核心配置
├── nuxt.config.ts          # Nuxt 配置
└── .github/workflows/      # CI/CD
```

## 🔧 配置

博客核心配置位于 `blog.config.ts`，包括：

- **站点信息** — 标题、副标题、作者、域名
- **文章设置** — 分类（含图标/颜色）、排序方式、URL 规则
- **评论系统** — Twikoo 服务地址
- **订阅源** — Atom Feed 配置

运行时可变的配置位于 `app/app.config.ts`，包括导航栏、页脚、分页、组件样式等。

## 🚢 部署

推送 `main` 分支后，GitHub Actions 会自动：

1. 检出代码
2. 使用 pnpm 安装依赖
3. 运行 `pnpm generate` 生成静态站点
4. 将 `.output/public/` 部署到 `gh-pages` 分支

GitHub Pages 会自动从 `gh-pages` 分支提供静态服务。

> 也可配置 GitHub App + Webhook，在自有服务器上自动拉取并部署。

## 📄 许可

博客文章内容采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-hans) 许可。

源代码基于 [blog-v3](https://github.com/L33Z22L11/blog-v3) 主题，遵循其原有许可。

## 🙏 致谢

- [纸鹿 / blog-v3](https://github.com/L33Z22L11/blog-v3) — 博客主题
- [Nuxt](https://nuxt.com/) — Web 框架
- [Anthony Fu](https://github.com/antfu) — ESLint 配置与开源生态
