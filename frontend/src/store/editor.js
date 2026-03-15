import { defineStore } from 'pinia'

// 定义编辑器状态管理
export const useEditorStore = defineStore('editor', {
  state: () => ({
    blocks: [], // 区块列表
    bgType: 'color', // 背景类型：image, video, color
    bgUrl: '#0a101f' // 背景图片/视频 URL 或颜色
  }),
  
  actions: {
    // 添加区块
    addBlock() {
      const newBlock = {
        id: Date.now().toString(),
        title: '新区块',
        content: '请输入内容',
        style: {
          width: '300px',
          height: '200px',
          backgroundColor: 'rgba(18,28,58,0.6)',
          border: '1px solid rgba(0,210,255,0.3)',
          borderRadius: '6px',
          padding: '10px',
          position: 'absolute',
          left: (this.blocks.length * 20) + 'px',
          top: (this.blocks.length * 20) + 'px'
        }
      }
      this.blocks.push(newBlock)
    },
    
    // 获取区块 by id
    getBlockById(id) {
      return this.blocks.find(block => block.id === id)
    },
    
    // 更新区块
    updateBlock(id, updatedBlock) {
      const index = this.blocks.findIndex(block => block.id === id)
      if (index !== -1) {
        this.blocks[index] = updatedBlock
      }
    },
    
    // 删除区块
    deleteBlock(id) {
      this.blocks = this.blocks.filter(block => block.id !== id)
    },
    
    // 设置区块列表
    setBlocks(blocks) {
      this.blocks = blocks
    },
    
    // 设置背景类型
    setBgType(type) {
      this.bgType = type
    },
    
    // 设置背景 URL
    setBgUrl(url) {
      this.bgUrl = url
    }
  }
})