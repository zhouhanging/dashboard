<template>
  <div class="editor-container">
    <!-- 底层背景 -->
    <div class="bg-layer" ref="bgLayer">
      <img v-if="bgType === 'image'" :src="bgUrl" />
      <video v-else-if="bgType === 'video'" :src="bgUrl" loop muted />
      <canvas class="particle-bg"></canvas>
    </div>

    <!-- 上层编辑层 -->
    <div class="edit-layer" ref="editLayer">
      <div class="blocks-container">
        <div 
          v-for="item in blocks" 
          :key="item.id"
          class="block-item"
          :style="item.style"
          @mousedown="startDrag(item, $event)"
        >
          <div class="block-header">
            <span class="block-title">{{ item.title }}</span>
            <div class="block-actions">
              <el-button size="small" @click="editBlock(item.id)">编辑</el-button>
              <el-button size="small" @click="deleteBlock(item.id)">删除</el-button>
            </div>
          </div>
          <div class="block-content">
            {{ item.content }}
          </div>
          <!-- 调整大小的手柄 -->
          <div class="resizers">
            <div class="resizer resizer-top-left" @mousedown="startResize(item, 'top-left', $event)"></div>
            <div class="resizer resizer-top-right" @mousedown="startResize(item, 'top-right', $event)"></div>
            <div class="resizer resizer-bottom-left" @mousedown="startResize(item, 'bottom-left', $event)"></div>
            <div class="resizer resizer-bottom-right" @mousedown="startResize(item, 'bottom-right', $event)"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑面板 -->
    <div class="edit-panel" v-if="isEditPanelVisible">
      <div class="panel-header">
        <h3>编辑区块</h3>
        <el-button size="small" @click="closeEditPanel">关闭</el-button>
      </div>
      <div class="panel-body">
        <el-form :model="currentBlock" :rules="blockRules" ref="blockFormRef">
          <el-form-item label="标题" prop="title">
            <el-input v-model="currentBlock.title" placeholder="请输入区块标题" />
          </el-form-item>
          <el-form-item label="内容" prop="content">
            <el-input v-model="currentBlock.content" type="textarea" rows="4" placeholder="请输入区块内容" />
          </el-form-item>
          <el-form-item label="宽度" prop="style.width">
            <el-input v-model="currentBlock.style.width" placeholder="请输入宽度，如 200px" />
          </el-form-item>
          <el-form-item label="高度" prop="style.height">
            <el-input v-model="currentBlock.style.height" placeholder="请输入高度，如 100px" />
          </el-form-item>
          <el-form-item label="背景" prop="style.backgroundColor">
            <el-color-picker v-model="currentBlock.style.backgroundColor" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveBlock">保存</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <!-- 工具栏 -->
    <div class="toolbar">
      <el-button @click="addBlock">添加区块</el-button>
      <el-button @click="savePage">保存页面</el-button>
      <el-button @click="uploadComponent">上传到组件市场</el-button>
      <el-button @click="changeBgType('image')">背景图片</el-button>
      <el-button @click="changeBgType('video')">背景视频</el-button>
      <el-button @click="changeBgType('color')">背景颜色</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue'
import draggable from 'vuedraggable'
import * as THREE from 'three'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import { useEditorStore } from '../store/editor'
import { useRouter } from 'vue-router'

const router = useRouter()
const store = useEditorStore()
const bgLayer = ref(null)
const editLayer = ref(null)
const isEditPanelVisible = ref(false)
const currentBlock = ref({})
const blockFormRef = ref(null)

// 从 store 获取状态
const blocks = computed(() => store.blocks)
const bgType = computed(() => store.bgType)
const bgUrl = computed(() => store.bgUrl)

// 检查是否登录
function checkLogin() {
  const token = localStorage.getItem('token')
  if (!token) {
    ElMessage.error('请先登录')
    router.push('/login')
    return false
  }
  return true
}

// 拖拽和调整大小相关变量
const draggingBlock = ref(null)
const resizingBlock = ref(null)
const resizeType = ref(null)
const startX = ref(0)
const startY = ref(0)
const startWidth = ref(0)
const startHeight = ref(0)
const startLeft = ref(0)
const startTop = ref(0)

// 开始拖拽
function startDrag(block, event) {
  // 点击整个模块都允许拖拽，但排除调整大小的手柄和操作按钮
  if (event.target.closest('.resizer') || event.target.closest('.block-actions')) return
  
  draggingBlock.value = block
  startX.value = event.clientX
  startY.value = event.clientY
  
  // 获取当前位置
  const rect = event.target.closest('.block-item').getBoundingClientRect()
  startLeft.value = parseFloat(block.style.left) || 0
  startTop.value = parseFloat(block.style.top) || 0
  
  // 添加鼠标移动和释放事件
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
  
  event.preventDefault()
}

// 拖拽中
function onDrag(event) {
  if (!draggingBlock.value) return
  
  event.preventDefault()
  
  const deltaX = event.clientX - startX.value
  const deltaY = event.clientY - startY.value
  
  // 计算新位置
  const newLeft = (startLeft.value + deltaX) + 'px'
  const newTop = (startTop.value + deltaY) + 'px'
  
  // 创建新的style对象，确保Vue能检测到变化
  const newStyle = { ...draggingBlock.value.style }
  newStyle.left = newLeft
  newStyle.top = newTop
  newStyle.position = 'absolute'
  
  // 更新整个区块对象
  const updatedBlock = { ...draggingBlock.value, style: newStyle }
  store.updateBlock(draggingBlock.value.id, updatedBlock)
  
  // 更新draggingBlock引用
  draggingBlock.value = updatedBlock
}

// 停止拖拽
function stopDrag() {
  draggingBlock.value = null
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
}

// 开始调整大小
function startResize(block, type, event) {
  resizingBlock.value = block
  resizeType.value = type
  startX.value = event.clientX
  startY.value = event.clientY
  
  // 获取当前尺寸和位置
  const rect = event.target.closest('.block-item').getBoundingClientRect()
  startWidth.value = parseFloat(block.style.width) || rect.width
  startHeight.value = parseFloat(block.style.height) || rect.height
  startLeft.value = parseFloat(block.style.left) || 0
  startTop.value = parseFloat(block.style.top) || 0
  
  // 添加鼠标移动和释放事件
  document.addEventListener('mousemove', onResize)
  document.addEventListener('mouseup', stopResize)
  
  event.preventDefault()
}

// 调整大小中
function onResize(event) {
  if (!resizingBlock.value) return
  
  event.preventDefault()
  
  const deltaX = event.clientX - startX.value
  const deltaY = event.clientY - startY.value
  
  let newWidth = startWidth.value
  let newHeight = startHeight.value
  let newLeft = startLeft.value
  let newTop = startTop.value
  
  switch (resizeType.value) {
    case 'top-left':
      newWidth = startWidth.value - deltaX
      newHeight = startHeight.value - deltaY
      newLeft = startLeft.value + deltaX
      newTop = startTop.value + deltaY
      break
    case 'top-right':
      newWidth = startWidth.value + deltaX
      newHeight = startHeight.value - deltaY
      newTop = startTop.value + deltaY
      break
    case 'bottom-left':
      newWidth = startWidth.value - deltaX
      newHeight = startHeight.value + deltaY
      newLeft = startLeft.value + deltaX
      break
    case 'bottom-right':
      newWidth = startWidth.value + deltaX
      newHeight = startHeight.value + deltaY
      break
  }
  
  // 确保最小尺寸
  if (newWidth < 100) newWidth = 100
  if (newHeight < 50) newHeight = 50
  
  // 创建新的style对象，确保Vue能检测到变化
  const newStyle = { ...resizingBlock.value.style }
  newStyle.width = newWidth + 'px'
  newStyle.height = newHeight + 'px'
  newStyle.left = newLeft + 'px'
  newStyle.top = newTop + 'px'
  newStyle.position = 'absolute'
  
  // 更新整个区块对象
  const updatedBlock = { ...resizingBlock.value, style: newStyle }
  store.updateBlock(resizingBlock.value.id, updatedBlock)
  
  // 更新resizingBlock引用
  resizingBlock.value = updatedBlock
}

// 停止调整大小
function stopResize() {
  resizingBlock.value = null
  resizeType.value = null
  document.removeEventListener('mousemove', onResize)
  document.removeEventListener('mouseup', stopResize)
}

const blockRules = {
  title: [{ required: true, message: '请输入区块标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入区块内容', trigger: 'blur' }],
  'style.width': [{ required: true, message: '请输入宽度', trigger: 'blur' }],
  'style.height': [{ required: true, message: '请输入高度', trigger: 'blur' }]
}

// 初始化粒子背景
function initParticleBg() {
  if (!bgLayer.value) return
  
  const canvas = bgLayer.value.querySelector('.particle-bg')
  if (!canvas) return
  
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  
  const particles = new THREE.BufferGeometry()
  const particleCount = 1000
  const positions = new Float32Array(particleCount * 3)
  
  for (let i = 0; i < particleCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 10
  }
  
  particles.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const material = new THREE.PointsMaterial({ size: 0.02, color: 0x00d2ff })
  const particleSystem = new THREE.Points(particles, material)
  scene.add(particleSystem)
  
  camera.position.z = 5
  
  function animate() {
    requestAnimationFrame(animate)
    particleSystem.rotation.x += 0.0005
    particleSystem.rotation.y += 0.0005
    renderer.render(scene, camera)
  }
  
  animate()
}

// 添加区块
function addBlock() {
  if (!checkLogin()) return
  store.addBlock()
}

// 编辑区块
function editBlock(id) {
  if (!checkLogin()) return
  const block = store.getBlockById(id)
  if (block) {
    currentBlock.value = JSON.parse(JSON.stringify(block))
    isEditPanelVisible.value = true
  }
}

// 保存区块
async function saveBlock() {
  if (!checkLogin()) return
  if (!blockFormRef.value) return
  
  await blockFormRef.value.validate(async (valid) => {
    if (valid) {
      store.updateBlock(currentBlock.value.id, currentBlock.value)
      isEditPanelVisible.value = false
      ElMessage.success('保存成功')
    }
  })
}

// 删除区块
function deleteBlock(id) {
  if (!checkLogin()) return
  store.deleteBlock(id)
  ElMessage.success('删除成功')
}

// 关闭编辑面板
function closeEditPanel() {
  isEditPanelVisible.value = false
}

// 保存页面
async function savePage() {
  if (!checkLogin()) return
  try {
    const token = localStorage.getItem('token')
    const data = {
      bgType: bgType.value,
      bgUrl: bgUrl.value,
      layoutJson: JSON.stringify(blocks.value)
    }
    const response = await axios.post('/api/page/save', data, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    if (response.data.success) {
      ElMessage.success('保存成功')
    } else {
      ElMessage.error('保存失败：' + response.data.message)
    }
  } catch (error) {
    ElMessage.error('保存失败：' + error.message)
  }
}

// 上传到组件市场
async function uploadComponent() {
  if (!checkLogin()) return
  if (blocks.value.length === 0) {
    ElMessage.error('请先添加区块')
    return
  }
  
  try {
    const token = localStorage.getItem('token')
    const data = {
      name: '我的组件',
      contentJson: JSON.stringify(blocks.value),
      isPublic: 1
    }
    const response = await axios.post('/api/component/upload', data, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    if (response.data.success) {
      ElMessage.success('上传成功')
    } else {
      ElMessage.error('上传失败：' + response.data.message)
    }
  } catch (error) {
    ElMessage.error('上传失败：' + error.message)
  }
}

// 改变背景类型
function changeBgType(type) {
  if (!checkLogin()) return
  store.setBgType(type)
  if (type === 'color') {
    store.setBgUrl('#0a101f')
  }
}

onMounted(() => {
  initParticleBg()
  // 不加载页面数据，避免初始化模块
})

// 监听窗口大小变化
window.addEventListener('resize', () => {
  initParticleBg()
})
</script>

<style scoped>
.editor-container {
  width: 100vw;
  height: 100vh;
  background: #0a101f;
  overflow: hidden;
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

.particle-bg {
  position: absolute;
  inset: 0;
}

/* 编辑层 */
.edit-layer {
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
  transition: all 0.2s;
  margin-bottom: 20px;
}

.block-item:hover {
  border-color: #00d2ff;
  box-shadow: 0 0 20px rgba(0,210,255,0.4);
}

.block-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  border-bottom: 1px solid rgba(0,210,255,0.3);
  cursor: move;
  z-index: 10;
}

.block-actions {
  z-index: 20;
  position: relative;
  cursor: default;
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

/* 编辑面板 */
.edit-panel {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 400px;
  background: rgba(18,28,58,0.95);
  border: 1px solid rgba(0,210,255,0.3);
  box-shadow: 0 0 30px rgba(0,210,255,0.4);
  border-radius: 10px;
  z-index: 1000;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid rgba(0,210,255,0.3);
}

.panel-header h3 {
  color: #00d2ff;
  margin: 0;
}

.panel-body {
  padding: 20px;
}

/* 工具栏 */
.toolbar {
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  gap: 10px;
  z-index: 100;
}

.toolbar .el-button {
  background: rgba(18,28,58,0.8);
  border: 1px solid rgba(0,210,255,0.3);
  color: #fff;
}

.toolbar .el-button:hover {
  border-color: #00d2ff;
  box-shadow: 0 0 10px rgba(0,210,255,0.4);
}

/* 拖拽样式 */
.ghost {
  opacity: 0.5;
  background: rgba(0,210,255,0.2);
}

/* 调整大小手柄样式 */
.resizers {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.resizer {
  position: absolute;
  background: #00d2ff;
  z-index: 10;
}

.resizer-top-left {
  top: -5px;
  left: -5px;
  width: 10px;
  height: 10px;
  cursor: nw-resize;
  border-radius: 50%;
}

.resizer-top-right {
  top: -5px;
  right: -5px;
  width: 10px;
  height: 10px;
  cursor: ne-resize;
  border-radius: 50%;
}

.resizer-bottom-left {
  bottom: -5px;
  left: -5px;
  width: 10px;
  height: 10px;
  cursor: sw-resize;
  border-radius: 50%;
}

.resizer-bottom-right {
  bottom: -5px;
  right: -5px;
  width: 10px;
  height: 10px;
  cursor: se-resize;
  border-radius: 50%;
}

/* 区块容器 */
.blocks-container {
  position: relative;
  width: 100%;
  height: 100%;
}

/* 确保区块可以定位 */
.block-item {
  position: absolute;
  display: block;
}
</style>