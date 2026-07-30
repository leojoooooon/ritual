const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// 托管前端静态文件
app.use(express.static('public'));
// 开放 photos 文件夹，让前端可以直接读取图片文件
app.use('/photos', express.static(path.join(__dirname, 'photos')));

// API：只返回照片的文件名列表
app.get('/api/photos', (req, res) => {
  const photosDir = path.join(__dirname, 'photos');
  try {
    const files = fs.readdirSync(photosDir).filter(file => {
      // 统一转小写进行匹配，完美解决 .JPG 和 .jpg 的问题
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png'].includes(ext);
    });
    res.json(files);
  } catch (error) {
    console.error("读取照片目录失败:", error);
    res.status(500).json({ error: "无法读取照片" });
  }
});

app.listen(port, () => {
  console.log(`新版服务器已启动: http://localhost:${port}`);
});