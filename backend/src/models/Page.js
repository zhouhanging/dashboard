const { pool, memoryStorage } = require('../config/database');

class Page {
  static async create(user_id, title, layout_json, bg_type, bg_url, is_public = 0) {
    try {
      if (pool) {
        try {
          // 使用数据库
          const [result] = await pool.execute(
            'INSERT INTO pages (user_id, title, layout_json, bg_type, bg_url, is_public) VALUES (?, ?, ?, ?, ?, ?)',
            [user_id, title, layout_json, bg_type, bg_url, is_public]
          );
          
          return result.insertId;
        } catch (error) {
          // 数据库操作失败，使用内存存储
          console.warn('数据库操作失败，使用内存存储:', error);
          const newPage = {
            id: memoryStorage.pages.length + 1,
            user_id,
            title,
            layout_json,
            bg_type,
            bg_url,
            is_public,
            update_time: new Date()
          };
          memoryStorage.pages.push(newPage);
          return newPage.id;
        }
      } else {
        // 使用内存存储
        const newPage = {
          id: memoryStorage.pages.length + 1,
          user_id,
          title,
          layout_json,
          bg_type,
          bg_url,
          is_public,
          update_time: new Date()
        };
        memoryStorage.pages.push(newPage);
        return newPage.id;
      }
    } catch (error) {
      throw error;
    }
  }
  
  static async findByUserId(user_id) {
    try {
      if (pool) {
        try {
          // 使用数据库
          const [rows] = await pool.execute(
            'SELECT * FROM pages WHERE user_id = ? ORDER BY update_time DESC',
            [user_id]
          );
          
          return rows;
        } catch (error) {
          // 数据库操作失败，使用内存存储
          console.warn('数据库操作失败，使用内存存储:', error);
          return memoryStorage.pages
            .filter(page => page.user_id === user_id)
            .sort((a, b) => new Date(b.update_time) - new Date(a.update_time));
        }
      } else {
        // 使用内存存储
        return memoryStorage.pages
          .filter(page => page.user_id === user_id)
          .sort((a, b) => new Date(b.update_time) - new Date(a.update_time));
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
          'SELECT * FROM pages WHERE id = ?',
          [id]
        );
        
        return rows[0] || null;
      } else {
        // 使用内存存储
        return memoryStorage.pages.find(page => page.id === id) || null;
      }
    } catch (error) {
      throw error;
    }
  }
  
  static async update(id, user_id, title, layout_json, bg_type, bg_url, is_public) {
    try {
      if (pool) {
        // 使用数据库
        const [result] = await pool.execute(
          'UPDATE pages SET title = ?, layout_json = ?, bg_type = ?, bg_url = ?, is_public = ?, update_time = NOW() WHERE id = ? AND user_id = ?',
          [title, layout_json, bg_type, bg_url, is_public, id, user_id]
        );
        
        return result.affectedRows > 0;
      } else {
        // 使用内存存储
        const pageIndex = memoryStorage.pages.findIndex(page => page.id === id && page.user_id === user_id);
        if (pageIndex !== -1) {
          memoryStorage.pages[pageIndex] = {
            ...memoryStorage.pages[pageIndex],
            title,
            layout_json,
            bg_type,
            bg_url,
            is_public,
            update_time: new Date()
          };
          return true;
        }
        return false;
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
          'DELETE FROM pages WHERE id = ? AND user_id = ?',
          [id, user_id]
        );
        
        return result.affectedRows > 0;
      } else {
        // 使用内存存储
        const initialLength = memoryStorage.pages.length;
        memoryStorage.pages = memoryStorage.pages.filter(page => !(page.id === id && page.user_id === user_id));
        return memoryStorage.pages.length < initialLength;
      }
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Page;