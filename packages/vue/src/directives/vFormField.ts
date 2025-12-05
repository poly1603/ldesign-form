/**
 * v-form-field 指令
 * 用于将普通 input 元素绑定到表单字段
 */

import type { Directive, DirectiveBinding } from 'vue'
import type { FormContext } from '../types'
import { FORM_CONTEXT_KEY } from '../constants'

interface FormFieldDirectiveValue {
  /** 字段名 */
  name: string
  /** 验证触发时机 */
  trigger?: 'change' | 'blur' | 'input'
  /** 值属性名 */
  valueProp?: string
  /** 事件名 */
  eventName?: string
}

interface FormFieldElement extends HTMLElement {
  _formFieldCleanup?: () => void
  _formContext?: FormContext
}

/**
 * 获取元素值
 */
function getElementValue(el: HTMLElement, valueProp?: string): any {
  const prop = valueProp || 'value'
  
  if (el instanceof HTMLInputElement) {
    if (el.type === 'checkbox') {
      return el.checked
    }
    if (el.type === 'radio') {
      return el.checked ? el.value : undefined
    }
    if (el.type === 'number') {
      return el.valueAsNumber
    }
    return el.value
  }
  
  if (el instanceof HTMLSelectElement) {
    if (el.multiple) {
      return Array.from(el.selectedOptions).map(opt => opt.value)
    }
    return el.value
  }
  
  if (el instanceof HTMLTextAreaElement) {
    return el.value
  }
  
  return (el as any)[prop]
}

/**
 * 设置元素值
 */
function setElementValue(el: HTMLElement, value: any, valueProp?: string): void {
  const prop = valueProp || 'value'
  
  if (el instanceof HTMLInputElement) {
    if (el.type === 'checkbox') {
      el.checked = Boolean(value)
      return
    }
    if (el.type === 'radio') {
      el.checked = el.value === value
      return
    }
    el.value = value ?? ''
    return
  }
  
  if (el instanceof HTMLSelectElement) {
    if (el.multiple && Array.isArray(value)) {
      Array.from(el.options).forEach(opt => {
        opt.selected = value.includes(opt.value)
      })
      return
    }
    el.value = value ?? ''
    return
  }
  
  if (el instanceof HTMLTextAreaElement) {
    el.value = value ?? ''
    return
  }
  
  (el as any)[prop] = value
}

/**
 * v-form-field 指令
 */
export const vFormField: Directive<FormFieldElement, string | FormFieldDirectiveValue> = {
  mounted(el, binding, vnode) {
    const value = binding.value
    const config: FormFieldDirectiveValue = typeof value === 'string' 
      ? { name: value }
      : value

    if (!config.name) {
      console.warn('[v-form-field] 字段名是必需的')
      return
    }

    // 尝试从组件实例获取表单上下文
    const instance = vnode.component?.proxy
    const formContext = (instance as any)?.$inject?.(FORM_CONTEXT_KEY) as FormContext | undefined

    if (!formContext?.instance) {
      console.warn('[v-form-field] 未找到表单上下文，请确保在 LForm 组件内使用此指令')
      return
    }

    el._formContext = formContext

    const { name, trigger = 'change', valueProp, eventName } = config

    // 初始化值
    const initialValue = formContext.instance.getFieldValue(name)
    if (initialValue !== undefined) {
      setElementValue(el, initialValue, valueProp)
    }

    // 事件处理
    const handleChange = () => {
      const newValue = getElementValue(el, valueProp)
      formContext.instance?.setFieldValue(name, newValue)
      
      if (trigger !== 'blur') {
        formContext.instance?.validateField(name)
      }
    }

    const handleBlur = () => {
      if (trigger === 'blur') {
        formContext.instance?.validateField(name)
      }
    }

    // 绑定事件
    const changeEvent = eventName || (trigger === 'input' ? 'input' : 'change')
    el.addEventListener(changeEvent, handleChange)
    el.addEventListener('blur', handleBlur)

    // 订阅表单状态变化
    const unsubscribe = formContext.instance.subscribe((state) => {
      const currentValue = state.data[name]
      const elValue = getElementValue(el, valueProp)
      if (currentValue !== elValue) {
        setElementValue(el, currentValue, valueProp)
      }
    })

    // 清理函数
    el._formFieldCleanup = () => {
      el.removeEventListener(changeEvent, handleChange)
      el.removeEventListener('blur', handleBlur)
      unsubscribe()
    }
  },

  updated(el, binding) {
    const value = binding.value
    const config: FormFieldDirectiveValue = typeof value === 'string' 
      ? { name: value }
      : value

    if (!config.name || !el._formContext?.instance) return

    const currentValue = el._formContext.instance.getFieldValue(config.name)
    setElementValue(el, currentValue, config.valueProp)
  },

  unmounted(el) {
    el._formFieldCleanup?.()
    delete el._formFieldCleanup
    delete el._formContext
  }
}

export default vFormField
