# @ldesign/form 增强计划

## 当前状态

- ✅ 基础表单组件
- ✅ 表单验证功能
- ⚠️ 缺少表单设计器
- ⚠️ 缺少 JSON Schema 支持
- ⚠️ 缺少表单联动规则引擎

## 增强目标

### 1. 拖拽表单设计器

**功能**: 可视化拖拽设计表单

**核心特性**:
- 拖拽添加表单字段
- 实时预览
- 字段属性配置
- 表单布局（Grid/Flex）
- 导出表单 Schema
- 导入表单 Schema

**技术栈**:
```typescript
// 使用 @ldesign/lowcode 的拖拽引擎
import { DragDropManager } from '@ldesign/lowcode'

// 表单设计器核心
export class FormDesigner {
  private dragManager: DragDropManager
  
  addField(type: string, config: FieldConfig) {
    // 添加字段到表单
  }
  
  removeField(id: string) {
    // 移除字段
  }
  
  exportSchema(): FormSchema {
    // 导出表单 Schema
  }
  
  importSchema(schema: FormSchema) {
    // 导入表单 Schema
  }
}
```

### 2. JSON Schema 支持

**功能**: 支持 JSON Schema 定义表单

**示例**:
```typescript
import { createForm } from '@ldesign/form'
import { createSchemaValidator } from '@ldesign/validator'

const formSchema = {
  username: {
    type: 'string',
    title: '用户名',
    required: true,
    minLength: 3,
    maxLength: 20,
  },
  email: {
    type: 'string',
    format: 'email',
    title: '邮箱',
    required: true,
  },
  age: {
    type: 'number',
    title: '年龄',
    minimum: 18,
    maximum: 100,
  },
}

const form = createForm({
  schema: formSchema,
  validator: createSchemaValidator(formSchema),
})
```

### 3. 表单联动规则引擎

**功能**: 字段之间的联动关系

**示例**:
```typescript
const form = createForm({
  fields: [
    { name: 'country', type: 'select' },
    { name: 'province', type: 'select' },
    { name: 'city', type: 'select' },
  ],
  rules: [
    {
      when: { field: 'country', value: 'China' },
      then: {
        show: ['province', 'city'],
        hide: ['state'],
      },
    },
    {
      when: { field: 'province', changed: true },
      then: {
        action: 'loadCities',
        target: 'city',
      },
    },
  ],
})
```

### 4. 表单版本回溯

**功能**: 保存表单历史，支持撤销/重做

**实施**:
```typescript
export class FormHistory {
  private history: FormState[] = []
  private currentIndex = -1
  
  push(state: FormState) {
    this.history.splice(this.currentIndex + 1)
    this.history.push(state)
    this.currentIndex++
  }
  
  undo(): FormState | null {
    if (this.currentIndex > 0) {
      this.currentIndex--
      return this.history[this.currentIndex]
    }
    return null
  }
  
  redo(): FormState | null {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++
      return this.history[this.currentIndex]
    }
    return null
  }
}
```

## 实施计划

### 阶段一：基础增强（1周）
1. 集成 @ldesign/validator 验证库
2. 添加 JSON Schema 支持
3. 完善表单 API

### 阶段二：表单设计器（2周）
1. 实现拖拽引擎
2. 创建字段组件库
3. 实现属性配置面板
4. 实现预览和导出功能

### 阶段三：规则引擎（1周）
1. 实现联动规则解析器
2. 实现规则执行引擎
3. 添加常用规则模板

### 阶段四：高级功能（1周）
1. 实现表单历史和版本回溯
2. 添加表单数据持久化
3. 添加表单性能优化

## 预期成果

- 📐 可视化表单设计器
- 📋 JSON Schema 完整支持
- 🔗 强大的联动规则引擎
- ⏱️ 版本回溯和历史管理
- 📊 与 @ldesign/validator 深度集成

---

**文档版本**: 1.0  
**创建时间**: 2025-10-22






