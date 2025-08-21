---
title: PicGo配置去图图床
description: PicGo实现去图图床配置，通过下载第三方插件，配置HEAD以及Body实现上传以及和Typora的联动
date: 2025-08-01 17:15:43
updated: 2025-08-04 
image: https://7.isyangs.cn/20250801/cc418048d677e4b6a6d512f75603b372.png
# type: story
categories: [配置]
tags: [插件]

---

## 1、下载web-uploader插件
::pic
---
src: https://7.isyangs.cn/20250801/8feea263d6805764727fbb2fa9a9dd8f.png
caption: 第三方插件
---
::
## 2、点击图床设置

配置如下，按着配置就行了。注意的是自定义请求头里要填写你自己的**Token**。

API地址为:
```bash
https://7tu.top/api/v2/upload
```

POST参数名为:

```bash
file
```

JSON路径为:

```bash
data.public_url
```

自定义Body为:

```js
{"storage_id":"5","is_public":"0"}
```

这里is_public是选择是否公开图片。按照自己需求即可。

::pic
---
src: https://7.isyangs.cn/20250801/b4db61781c20c78bf7a3505d7023b949.png
caption: 图床配置
---
::

## 3、自定义请求头

如何获取**Token**？

点击我的令牌，新建即可，记得保存，一会填请求头会用到。

::pic
---
src: https://7.isyangs.cn/20250801/d265b50e104fcc5263ea901888f05039.png
caption: 
---
::

请求头的格式如下:
```js
{"Authorization":"Bearer 这里填写你的Token","Accept":"application/json"}
```

比如你的Token是`mytoken-test`

那么你的自定义请求头就写为:

```js
{"Authorization":"Bearer mytoken-test","Accept":"application/json"}
```

之后就可以正常使用了，包括与**Typora**联动。
