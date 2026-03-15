const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// 注册
router.post('/register', async (req, res) => {
  try {
    const { username, password, nickname } = req.body;
    
    // 检查用户名是否已存在
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.json({ success: false, message: '用户名已存在' });
    }
    
    // 创建用户
    const userId = await User.create(username, password, nickname || username);
    
    res.json({ success: true, message: '注册成功' });
  } catch (error) {
    console.error('注册失败:', error);
    res.json({ success: false, message: '注册失败' });
  }
});

// 登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // 查找用户
    const user = await User.findByUsername(username);
    if (!user) {
      return res.json({ success: false, message: '用户名或密码错误' });
    }
    
    // 验证密码
    const isValid = await User.verifyPassword(password, user.password);
    if (!isValid) {
      return res.json({ success: false, message: '用户名或密码错误' });
    }
    
    // 生成 token
    const token = jwt.sign(
      { user_id: user.id, username: user.username },
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
    
    res.json({ success: true, token, user: { id: user.id, username: user.username, nickname: user.nickname } });
  } catch (error) {
    console.error('登录失败:', error);
    res.json({ success: false, message: '登录失败' });
  }
});

module.exports = router;