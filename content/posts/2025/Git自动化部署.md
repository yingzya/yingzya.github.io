---
title: Git自动化部署
description: Git自动化部署
date: 2025-07-31 19:42:40
updated: 2025-07-31 19:42:40
# image: https://7.isyangs.cn/20250731/2a767389db86969893e17922d767fb6a.jpg
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

记得**安全组**开放**6688**端口，也可以自己更换别的端口

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

内容如下(根据自己的项目路径调整)

```bash
#!/bin/bash
cd /home/qinyu/nuxt-blog || exit

echo "🔄 Pulling latest code..."
git pull

echo "Installing dependencies..."
pnpm install

echo "Building project..."
pnpm build

echo "Copying files to /www/wwwroot/yingzya.top ..."
cp -r .output/public/* /www/wwwroot/yingzya.top/

echo "Deployment complete."

```

### 4、启动服务(pm2防挂)

```bash
npm install -g pm2
pm2 start server.js --name webhook
pm2 save
pm2 startup  # 设置开机自启
```

##  第 3 步：GitHub 设置 Webhook

### 打开 GitHub 仓库 → `Settings` → `Webhooks`

- **Payload URL**：

  ```ur
  http://你的服务器公网IP:6688/webhook
  ```

- **Content type**：`application/json`

- **Secret**：填写你在 `server.js` 中设的 secret（比如 `your_secret`）

- 触发事件选择：

  -  只勾选 `Just the push event` 即可

