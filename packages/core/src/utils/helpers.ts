/**
 * 工具函数
 */

/**
 * 深拷贝
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as unknown as T
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T
  }

  if (obj instanceof RegExp) {
    return new RegExp(obj.source, obj.flags) as unknown as T
  }

  const cloned = {} as T
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key])
    }
  }

  return cloned
}

/**
 * 合并数据
 */
export function mergeData(target: Record<string, any>, source: Record<string, any>): Record<string, any> {
  const result = deepClone(target)
  
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      result[key] = source[key]
    }
  }

  return result
}

/**
 * 获取嵌套对象属性
 */
export function get(obj: Record<string, any>, path: string, defaultValue?: any): any {
  if (!path) return obj
  
  const keys = path.split('.')
  let result = obj

  for (const key of keys) {
    if (result === null || result === undefined) {
      return defaultValue
    }
    result = result[key]
  }

  return result === undefined ? defaultValue : result
}

/**
 * 设置嵌套对象属性
 */
export function set(obj: Record<string, any>, path: string, value: any): void {
  if (!path) return
  
  const keys = path.split('.')
  let current = obj

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {}
    }
    current = current[key]
  }

  current[keys[keys.length - 1]] = value
}

/**
 * 判断是否为空值
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string' && value.trim() === '') return true
  if (Array.isArray(value) && value.length === 0) return true
  if (typeof value === 'object' && Object.keys(value).length === 0) return true
  return false
}

/**
 * 判断是否为数组且非空
 */
export function isArrayAndNotEmpty(value: any): value is any[] {
  return Array.isArray(value) && value.length > 0
}

/**
 * 判断是否为字符串
 */
export function isString(value: any): value is string {
  return typeof value === 'string'
}

/**
 * 判断是否为数字
 */
export function isNumber(value: any): value is number {
  return typeof value === 'number' && !isNaN(value)
}

/**
 * 判断是否为布尔值
 */
export function isBoolean(value: any): value is boolean {
  return typeof value === 'boolean'
}

/**
 * 判断是否为函数
 */
export function isFunction(value: any): value is Function {
  return typeof value === 'function'
}

/**
 * 判断是否为对象
 */
export function isObject(value: any): value is Record<string, any> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * 数组求和
 */
export function sumArray(numbers: number[]): number {
  return numbers?.reduce((sum, current) => sum + (current || 0), 0) || 0
}

/**
 * 像素兼容处理
 */
export function pxCompat(value: string | number | undefined): string {
  if (value === undefined || value === null) return '0px'
  if (typeof value === 'number') return `${value}px`
  if (typeof value === 'string') {
    // 如果已经包含单位或是 CSS 变量，直接返回
    if (value.includes('px') || value.includes('%') || value.includes('var(')) {
      return value
    }
    // 尝试解析为数字
    const num = parseFloat(value)
    if (!isNaN(num)) {
      return `${num}px`
    }
  }
  return String(value)
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null
  
  return function (this: any, ...args: Parameters<T>) {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastTime = 0
  
  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now()
    if (now - lastTime >= delay) {
      fn.apply(this, args)
      lastTime = now
    }
  }
}

/**
 * 生成唯一 ID
 */
export function generateId(prefix = 'lf'): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 11)}`
}

/**
 * 合并对象（用于缓存）
 */
export function mergeObjects(
  defaultValue: Record<string, any>,
  value: Record<string, any>,
  innerValue: Record<string, any>
): Record<string, any> {
  const result: Record<string, any> = {}
  const keys = new Set([
    ...Object.keys(defaultValue || {}),
    ...Object.keys(value || {}),
    ...Object.keys(innerValue || {})
  ])

  keys.forEach(key => {
    if (innerValue && innerValue[key] != null && innerValue[key] !== '') {
      result[key] = innerValue[key]
    } else if (value && value[key] != null && value[key] !== '') {
      result[key] = value[key]
    } else {
      result[key] = defaultValue?.[key]
    }
  })

  return result
}

/**
 * 检查对象是否包含指定键
 */
export function containsKey(array: any[] | undefined, key: string): boolean {
  return array?.some(obj => Object.prototype.hasOwnProperty.call(obj, key)) || false
}

/**
 * 数组转对象
 */
export function arrayToObject<T extends { name: string; value: any }>(
  array: T[]
): Record<string, any> {
  const result: Record<string, any> = {}
  array.forEach(item => {
    if (item.name && item.value !== undefined) {
      result[item.name] = item.value
    }
  })
  return result
}
