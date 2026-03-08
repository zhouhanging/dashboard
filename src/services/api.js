const API_BASE_URL = 'http://localhost:3000/api';

// 通用请求方法
async function request(url, options = {}) {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

// Dashboard相关API
export const dashboardAPI = {
  // 获取所有dashboard
  getAll: () => request('/dashboards'),
  
  // 创建新dashboard
  create: (data) => request('/dashboards', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  // 获取单个dashboard
  getOne: (id) => request(`/dashboards/${id}`),
  
  // 更新dashboard
  update: (id, data) => request(`/dashboards/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  
  // 删除dashboard
  delete: (id) => request(`/dashboards/${id}`, {
    method: 'DELETE'
  })
};