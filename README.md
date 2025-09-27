##  Nuxt 4 博客

[![CI Status](https://github.com/yingzya/yingzya.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/yingzya/yingzya.github.io/actions)
[![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub_Pages-blue?logo=github)](https://yingzya.github.io/yingzya.github.io)
[![Last Commit](https://img.shields.io/github/last-commit/yingzya/yingzya.github.io?label=Last%20Updated&color=blue)](https://github.com/yingzya/yingzya.github.io/commits/main)
[![Nuxt Version](https://img.shields.io/badge/Nuxt-4.x-brightgreen?logo=nuxt.js)](https://nuxt.com/)
[![License](https://img.shields.io/github/license/yingzya/yingzya.github.io?color=orange)](./LICENSE)
[![Vite](https://img.shields.io/badge/Bundler-Vite-646CFF?logo=vite)](https://vitejs.dev/)
[![PNPM](https://img.shields.io/badge/Package_Manager-pnpm-222222?logo=pnpm)](https://pnpm.io/)
[![Blog Theme](https://img.shields.io/badge/Theme-纸鹿-violet)](https://github.com/L33Z22L11/blog-v3)

> 本项目是一个基于 **Nuxt 4** 的静态博客系统，支持通过 **GitHub Actions 自动构建并部署到服务器**，无需手动上传构建文件，部署简单高效。

源项目链接：[纸鹿](https://github.com/L33Z22L11/blog-v3) ✍️

博客地址：[字节追风者](https://yingzya.top)



### 分支结构说明

- `main`：源码主分支，存放 Nuxt 开发代码
- `gh-pages`：自动构建后生成的静态资源分支（`.output/public`）

### 本地开发

```bash
pnpm install
pnpm dev
```

访问地址：[http://localhost:3000](http://localhost:3000/)

### 本地构建

```bash
pnpm generate
```

构建后的静态资源会生成在 `.output/public` 目录中。

### 自动化部署(GitHub App + Webhook)

当代码推送到 `main` 分支时，**GitHub App 会触发服务器 Webhook**，服务器会自动执行以下操作：

1. 拉取最新仓库代码。
2. 构建静态站点（`.output/public`）。
3. 覆盖服务器上博客目录的内容。
4. 博客自动更新，无需手动操作。

> ⚠️ 注意：服务器需要配置 Webhook 服务（例如 `webhook.js`）并确保正确运行。