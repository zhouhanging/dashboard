<template>
  <div class="app">
    <h1>可视化大屏设计工具</h1>
    <div class="dashboard-container">
      <div class="sidebar">
        <h2>组件库</h2>
        <!-- 组件库内容 -->
      </div>
      <div class="canvas">
        <!-- 画布内容 -->
        <h3>拖拽组件到此处</h3>
        <button @click="testAPI" class="test-btn">测试API连接</button>
      </div>
      <div class="properties">
        <h2>属性设置</h2>
        <!-- 属性设置内容 -->
        <div v-if="apiTestResult" class="api-result">
          <p>API测试结果: {{ apiTestResult }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { dashboardAPI } from './services/api';

export default {
  name: 'App',
  data() {
    return {
      apiTestResult: null
    };
  },
  methods: {
    async testAPI() {
      try {
        const result = await dashboardAPI.getAll();
        this.apiTestResult = '成功！获取到 ' + result.length + ' 个仪表盘';
      } catch (error) {
        this.apiTestResult = '失败: ' + error.message;
      }
    }
  }
}
</script>

<style scoped>
.app {
  width: 100vw;
  height: 100vh;
  background-color: #f0f2f5;
  padding: 20px;
  box-sizing: border-box;
}

h1 {
  text-align: center;
  color: #1890ff;
  margin-bottom: 30px;
}

.dashboard-container {
  display: flex;
  height: calc(100vh - 100px);
  gap: 20px;
}

.sidebar {
  width: 200px;
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.canvas {
  flex: 1;
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px dashed #d9d9d9;
}

.test-btn {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.test-btn:hover {
  background-color: #40a9ff;
}

.properties {
  width: 250px;
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.api-result {
  margin-top: 20px;
  padding: 10px;
  background-color: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 4px;
  color: #389e0d;
}
</style>