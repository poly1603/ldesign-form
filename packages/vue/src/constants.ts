/**
 * 常量定义
 */

import type { InjectionKey } from 'vue'
import type { FormContext } from './types'

/** 表单上下文注入 Key */
export const FORM_CONTEXT_KEY: InjectionKey<FormContext> = Symbol('ldesign-form-context')

/** 表单项上下文注入 Key */
export const FORM_ITEM_CONTEXT_KEY: InjectionKey<{
  name: string
  validate: () => Promise<any>
  clearValidate: () => void
}> = Symbol('ldesign-form-item-context')

/** 默认配置 */
export const DEFAULT_CONFIG = {
  span: 4,
  minSpan: 1,
  maxSpan: 4,
  spanWidth: 320,
  previewRows: 0,
  space: 8,
  gutter: 16,
  colon: true,
  adjustSpan: true,
  buttonPosition: 'inline' as const,
  buttonAlign: 'right' as const,
  buttonSpan: 1,
  labelAlign: 'right' as const,
  variant: 'default' as const,
  requiredMark: true,
  resetType: 'initial' as const,
  labelPadding: 12
}

/** CSS 类名前缀 */
export const CLASS_PREFIX = 'ldesign-form'
