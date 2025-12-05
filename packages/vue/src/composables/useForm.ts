/**
 * useForm 组合式函数
 */

import { ref, computed, watch, onMounted, onUnmounted, toRaw } from 'vue'
import type { Ref, ComputedRef } from 'vue'
import type {
  FormConfig,
  FormInstance,
  FormState,
  FormValidateResult,
  FormEvents,
  FormRule
} from '@ldesign/form-core'
import { createFormStore } from '@ldesign/form-core'
import type { UseFormReturn } from '../types'

export interface UseFormOptions extends Partial<FormConfig> {
  /** 初始值 */
  initialValues?: Record<string, any>
  /** 验证规则 */
  rules?: Record<string, FormRule[]>
  /** 提交回调 */
  onSubmit?: (data: Record<string, any>) => void | Promise<void>
  /** 重置回调 */
  onReset?: (data: Record<string, any>) => void
  /** 变化回调 */
  onChange?: (data: Record<string, any>, context: any) => void
  /** 验证回调 */
  onValidate?: (result: FormValidateResult) => void
}

/**
 * 表单组合式函数
 */
export function useForm(options: UseFormOptions = {}): UseFormReturn {
  const form = ref<FormInstance | null>(null)
  const formData = ref<Record<string, any>>(options.initialValues || options.defaultValue || {})
  const internalState = ref<FormState | null>(null)

  // 计算属性
  const formState = computed(() => internalState.value)
  const validating = computed(() => internalState.value?.validating ?? false)
  const submitting = computed(() => internalState.value?.submitting ?? false)
  const valid = computed(() => internalState.value?.valid ?? true)
  const dirty = computed(() => internalState.value?.dirty ?? false)
  const errors = computed(() => internalState.value?.errors ?? {})

  // 初始化表单
  function initForm(): void {
    const events: FormEvents = {
      onSubmit: async (context) => {
        await options.onSubmit?.(context.data)
      },
      onReset: (context) => {
        formData.value = { ...context.data }
        options.onReset?.(context.data)
      },
      onChange: (context) => {
        formData.value = { ...context.data }
        options.onChange?.(context.data, context)
      },
      onValidate: (result) => {
        options.onValidate?.(result)
      },
      onReady: (instance) => {
        // 表单就绪
      }
    }

    const config: FormConfig = {
      options: options.options || [],
      defaultValue: options.initialValues || options.defaultValue,
      value: formData.value,
      rules: options.rules,
      span: options.span,
      minSpan: options.minSpan,
      maxSpan: options.maxSpan,
      spanWidth: options.spanWidth,
      resetType: options.resetType,
      readonly: options.readonly,
      disabled: options.disabled
    }

    form.value = createFormStore(config, events)

    // 订阅状态变化
    form.value.subscribe((state) => {
      internalState.value = state
    })
  }

  // 获取字段值
  function getFieldValue(name: string): any {
    return form.value?.getFieldValue(name)
  }

  // 设置字段值
  function setFieldValue(name: string, value: any): void {
    form.value?.setFieldValue(name, value)
  }

  // 验证表单
  async function validate(names?: string[]): Promise<FormValidateResult> {
    if (!form.value) {
      return { valid: true, errors: {} }
    }
    return form.value.validate(names)
  }

  // 验证字段
  async function validateField(name: string): Promise<any> {
    return form.value?.validateField(name)
  }

  // 重置表单
  function reset(names?: string[]): void {
    form.value?.reset(names)
  }

  // 重置字段
  function resetField(name: string): void {
    form.value?.resetField(name)
  }

  // 清除验证
  function clearValidate(names?: string[]): void {
    form.value?.clearValidate(names)
  }

  // 提交表单
  async function submit(): Promise<any> {
    return form.value?.submit()
  }

  // 监听外部值变化
  watch(
    () => options.initialValues,
    (newValues) => {
      if (newValues && form.value) {
        form.value.setData(newValues, false)
      }
    },
    { deep: true }
  )

  // 生命周期
  onMounted(() => {
    initForm()
  })

  onUnmounted(() => {
    form.value?.destroy()
  })

  return {
    form,
    formData,
    formState,
    validating,
    submitting,
    valid,
    dirty,
    errors,
    getFieldValue,
    setFieldValue,
    validate,
    validateField,
    reset,
    resetField,
    clearValidate,
    submit
  }
}

/**
 * 创建响应式表单（不依赖组件生命周期）
 */
export function createReactiveForm(options: UseFormOptions = {}): UseFormReturn & { init: () => void; destroy: () => void } {
  const form = ref<FormInstance | null>(null)
  const formData = ref<Record<string, any>>(options.initialValues || options.defaultValue || {})
  const internalState = ref<FormState | null>(null)

  const formState = computed(() => internalState.value)
  const validating = computed(() => internalState.value?.validating ?? false)
  const submitting = computed(() => internalState.value?.submitting ?? false)
  const valid = computed(() => internalState.value?.valid ?? true)
  const dirty = computed(() => internalState.value?.dirty ?? false)
  const errors = computed(() => internalState.value?.errors ?? {})

  function init(): void {
    const events: FormEvents = {
      onSubmit: async (context) => {
        await options.onSubmit?.(context.data)
      },
      onReset: (context) => {
        formData.value = { ...context.data }
        options.onReset?.(context.data)
      },
      onChange: (context) => {
        formData.value = { ...context.data }
        options.onChange?.(context.data, context)
      },
      onValidate: (result) => {
        options.onValidate?.(result)
      }
    }

    const config: FormConfig = {
      options: options.options || [],
      defaultValue: options.initialValues || options.defaultValue,
      value: formData.value,
      rules: options.rules,
      resetType: options.resetType
    }

    form.value = createFormStore(config, events)
    form.value.subscribe((state) => {
      internalState.value = state
    })
  }

  function destroy(): void {
    form.value?.destroy()
    form.value = null
  }

  function getFieldValue(name: string): any {
    return form.value?.getFieldValue(name)
  }

  function setFieldValue(name: string, value: any): void {
    form.value?.setFieldValue(name, value)
  }

  async function validate(names?: string[]): Promise<FormValidateResult> {
    if (!form.value) {
      return { valid: true, errors: {} }
    }
    return form.value.validate(names)
  }

  async function validateField(name: string): Promise<any> {
    return form.value?.validateField(name)
  }

  function reset(names?: string[]): void {
    form.value?.reset(names)
  }

  function resetField(name: string): void {
    form.value?.resetField(name)
  }

  function clearValidate(names?: string[]): void {
    form.value?.clearValidate(names)
  }

  async function submit(): Promise<any> {
    return form.value?.submit()
  }

  return {
    form,
    formData,
    formState,
    validating,
    submitting,
    valid,
    dirty,
    errors,
    getFieldValue,
    setFieldValue,
    validate,
    validateField,
    reset,
    resetField,
    clearValidate,
    submit,
    init,
    destroy
  }
}
