const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Asset = require('../models/Asset');

// 配置文件存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// 确保上传目录存在
const fs = require('fs');
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 上传文件
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const file = req.file;
    
    if (!file) {
      return res.json({ success: false, message: '请选择文件' });
    }
    
    // 保存到数据库
    const assetId = await Asset.create(
      user_id,
      file.mimetype,
      `/uploads/${file.filename}`,
      file.size
    );
    
    if (assetId) {
      res.json({ success: true, data: { url: `/uploads/${file.filename}` } });
    } else {
      res.json({ success: false, message: '上传失败' });
    }
  } catch (error) {
    console.error('上传文件失败:', error);
    res.json({ success: false, message: '上传文件失败' });
  }
});

module.exports = router;