const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const Dashboard = require('./models/Dashboard');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 连接数据库
connectDB();

// API路由
app.get('/api/dashboards', async (req, res) => {
  try {
    const dashboards = await Dashboard.find();
    res.json(dashboards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/dashboards', async (req, res) => {
  try {
    const dashboard = new Dashboard(req.body);
    const savedDashboard = await dashboard.save();
    res.status(201).json(savedDashboard);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get('/api/dashboards/:id', async (req, res) => {
  try {
    const dashboard = await Dashboard.findById(req.params.id);
    if (!dashboard) {
      return res.status(404).json({ message: 'Dashboard not found' });
    }
    res.json(dashboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/dashboards/:id', async (req, res) => {
  try {
    const dashboard = await Dashboard.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!dashboard) {
      return res.status(404).json({ message: 'Dashboard not found' });
    }
    res.json(dashboard);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/dashboards/:id', async (req, res) => {
  try {
    const dashboard = await Dashboard.findByIdAndDelete(req.params.id);
    if (!dashboard) {
      return res.status(404).json({ message: 'Dashboard not found' });
    }
    res.json({ message: 'Dashboard deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 启动服务器
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});