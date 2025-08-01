---
title: Git自动化部署
description: Git自动化部署
date: 2025-07-31 19:42:40
updated: 2025-07-31 19:42:40
image: https://7.isyangs.cn/20250731/2a767389db86969893e17922d767fb6a.jpg
# type: story
categories: [Linux]
tags: [Git]
---

由于不想每次更新完博客再手动上传到服务器，于是在纸鹿和GPT的支持下，弄了一下自动化部署。

## 第1步：服务器配置

✅ 安装 **Node.js** 和 **pnpm**

```bash
# 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 安装 pnpm
npm install -g pnpm
```

## 第2步：部署 Webhook 接收器（NodeJS 服务）

我们用 Node 写一个 Webhook 接收服务（监听 GitHub 推送事件）:

### 1、在服务器建个目录

```bash
mkdir -p ~/webhook-server
cd ~/webhook-server
```

### 2、创建`server.js` 文件：

```bash
nano server.js
```

粘贴以下内容（记得替换路径和仓库分支）：

记得**安全组**开放**6688**端口，也可以自己更换别的端口。同时服务器防火墙也要开放该端口

```js
const http = require('http');
const { exec } = require('child_process');

const secret = 'your_secret'; // 与 GitHub 中 Webhook 设置的 secret 一致
const PORT = 6688;// 可以自己改端口

function verifySignature(req, body) {
  // 可以添加签名校验，这里略去简化
  return true;
}

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/webhook') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      if (!verifySignature(req, body)) {
        res.writeHead(403);
        res.end('Invalid signature');
        return;
      }

      // 执行构建+部署
      exec('sh ./deploy.sh', (err, stdout, stderr) => {
        if (err) {
          console.error(`执行错误: ${err.message}`);
          return;
        }
        console.log(`输出: ${stdout}`);
        console.error(`错误: ${stderr}`);
      });

      res.writeHead(200);
      res.end('Webhook received and processing');
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Webhook server running at http://localhost:${PORT}/webhook`);
});

```

### 3、创建部署脚本`deploy.sh`

```bash
nano deploy.sh
```

内容如下(根据自己的**项目路径**调整)

```bash
#!/bin/bash

echo "🔄 开始部署..."

cd /home/qinyu/nuxt-blog || exit

# 拉取最新代码
git reset --hard origin/main
git clean -fd
git pull origin main

# 判断 package.json 是否有变化（缓存上一次的哈希）
PACKAGE_HASH_FILE=".package.hash"
CURRENT_HASH=$(md5sum package.json | awk '{print $1}')

if [ -f "$PACKAGE_HASH_FILE" ]; then
    LAST_HASH=$(cat "$PACKAGE_HASH_FILE")
else
    LAST_HASH=""
fi

if [ "$CURRENT_HASH" != "$LAST_HASH" ]; then
    echo "📦 package.json 发生变化，执行 pnpm install..."
    pnpm install
    echo "$CURRENT_HASH" > "$PACKAGE_HASH_FILE"
else
    echo "✅ package.json 未变化，跳过 pnpm install"
fi

# 构建项目
echo "⚙️ 开始构建项目..."
pnpm build

# 拷贝生成的文件到目标目录
echo "🚚 拷贝到网站根目录..."
rm -rf /www/wwwroot/yingzya.top/*
cp -r .output/public/* /www/wwwroot/yingzya.top/

echo "✅ 部署完成"
```

### 4、启动服务(pm2防挂)

```bash
npm install -g pm2
pm2 start server.js --name webhook
pm2 save
pm2 startup  # 设置开机自启
```

##  第 3 步：GitHub 设置 Webhook

 打开 GitHub 仓库 → `Settings` → `Webhooks`

- **Payload URL**：

```bash
http://你的服务器公网IP:6688/webhook
```

- **Content type**：`application/json`

- **Secret**：填写你在 `server.js` 中设的 secret（比如 `your_secret`）

- 触发事件选择：

  -  只勾选 `Just the push event` 即可

## 可能的错误

你可能碰到Github上Webhook返回200，但是没更新，请查看你设置的目录 `/home/qinyu/nuxt-blog` 并不是一个 Git 仓库。

可能你：

- 没有执行 `git clone 仓库地址`
- 或者部署脚本中的工作目录设置错了

## Nuxt静态部署

如果你的博客和我一样是Nuxt的话，完全可以本地构建 + 只同步静态文件到服务器。

我之前用上面的方式，服务器上构建，太慢了，于是我想到了这种方法。

在Github创建一个分支，用来专门存储静态文件，然后服务器只拉取这个分支。这里取分支为`gh-pages`

- **每次 push 代码到 `main` 分支**

- **自动构建 Nuxt 静态站点**

- **自动把 `.output/public` 推送到 `gh-pages` 分支**

**服务器只需要：**

- 拉取最新的静态文件（比如 `git pull` 或通过 rsync）
- 直接部署到网站目录 `/www/wwwroot/xxxxx`
- 不用 `pnpm install` 或 `pnpm build`

**服务器初始化**:

假设你服务器网站目录为空或没初始化过：

下面是以我自己的为例:

```bash
cd /www/wwwroot
git clone https://github.com/yingzya/yingzya.github.io.git yingzya.top
cd yingzya.top
git checkout -b gh-pages origin/gh-pages
```

然后创建文件`.github/workflows/deploy.yml`

```yaml
name: Deploy Nuxt Static Site

on:
  push:
    branches:
      - main

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'  # 或你本地用的版本

      - name: Install pnpm
        run: npm install -g pnpm

      - name: Install dependencies
        run: pnpm install

      - name: Build Nuxt project
        run: pnpm build

      - name: Deploy to gh-pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: .output/public
          publish_branch: gh-pages
```

### 可能的错误

`The requested URL returned error: 403`

`github-actions[bot]` 没有权限推送到你的仓库，导致 403 拒绝访问。

打开你Github的项目，然后settings，然后左侧点击Actions，点击Gereral，确保下面的两个勾选上了

![10370](https://7.isyangs.cn/20250731/723b20ec409cf0976ee3459cf32c2809.png)

记得配置下面的**Token**，如果访问权限不够的话。

![10371](https://7.isyangs.cn/20250731/b67f9cf6ba2490e5d050a288d0ecca0f.png)

**解决方法一：给 Actions 用一个 PAT 代替默认 token**

- 你可以在 GitHub 生成一个 **Personal Access Token (PAT)**，权限至少要包含 **repo (所有)** 权限
- 然后在你的仓库 Settings → Secrets → New repository secret 新建一个变量，比如叫 `PERSONAL_TOKEN`
- 修改 workflow 用这个 token：

**简单步骤生成 PAT：**

1. 访问 https://github.com/settings/tokens
2. 点击“Generate new token (classic)”
3. 选中 `repo` 权限（全部权限）
4. 生成后复制令牌
5. 仓库→Settings→Secrets→Actions，新建 `PERSONAL_TOKEN`，粘贴保存

### NodeJS服务

```js
const http = require('http');
const { exec } = require('child_process');

const PORT = 6688;  // 监听端口
const SECRET = 'your_webhook_secret'; // 你在 GitHub webhook 里设置的 secret，和这里对应

// 简单验证签名（可选，生产建议实现）
function verifySignature(req, body) {
  // 这里为了示例，暂时不验证，直接返回 true
  return true;
}

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/webhook') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      if (!verifySignature(req, body)) {
        res.writeHead(403);
        res.end('Invalid signature');
        return;
      }

      let payload;
      try {
        payload = JSON.parse(body);
      } catch {
        res.writeHead(400);
        res.end('Invalid JSON');
        return;
      }

      // 只处理 gh-pages 分支的 push 事件
      if (payload.ref === 'refs/heads/gh-pages') {
        console.log('🚀 gh-pages 分支更新，开始部署脚本...');
        exec('sh /home/qinyu/deploy.sh', (err, stdout, stderr) => {
          if (err) {
            console.error(`❌ 部署脚本执行失败: ${err.message}`);
            return;
          }
          console.log(`✅ 部署脚本输出:\n${stdout}`);
          if (stderr) {
            console.error(`⚠️ 部署脚本错误输出:\n${stderr}`);
          }
        });
      } else {
        console.log(`忽略非 gh-pages 分支更新: ${payload.ref}`);
      }

      res.writeHead(200);
      res.end('Webhook received');
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(PORT, () => {
  console.log(`Webhook 监听服务已启动，端口 ${PORT}`);
});

```

### 自动部署脚本示例（deploy.sh）

```bash
#!/bin/bash

set -e

# 1. 网站目录（请改成你的路径）
WEB_ROOT="/www/wwwroot/yingzya.top"

# 2. 进入网站目录
cd "$WEB_ROOT" || { echo "目录不存在，退出"; exit 1; }

# 3. 确保当前在 gh-pages 分支
git checkout gh-pages

# 4. 拉取最新代码
git pull origin gh-pages

echo "✅ 静态文件已更新：$(date '+%Y-%m-%d %H:%M:%S')"
```
**1. 先创建部署脚本文件**

文件在上面，按 `Ctrl + O` 保存，`Enter` 确认，然后 `Ctrl + X` 退出编辑器。

**2. 赋予可执行权限**

```bash
chmod +x /home/qinyu/deploy.sh
```

### 使用 PM2 守护运行(可选)

```bash
npm install -g pm2
pm2 start /home/qinyu/webhook.js
pm2 save
pm2 startup
```

### 动态部署

1、

```sh
#!/bin/bash

echo "🔄 开始动态部署..."

PROJECT_DIR="/home/qinyu/nuxt-blog"  # 你项目目录
APP_NAME="nuxt-blog"                 # pm2启动的进程名

cd $PROJECT_DIR || { echo "❌ 项目目录不存在，退出"; exit 1; }

# 拉取最新代码，确保干净
git fetch origin main
git reset --hard origin/main
git clean -fd

# 判断 package.json 是否有变化（缓存上一次的哈希）
PACKAGE_HASH_FILE=".package.hash"
CURRENT_HASH=$(md5sum package.json | awk '{print $1}')

if [ -f "$PACKAGE_HASH_FILE" ]; then
    LAST_HASH=$(cat "$PACKAGE_HASH_FILE")
else
    LAST_HASH=""
fi

if [ "$CURRENT_HASH" != "$LAST_HASH" ]; then
    echo "📦 package.json 变化，执行 pnpm install..."
    pnpm install
    echo "$CURRENT_HASH" > "$PACKAGE_HASH_FILE"
else
    echo "✅ package.json 未变化，跳过 pnpm install"
fi

# 构建项目
echo "⚙️ 开始构建项目..."
pnpm build

# 重启pm2进程，如果没有则启动
if pm2 describe $APP_NAME > /dev/null; then
    echo "🔄 重启 $APP_NAME"
    pm2 restart $APP_NAME
else
    echo "🚀 启动 $APP_NAME"
    pm2 start npm --name "$APP_NAME" -- run start
fi

echo "✅ 动态部署完成"
```



```js
const http = require('http');
const { exec } = require('child_process');

const PORT = 6688;  // 监听端口
const SECRET = 'your_webhook_secret'; // 你在 GitHub webhook 里设置的 secret，和这里对应

// 简单验证签名（可选，生产建议实现）
function verifySignature(req, body) {
  // 这里为了示例，暂时不验证，直接返回 true
  return true;
}

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/webhook') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      if (!verifySignature(req, body)) {
        res.writeHead(403);
        res.end('Invalid signature');
        return;
      }

      let payload;
      try {
        payload = JSON.parse(body);
      } catch {
        res.writeHead(400);
        res.end('Invalid JSON');
        return;
      }

      // 只处理 gh-pages 分支的 push 事件
      if (payload.ref === 'refs/heads/main') {
        console.log('main 分支更新，开始部署脚本...');
        exec('sh /home/qinyu/deploy.sh', (err, stdout, stderr) => {
          if (err) {
            console.error(`❌ 部署脚本执行失败: ${err.message}`);
            return;
          }
          console.log(`✅ 部署脚本输出:\n${stdout}`);
          if (stderr) {
            console.error(`⚠️ 部署脚本错误输出:\n${stderr}`);
          }
        });
      } else {
        console.log(`忽略非 gh-pages 分支更新: ${payload.ref}`);
      }

      res.writeHead(200);
      res.end('Webhook received');
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(PORT, () => {
  console.log(`Webhook 监听服务已启动，端口 ${PORT}`);
});

```

