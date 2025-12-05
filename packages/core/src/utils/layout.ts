/**
 * 布局计算工具
 */

import type { FormFieldConfig, ComputedFormOptions } from '../types'
import { isString, sumArray } from './helpers'

/**
 * 填充 span 默认值
 */
export function normalizeSpan(options: FormFieldConfig[]): FormFieldConfig[] {
  return options.map(item => ({
    ...item,
    span: item.span ?? 1
  }))
}

/**
 * 计算字段的实际 span 值
 */
export function computeSpan(span: number | string, totalSpan: number): number {
  if (typeof span === 'number') {
    return Math.min(span, totalSpan)
  }
  if (typeof span === 'string') {
    const percent = parseFloat(span)
    if (!isNaN(percent)) {
      return Math.floor((percent / 100) * totalSpan)
    }
  }
  return 1
}

/**
 * 按 span 限制和行数分组
 */
export function groupBySpanLimit(
  items: FormFieldConfig[],
  limit: number,
  previewRows: number,
  buttonSpan: number,
  isCollapsed: boolean,
  buttonPosition: 'inline' | 'block',
  adjustSpan: boolean
): ComputedFormOptions {
  if (limit === 0 || !items || items.length === 0) {
    return { preview: [], more: [], labelWidths: [] }
  }

  // 过滤可见字段
  const visibleItems = items.filter(item => item.visible !== false)
  
  const groups: FormFieldConfig[][] = []
  let currentGroup: FormFieldConfig[] = []
  let currentSpanSum = 0
  let currentRowIndex = 0

  // 是否需要为按钮预留空间
  const isReservedRow = buttonPosition === 'inline' && isCollapsed && currentRowIndex === previewRows - 1
  const reservedSpan = isReservedRow ? buttonSpan : 0

  for (let i = 0; i < visibleItems.length; i++) {
    const item = { ...visibleItems[i] }
    delete item.adjustSpan

    const effectiveLimit = (buttonPosition === 'inline' && isCollapsed && currentRowIndex === previewRows - 1)
      ? limit - buttonSpan
      : limit

    const currentSpan = computeSpan(item.span || 1, limit)
    
    // 如果是字符串百分比，计算实际值
    if (isString(item.span)) {
      item.computedSpan = currentSpan
    }

    // 当前组能容纳这个字段
    if (currentSpanSum + currentSpan <= effectiveLimit) {
      currentGroup.push(item)
      currentSpanSum += currentSpan
    } else {
      // 需要新建一行
      if (adjustSpan && currentGroup.length > 0) {
        // 调整最后一个字段的 span 以填满行
        const totalSpan = sumArray(currentGroup.map(a => computeSpan(a.span || 1, limit)))
        if (totalSpan < limit) {
          const lastItem = currentGroup[currentGroup.length - 1]
          lastItem.adjustSpan = (computeSpan(lastItem.span || 1, limit)) + (limit - totalSpan)
        }
      }

      groups.push(currentGroup)
      currentGroup = [item]
      currentSpanSum = currentSpan
      currentRowIndex++
    }
  }

  // 添加最后一组
  if (currentGroup.length > 0) {
    if (adjustSpan && buttonPosition === 'block') {
      const totalSpan = sumArray(currentGroup.map(a => computeSpan(a.span || 1, limit)))
      if (totalSpan < limit) {
        const lastItem = currentGroup[currentGroup.length - 1]
        lastItem.adjustSpan = (computeSpan(lastItem.span || 1, limit)) + (limit - totalSpan)
      }
    }
    groups.push(currentGroup)
  }

  // 分割预览和更多区域
  const splitIndex = previewRows > 0 ? previewRows : groups.length
  const preview = groups.slice(0, splitIndex)
  const more = groups.slice(splitIndex)

  // 计算标签宽度
  const labelWidths = calculateLabelWidths([...preview, ...more], limit)

  // 为每个字段设置索引
  let globalIndex = 0
  ;[...preview, ...more].forEach(row => {
    let colIndex = 0
    row.forEach(item => {
      item.index = colIndex
      colIndex += computeSpan(item.span || 1, limit)
      globalIndex++
    })
  })

  return { preview, more, labelWidths }
}

/**
 * 计算每列的标签宽度
 */
export function calculateLabelWidths(
  groups: FormFieldConfig[][],
  limit: number,
  defaultWidth?: number | string
): number[] {
  const labelWidths: number[] = new Array(limit).fill(defaultWidth ? parseFloat(String(defaultWidth)) : 0)

  groups.forEach(row => {
    let startIndex = 0
    row.forEach(item => {
      const labelWidth = calculateTextWidth(String(item.label || ''))
      
      // 考虑必填标记
      const isRequired = item.rules?.some(rule => rule.required)
      const requiredWidth = isRequired ? 8 : 0
      
      const totalWidth = labelWidth + requiredWidth
      
      if (totalWidth > labelWidths[startIndex]) {
        labelWidths[startIndex] = totalWidth
      }

      item.computedLabelWidth = labelWidth
      item.isRequired = isRequired
      
      startIndex += computeSpan(item.span || 1, limit)
    })
  })

  return labelWidths
}

/**
 * 计算文本宽度（浏览器环境）
 */
export function calculateTextWidth(text: string, fontSize = 14): number {
  if (typeof document === 'undefined') {
    // 非浏览器环境，使用估算值
    return text.length * fontSize * 0.6
  }

  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  if (!context) {
    return text.length * fontSize * 0.6
  }

  context.font = `${fontSize}px sans-serif`
  return Math.ceil(context.measureText(text).width)
}

/**
 * 计算冒号宽度
 */
export function getColonWidth(): number {
  return calculateTextWidth('：')
}

/**
 * 将数组按索引分割为两部分
 */
export function splitArrayByIndex<T>(arr: T[], index: number): [T[], T[]] {
  if (index < 0 || index >= arr.length) {
    return [arr, []]
  }
  return [arr.slice(0, index + 1), arr.slice(index + 1)]
}
