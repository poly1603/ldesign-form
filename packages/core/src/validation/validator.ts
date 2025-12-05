/**
 * 表单验证器
 */

import type { FormRule, ValidationResult } from '../types'

/** 邮箱正则 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** URL 正则 */
const URL_REGEX = /^https?:\/\/[^\s$.?#].[^\s]*$/

/** 日期正则 */
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2})?/

/**
 * 验证单个规则
 */
async function validateRule(
  value: any,
  rule: FormRule,
  formData: Record<string, any>
): Promise<ValidationResult> {
  // 必填验证
  if (rule.required) {
    const isEmpty = value === undefined ||
      value === null ||
      value === '' ||
      (Array.isArray(value) && value.length === 0) ||
      (rule.whitespace !== false && typeof value === 'string' && value.trim() === '')
    
    if (isEmpty) {
      return {
        valid: false,
        message: rule.message || '此字段为必填项'
      }
    }
  }

  // 如果值为空且不是必填，跳过其他验证
  if (value === undefined || value === null || value === '') {
    return { valid: true }
  }

  // 类型验证
  if (rule.type) {
    const typeValid = validateType(value, rule.type)
    if (!typeValid) {
      return {
        valid: false,
        message: rule.message || getTypeErrorMessage(rule.type)
      }
    }
  }

  // 长度验证
  if (rule.len !== undefined) {
    const length = getLength(value)
    if (length !== rule.len) {
      return {
        valid: false,
        message: rule.message || `长度必须为 ${rule.len}`
      }
    }
  }

  // 最小长度
  if (rule.min !== undefined) {
    const length = getLength(value)
    if (length < rule.min) {
      return {
        valid: false,
        message: rule.message || `最小长度为 ${rule.min}`
      }
    }
  }

  // 最大长度
  if (rule.max !== undefined) {
    const length = getLength(value)
    if (length > rule.max) {
      return {
        valid: false,
        message: rule.message || `最大长度为 ${rule.max}`
      }
    }
  }

  // 正则验证
  if (rule.pattern) {
    const regex = typeof rule.pattern === 'string' ? new RegExp(rule.pattern) : rule.pattern
    if (!regex.test(String(value))) {
      return {
        valid: false,
        message: rule.message || '格式不正确'
      }
    }
  }

  // 枚举验证
  if (rule.enum && rule.enum.length > 0) {
    if (!rule.enum.includes(value)) {
      return {
        valid: false,
        message: rule.message || `值必须是以下之一: ${rule.enum.join(', ')}`
      }
    }
  }

  // 自定义验证器
  if (rule.validator) {
    try {
      const result = await rule.validator(value, rule, formData)
      if (result === false) {
        return {
          valid: false,
          message: rule.message || '验证失败'
        }
      }
      if (typeof result === 'string') {
        return {
          valid: false,
          message: result
        }
      }
    } catch (error: any) {
      return {
        valid: false,
        message: error?.message || '验证出错'
      }
    }
  }

  return { valid: true }
}

/**
 * 验证类型
 */
function validateType(value: any, type: FormRule['type']): boolean {
  switch (type) {
    case 'string':
      return typeof value === 'string'
    case 'number':
      return typeof value === 'number' && !isNaN(value)
    case 'boolean':
      return typeof value === 'boolean'
    case 'array':
      return Array.isArray(value)
    case 'object':
      return typeof value === 'object' && value !== null && !Array.isArray(value)
    case 'email':
      return typeof value === 'string' && EMAIL_REGEX.test(value)
    case 'url':
      return typeof value === 'string' && URL_REGEX.test(value)
    case 'date':
      return value instanceof Date || (typeof value === 'string' && DATE_REGEX.test(value))
    default:
      return true
  }
}

/**
 * 获取类型错误消息
 */
function getTypeErrorMessage(type: FormRule['type']): string {
  const messages: Record<string, string> = {
    string: '必须是字符串',
    number: '必须是数字',
    boolean: '必须是布尔值',
    array: '必须是数组',
    object: '必须是对象',
    email: '邮箱格式不正确',
    url: 'URL 格式不正确',
    date: '日期格式不正确'
  }
  return messages[type as string] || '类型不正确'
}

/**
 * 获取值的长度
 */
function getLength(value: any): number {
  if (typeof value === 'string') {
    return value.length
  }
  if (Array.isArray(value)) {
    return value.length
  }
  if (typeof value === 'number') {
    return value
  }
  return 0
}

/**
 * 验证字段
 */
export async function validateField(
  value: any,
  rules: FormRule[],
  formData: Record<string, any>,
  fieldName: string
): Promise<ValidationResult> {
  if (!rules || rules.length === 0) {
    return { valid: true, field: fieldName }
  }

  for (const rule of rules) {
    const result = await validateRule(value, rule, formData)
    if (!result.valid) {
      return {
        ...result,
        field: fieldName
      }
    }
  }

  return { valid: true, field: fieldName }
}

/**
 * 验证表单
 */
export async function validateForm(
  formData: Record<string, any>,
  rules: Record<string, FormRule[]>,
  fieldNames?: string[]
): Promise<Record<string, ValidationResult>> {
  const errors: Record<string, ValidationResult> = {}
  const names = fieldNames || Object.keys(rules)

  await Promise.all(
    names.map(async (name) => {
      const fieldRules = rules[name]
      if (fieldRules && fieldRules.length > 0) {
        const value = formData[name]
        const result = await validateField(value, fieldRules, formData, name)
        if (!result.valid) {
          errors[name] = result
        }
      }
    })
  )

  return errors
}

/**
 * 获取第一个错误消息
 */
export function getFirstError(errors: Record<string, ValidationResult>): string | undefined {
  const keys = Object.keys(errors)
  if (keys.length === 0) return undefined
  return errors[keys[0]]?.message
}

/**
 * 创建验证规则
 */
export function createRule(options: FormRule): FormRule {
  return { ...options }
}

/**
 * 常用验证规则
 */
export const Rules = {
  /** 必填 */
  required: (message?: string): FormRule => ({
    required: true,
    message: message || '此字段为必填项'
  }),

  /** 邮箱 */
  email: (message?: string): FormRule => ({
    type: 'email',
    message: message || '请输入有效的邮箱地址'
  }),

  /** URL */
  url: (message?: string): FormRule => ({
    type: 'url',
    message: message || '请输入有效的 URL'
  }),

  /** 最小长度 */
  minLength: (min: number, message?: string): FormRule => ({
    min,
    message: message || `最小长度为 ${min}`
  }),

  /** 最大长度 */
  maxLength: (max: number, message?: string): FormRule => ({
    max,
    message: message || `最大长度为 ${max}`
  }),

  /** 长度范围 */
  lengthRange: (min: number, max: number, message?: string): FormRule => ({
    min,
    max,
    message: message || `长度必须在 ${min} 到 ${max} 之间`
  }),

  /** 正则匹配 */
  pattern: (pattern: RegExp | string, message?: string): FormRule => ({
    pattern,
    message: message || '格式不正确'
  }),

  /** 手机号 */
  phone: (message?: string): FormRule => ({
    pattern: /^1[3-9]\d{9}$/,
    message: message || '请输入有效的手机号'
  }),

  /** 身份证 */
  idCard: (message?: string): FormRule => ({
    pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,
    message: message || '请输入有效的身份证号'
  }),

  /** 数字 */
  number: (message?: string): FormRule => ({
    type: 'number',
    message: message || '请输入数字'
  }),

  /** 整数 */
  integer: (message?: string): FormRule => ({
    pattern: /^-?\d+$/,
    message: message || '请输入整数'
  }),

  /** 正整数 */
  positiveInteger: (message?: string): FormRule => ({
    pattern: /^[1-9]\d*$/,
    message: message || '请输入正整数'
  })
}
