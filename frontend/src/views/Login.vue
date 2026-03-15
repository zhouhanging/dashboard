<template>
  <div class="login-container">
    <div class="login-form">
      <h2>AI可视化拖拽网页编辑器</h2>
      <el-form :model="loginForm" :rules="rules" ref="loginFormRef">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="loginForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleLogin" :loading="loading">登录</el-button>
          <el-button @click="handleRegister">注册</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessage } from 'element-plus'

const router = useRouter()
const loading = ref(false)
const loginFormRef = ref(null)

const loginForm = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const response = await axios.post('/api/login', loginForm)
        if (response.data.success) {
          localStorage.setItem('token', response.data.token)
          ElMessage.success('登录成功')
          router.push('/editor')
        } else {
          ElMessage.error('登录失败：' + response.data.message)
        }
      } catch (error) {
        ElMessage.error('登录失败：' + error.message)
      } finally {
        loading.value = false
      }
    }
  })
}

const handleRegister = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const response = await axios.post('/api/register', loginForm)
        if (response.data.success) {
          ElMessage.success('注册成功，请登录')
        } else {
          ElMessage.error('注册失败：' + response.data.message)
        }
      } catch (error) {
        ElMessage.error('注册失败：' + error.message)
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.login-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #0a101f 0%, #1a2035 100%);
}

.login-form {
  width: 400px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  border: 1px solid rgba(0, 210, 255, 0.3);
  box-shadow: 0 0 30px rgba(0, 210, 255, 0.2);
}

.login-form h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #00d2ff;
  font-size: 24px;
}

.el-form-item__label {
  color: #fff;
}

.el-input__wrapper {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(0, 210, 255, 0.3);
}

.el-input__inner {
  color: #fff;
}

.el-button--primary {
  background: #00d2ff;
  border-color: #00d2ff;
}

.el-button--primary:hover {
  background: #00b8e6;
  border-color: #00b8e6;
}

.el-button {
  color: #fff;
  border-color: rgba(0, 210, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
}

.el-button:hover {
  border-color: #00d2ff;
  background: rgba(0, 210, 255, 0.2);
}
</style>