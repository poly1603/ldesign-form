/**
 * v-form-validate 指令
 * 用于在元素失焦或提交时触发验证
 */

import type { Directive } from 'vue'
import type { FormContext } from '../types'
import { FORM_CONTEXT_KEY } from '../constants'

interface FormValidateElement extends HTMLElement {
  _formValidateCleanup?: () => void
}

interface FormValidateValue {
  /** 要验证的字段名，不指定则验证所有字段 */
  fields?: string | string[]
  /** 触发时机 */
  trigger?: 'blur' | 'change' | 'submit'
  /** 验证失败时是否阻止默认行为 */
  preventDefault?: boolean
  /** 验证完成回调 */
  onValidate?: (valid: boolean, errors: any) => void
}

/**
 * v-form-validate 指令
 */
export const vFormValidate: Directive<FormValidateElement, string | string[] | FormValidateValue> = {
  mounted(el, binding, vnode) {
    const value = binding.value
    let config: FormValidateValue

    if (typeof value === 'string') {
      config = { fields: value }
    } else if (Array.isArray(value)) {
      config = { fields: value }
    } else {
      config = value || {}
    }

    // 尝试从组件实例获取表单上下文
    const instance = vnode.component?.proxy
    const formContext = (instance as any)?.$inject?.(FORM_CONTEXT_KEY) as FormContext | undefined

    if (!formContext?.instance) {
      console.warn('[v-form-validate] 未找到表单上下文')
      return
    }

    const { fields, trigger = 'blur', preventDefault = false, onValidate } = config

    const fieldsArray = typeof fields === 'string' ? [fields] : fields

    const handleValidate = async (e: Event) => {
      const result = await formContext.instance!.validate(fieldsArray)
      
      if (!result.valid && preventDefault) {
        e.preventDefault()
        e.stopPropagation()
      }

      onValidate?.(result.valid, result.errors)
    }

    // 根据触发时机绑定事件
    if (trigger === 'submit' && (el instanceof HTMLFormElement || el.tagName === 'FORM')) {
      el.addEventListener('submit', handleValidate)
      el._formValidateCleanup = () => {
        el.removeEventListener('submit', handleValidate)
      }
    } else {
      const eventName = trigger === 'change' ? 'change' : 'blur'
      el.addEventListener(eventName, handleValidate)
      el._formValidateCleanup = () => {
        el.removeEventListener(eventName, handleValidate)
      }
    }
  },

  unmounted(el) {
    el._formValidateCleanup?.()
    delete el._formValidateCleanup
  }
}

export default vFormValidate
