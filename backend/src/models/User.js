const { pool, memoryStorage } = require('../config/database');
const bcrypt = require('bcrypt');

class User {
  static async create(username, password, nickname) {
    try {
      // 加密密码
      const hashedPassword = await bcrypt.hash(password, 10);
      
      if (pool) {
        try {
          // 使用数据库
          const [result] = await pool.execute(
            'INSERT INTO users (username, password, nickname) VALUES (?, ?, ?)',
            [username, hashedPassword, nickname]
          );
          
          return result.insertId;
        } catch (error) {
          // 数据库操作失败，使用内存存储
          console.warn('数据库操作失败，使用内存存储:', error);
          const newUser = {
            id: memoryStorage.users.length + 1,
            username,
            password: hashedPassword,
            nickname,
            create_time: new Date()
          };
          memoryStorage.users.push(newUser);
          return newUser.id;
        }
      } else {
        // 使用内存存储
        const newUser = {
          id: memoryStorage.users.length + 1,
          username,
          password: hashedPassword,
          nickname,
          create_time: new Date()
        };
        memoryStorage.users.push(newUser);
        return newUser.id;
      }
    } catch (error) {
      throw error;
    }
  }
  
  static async findByUsername(username) {
    try {
      if (pool) {
        try {
          // 使用数据库
          const [rows] = await pool.execute(
            'SELECT * FROM users WHERE username = ?',
            [username]
          );
          
          return rows[0] || null;
        } catch (error) {
          // 数据库操作失败，使用内存存储
          console.warn('数据库操作失败，使用内存存储:', error);
          return memoryStorage.users.find(user => user.username === username) || null;
        }
      } else {
        // 使用内存存储
        return memoryStorage.users.find(user => user.username === username) || null;
      }
    } catch (error) {
      throw error;
    }
  }
  
  static async findById(id) {
    try {
      if (pool) {
        // 使用数据库
        const [rows] = await pool.execute(
          'SELECT * FROM users WHERE id = ?',
          [id]
        );
        
        return rows[0] || null;
      } else {
        // 使用内存存储
        return memoryStorage.users.find(user => user.id === id) || null;
      }
    } catch (error) {
      throw error;
    }
  }
  
  static async verifyPassword(password, hashedPassword) {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;