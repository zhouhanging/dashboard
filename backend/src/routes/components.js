const express = require('express');
const router = express.Router();
const Component = require('../models/Component');

// 获取公共组件列表
router.get('/market', async (req, res) => {
  try {
    const components = await Component.findPublic();
    res.json({ success: true, data: components });
  } catch (error) {
    console.error('获取公共组件失败:', error);
    res.json({ success: false, message: '获取公共组件失败' });
  }
});

// 上传组件
router.post('/upload', async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { name, contentJson, isPublic = 1 } = req.body;
    
    const componentId = await Component.create(
      user_id,
      name,
      contentJson,
      isPublic
    );
    
    if (componentId) {
      res.json({ success: true, message: '上传成功' });
    } else {
      res.json({ success: false, message: '上传失败' });
    }
  } catch (error) {
    console.error('上传组件失败:', error);
    res.json({ success: false, message: '上传组件失败' });
  }
});

// 获取用户组件列表
router.get('/list', async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const components = await Component.findByUserId(user_id);
    res.json({ success: true, data: components });
  } catch (error) {
    console.error('获取组件列表失败:', error);
    res.json({ success: false, message: '获取组件列表失败' });
  }
});

module.exports = router;