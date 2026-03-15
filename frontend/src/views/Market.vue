<template>
  <div class="market-container">
    <div class="market-header">
      <h2>组件市场</h2>
      <el-button @click="goBack">返回编辑</el-button>
    </div>
    <div class="market-content">
      <div class="component-list">
        <div 
          v-for="component in components" 
          :key="component.id"
          class="component-item"
          @click="useComponent(component)"
        >
          <div class="component-header">
            <h3>{{ component.name }}</h3>
            <span class="component-author">{{ component.username }}</span>
          </div>
          <div class="component-preview">
            <!-- 这里可以添加组件预览 -->
            <div class="preview-placeholder">
              <span>组件预览</span>
            </div>
          </div>
          <div class="component-actions">
            <el-button size="small" type="primary" @click.stop="useComponent(component)">使用</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useEditorStore } from '../store/editor'

const router = useRouter()
const store = useEditorStore()
const components = ref([])

// 返回编辑页面
function goBack() {
  router.push('/editor')
}

// 使用组件
function useComponent(component) {
  try {
    const blocks = JSON.parse(component.content_json)
    store.setBlocks(blocks)
    ElMessage.success('组件加载成功')
    router.push('/editor')
  } catch (error) {
    ElMessage.error('组件加载失败：' + error.message)
  }
}

onMounted(() => {
  // 加载公共组件
  axios.get('/api/component/market').then(response => {
    if (response.data.success) {
      components.value = response.data.data
    }
  })
})
</script>

<style scoped>
.market-container {
  width: 100vw;
  height: 100vh;
  background: #0a101f;
  overflow: hidden;
  position: relative;
}

.market-header {
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  align-items: center;
  gap: 20px;
  z-index: 100;
}

.market-header h2 {
  color: #00d2ff;
  margin: 0;
}

.market-header .el-button {
  background: rgba(18,28,58,0.8);
  border: 1px solid rgba(0,210,255,0.3);
  color: #fff;
}

.market-header .el-button:hover {
  border-color: #00d2ff;
  box-shadow: 0 0 10px rgba(0,210,255,0.4);
}

.market-content {
  width: 100%;
  height: 100%;
  padding-top: 80px;
  overflow-y: auto;
}

.component-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  padding: 20px;
}

.component-item {
  background: rgba(18,28,58,0.6);
  border: 1px solid rgba(0,210,255,0.3);
  border-radius: 10px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.component-item:hover {
  border-color: #00d2ff;
  box-shadow: 0 0 20px rgba(0,210,255,0.4);
  transform: translateY(-5px);
}

.component-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.component-header h3 {
  color: #00d2ff;
  margin: 0;
  font-size: 16px;
}

.component-author {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.component-preview {
  height: 200px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  margin-bottom: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.preview-placeholder {
  color: rgba(255, 255, 255, 0.4);
  font-size: 14px;
}

.component-actions {
  display: flex;
  justify-content: flex-end;
}

.component-actions .el-button {
  background: #00d2ff;
  border-color: #00d2ff;
  color: #0a101f;
}

.component-actions .el-button:hover {
  background: #00b8e6;
  border-color: #00b8e6;
}
</style>