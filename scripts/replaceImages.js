import fs from 'fs';
import path from 'path';

// 在脚本内指定文件夹路径
const folderPath = 'E:/Project/blog/content/posts/2025';  

// 从命令行获取文件名
const fileName = process.argv[2];

if (!fileName) {
  console.error('请指定要转换的 Markdown 文件名');
  process.exit(1);
}

// 拼接出文件的完整路径
const filePath = path.join(folderPath, fileName);

fs.readFile(filePath, 'utf-8', (err, data) => {
  if (err) {
    console.error('读取文件失败:', filePath);
    return;
  }

  // 使用正则表达式替换图片路径
  const updatedData = data.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, altText, imgPath) => {
    // 构造新的格式：::pic ... :: 形式
    return `::pic\n---\nsrc: ${imgPath}\ncaption: \n---\n::`;
  });

  // 如果内容有变化，则写回文件
  if (updatedData !== data) {
    fs.writeFile(filePath, updatedData, 'utf-8', (err) => {
      if (err) {
        console.error('写入文件失败:', filePath);
      } else {
        console.log(`已更新: ${filePath}`);
      }
    });
  } else {
    console.log('文件未发生变化');
  }
});
