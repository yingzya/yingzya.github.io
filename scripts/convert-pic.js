import fs from "fs";
import path from "path";

//node scripts/convert-pic.js test.md

// 固定目录
const postsDir = "E:/Project/blog/content/posts/2025";

// 获取命令行参数，第一个参数是文件名
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log("请指定要转换的 Markdown 文件名，例如：node convert-pic.js test.md");
  process.exit(1);
}

const fileName = args[0];
const inputFile = path.join(postsDir, fileName);

// 检查文件是否存在
if (!fs.existsSync(inputFile)) {
  console.log(`文件不存在: ${inputFile}`);
  process.exit(1);
}

// 直接覆盖原文件
const outputFile = inputFile;

// 读取文件内容
let content = fs.readFileSync(inputFile, "utf-8");

// 匹配 Markdown 图片 ![xxx](url)
const regex = /!\[.*?\]\((.*?)\)/g;

// 替换为 ::pic 块，caption 先留空
content = content.replace(regex, (_, url) => {
  return `::pic
---
src: ${url}
caption: 
---
::`;
});

// 写入文件（覆盖原文件）
fs.writeFileSync(outputFile, content, "utf-8");

console.log(`已覆盖转换: ${outputFile}`);
