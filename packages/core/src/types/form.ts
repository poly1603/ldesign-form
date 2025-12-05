/**
 * 表单类型定义
 */

import type { FormFieldConfig, FormRule, ValidationResult } from './field'

/** 表单分组配置 */
export interface FormGroup<TComponent = any> {
  /** 分组标题 */
  title?: string | (() => any)
  /** 分组名称 */
  name: string
  /** 分组是否展开 */
  visible?: boolean
  /** 预览行数 */
  previewRows?: number
  /** 按钮位置 */
  buttonPosition?: 'inline' | 'block'
  /** 展开方式 */
  expandType?: 'visible' | 'popup'
  /** 分组字段 */
  children: FormFieldConfig<TComponent>[]
}

/** 表单配置 */
export interface FormConfig<TComponent = any> {
  /** 表单字段配置，可以是分组或字段数组 */
  options: FormFieldConfig<TComponent>[] | FormGroup<TComponent>[]
  /** 表单初始值 */
  defaultValue?: Record<string, any>
  /** 表单值 */
  value?: Record<string, any>
  /** 表单验证规则 */
  rules?: Record<string, FormRule[]>
  /** 栅格数 */
  span?: number
  /** 最小栅格数 */
  minSpan?: number
  /** 最大栅格数 */
  maxSpan?: number
  /** 栅格宽度阈值 */
  spanWidth?: number
  /** 预览行数 */
  previewRows?: number
  /** 展开方式 */
  expandType?: 'visible' | 'popup'
  /** 标签间距 */
  space?: string | number
  /** 字段间距 */
  gutter?: string | number
  /** 内部间距 */
  innerSpace?: string | number
  /** 是否显示冒号 */
  colon?: boolean
  /** 是否自动调整 span */
  adjustSpan?: boolean
  /** 按钮配置 */
  button?: boolean | string | any
  /** 按钮位置 */
  buttonPosition?: 'inline' | 'block'
  /** 是否隐藏按钮标签 */
  hiddenButtonLabel?: boolean
  /** 按钮对齐方式 */
  buttonAlign?: 'left' | 'center' | 'right' | 'justify'
  /** 按钮占用栅格数 */
  buttonSpan?: number
  /** 是否可见时更新标签宽度 */
  labelWidthChangeOnVisible?: boolean
  /** 标签宽度 */
  labelWidth?: number | string
  /** 标签对齐方式 */
  labelAlign?: 'left' | 'right' | 'top'
  /** 内容对齐方式 */
  contentAlign?: 'left' | 'right'
  /** 表单变体 */
  variant?: 'default' | 'document'
  /** 是否显示必填标记 */
  requiredMark?: boolean
  /** 是否只读 */
  readonly?: boolean
  /** 是否禁用 */
  disabled?: boolean
  /** 是否静态展示 */
  static?: boolean
  /** 重置类型 */
  resetType?: 'initial' | 'empty'
  /** 是否自动销毁 */
  autoDestroy?: boolean
  /** 是否在滚动容器内 */
  isInScrollContainer?: boolean
  /** 表单宽度 */
  width?: string | number
  /** 标签内边距 */
  labelPadding?: number
  /** 表单内边距 */
  padding?: number | string
  /** 设备类型 */
  device?: 'desktop' | 'mobile' | 'tablet'
  /** 语言 */
  locale?: string
  /** 代码表加载器 */
  codeLoader?: import('./field').CodeLoader
}

/** 表单状态 */
export interface FormState {
  /** 表单数据 */
  data: Record<string, any>
  /** 初始数据 */
  initialData: Record<string, any>
  /** 字段状态映射 */
  fields: Map<string, import('./field').FormFieldState>
  /** 是否正在提交 */
  submitting: boolean
  /** 是否正在验证 */
  validating: boolean
  /** 是否有效 */
  valid: boolean
  /** 是否已修改 */
  dirty: boolean
  /** 验证错误 */
  errors: Record<string, ValidationResult>
  /** 计算后的 span */
  computedSpan: number
  /** 表单宽度 */
  width: number
}

/** 表单实例 */
export interface FormInstance {
  /** 获取表单数据 */
  getData: () => Record<string, any>
  /** 设置表单数据 */
  setData: (data: Record<string, any>, merge?: boolean) => void
  /** 获取字段值 */
  getFieldValue: (name: string) => any
  /** 设置字段值 */
  setFieldValue: (name: string, value: any) => void
  /** 验证表单 */
  validate: (names?: string[]) => Promise<FormValidateResult>
  /** 验证字段 */
  validateField: (name: string) => Promise<ValidationResult>
  /** 重置表单 */
  reset: (names?: string[]) => void
  /** 重置字段 */
  resetField: (name: string) => void
  /** 清除验证 */
  clearValidate: (names?: string[]) => void
  /** 提交表单 */
  submit: () => Promise<FormSubmitResult>
  /** 获取表单状态 */
  getState: () => FormState
  /** 获取字段状态 */
  getFieldState: (name: string) => import('./field').FormFieldState | undefined
  /** 设置字段禁用状态 */
  setFieldDisabled: (name: string, disabled: boolean) => void
  /** 设置字段可见状态 */
  setFieldVisible: (name: string, visible: boolean) => void
  /** 订阅表单变化 */
  subscribe: (callback: FormSubscriber) => () => void
  /** 销毁表单 */
  destroy: () => void
}

/** 表单验证结果 */
export interface FormValidateResult {
  /** 是否验证通过 */
  valid: boolean
  /** 验证错误 */
  errors: Record<string, ValidationResult>
  /** 第一个错误消息 */
  firstError?: string
}

/** 表单提交结果 */
export interface FormSubmitResult {
  /** 是否成功 */
  success: boolean
  /** 表单数据 */
  data: Record<string, any>
  /** 验证结果 */
  validateResult: FormValidateResult
}

/** 表单提交上下文 */
export interface FormSubmitContext {
  /** 表单数据 */
  data: Record<string, any>
  /** 初始数据 */
  initialData: Record<string, any>
  /** 验证结果 */
  validateResult: FormValidateResult
  /** 表单实例 */
  instance: FormInstance
}

/** 表单重置上下文 */
export interface FormResetContext {
  /** 重置后的数据 */
  data: Record<string, any>
  /** 初始数据 */
  initialData: Record<string, any>
  /** 表单实例 */
  instance: FormInstance
}

/** 表单变化上下文 */
export interface FormChangeContext {
  /** 变化的字段名 */
  field?: string
  /** 变化前的值 */
  oldValue?: any
  /** 变化后的值 */
  newValue?: any
  /** 当前表单数据 */
  data: Record<string, any>
  /** 变化动作 */
  action: 'change' | 'init' | 'reset' | 'cascader' | 'setData'
}

/** 表单订阅者 */
export type FormSubscriber = (state: FormState, context: FormChangeContext) => void

/** 表单事件 */
export interface FormEvents {
  /** 表单提交事件 */
  onSubmit?: (context: FormSubmitContext) => void | Promise<void>
  /** 表单重置事件 */
  onReset?: (context: FormResetContext) => void
  /** 表单变化事件 */
  onChange?: (context: FormChangeContext) => void
  /** 表单就绪事件 */
  onReady?: (instance: FormInstance) => void
  /** 表单验证事件 */
  onValidate?: (result: FormValidateResult) => void
  /** 分组展开变化事件 */
  onVisibleChange?: (visible: boolean, group: FormGroup) => void
}

/** 计算后的表单选项 */
export interface ComputedFormOptions {
  /** 预览区域字段（按行分组） */
  preview: FormFieldConfig[][]
  /** 更多区域字段（按行分组） */
  more: FormFieldConfig[][]
  /** 每列的标签宽度 */
  labelWidths: number[]
}

/** 计算后的表单分组 */
export interface ComputedFormGroup {
  /** 分组标题 */
  title?: string | (() => any)
  /** 分组名称 */
  name: string
  /** 是否展开 */
  visible: boolean
  /** 按钮位置 */
  buttonPosition: 'inline' | 'block'
  /** 原始子字段 */
  children: FormFieldConfig[]
  /** 计算后的选项 */
  options: ComputedFormOptions
}
