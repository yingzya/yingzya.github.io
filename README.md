###  Nuxt 4 博客自动部署到 GitHub Pages

[![CI Status](https://github.com/yingzya/yingzya.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/yingzya/yingzya.github.io/actions)
[![GitHub Pages](https://img.shields.io/badge/GitHub-Pages-blue?logo=github)](https://yingzya.github.io/yingzya.github.io)
[![Last Commit](https://img.shields.io/github/last-commit/yingzya/yingzya.github.io?label=Last%20Updated)](https://github.com/yingzya/yingzya.github.io/commits/main)

本项目是一个基于 **Nuxt 4** 的静态博客系统，支持通过 **GitHub Actions 自动构建并部署到 GitHub Pages**，无需手动上传构建文件，部署简单高效。

源项目链接:[纸鹿](https://github.com/L33Z22L11/blog-v3) 

###   分支结构说明

- `main`：源码主分支，存放 Nuxt 开发代码
- `gh-pages`：自动构建后生成的静态资源分支（`.output/public`），由 GitHub Pages 托管

---



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

### 自动化部署

当将代码推送到 `main` 分支时，GitHub Actions 将自动执行以下操作：

1. 安装依赖
2. 执行 `pnpm generate` 构建静态站点
3. 将 `.output/public` 中的内容推送到 `gh-pages` 分支
4. 自动更新 GitHub Pages 上的内容
