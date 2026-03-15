const mysql = require('mysql2/promise');
require('dotenv').config();

// 内存存储，作为数据库的备选方案
const memoryStorage = {
  users: [],
  pages: [],
  components: [],
  assets: []
};

// 创建数据库连接池
let pool = null;
try {
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '@Dollar99999',
    database: process.env.DB_NAME || 'web_editor',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
} catch (error) {
  console.warn('数据库连接失败，将使用内存存储:', error);
  pool = null;
}

// 测试数据库连接
async function testConnection() {
  if (!pool) {
    console.log('使用内存存储');
    return;
  }
  try {
    const connection = await pool.getConnection();
    console.log('数据库连接成功');
    connection.release();
  } catch (error) {
    console.error('数据库连接失败:', error);
    pool = null;
  }
}

// 初始化数据库表
async function initDatabase() {
  if (!pool) {
    console.log('使用内存存储，跳过数据库初始化');
    return;
  }
  try {
    const connection = await pool.getConnection();
    
    // 创建 users 表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(100) NOT NULL,
        nickname VARCHAR(50),
        create_time DATETIME DEFAULT NOW()
      )
    `);
    
    // 创建 pages 表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS pages (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        title VARCHAR(100),
        layout_json LONGTEXT,
        bg_type ENUM('image','video','color'),
        bg_url TEXT,
        is_public TINYINT DEFAULT 0,
        update_time DATETIME DEFAULT NOW(),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    
    // 创建 components 表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS components (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        name VARCHAR(100),
        content_json LONGTEXT,
        is_public TINYINT DEFAULT 0,
        create_time DATETIME DEFAULT NOW(),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    
    // 创建 assets 表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS assets (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        file_type VARCHAR(20),
        url TEXT,
        size INT,
        create_time DATETIME DEFAULT NOW(),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    
    console.log('数据库表创建成功');
    connection.release();
  } catch (error) {
    console.error('数据库表创建失败:', error);
    pool = null;
  }
}

module.exports = {
  pool,
  memoryStorage,
  testConnection,
  initDatabase
};