/**
 * useFormContext 组合式函数
 */

import { inject, provide, reactive } from 'vue'
import type { FormContext } from '../types'
import { FORM_CONTEXT_KEY } from '../constants'

/**
 * 获取表单上下文
 */
export function useFormContext(): FormContext | null {
  return inject<FormContext | null>(FORM_CONTEXT_KEY, null)
}

/**
 * 提供表单上下文
 */
export function provideFormContext(context: FormContext): void {
  provide(FORM_CONTEXT_KEY, context)
}

/**
 * 创建表单上下文
 */
export function createFormContext(options: Partial<FormContext>): FormContext {
  const fields = new Set<string>()

  const context: FormContext = reactive({
    instance: options.instance || null,
    config: options.config || { options: [] },
    disabled: options.disabled ?? false,
    readonly: options.readonly ?? false,
    colon: options.colon ?? true,
    labelWidth: options.labelWidth,
    labelAlign: options.labelAlign,
    registerField: (name: string, initialValue?: any) => {
      fields.add(name)
      if (context.instance && initialValue !== undefined) {
        const currentValue = context.instance.getFieldValue(name)
        if (currentValue === undefined) {
          context.instance.setFieldValue(name, initialValue)
        }
      }
    },
    unregisterField: (name: string) => {
      fields.delete(name)
    }
  })

  return context
}
