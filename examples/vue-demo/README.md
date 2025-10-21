# @ldesign/form Vue Demo

Vue 3 完整演示应用，展示表单系统的所有功能。

## ✨ 功能特性

### 包含的演示页面

1. **首页** - 项目概览和快速开始
2. **所有字段** - 13个字段组件完整展示
3. **验证规则** - 22个验证规则演示
4. **用户资料** - 真实的用户信息管理表单
5. **商品编辑** - 电商商品管理表单
6. **动态数组** - 联系人、工作经历等动态列表
7. **条件字段** - 根据值动态显示/隐藏字段
8. **表单分组** - 分组折叠展开
9. **问卷调查** - 带进度跟踪的问卷表单
10. **设置页面** - 应用设置界面
11. **布局系统** - 多种布局方式展示
12. **主题定制** - 主题和样式定制

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 运行开发服务器

```bash
npm run dev
```

然后在浏览器中打开 `http://localhost:5173`

### 构建生产版本

```bash
npm run build
```

## 📦 项目结构

```
vue-demo/
├── src/
│   ├── App.vue           # 主应用组件
│   ├── router.js         # 路由系统
│   ├── main.js           # 入口文件
│   ├── style.css         # 全局样式
│   └── pages/            # 演示页面
│       ├── HomePage.vue
│       ├── AllFieldsDemo.vue
│       ├── ValidationDemo.vue
│       ├── UserProfileDemo.vue
│       ├── ProductFormDemo.vue
│       ├── ArrayFieldsDemo.vue
│       ├── ConditionalFieldsDemo.vue
│       ├── FormGroupDemo.vue
│       ├── SurveyDemo.vue
│       ├── SettingsDemo.vue
│       ├── LayoutDemo.vue
│       └── ThemeDemo.vue
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 🎯 使用的组件

### 字段组件（13个）
- InputField
- TextareaField
- SelectField
- RadioField
- CheckboxField
- DatePickerField
- TimePickerField
- CascaderField
- UploadField
- SwitchField
- SliderField
- RateField
- ColorPickerField

### 验证规则（22个）
- 基础验证: required, email, url, phone, number, integer
- 长度范围: minLength, maxLength, min, max, range
- 高级验证: pattern, idCard, creditCard, ip, postalCode, fileType, fileSize, passwordStrength
- 跨字段: confirm, compareWith
- 异步: uniqueUsername

## 📖 学习路径

1. 从首页了解项目概况
2. 查看"所有字段"了解每个组件
3. 查看"验证规则"学习验证系统
4. 参考真实场景示例学习实际应用
5. 查看高级功能了解复杂用法

## 🔗 相关资源

- [主文档](../../README.md)
- [字段类型文档](../../docs/field-types.md)
- [高级功能指南](../../docs/advanced-features.md)
- [最佳实践](../../docs/best-practices.md)

## 💡 提示

- 使用侧边导航切换不同的演示页面
- 所有示例都是可交互的，可以直接操作
- 打开浏览器控制台查看提交的数据
- 尝试切换主题模式查看深色主题效果



