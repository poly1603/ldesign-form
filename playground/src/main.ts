import { createApp } from 'vue'
import App from './App.vue'
import './styles/index.less'

// 注册表单插件
import FormPlugin from '@ldesign/form-vue'

const app = createApp(App)
app.use(FormPlugin)
app.mount('#app')
