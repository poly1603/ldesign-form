/**
 * Vue 适配器类型定义
 */

import type { Component, VNode, Ref, ComputedRef } from 'vue'
import type {
  FormConfig,
  FormFieldConfig,
  FormGroup,
  FormInstance,
  FormState,
  FormEvents,
  FormValidateResult,
  FormRule,
  FieldOption,
  CodeLoader,
  FieldKeys,
  FieldLoader
} from '@ldesign/form-core'

/** Vue 表单配置 */
export interface VueFormConfig extends FormConfig<Component> {
  /** 表单引用 */
  formRef?: Ref<HTMLFormElement | null>
}

/** Vue 表单字段配置 */
export interface VueFormFieldConfig extends Omit<FormFieldConfig<Component>, 'name'> {
  /** 字段名称 */
  name: string
  /** 字段标签 */
  label?: string | (() => VNode)
  /** 渲染函数 */
  render?: (context: VueFieldRenderContext) => VNode
  /** 插槽 */
  slots?: Record<string, (context: VueFieldRenderContext) => VNode>
  /** 验证规则 */
  rules?: FormRule[]
  /** 占用栅格数 */
  span?: number | string
  /** 
   * 标签对齐方式（覆盖表单级别设置）
   * - left: 左对齐（标签和控件同行）
   * - right: 右对齐（标签和控件同行）
   * - top: 垂直布局（标签在控件上方）
   */
  labelAlign?: 'left' | 'right' | 'top'
  /** 选项代码 */
  code?: string
  /** 选项加载器 */
  load?: FieldLoader
  /** 选项键映射 */
  keys?: FieldKeys
  /** 关联字段 */
  relation?: string | { name: string; type: number | 'empty' | 'first' | 'last' }
  /** 前缀 */
  prefix?: Component | { component: Component; props?: Record<string, any> }
  /** 后缀 */
  suffix?: Component | { component: Component; props?: Record<string, any> }
}

/** Vue 表单分组配置 */
export interface VueFormGroup extends Omit<FormGroup<Component>, 'children' | 'name'> {
  /** 分组名称 */
  name: string
  /** 分组标题 */
  title?: string | (() => VNode)
  /** 分组字段 */
  children: VueFormFieldConfig[]
  /** 是否展开 */
  visible?: boolean
  /** 展开方式 */
  expandType?: 'visible' | 'popup'
}

/** 字段渲染上下文 */
export interface VueFieldRenderContext {
  /** 字段配置 */
  field: VueFormFieldConfig
  /** 字段值 */
  value: any
  /** 表单数据 */
  formData: Record<string, any>
  /** 表单实例 */
  form: FormInstance
  /** 是否禁用 */
  disabled: boolean
  /** 是否只读 */
  readonly: boolean
  /** 更新值 */
  onChange: (value: any) => void
  /** 字段选项 */
  options?: FieldOption[]
}

/** 表单 Props */
export interface LFormProps {
  /** 表单值 (v-model) */
  modelValue?: Record<string, any>
  /** 表单默认值 */
  defaultValue?: Record<string, any>
  /** 表单字段配置 */
  options?: VueFormFieldConfig[] | VueFormGroup[]
  /** 验证规则 */
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
  button?: boolean | string | Component
  /** 按钮位置 */
  buttonPosition?: 'inline' | 'block'
  /** 是否隐藏按钮标签 */
  hiddenButtonLabel?: boolean
  /** 按钮对齐方式 */
  buttonAlign?: 'left' | 'center' | 'right' | 'justify'
  /** 按钮占用栅格数 */
  buttonSpan?: number
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
  /** 表单宽度 */
  width?: string | number
  /** 标签内边距 */
  labelPadding?: number
  /** 表单内边距 */
  padding?: number | string
  /** 设备类型 */
  device?: 'desktop' | 'mobile' | 'tablet'
  /** 代码表加载器 */
  codeLoader?: CodeLoader
}

/** 表单 Emits */
export interface LFormEmits {
  (e: 'update:modelValue', value: Record<string, any>): void
  (e: 'submit', data: Record<string, any>, context: any): void
  (e: 'reset', data: Record<string, any>, context: any): void
  (e: 'change', data: Record<string, any>, context: any): void
  (e: 'ready', instance: FormInstance): void
  (e: 'validate', result: FormValidateResult): void
  (e: 'visibleChange', visible: boolean, group: any): void
}

/** 表单项 Props */
export interface LFormItemProps {
  /** 字段名 */
  name: string
  /** 字段标签 */
  label?: string
  /** 验证规则 */
  rules?: FormRule[]
  /** 标签宽度 */
  labelWidth?: number | string
  /** 标签对齐方式 */
  labelAlign?: 'left' | 'right' | 'top'
  /** 是否必填 */
  required?: boolean
  /** 是否显示冒号 */
  colon?: boolean
  /** 帮助信息 */
  help?: string
  /** 额外信息 */
  extra?: string
}

/** useForm 返回类型 */
export interface UseFormReturn {
  /** 表单实例 */
  form: Ref<FormInstance | null>
  /** 表单数据 */
  formData: Ref<Record<string, any>>
  /** 表单状态 */
  formState: ComputedRef<FormState | null>
  /** 是否验证中 */
  validating: ComputedRef<boolean>
  /** 是否提交中 */
  submitting: ComputedRef<boolean>
  /** 是否有效 */
  valid: ComputedRef<boolean>
  /** 是否已修改 */
  dirty: ComputedRef<boolean>
  /** 验证错误 */
  errors: ComputedRef<Record<string, any>>
  /** 获取字段值 */
  getFieldValue: (name: string) => any
  /** 设置字段值 */
  setFieldValue: (name: string, value: any) => void
  /** 验证表单 */
  validate: (names?: string[]) => Promise<FormValidateResult>
  /** 验证字段 */
  validateField: (name: string) => Promise<any>
  /** 重置表单 */
  reset: (names?: string[]) => void
  /** 重置字段 */
  resetField: (name: string) => void
  /** 清除验证 */
  clearValidate: (names?: string[]) => void
  /** 提交表单 */
  submit: () => Promise<any>
}

/** useFormField 返回类型 */
export interface UseFormFieldReturn {
  /** 字段值 */
  value: Ref<any>
  /** 字段错误 */
  error: ComputedRef<string | undefined>
  /** 是否有效 */
  valid: ComputedRef<boolean>
  /** 是否已触摸 */
  touched: ComputedRef<boolean>
  /** 是否已修改 */
  dirty: ComputedRef<boolean>
  /** 是否验证中 */
  validating: ComputedRef<boolean>
  /** 更新值 */
  onChange: (value: any) => void
  /** 触摸字段 */
  onBlur: () => void
  /** 验证字段 */
  validate: () => Promise<any>
  /** 重置字段 */
  reset: () => void
  /** 清除验证 */
  clearValidate: () => void
}

/** 表单上下文 */
export interface FormContext {
  /** 表单实例 */
  instance: FormInstance | null
  /** 表单配置 */
  config: VueFormConfig
  /** 是否禁用 */
  disabled: boolean
  /** 是否只读 */
  readonly: boolean
  /** 冒号 */
  colon: boolean
  /** 标签宽度 */
  labelWidth?: number | string
  /** 标签对齐 */
  labelAlign?: 'left' | 'right' | 'top'
  /** 注册字段 */
  registerField: (name: string, initialValue?: any) => void
  /** 注销字段 */
  unregisterField: (name: string) => void
}

/** 插件安装选项 */
export interface FormPluginOptions {
  /** 组件前缀 */
  prefix?: string
  /** 是否注册全局组件 */
  registerComponents?: boolean
  /** 是否注册全局指令 */
  registerDirectives?: boolean
}
