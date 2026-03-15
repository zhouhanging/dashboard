const { pool, memoryStorage } = require('../config/database');

class Component {
  static async create(user_id, name, content_json, is_public = 0) {
    try {
      if (pool) {
        // 使用数据库
        const [result] = await pool.execute(
          'INSERT INTO components (user_id, name, content_json, is_public) VALUES (?, ?, ?, ?)',
          [user_id, name, content_json, is_public]
        );
        
        return result.insertId;
      } else {
        // 使用内存存储
        const newComponent = {
          id: memoryStorage.components.length + 1,
          user_id,
          name,
          content_json,
          is_public,
          create_time: new Date()
        };
        memoryStorage.components.push(newComponent);
        return newComponent.id;
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
          'SELECT * FROM components WHERE user_id = ? ORDER BY create_time DESC',
          [user_id]
        );
        
        return rows;
      } else {
        // 使用内存存储
        return memoryStorage.components
          .filter(component => component.user_id === user_id)
          .sort((a, b) => new Date(b.create_time) - new Date(a.create_time));
      }
    } catch (error) {
      throw error;
    }
  }
  
  static async findPublic() {
    try {
      if (pool) {
        // 使用数据库
        const [rows] = await pool.execute(
          `SELECT c.*, u.username FROM components c 
           LEFT JOIN users u ON c.user_id = u.id 
           WHERE c.is_public = 1 
           ORDER BY c.create_time DESC`
        );
        
        return rows;
      } else {
        // 使用内存存储
        return memoryStorage.components
          .filter(component => component.is_public === 1)
          .map(component => {
            const user = memoryStorage.users.find(user => user.id === component.user_id);
            return {
              ...component,
              username: user ? user.username : 'unknown'
            };
          })
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
          'SELECT * FROM components WHERE id = ?',
          [id]
        );
        
        return rows[0] || null;
      } else {
        // 使用内存存储
        return memoryStorage.components.find(component => component.id === id) || null;
      }
    } catch (error) {
      throw error;
    }
  }
  
  static async update(id, user_id, name, content_json, is_public) {
    try {
      if (pool) {
        // 使用数据库
        const [result] = await pool.execute(
          'UPDATE components SET name = ?, content_json = ?, is_public = ? WHERE id = ? AND user_id = ?',
          [name, content_json, is_public, id, user_id]
        );
        
        return result.affectedRows > 0;
      } else {
        // 使用内存存储
        const componentIndex = memoryStorage.components.findIndex(component => component.id === id && component.user_id === user_id);
        if (componentIndex !== -1) {
          memoryStorage.components[componentIndex] = {
            ...memoryStorage.components[componentIndex],
            name,
            content_json,
            is_public
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
          'DELETE FROM components WHERE id = ? AND user_id = ?',
          [id, user_id]
        );
        
        return result.affectedRows > 0;
      } else {
        // 使用内存存储
        const initialLength = memoryStorage.components.length;
        memoryStorage.components = memoryStorage.components.filter(component => !(component.id === id && component.user_id === user_id));
        return memoryStorage.components.length < initialLength;
      }
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Component;