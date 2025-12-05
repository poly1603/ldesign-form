# @ldesign/form-vue

Vue 3 表单适配器，提供组件、组合式函数和指令，用于在 Vue 项目中使用 LDesign Form。

## 特性

- 🧩 **组件** - `LForm`、`LFormItem` 完整的表单组件
- 🎣 **Composables** - `useForm`、`useFormField` 组合式函数
- 📌 **指令** - `v-form-field`、`v-form-validate` 自定义指令
- 🎨 **响应式布局** - 自动计算栅格布局
- ✅ **验证集成** - 与 `@ldesign/form-core` 验证无缝集成
- 📝 **TypeScript** - 完整的类型定义

## 安装

```bash
npm install @ldesign/form-vue @ldesign/form-core
# or
pnpm add @ldesign/form-vue @ldesign/form-core
```

## 快速开始

### 全局注册

```typescript
import { createApp } from 'vue'
import FormPlugin from '@ldesign/form-vue'
import '@ldesign/form-vue/style.css'

const app = createApp(App)
app.use(FormPlugin, {
  prefix: 'L',           // 组件前缀
  registerComponents: true,
  registerDirectives: true
})
```

### 按需导入

```typescript
import { LForm, LFormItem, useForm, vFormField } from '@ldesign/form-vue'
```

## 使用方式

### 1. 组件用法

```vue
<template>
  <LForm
    v-model="formData"
    :options="formOptions"
    :rules="formRules"
    @submit="handleSubmit"
    @reset="handleReset"
  >
    <template #buttons="{ submit, reset }">
      <button @click="reset">重置</button>
      <button @click="submit">提交</button>
    </template>
  </LForm>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { LForm } from '@ldesign/form-vue'
import { Input, Select } from 'your-ui-library'

const formData = ref({
  name: '',
  gender: ''
})

const formOptions = [
  {
    name: 'name',
    label: '姓名',
    component: Input,
    props: { placeholder: '请输入姓名' }
  },
  {
    name: 'gender',
    label: '性别',
    component: Select,
    props: {
      options: [
        { label: '男', value: 'male' },
        { label: '女', value: 'female' }
      ]
    }
  }
]

const formRules = {
  name: [{ required: true, message: '请输入姓名' }]
}

function handleSubmit(data, ctx) {
  console.log('提交:', data)
}

function handleReset(data) {
  console.log('重置:', data)
}
</script>
```

### 2. Composable 用法

```vue
<template>
  <form @submit.prevent="submit">
    <input v-model="formData.name" />
    <span v-if="errors.name">{{ errors.name.message }}</span>
    
    <button type="submit" :disabled="submitting">
      {{ submitting ? '提交中...' : '提交' }}
    </button>
  </form>
</template>

<script setup lang="ts">
import { useForm } from '@ldesign/form-vue'

const {
  formData,
  errors,
  submitting,
  valid,
  validate,
  submit,
  reset,
  setFieldValue,
  getFieldValue
} = useForm({
  initialValues: { name: '', email: '' },
  rules: {
    name: [{ required: true }],
    email: [{ type: 'email' }]
  },
  onSubmit: async (data) => {
    await api.save(data)
  }
})
</script>
```

### 3. useFormField 用法

```vue
<template>
  <div>
    <input
      :value="value"
      @input="onChange($event.target.value)"
      @blur="onBlur"
    />
    <span v-if="error">{{ error }}</span>
  </div>
</template>

<script setup lang="ts">
import { useFormField } from '@ldesign/form-vue'

const { value, error, onChange, onBlur, validate } = useFormField({
  name: 'email',
  defaultValue: '',
  validateTrigger: 'blur'
})
</script>
```

### 4. 指令用法

```vue
<template>
  <LForm>
    <!-- 使用 v-form-field 绑定表单字段 -->
    <input v-form-field="'name'" />
    <input v-form-field="{ name: 'email', trigger: 'blur' }" />
    
    <!-- 使用 v-form-validate 触发验证 -->
    <button v-form-validate>验证</button>
  </LForm>
</template>
```

## 组件 Props

### LForm

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `object` | `{}` | 表单数据 (v-model) |
| `options` | `array` | `[]` | 表单字段配置 |
| `rules` | `object` | `{}` | 验证规则 |
| `span` | `number` | - | 栅格数 |
| `spanWidth` | `number` | `320` | 栅格宽度阈值 |
| `labelWidth` | `string\|number` | - | 标签宽度 |
| `labelAlign` | `'left'\|'right'\|'top'` | `'right'` | 标签对齐 |
| `colon` | `boolean` | `true` | 显示冒号 |
| `readonly` | `boolean` | `false` | 只读模式 |
| `disabled` | `boolean` | `false` | 禁用模式 |
| `variant` | `'default'\|'document'` | `'default'` | 表单变体 |

### LFormItem

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `name` | `string` | - | 字段名 (必填) |
| `label` | `string` | - | 标签文本 |
| `rules` | `array` | `[]` | 验证规则 |
| `labelWidth` | `string\|number` | - | 标签宽度 |
| `required` | `boolean` | - | 是否必填 |

## 事件

| 事件 | 参数 | 说明 |
|------|------|------|
| `submit` | `(data, context)` | 表单提交 |
| `reset` | `(data, context)` | 表单重置 |
| `change` | `(data, context)` | 数据变化 |
| `ready` | `(instance)` | 表单就绪 |
| `validate` | `(result)` | 验证完成 |

## 暴露方法

```typescript
const formRef = ref()

// 通过 ref 调用
formRef.value.submit()
formRef.value.validate()
formRef.value.validateField('name')
formRef.value.reset()
formRef.value.clearValidate()
formRef.value.getData()
formRef.value.setData({ name: 'value' })
```

## License

MIT
