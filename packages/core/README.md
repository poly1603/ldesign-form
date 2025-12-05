# @ldesign/form-core

框架无关的表单核心库，提供完整的表单状态管理、验证、布局计算等功能。

## 特性

- 🎯 **框架无关** - 核心逻辑不依赖任何 UI 框架
- ✅ **完整验证** - 内置丰富的验证规则，支持自定义验证器
- 📦 **状态管理** - 响应式表单状态管理
- 🔧 **工具函数** - 提供布局计算、数据处理等工具函数
- 📝 **TypeScript** - 完整的类型定义

## 安装

```bash
npm install @ldesign/form-core
# or
pnpm add @ldesign/form-core
```

## 核心模块

### 类型定义 (types)

```typescript
import type {
  FormFieldConfig,
  FormRule,
  FormConfig,
  FormInstance,
  FormState,
  ValidationResult
} from '@ldesign/form-core'
```

### 状态管理 (state)

```typescript
import { createFormStore } from '@ldesign/form-core'

const form = createFormStore(
  {
    defaultValue: { name: '', email: '' },
    rules: {
      name: [{ required: true, message: '请输入姓名' }],
      email: [{ type: 'email', message: '请输入有效邮箱' }]
    }
  },
  {
    onSubmit: (ctx) => console.log('提交:', ctx.data),
    onChange: (ctx) => console.log('变化:', ctx.data)
  }
)

// 使用表单实例
form.setFieldValue('name', '张三')
await form.validate()
form.submit()
form.reset()
```

### 验证器 (validation)

```typescript
import { validateField, validateForm, Rules } from '@ldesign/form-core'

// 使用预定义规则
const rules = [
  Rules.required('此字段必填'),
  Rules.email('邮箱格式不正确'),
  Rules.minLength(6, '最少6个字符')
]

// 验证字段
const result = await validateField(value, rules, formData, 'email')

// 验证表单
const errors = await validateForm(formData, allRules)
```

### 工具函数 (utils)

```typescript
import {
  deepClone,
  mergeData,
  get,
  set,
  pxCompat,
  debounce,
  groupBySpanLimit
} from '@ldesign/form-core'

// 深拷贝
const cloned = deepClone(data)

// 获取/设置嵌套属性
const value = get(obj, 'a.b.c')
set(obj, 'a.b.c', newValue)

// 像素兼容
pxCompat(16) // '16px'
pxCompat('var(--size)') // 'var(--size)'
```

## 验证规则

内置验证规则：

| 规则 | 说明 |
|------|------|
| `Rules.required()` | 必填验证 |
| `Rules.email()` | 邮箱格式 |
| `Rules.url()` | URL 格式 |
| `Rules.phone()` | 手机号 |
| `Rules.idCard()` | 身份证号 |
| `Rules.minLength(n)` | 最小长度 |
| `Rules.maxLength(n)` | 最大长度 |
| `Rules.pattern(regex)` | 正则匹配 |
| `Rules.number()` | 数字类型 |
| `Rules.integer()` | 整数 |

自定义验证器：

```typescript
const customRule: FormRule = {
  validator: async (value, rule, formData) => {
    // 返回 true 表示验证通过
    // 返回 false 或字符串表示验证失败
    if (value !== formData.confirmPassword) {
      return '两次密码不一致'
    }
    return true
  }
}
```

## License

MIT
