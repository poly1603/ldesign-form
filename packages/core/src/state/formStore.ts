/**
 * 表单状态管理
 */

import type {
  FormState,
  FormInstance,
  FormConfig,
  FormChangeContext,
  FormSubmitContext,
  FormResetContext,
  FormValidateResult,
  FormSubmitResult,
  FormSubscriber,
  FormEvents
} from '../types/form'
import type { FormFieldState, FormRule, ValidationResult } from '../types/field'
import { validateForm, validateField as validateFieldRules, getFirstError } from '../validation'
import { deepClone, mergeData, get, set } from '../utils'

/**
 * 创建字段状态
 */
function createFieldState(name: string, initialValue: any): FormFieldState {
  return {
    name,
    value: initialValue,
    initialValue: deepClone(initialValue),
    dirty: false,
    touched: false,
    validating: false,
    validation: { valid: true },
    disabled: false,
    readonly: false,
    visible: true
  }
}

/**
 * 创建表单状态管理器
 */
export function createFormStore(
  config: FormConfig,
  events?: FormEvents
): FormInstance {
  // 初始化状态
  const state: FormState = {
    data: deepClone(config.value || config.defaultValue || {}),
    initialData: deepClone(config.defaultValue || {}),
    fields: new Map(),
    submitting: false,
    validating: false,
    valid: true,
    dirty: false,
    errors: {},
    computedSpan: config.span || 4,
    width: typeof config.width === 'number' ? config.width : 0
  }

  // 订阅者列表
  const subscribers: Set<FormSubscriber> = new Set()

  // 规则映射
  let rules: Record<string, FormRule[]> = { ...config.rules }

  /**
   * 通知订阅者
   */
  function notify(context: FormChangeContext): void {
    subscribers.forEach(callback => {
      try {
        callback(getState(), context)
      } catch (error) {
        console.error('Form subscriber error:', error)
      }
    })
  }

  /**
   * 获取表单状态
   */
  function getState(): FormState {
    return { ...state }
  }

  /**
   * 获取表单数据
   */
  function getData(): Record<string, any> {
    return deepClone(state.data)
  }

  /**
   * 设置表单数据
   */
  function setData(data: Record<string, any>, merge = true): void {
    const oldData = deepClone(state.data)
    state.data = merge ? mergeData(state.data, data) : deepClone(data)
    
    // 更新字段状态
    Object.keys(data).forEach(name => {
      const fieldState = state.fields.get(name)
      if (fieldState) {
        fieldState.value = state.data[name]
        fieldState.dirty = fieldState.value !== fieldState.initialValue
      }
    })

    // 更新 dirty 状态
    updateDirtyState()

    // 触发变化事件
    const context: FormChangeContext = {
      data: getData(),
      action: 'setData'
    }
    
    events?.onChange?.(context)
    notify(context)
  }

  /**
   * 获取字段值
   */
  function getFieldValue(name: string): any {
    return get(state.data, name)
  }

  /**
   * 设置字段值
   */
  function setFieldValue(name: string, value: any): void {
    const oldValue = getFieldValue(name)
    set(state.data, name, value)

    // 更新字段状态
    let fieldState = state.fields.get(name)
    if (!fieldState) {
      fieldState = createFieldState(name, value)
      state.fields.set(name, fieldState)
    }
    fieldState.value = value
    fieldState.dirty = value !== fieldState.initialValue
    fieldState.touched = true

    // 更新 dirty 状态
    updateDirtyState()

    // 触发变化事件
    const context: FormChangeContext = {
      field: name,
      oldValue,
      newValue: value,
      data: getData(),
      action: 'change'
    }
    
    events?.onChange?.(context)
    notify(context)
  }

  /**
   * 更新 dirty 状态
   */
  function updateDirtyState(): void {
    let dirty = false
    state.fields.forEach(fieldState => {
      if (fieldState.dirty) {
        dirty = true
      }
    })
    state.dirty = dirty
  }

  /**
   * 验证表单
   */
  async function validate(names?: string[]): Promise<FormValidateResult> {
    state.validating = true
    
    try {
      const errors = await validateForm(state.data, rules, names)
      state.errors = errors
      state.valid = Object.keys(errors).length === 0

      // 更新字段验证状态
      if (names) {
        names.forEach(name => {
          const fieldState = state.fields.get(name)
          if (fieldState) {
            fieldState.validation = errors[name] || { valid: true }
          }
        })
      } else {
        state.fields.forEach((fieldState, name) => {
          fieldState.validation = errors[name] || { valid: true }
        })
      }

      const result: FormValidateResult = {
        valid: state.valid,
        errors,
        firstError: getFirstError(errors)
      }

      events?.onValidate?.(result)
      return result
    } finally {
      state.validating = false
    }
  }

  /**
   * 验证字段
   */
  async function validateFieldValue(name: string): Promise<ValidationResult> {
    const fieldRules = rules[name] || []
    const value = getFieldValue(name)
    
    const fieldState = state.fields.get(name)
    if (fieldState) {
      fieldState.validating = true
    }

    try {
      const result = await validateFieldRules(value, fieldRules, state.data, name)
      
      if (fieldState) {
        fieldState.validation = result
      }

      if (!result.valid) {
        state.errors[name] = result
      } else {
        delete state.errors[name]
      }

      state.valid = Object.keys(state.errors).length === 0
      return result
    } finally {
      if (fieldState) {
        fieldState.validating = false
      }
    }
  }

  /**
   * 重置表单
   */
  function reset(names?: string[]): void {
    const resetType = config.resetType || 'initial'
    
    if (names) {
      names.forEach(name => {
        const initialValue = resetType === 'initial' 
          ? get(state.initialData, name) 
          : getDefaultValue(name)
        set(state.data, name, deepClone(initialValue))
        
        const fieldState = state.fields.get(name)
        if (fieldState) {
          fieldState.value = initialValue
          fieldState.dirty = false
          fieldState.touched = false
          fieldState.validation = { valid: true }
        }
      })
    } else {
      state.data = resetType === 'initial' 
        ? deepClone(state.initialData) 
        : {}
      
      state.fields.forEach((fieldState, name) => {
        const initialValue = get(state.initialData, name)
        fieldState.value = initialValue
        fieldState.dirty = false
        fieldState.touched = false
        fieldState.validation = { valid: true }
      })
    }

    state.errors = {}
    state.valid = true
    state.dirty = false

    const context: FormResetContext = {
      data: getData(),
      initialData: deepClone(state.initialData),
      instance
    }

    events?.onReset?.(context)
    notify({
      data: getData(),
      action: 'reset'
    })
  }

  /**
   * 获取字段默认值
   */
  function getDefaultValue(name: string): any {
    return get(state.initialData, name)
  }

  /**
   * 重置字段
   */
  function resetField(name: string): void {
    reset([name])
  }

  /**
   * 清除验证
   */
  function clearValidate(names?: string[]): void {
    if (names) {
      names.forEach(name => {
        delete state.errors[name]
        const fieldState = state.fields.get(name)
        if (fieldState) {
          fieldState.validation = { valid: true }
        }
      })
    } else {
      state.errors = {}
      state.fields.forEach(fieldState => {
        fieldState.validation = { valid: true }
      })
    }
    state.valid = true
  }

  /**
   * 提交表单
   */
  async function submit(): Promise<FormSubmitResult> {
    state.submitting = true

    try {
      const validateResult = await validate()
      
      const result: FormSubmitResult = {
        success: validateResult.valid,
        data: getData(),
        validateResult
      }

      if (validateResult.valid) {
        const context: FormSubmitContext = {
          data: getData(),
          initialData: deepClone(state.initialData),
          validateResult,
          instance
        }
        await events?.onSubmit?.(context)
      }

      return result
    } finally {
      state.submitting = false
    }
  }

  /**
   * 获取字段状态
   */
  function getFieldState(name: string): FormFieldState | undefined {
    return state.fields.get(name)
  }

  /**
   * 设置字段禁用状态
   */
  function setFieldDisabled(name: string, disabled: boolean): void {
    const fieldState = state.fields.get(name)
    if (fieldState) {
      fieldState.disabled = disabled
    }
  }

  /**
   * 设置字段可见状态
   */
  function setFieldVisible(name: string, visible: boolean): void {
    const fieldState = state.fields.get(name)
    if (fieldState) {
      fieldState.visible = visible
    }
  }

  /**
   * 订阅表单变化
   */
  function subscribe(callback: FormSubscriber): () => void {
    subscribers.add(callback)
    return () => {
      subscribers.delete(callback)
    }
  }

  /**
   * 设置规则
   */
  function setRules(newRules: Record<string, FormRule[]>): void {
    rules = { ...newRules }
  }

  /**
   * 初始化字段状态
   */
  function initFieldState(name: string, initialValue?: any): void {
    if (!state.fields.has(name)) {
      const value = initialValue ?? getFieldValue(name)
      state.fields.set(name, createFieldState(name, value))
    }
  }

  /**
   * 销毁表单
   */
  function destroy(): void {
    subscribers.clear()
    state.fields.clear()
  }

  // 表单实例
  const instance: FormInstance = {
    getData,
    setData,
    getFieldValue,
    setFieldValue,
    validate,
    validateField: validateFieldValue,
    reset,
    resetField,
    clearValidate,
    submit,
    getState,
    getFieldState,
    setFieldDisabled,
    setFieldVisible,
    subscribe,
    destroy
  }

  // 触发就绪事件
  setTimeout(() => {
    events?.onReady?.(instance)
    notify({
      data: getData(),
      action: 'init'
    })
  }, 0)

  // 返回扩展实例
  return Object.assign(instance, {
    setRules,
    initFieldState
  })
}

export type FormStore = ReturnType<typeof createFormStore>
