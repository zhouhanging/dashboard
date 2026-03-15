const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();

// 导入路由
const usersRouter = require('./routes/users');
const pagesRouter = require('./routes/pages');
const componentsRouter = require('./routes/components');
const uploadRouter = require('./routes/upload');

// 导入数据库配置
const { testConnection, initDatabase } = require('./config/database');

const app = express();
const port = process.env.PORT || 8080;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// JWT 中间件
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.json({ success: false, message: '请先登录' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.json({ success: false, message: '无效的 token' });
  }
}

// 路由
app.use('/api', usersRouter);
app.use('/api/page', authMiddleware, pagesRouter);
app.use('/api/component', authMiddleware, componentsRouter);
app.use('/api/upload', authMiddleware, uploadRouter);

// 测试路由
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: '测试成功' });
});

// 启动服务器
async function startServer() {
  try {
    // 测试数据库连接
    await testConnection();
    
    // 初始化数据库表
    await initDatabase();
    
    // 启动服务器
    app.listen(port, () => {
      console.log(`服务器运行在 http://localhost:${port}`);
    });
  } catch (error) {
    console.error('启动服务器失败:', error);
  }
}

startServer();