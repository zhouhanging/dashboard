<template>
  <div class="preview-container">
    <div class="preview-header">
      <h2>预览页面</h2>
      <el-button @click="goBack">返回编辑</el-button>
    </div>
    <div class="preview-content">
      <!-- 底层背景 -->
      <div class="bg-layer">
        <img v-if="bgType === 'image'" :src="bgUrl" />
        <video v-else-if="bgType === 'video'" :src="bgUrl" loop muted />
      </div>

      <!-- 内容层 -->
      <div class="content-layer">
        <div 
          v-for="item in blocks" 
          :key="item.id"
          class="block-item"
          :style="item.style"
        >
          <div class="block-header">
            <span class="block-title">{{ item.title }}</span>
          </div>
          <div class="block-content">
            {{ item.content }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useEditorStore } from '../store/editor'

const router = useRouter()
const store = useEditorStore()

// 从 store 获取状态
const blocks = computed(() => store.blocks)
const bgType = computed(() => store.bgType)
const bgUrl = computed(() => store.bgUrl)

// 返回编辑页面
function goBack() {
  router.push('/editor')
}

onMounted(() => {
  // 不加载页面数据，避免初始化模块
})
</script>

<style scoped>
.preview-container {
  width: 100vw;
  height: 100vh;
  background: #0a101f;
  overflow: hidden;
  position: relative;
}

.preview-header {
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  align-items: center;
  gap: 20px;
  z-index: 100;
}

.preview-header h2 {
  color: #00d2ff;
  margin: 0;
}

.preview-header .el-button {
  background: rgba(18,28,58,0.8);
  border: 1px solid rgba(0,210,255,0.3);
  color: #fff;
}

.preview-header .el-button:hover {
  border-color: #00d2ff;
  box-shadow: 0 0 10px rgba(0,210,255,0.4);
}

.preview-content {
  width: 100%;
  height: 100%;
  position: relative;
}

/* 底层 */
.bg-layer {
  position: absolute;
  inset: 0;
  filter: brightness(0.7) blur(2px);
}

.bg-layer img,
.bg-layer video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 内容层 */
.content-layer {
  position: absolute;
  inset: 0;
  backdrop-filter: blur(2px);
  padding: 20px;
}

/* 区块样式 */
.block-item {
  background: rgba(18,28,58,0.6);
  border: 1px solid rgba(0,210,255,0.3);
  box-shadow: 0 0 12px rgba(0,210,255,0.2);
  border-radius: 6px;
  margin-bottom: 20px;
}

.block-header {
  padding: 10px 15px;
  border-bottom: 1px solid rgba(0,210,255,0.3);
}

.block-title {
  font-size: 14px;
  font-weight: bold;
  color: #00d2ff;
}

.block-content {
  padding: 15px;
  min-height: 100px;
}
</style>