/**
 * useFormField 组合式函数
 */

import { ref, computed, inject, onMounted, onUnmounted } from 'vue'
import type { UseFormFieldReturn, FormContext } from '../types'
import { FORM_CONTEXT_KEY } from '../constants'

export interface UseFormFieldOptions {
  /** 字段名 */
  name: string
  /** 默认值 */
  defaultValue?: any
  /** 验证触发时机 */
  validateTrigger?: 'change' | 'blur' | 'submit'
  /** 值变化回调 */
  onChange?: (value: any) => void
  /** 失焦回调 */
  onBlur?: () => void
}

/**
 * 表单字段组合式函数
 */
export function useFormField(options: UseFormFieldOptions): UseFormFieldReturn {
  const { name, defaultValue, validateTrigger = 'change' } = options

  // 注入表单上下文
  const formContext = inject<FormContext | null>(FORM_CONTEXT_KEY, null)

  // 本地状态
  const localValue = ref(defaultValue)
  const localTouched = ref(false)
  const localDirty = ref(false)
  const localValidating = ref(false)
  const localError = ref<string | undefined>(undefined)

  // 计算属性 - 值
  const value = computed({
    get: () => {
      if (formContext?.instance) {
        return formContext.instance.getFieldValue(name)
      }
      return localValue.value
    },
    set: (newValue) => {
      if (formContext?.instance) {
        formContext.instance.setFieldValue(name, newValue)
      } else {
        localValue.value = newValue
      }
    }
  })

  // 计算属性 - 错误
  const error = computed(() => {
    if (formContext?.instance) {
      const fieldState = formContext.instance.getFieldState(name)
      return fieldState?.validation.valid === false ? fieldState.validation.message : undefined
    }
    return localError.value
  })

  // 计算属性 - 是否有效
  const valid = computed(() => !error.value)

  // 计算属性 - 是否已触摸
  const touched = computed(() => {
    if (formContext?.instance) {
      const fieldState = formContext.instance.getFieldState(name)
      return fieldState?.touched ?? false
    }
    return localTouched.value
  })

  // 计算属性 - 是否已修改
  const dirty = computed(() => {
    if (formContext?.instance) {
      const fieldState = formContext.instance.getFieldState(name)
      return fieldState?.dirty ?? false
    }
    return localDirty.value
  })

  // 计算属性 - 是否验证中
  const validating = computed(() => {
    if (formContext?.instance) {
      const fieldState = formContext.instance.getFieldState(name)
      return fieldState?.validating ?? false
    }
    return localValidating.value
  })

  // 值变化处理
  function onChange(newValue: any): void {
    value.value = newValue
    localDirty.value = true
    options.onChange?.(newValue)

    if (validateTrigger === 'change') {
      validate()
    }
  }

  // 失焦处理
  function onBlur(): void {
    localTouched.value = true
    options.onBlur?.()

    if (validateTrigger === 'blur') {
      validate()
    }
  }

  // 验证字段
  async function validate(): Promise<any> {
    if (formContext?.instance) {
      return formContext.instance.validateField(name)
    }
    return { valid: true }
  }

  // 重置字段
  function reset(): void {
    if (formContext?.instance) {
      formContext.instance.resetField(name)
    } else {
      localValue.value = defaultValue
      localDirty.value = false
      localTouched.value = false
      localError.value = undefined
    }
  }

  // 清除验证
  function clearValidate(): void {
    if (formContext?.instance) {
      formContext.instance.clearValidate([name])
    } else {
      localError.value = undefined
    }
  }

  // 生命周期
  onMounted(() => {
    formContext?.registerField(name, defaultValue)
  })

  onUnmounted(() => {
    formContext?.unregisterField(name)
  })

  return {
    value: value as any,
    error,
    valid,
    touched,
    dirty,
    validating,
    onChange,
    onBlur,
    validate,
    reset,
    clearValidate
  }
}
