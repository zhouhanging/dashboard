const { pool, memoryStorage } = require('../config/database');

class Asset {
  static async create(user_id, file_type, url, size) {
    try {
      if (pool) {
        // 使用数据库
        const [result] = await pool.execute(
          'INSERT INTO assets (user_id, file_type, url, size) VALUES (?, ?, ?, ?)',
          [user_id, file_type, url, size]
        );
        
        return result.insertId;
      } else {
        // 使用内存存储
        const newAsset = {
          id: memoryStorage.assets.length + 1,
          user_id,
          file_type,
          url,
          size,
          create_time: new Date()
        };
        memoryStorage.assets.push(newAsset);
        return newAsset.id;
      }
    } catch (error) {
      throw error;
    }
  }
  
  static async findByUserId(user_id) {
    try {
      if (pool) {
        // 使用数据库
        const [rows] = await pool.execute(
          'SELECT * FROM assets WHERE user_id = ? ORDER BY create_time DESC',
          [user_id]
        );
        
        return rows;
      } else {
        // 使用内存存储
        return memoryStorage.assets
          .filter(asset => asset.user_id === user_id)
          .sort((a, b) => new Date(b.create_time) - new Date(a.create_time));
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
          'SELECT * FROM assets WHERE id = ?',
          [id]
        );
        
        return rows[0] || null;
      } else {
        // 使用内存存储
        return memoryStorage.assets.find(asset => asset.id === id) || null;
      }
    } catch (error) {
      throw error;
    }
  }
  
  static async delete(id, user_id) {
    try {
      if (pool) {
        // 使用数据库
        const [result] = await pool.execute(
          'DELETE FROM assets WHERE id = ? AND user_id = ?',
          [id, user_id]
        );
        
        return result.affectedRows > 0;
      } else {
        // 使用内存存储
        const initialLength = memoryStorage.assets.length;
        memoryStorage.assets = memoryStorage.assets.filter(asset => !(asset.id === id && asset.user_id === user_id));
        return memoryStorage.assets.length < initialLength;
      }
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Asset;