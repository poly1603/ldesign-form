/**
 * 表单字段类型定义
 */

/** 字段验证规则 */
export interface FormRule {
  /** 是否必填 */
  required?: boolean
  /** 自定义验证消息 */
  message?: string
  /** 触发验证的时机 */
  trigger?: 'change' | 'blur' | 'submit' | ('change' | 'blur' | 'submit')[]
  /** 最小长度 */
  min?: number
  /** 最大长度 */
  max?: number
  /** 正则表达式 */
  pattern?: RegExp | string
  /** 数据类型验证 */
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'email' | 'url' | 'date'
  /** 自定义验证器 */
  validator?: (value: any, rule: FormRule, formData: Record<string, any>) => boolean | string | Promise<boolean | string>
  /** 枚举值验证 */
  enum?: any[]
  /** 自定义长度计算 */
  len?: number
  /** 是否空白时不验证 */
  whitespace?: boolean
}

/** 字段验证结果 */
export interface ValidationResult {
  /** 是否验证通过 */
  valid: boolean
  /** 错误消息 */
  message?: string
  /** 字段名 */
  field?: string
}

/** 选项类型，用于 Select, Radio, Checkbox 等 */
export interface FieldOption {
  /** 显示标签 */
  label: string
  /** 值 */
  value: any
  /** 是否禁用 */
  disabled?: boolean
  /** 子选项 */
  children?: FieldOption[]
}

/** 字段加载器 */
export type FieldLoader = (formData?: Record<string, any>, fieldConfig?: FormFieldConfig) => Promise<FieldOption[]>

/** 代码表加载器 */
export type CodeLoader = (code: string, formData?: Record<string, any>, parentValue?: any) => Promise<FieldOption[]>

/** 字段选项键映射 */
export interface FieldKeys {
  /** label 映射的字段名 */
  label?: string
  /** value 映射的字段名 */
  value?: string
  /** children 映射的字段名 */
  children?: string
}

/** 字段关联配置 */
export interface FieldRelation {
  /** 关联字段名 */
  name: string
  /** 关联类型 */
  type: number | 'empty' | 'first' | 'last'
}

/** 字段扩展组件 */
export interface FieldAddon {
  /** 组件 */
  component: any
  /** 组件属性 */
  props?: Record<string, any>
}

/** 表单字段配置 */
export interface FormFieldConfig<TComponent = any> {
  /** 字段名称，作为表单数据的 key */
  name: string
  /** 字段标签 */
  label?: string | (() => any)
  /** 字段使用的组件 */
  component?: TComponent
  /** 组件属性 */
  props?: Record<string, any>
  /** 字段占用的栅格数 (1-12 或百分比字符串如 '50%') */
  span?: number | string
  /** 计算后的 span 值 */
  computedSpan?: number
  /** 调整后的 span 值 */
  adjustSpan?: number
  /** 标签宽度 */
  labelWidth?: number | string
  /** 标签对齐方式 */
  labelAlign?: 'left' | 'right' | 'top'
  /** 内容对齐方式 */
  contentAlign?: 'left' | 'right'
  /** 验证规则 */
  rules?: FormRule[]
  /** 默认值 */
  defaultValue?: any
  /** 是否可见 */
  visible?: boolean | ((formData: Record<string, any>) => boolean)
  /** 是否禁用 */
  disabled?: boolean | ((formData: Record<string, any>) => boolean)
  /** 是否只读 */
  readonly?: boolean | ((formData: Record<string, any>) => boolean)
  /** 占位文本 */
  placeholder?: string
  /** 帮助信息 */
  help?: string
  /** 额外信息 */
  extra?: string
  /** 选项代码，用于从远程加载选项 */
  code?: string
  /** 自定义选项加载器 */
  load?: FieldLoader
  /** 选项键映射 */
  keys?: FieldKeys
  /** 选项数据 */
  options?: FieldOption[]
  /** 关联字段配置 */
  relation?: string | FieldRelation
  /** 字段索引，自动生成 */
  index?: number
  /** 标签是否多行，自动计算 */
  isMultipleLine?: boolean
  /** 是否必填，自动计算 */
  isRequired?: boolean
  /** 计算后的标签宽度 */
  computedLabelWidth?: number
  /** 前缀组件 */
  prefix?: any | FieldAddon
  /** 后缀组件 */
  suffix?: any | FieldAddon
  /** 字段变化回调 */
  onChange?: (value: any, context: FieldChangeContext) => void
  /** 自定义内联样式 */
  style?: Record<string, any>
  /** 自定义 class */
  class?: string | string[] | Record<string, boolean>
}

/** 字段变化上下文 */
export interface FieldChangeContext {
  /** 触发变化的字段 */
  target: FormFieldConfig
  /** 当前表单值 */
  formData: Record<string, any>
  /** 变化动作类型 */
  action: 'change' | 'init' | 'reset' | 'cascader'
  /** 原始事件上下文 */
  originalContext?: any
}

/** 表单字段状态 */
export interface FormFieldState {
  /** 字段名 */
  name: string
  /** 当前值 */
  value: any
  /** 初始值 */
  initialValue: any
  /** 是否已修改 */
  dirty: boolean
  /** 是否已触摸 */
  touched: boolean
  /** 是否正在验证 */
  validating: boolean
  /** 验证结果 */
  validation: ValidationResult
  /** 是否禁用 */
  disabled: boolean
  /** 是否只读 */
  readonly: boolean
  /** 是否可见 */
  visible: boolean
}
