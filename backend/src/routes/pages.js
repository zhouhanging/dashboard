const express = require('express');
const router = express.Router();
const Page = require('../models/Page');

// 获取用户页面列表
router.get('/list', async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const pages = await Page.findByUserId(user_id);
    res.json({ success: true, data: pages });
  } catch (error) {
    console.error('获取页面列表失败:', error);
    res.json({ success: false, message: '获取页面列表失败' });
  }
});

// 保存页面
router.post('/save', async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { bgType, bgUrl, layoutJson, title = '未命名页面', isPublic = 0 } = req.body;
    
    // 检查是否已有页面
    const pages = await Page.findByUserId(user_id);
    if (pages.length > 0) {
      // 更新现有页面
      const updated = await Page.update(
        pages[0].id,
        user_id,
        title,
        layoutJson,
        bgType,
        bgUrl,
        isPublic
      );
      if (updated) {
        res.json({ success: true, message: '保存成功' });
      } else {
        res.json({ success: false, message: '保存失败' });
      }
    } else {
      // 创建新页面
      const pageId = await Page.create(
        user_id,
        title,
        layoutJson,
        bgType,
        bgUrl,
        isPublic
      );
      if (pageId) {
        res.json({ success: true, message: '保存成功' });
      } else {
        res.json({ success: false, message: '保存失败' });
      }
    }
  } catch (error) {
    console.error('保存页面失败:', error);
    res.json({ success: false, message: '保存页面失败' });
  }
});

// 获取页面详情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const page = await Page.findById(id);
    if (page) {
      res.json({ success: true, data: page });
    } else {
      res.json({ success: false, message: '页面不存在' });
    }
  } catch (error) {
    console.error('获取页面详情失败:', error);
    res.json({ success: false, message: '获取页面详情失败' });
  }
});

module.exports = router;