# 介绍

LemonForm 是一个专为 Vue 3 设计的动态表单库，它提供了强大、灵活、易用的表单解决方案。

## 设计理念

### 配置驱动

LemonForm 采用配置驱动的设计理念，通过简单的配置对象就能创建复杂的表单，无需编写大量的模板代码。

```typescript
const formConfig = {
  fields: [
    {
      type: 'input',
      name: 'username',
      label: '用户名',
      required: true
    }
  ]
}
```

### 组件化架构

采用模块化的组件架构，每个功能都是独立的模块，可以按需使用，也可以轻松扩展。

### 类型安全

完整的 TypeScript 支持，提供优秀的开发体验和类型安全保障。

## 核心特性

### 🚀 开箱即用

- 内置常用字段类型（输入框、选择器、日期选择器等）
- 预设的验证规则
- 响应式布局系统
- 主题样式

### 🎨 高度可定制

- 自定义字段组件
- 自定义验证器
- 自定义主题样式
- 插件系统

### 📱 响应式设计

- 自动适配不同屏幕尺寸
- 支持断点配置
- 栅格布局系统
- 移动端优化

### ✅ 强大验证

- 内置丰富的验证规则
- 支持异步验证
- 自定义验证器
- 实时验证反馈

### 🔄 条件渲染

- 字段间联动
- 动态显示/隐藏
- 条件验证
- 复杂表单逻辑

## 架构概览

LemonForm 采用分层架构设计：

```
┌─────────────────────────────────────┐
│           Vue 组件层                │
│  DynamicForm, FormField, etc.       │
├─────────────────────────────────────┤
│           组合式函数层              │
│  useForm, useFormField, etc.        │
├─────────────────────────────────────┤
│           核心引擎层                │
│  FormEngine, ValidationEngine, etc. │
├─────────────────────────────────────┤
│           工具函数层                │
│  form-utils, validation-utils, etc. │
└─────────────────────────────────────┘
```

### 核心引擎

- **FormEngine** - 表单核心引擎，负责整体协调
- **StateManager** - 状态管理，处理表单数据和字段状态
- **ValidationEngine** - 验证引擎，处理表单验证逻辑
- **LayoutEngine** - 布局引擎，处理响应式布局
- **ConditionEngine** - 条件引擎，处理字段联动逻辑
- **EventBus** - 事件总线，处理组件间通信

### Vue 组件

- **DynamicForm** - 主表单组件
- **FormField** - 字段组件
- **FormActions** - 操作按钮组件
- **字段组件** - 各种输入组件

### 组合式函数

- **useForm** - 表单主要逻辑
- **useFormField** - 字段逻辑
- **useFormValidation** - 验证逻辑
- **useFormLayout** - 布局逻辑

## 浏览器支持

LemonForm 支持所有现代浏览器：

- Chrome >= 87
- Firefox >= 78
- Safari >= 14
- Edge >= 88

## 下一步

- [快速开始](/guide/getting-started) - 学习如何安装和使用 LemonForm
- [表单配置](/guide/form-config) - 了解如何配置表单
- [字段类型](/guide/field-types) - 查看所有可用的字段类型
- [示例](/examples/) - 查看实际使用示例
