<script lang="ts">
/**
 * LForm 表单组件
 * 
 * 特性：
 * 1. 根据容器宽度自动计算最大列数
 * 2. 表单项支持跨列
 * 3. 支持预览行数 + 展开/收起
 * 4. 按钮组智能定位（行内/独立行）
 * 5. 标签宽度按列自动对齐
 * 6. 支持标签水平/垂直布局
 */
import {
  defineComponent,
  ref,
  computed,
  watch,
  onMounted,
  onUnmounted,
  provide,
  nextTick
} from 'vue'
import type { PropType } from 'vue'
import type { FormRule, FormInstance } from '@ldesign/form-core'
import { createFormStore, pxCompat } from '@ldesign/form-core'
import { FORM_CONTEXT_KEY, CLASS_PREFIX } from '../constants'
import type { FormContext, VueFormFieldConfig, VueFormGroup } from '../types'
import LFormItem from './LFormItem.vue'

/** 布局行信息 */
interface LayoutRow {
  fields: Array<VueFormFieldConfig & { _colIndex: number }>
  usedCols: number
  remainingCols: number
}

/** 计算文本宽度（带缓存） */
const textWidthCache = new Map<string, number>()
function getTextWidth(text: string, fontSize = 14): number {
  const key = `${text}_${fontSize}`
  if (textWidthCache.has(key)) return textWidthCache.get(key)!
  
  if (typeof document === 'undefined') {
    const width = text.length * fontSize * 0.6
    textWidthCache.set(key, width)
    return width
  }
  
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    const width = text.length * fontSize * 0.6
    textWidthCache.set(key, width)
    return width
  }
  
  ctx.font = `${fontSize}px sans-serif`
  const width = Math.ceil(ctx.measureText(text).width)
  textWidthCache.set(key, width)
  return width
}

export default defineComponent({
  name: 'LForm',
  components: { LFormItem },
  props: {
    // ========== 表单数据 ==========
    modelValue: {
      type: Object as PropType<Record<string, any>>,
      default: () => ({})
    },
    defaultValue: {
      type: Object as PropType<Record<string, any>>,
      default: () => ({})
    },
    
    // ========== 表单配置 ==========
    options: {
      type: Array as PropType<VueFormFieldConfig[] | VueFormGroup[]>,
      default: () => []
    },
    rules: {
      type: Object as PropType<Record<string, FormRule[]>>,
      default: () => ({})
    },
    
    // ========== 栅格配置 ==========
    /** 每列基础宽度(px)，用于计算最大列数 */
    colWidth: {
      type: Number,
      default: 280
    },
    /** 最小列数 */
    minCols: {
      type: Number,
      default: 1
    },
    /** 最大列数 */
    maxCols: {
      type: Number,
      default: 6
    },
    /** 列间距 */
    gutter: {
      type: [String, Number] as PropType<string | number>,
      default: 16
    },
    /** 行间距（默认与列间距相同） */
    rowGutter: {
      type: [String, Number] as PropType<string | number>,
      default: undefined
    },
    
    // ========== 预览/展开配置 ==========
    /** 默认显示行数，0表示显示全部 */
    previewRows: {
      type: Number,
      default: 0
    },
    /** 是否将每行最后一列自动铺满剩余空间 */
    adjustLastCol: {
      type: Boolean,
      default: false
    },
    
    // ========== 按钮配置 ==========
    /** 是否显示按钮组 */
    showButton: {
      type: Boolean,
      default: true
    },
    /** 
     * 按钮组位置
     * - inline: 和表单项同行，在最后一行末尾
     * - newline: 始终独占一行
     */
    buttonPosition: {
      type: String as PropType<'inline' | 'newline'>,
      default: 'inline'
    },
    /** 按钮组占用列数 */
    buttonSpan: {
      type: Number,
      default: 1
    },
    
    // ========== 标签配置 ==========
    /** 
     * 标签宽度
     * - undefined: 按列自动计算最大宽度对齐
     * - 数值/字符串: 固定宽度
     */
    labelWidth: {
      type: [String, Number] as PropType<string | number>,
      default: undefined
    },
    /** 
     * 标签对齐方式
     * - left: 左对齐（标签和控件同行）
     * - right: 右对齐（标签和控件同行）
     * - top: 垂直布局（标签在控件上方）
     */
    labelAlign: {
      type: String as PropType<'left' | 'right' | 'top'>,
      default: 'right'
    },
    /**
     * 标签宽度计算模式
     * - visible: 根据当前可见字段计算
     * - all: 根据所有字段计算
     */
    labelWidthMode: {
      type: String as PropType<'visible' | 'all'>,
      default: 'visible'
    },
    /** 是否显示冒号 */
    colon: {
      type: Boolean,
      default: true
    },
    
    // ========== 其他 ==========
    disabled: {
      type: Boolean,
      default: false
    },
    readonly: {
      type: Boolean,
      default: false
    },
    resetType: {
      type: String as PropType<'initial' | 'empty'>,
      default: 'initial'
    }
  },
  emits: ['update:modelValue', 'submit', 'reset', 'change', 'ready', 'validate', 'expand'],
  setup(props, { emit, expose }) {
    // ========== Refs ==========
    const formRef = ref<HTMLFormElement | null>(null)
    const formInstance = ref<FormInstance | null>(null)
    const innerValue = ref<Record<string, any>>({ ...props.defaultValue, ...props.modelValue })
    const containerWidth = ref(0)
    const expanded = ref(false)

    // ========== 计算属性 ==========
    
    /** 计算当前最大列数（响应式） */
    const maxColsComputed = computed(() => {
      // 如果容器宽度未知，使用最大列数作为默认值（避免布局跳动）
      if (containerWidth.value === 0) return props.maxCols
      const cols = Math.floor(containerWidth.value / props.colWidth)
      return Math.max(props.minCols, Math.min(props.maxCols, cols))
    })

    /** 行间距（默认与列间距相同） */
    const rowGutterComputed = computed(() => {
      return props.rowGutter ?? props.gutter
    })

    /** 判断是否为分组模式 */
    const isGroupMode = computed(() => {
      return props.options.length > 0 && 'children' in props.options[0]
    })

    /** 获取所有可见字段（含 span 裁剪） */
    const visibleFields = computed(() => {
      let fields: VueFormFieldConfig[]
      if (isGroupMode.value) {
        fields = (props.options as VueFormGroup[]).flatMap(g => g.children || [])
      } else {
        fields = props.options as VueFormFieldConfig[]
      }
      return fields
        .filter(f => f.visible !== false)
        .map(f => ({
          ...f,
          span: Math.min(Math.max(1, Number(f.span) || 1), maxColsComputed.value)
        }))
    })

    /**
     * 将字段分配到行中，并记录每个字段所在的起始列索引
     * 返回完整布局（不考虑预览限制）
     */
    const fullLayoutRows = computed((): LayoutRow[] => {
      const rows: LayoutRow[] = []
      const maxCols = maxColsComputed.value

      let currentRowFields: Array<VueFormFieldConfig & { _colIndex: number }> = []
      let currentColIndex = 0

      for (const field of visibleFields.value) {
        const fieldSpan = field.span || 1

        // 当前行放不下，开新行
        if (currentColIndex + fieldSpan > maxCols) {
          if (currentRowFields.length > 0) {
            rows.push({
              fields: currentRowFields,
              usedCols: currentColIndex,
              remainingCols: maxCols - currentColIndex
            })
          }
          currentRowFields = []
          currentColIndex = 0
        }

        currentRowFields.push({ ...field, _colIndex: currentColIndex })
        currentColIndex += fieldSpan
      }

      // 添加最后一行
      if (currentRowFields.length > 0) {
        rows.push({
          fields: currentRowFields,
          usedCols: currentColIndex,
          remainingCols: maxCols - currentColIndex
        })
      }

      return rows
    })

    /**
     * 计算每列的最大标签宽度
     * 只有当 labelAlign 不是 'top' 且 labelWidth 未指定时才需要计算
     */
    const columnLabelWidths = computed(() => {
      // 如果标签在顶部或已指定固定宽度，不需要计算
      if (props.labelAlign === 'top' || props.labelWidth !== undefined) {
        return []
      }

      const maxCols = maxColsComputed.value
      const widths: number[] = new Array(maxCols).fill(0)

      // 根据 labelWidthMode 选择数据源
      // 'visible' 模式使用当前显示的行，'all' 模式使用所有行
      const rows = props.labelWidthMode === 'all' 
        ? fullLayoutRows.value 
        : displayLayout.value.rows

      for (const row of rows) {
        for (const field of row.fields) {
          if (!field.label) continue
          
          const colIndex = field._colIndex
          const labelText = typeof field.label === 'function' ? '' : String(field.label)
          const isRequired = field.rules?.some(r => r.required) ||
                            props.rules[field.name]?.some(r => r.required)
          
          // 计算标签宽度：文本宽度 + 必填标记(10px) + 冒号(12px)
          const width = getTextWidth(labelText) + (isRequired ? 10 : 0) + (props.colon ? 12 : 0)
          
          // 只统计该字段起始列的标签宽度
          if (width > widths[colIndex]) {
            widths[colIndex] = width
          }
        }
      }

      return widths
    })

    /** 是否需要显示展开按钮 */
    const showExpandButton = computed(() => {
      if (props.previewRows <= 0 || !props.showButton) return false
      
      // 检查完整布局是否超过预览行数
      return fullLayoutRows.value.length > props.previewRows
    })

    /**
     * 计算最终显示布局
     * 根据 expanded 状态和 previewRows 配置，决定显示哪些行
     */
    const displayLayout = computed(() => {
      const maxCols = maxColsComputed.value
      const btnSpan = props.buttonSpan
      const showBtn = props.showButton

      // ===== 情况1: 不显示按钮 =====
      if (!showBtn) {
        return {
          rows: fullLayoutRows.value,
          buttonInline: false,
          buttonRowIndex: -1,
          buttonRemainingCols: 0
        }
      }

      // ===== 情况2: 按钮独占一行 =====
      if (props.buttonPosition === 'newline') {
        const displayRows = (props.previewRows > 0 && !expanded.value)
          ? fullLayoutRows.value.slice(0, props.previewRows)
          : fullLayoutRows.value
        
        return {
          rows: displayRows,
          buttonInline: false,
          buttonRowIndex: -1,
          buttonRemainingCols: maxCols
        }
      }

      // ===== 情况3: 无预览限制，或已展开 - 按钮内联到最后一行 =====
      if (props.previewRows <= 0 || expanded.value) {
        const rows = fullLayoutRows.value
        const lastRow = rows[rows.length - 1]
        // 只要最后一行有剩余空间（>=1列），按钮就内联
        const hasSpace = lastRow && lastRow.remainingCols >= 1
        
        return {
          rows,
          buttonInline: hasSpace,
          buttonRowIndex: hasSpace ? rows.length - 1 : -1,
          // 按钮占用所有剩余空间，如果没空间则独占一行
          buttonRemainingCols: hasSpace ? lastRow.remainingCols : maxCols
        }
      }

      // ===== 情况4: 按钮内联，已收起 =====
      // 最后一列预留给按钮组
      const targetRows = props.previewRows
      const result: LayoutRow[] = []
      let rowCount = 0
      let currentRowFields: Array<VueFormFieldConfig & { _colIndex: number }> = []
      let currentColIndex = 0

      for (const field of visibleFields.value) {
        const fieldSpan = field.span || 1
        const isLastPreviewRow = rowCount === targetRows - 1
        // 最后一行预留1列给按钮
        const effectiveMaxCols = isLastPreviewRow ? maxCols - 1 : maxCols

        // 当前行放不下
        if (currentColIndex + fieldSpan > effectiveMaxCols) {
          if (currentRowFields.length > 0) {
            result.push({
              fields: currentRowFields,
              usedCols: currentColIndex,
              remainingCols: effectiveMaxCols - currentColIndex
            })
            rowCount++
          }

          if (rowCount >= targetRows) break

          currentRowFields = [{ ...field, _colIndex: 0 }]
          currentColIndex = fieldSpan
        } else {
          currentRowFields.push({ ...field, _colIndex: currentColIndex })
          currentColIndex += fieldSpan
        }
      }

      // 添加最后一行（如果还有配额）
      if (currentRowFields.length > 0 && rowCount < targetRows) {
        result.push({
          fields: currentRowFields,
          usedCols: currentColIndex,
          remainingCols: 0  // 剩余空间给按钮
        })
      }

      // 按钮放在最后一行的末尾，占用剩余空间（至少1列）
      const lastRow = result[result.length - 1]
      return {
        rows: result,
        buttonInline: true,
        buttonRowIndex: result.length - 1,
        buttonRemainingCols: maxCols - (lastRow?.usedCols || 0)
      }
    })

    // ========== 辅助方法 ==========

    /** 合并规则 */
    const mergedRules = computed(() => {
      const rules: Record<string, FormRule[]> = { ...props.rules }
      visibleFields.value.forEach(field => {
        if (field.rules) {
          rules[field.name] = rules[field.name]
            ? [...rules[field.name], ...field.rules]
            : field.rules
        }
      })
      return rules
    })

    /** 获取字段的标签宽度 */
    function getFieldLabelWidth(field: VueFormFieldConfig & { _colIndex: number }): string {
      // 标签在顶部时不需要宽度
      const fieldLabelAlign = field.labelAlign || props.labelAlign
      if (fieldLabelAlign === 'top') return 'auto'
      
      // 优先使用指定的宽度
      if (props.labelWidth !== undefined) {
        return pxCompat(props.labelWidth)
      }
      
      // 使用该列计算出的最大宽度
      const colIndex = field._colIndex
      const width = columnLabelWidths.value[colIndex] || 0
      return width > 0 ? `${width + 16}px` : 'auto'  // +16 为 padding
    }

    /** 获取字段的标签对齐方式 */
    function getFieldLabelAlign(field: VueFormFieldConfig): 'left' | 'right' | 'top' {
      return field.labelAlign || props.labelAlign
    }

    // ========== 表单上下文 ==========
    const formContext: FormContext = {
      instance: null,
      config: {
        options: props.options,
        defaultValue: props.defaultValue,
        value: innerValue.value,
        rules: mergedRules.value
      },
      disabled: props.disabled,
      readonly: props.readonly,
      colon: props.colon,
      labelWidth: props.labelWidth,
      labelAlign: props.labelAlign,
      registerField: () => {},
      unregisterField: () => {}
    }

    provide(FORM_CONTEXT_KEY, formContext)

    // 初始化表单
    function initForm(): void {
      formInstance.value = createFormStore(
        {
          options: props.options,
          defaultValue: props.defaultValue,
          value: innerValue.value,
          rules: mergedRules.value,
          resetType: props.resetType
        },
        {
          onSubmit: (ctx) => emit('submit', ctx.data, ctx),
          onReset: (ctx) => {
            innerValue.value = { ...ctx.data }
            emit('update:modelValue', innerValue.value)
            emit('reset', ctx.data, ctx)
          },
          onChange: (ctx) => {
            innerValue.value = { ...ctx.data }
            emit('update:modelValue', innerValue.value)
            emit('change', ctx.data, ctx)
          },
          onValidate: (result) => emit('validate', result),
          onReady: (instance) => {
            formContext.instance = instance
            emit('ready', instance)
          }
        }
      )
    }

    // 监听容器宽度
    let resizeObserver: ResizeObserver | null = null
    function observeWidth(): void {
      if (!formRef.value) return
      resizeObserver = new ResizeObserver(entries => {
        const entry = entries[0]
        if (entry) {
          containerWidth.value = entry.contentRect.width
        }
      })
      resizeObserver.observe(formRef.value)
    }

    // 事件处理
    function handleSubmit(e: Event): void {
      e.preventDefault()
      formInstance.value?.submit()
    }

    function handleReset(e: Event): void {
      e.preventDefault()
      formInstance.value?.reset()
    }

    function handleFieldChange(name: string, val: any): void {
      innerValue.value[name] = val
      formInstance.value?.setFieldValue(name, val)
    }

    function toggleExpand(): void {
      expanded.value = !expanded.value
      emit('expand', expanded.value)
    }

    // ========== 暴露方法 ==========
    expose({
      submit: () => formInstance.value?.submit(),
      validate: (names?: string[]) => formInstance.value?.validate(names),
      validateField: (name: string) => formInstance.value?.validateField(name),
      reset: (names?: string[]) => formInstance.value?.reset(names),
      resetField: (name: string) => formInstance.value?.resetField(name),
      clearValidate: (names?: string[]) => formInstance.value?.clearValidate(names),
      getData: () => formInstance.value?.getData(),
      setData: (data: Record<string, any>, merge?: boolean) => formInstance.value?.setData(data, merge),
      getFieldValue: (name: string) => formInstance.value?.getFieldValue(name),
      setFieldValue: (name: string, value: any) => formInstance.value?.setFieldValue(name, value),
      expand: () => { expanded.value = true },
      collapse: () => { expanded.value = false },
      isExpanded: () => expanded.value,
      getMaxCols: () => maxColsComputed.value
    })

    // 监听
    watch(() => props.modelValue, (val) => {
      if (val) {
        innerValue.value = { ...val }
        formInstance.value?.setData(val)
      }
    }, { deep: true })

    onMounted(() => {
      initForm()
      nextTick(observeWidth)
    })

    onUnmounted(() => {
      resizeObserver?.disconnect()
      formInstance.value?.destroy()
    })

    return {
      formRef,
      formInstance,
      innerValue,
      maxColsComputed,
      rowGutterComputed,
      displayLayout,
      mergedRules,
      expanded,
      showExpandButton,
      columnLabelWidths,
      handleSubmit,
      handleReset,
      handleFieldChange,
      toggleExpand,
      getFieldLabelWidth,
      getFieldLabelAlign,
      pxCompat,
      CLASS_PREFIX
    }
  }
})
</script>

<template>
  <form
    ref="formRef"
    :class="[CLASS_PREFIX, { 'is-disabled': disabled, 'is-readonly': readonly }]"
    :style="{
      '--form-cols': maxColsComputed,
      '--form-gutter': pxCompat(gutter)
    }"
    @submit="handleSubmit"
    @reset="handleReset"
  >
    <!-- 表单头部插槽 -->
    <div v-if="$slots.header" :class="`${CLASS_PREFIX}__header`">
      <slot name="header" />
    </div>

    <!-- 表单内容 -->
    <div :class="`${CLASS_PREFIX}__body`">
      <!-- 渲染行 -->
      <div
        v-for="(row, rowIndex) in displayLayout.rows"
        :key="'row-' + rowIndex"
        :class="`${CLASS_PREFIX}__row`"
        :style="{ '--row-gutter': pxCompat(rowGutterComputed) }"
      >
        <!-- 渲染字段 -->
        <template v-for="(field, fieldIndex) in row.fields" :key="field.name">
          <div
            :class="[
              `${CLASS_PREFIX}__col`,
              { 
                'is-last': fieldIndex === row.fields.length - 1,
                'is-expanded': adjustLastCol && fieldIndex === row.fields.length - 1 && row.remainingCols > 0 && !(displayLayout.buttonInline && rowIndex === displayLayout.buttonRowIndex)
              }
            ]"
            :style="{
              '--field-span': field.span || 1,
              '--extra-span': (fieldIndex === row.fields.length - 1 && adjustLastCol && !(displayLayout.buttonInline && rowIndex === displayLayout.buttonRowIndex)) ? row.remainingCols : 0
            }"
          >
            <LFormItem
              :name="field.name"
              :label="field.label"
              :rules="mergedRules[field.name]"
              :label-width="getFieldLabelWidth(field)"
              :label-align="getFieldLabelAlign(field)"
              :colon="colon"
            >
              <component
                :is="field.component"
                v-if="field.component"
                v-bind="field.props"
                :model-value="innerValue[field.name]"
                :disabled="disabled || field.props?.disabled"
                :readonly="readonly || field.props?.readonly"
                @update:model-value="(val: any) => handleFieldChange(field.name, val)"
              />
            </LFormItem>
          </div>
        </template>

        <!-- 按钮组（内联模式，放在当前行末尾） -->
        <div
          v-if="showButton && displayLayout.buttonInline && rowIndex === displayLayout.buttonRowIndex"
          :class="`${CLASS_PREFIX}__col--buttons`"
        >
          <div :class="`${CLASS_PREFIX}__buttons`">
            <slot name="buttons" :submit="handleSubmit" :reset="handleReset" :expanded="expanded" :toggle="toggleExpand">
              <button type="submit" :class="`${CLASS_PREFIX}__btn ${CLASS_PREFIX}__btn--primary`">查询</button>
              <button type="reset" :class="`${CLASS_PREFIX}__btn`">重置</button>
              <button 
                v-if="showExpandButton" 
                type="button" 
                :class="`${CLASS_PREFIX}__btn ${CLASS_PREFIX}__btn--link`"
                @click="toggleExpand"
              >
                <span :class="[`${CLASS_PREFIX}__expand-icon`, { 'is-expanded': expanded }]">{{ expanded ? '∧' : '∨' }}</span>
                {{ expanded ? '收起' : '展开' }}
              </button>
            </slot>
          </div>
        </div>
      </div>

      <!-- 按钮组（独立行模式或最后一行放不下） -->
      <div
        v-if="showButton && !displayLayout.buttonInline"
        :class="[`${CLASS_PREFIX}__row`, `${CLASS_PREFIX}__row--buttons`]"
      >
        <div :class="`${CLASS_PREFIX}__buttons`">
          <slot name="buttons" :submit="handleSubmit" :reset="handleReset" :expanded="expanded" :toggle="toggleExpand">
            <button type="submit" :class="`${CLASS_PREFIX}__btn ${CLASS_PREFIX}__btn--primary`">查询</button>
            <button type="reset" :class="`${CLASS_PREFIX}__btn`">重置</button>
            <button 
              v-if="showExpandButton" 
              type="button" 
              :class="`${CLASS_PREFIX}__btn ${CLASS_PREFIX}__btn--link`"
              @click="toggleExpand"
            >
              <span :class="[`${CLASS_PREFIX}__expand-icon`, { 'is-expanded': expanded }]">{{ expanded ? '∧' : '∨' }}</span>
              {{ expanded ? '收起' : '展开' }}
            </button>
          </slot>
        </div>
      </div>
    </div>

    <!-- 表单底部插槽 -->
    <div v-if="$slots.footer" :class="`${CLASS_PREFIX}__footer`">
      <slot name="footer" />
    </div>
  </form>
</template>

<style lang="less">
@prefix: ldesign-form;

.@{prefix} {
  --form-cols: 3;
  --form-gutter: 16px;
  --row-gutter: 16px;
  
  width: 100%;
  font-size: 14px;

  &__header {
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #e5e6eb;
  }

  &__body {
    width: 100%;
  }

  &__row {
    display: flex;
    flex-wrap: nowrap;
    gap: var(--form-gutter);
    margin-bottom: var(--row-gutter, var(--form-gutter));

    &:last-child {
      margin-bottom: 0;
    }

    &--buttons {
      justify-content: flex-end;
    }
  }

  &__col {
    // 使用百分比宽度，每列占 (1/cols) 的宽度
    // 计算：(100% - 间隙) / 列数 * span
    flex: 0 0 auto;
    width: calc((100% - var(--form-gutter) * (var(--form-cols) - 1)) / var(--form-cols) * var(--field-span, 1) + var(--form-gutter) * (var(--field-span, 1) - 1));
    min-width: 0;

    &.is-expanded {
      width: calc((100% - var(--form-gutter) * (var(--form-cols) - 1)) / var(--form-cols) * (var(--field-span, 1) + var(--extra-span, 0)) + var(--form-gutter) * (var(--field-span, 1) + var(--extra-span, 0) - 1));
    }

    &--buttons {
      flex: 1;
      display: flex;
      align-items: flex-end;
      justify-content: flex-end;
    }
  }

  &__buttons {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    height: 32px;
  }

  &__btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 32px;
    padding: 0 16px;
    font-size: 14px;
    border-radius: 6px;
    border: 1px solid #dcdcdc;
    background: #fff;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;

    &:hover {
      border-color: #0052d9;
      color: #0052d9;
    }

    &--primary {
      background: #0052d9;
      border-color: #0052d9;
      color: #fff;

      &:hover {
        background: #0045b8;
        border-color: #0045b8;
      }
    }

    &--link {
      border: none;
      background: transparent;
      color: #0052d9;
      padding: 0 8px;

      &:hover {
        color: #0045b8;
      }
    }
  }

  &__expand-icon {
    display: inline-block;
    margin-right: 4px;
    font-size: 12px;
  }

  &__footer {
    margin-top: 16px;
    padding-top: 12px;
    border-top: 1px solid #e5e6eb;
  }

  &.is-disabled {
    opacity: 0.6;
    pointer-events: none;
  }

  &.is-readonly {
    .@{prefix}__btn {
      display: none;
    }
  }
}

// 表单项样式
.@{prefix}-item {
  display: flex;
  align-items: flex-start;
  width: 100%;

  &__label {
    flex-shrink: 0;
    padding-right: 8px;
    line-height: 32px;
    color: #1d2129;
    text-align: right;
  }

  &__required {
    color: #e34d59;
    margin-right: 2px;
  }

  &__colon {
    margin-left: 2px;
  }

  &__content {
    flex: 1;
    min-width: 0;
  }

  &__control {
    width: 100%;

    input, select, textarea {
      width: 100%;
      height: 32px;
      padding: 0 12px;
      font-size: 14px;
      border: 1px solid #dcdcdc;
      border-radius: 6px;
      outline: none;
      transition: border-color 0.2s;

      &:focus {
        border-color: #0052d9;
      }

      &:disabled {
        background: #f5f5f5;
        cursor: not-allowed;
      }
    }

    textarea {
      height: auto;
      min-height: 80px;
      padding: 8px 12px;
      resize: vertical;
    }
  }

  &__error {
    margin-top: 4px;
    font-size: 12px;
    color: #e34d59;
  }

  &__help {
    margin-top: 4px;
    font-size: 12px;
    color: #86909c;
  }

  &.is-error {
    .@{prefix}-item__control {
      input, select, textarea {
        border-color: #e34d59;
      }
    }
  }

  &.is-label-top {
    flex-direction: column;

    .@{prefix}-item__label {
      width: 100%;
      text-align: left;
      padding-right: 0;
      margin-bottom: 4px;
      line-height: 1.5;
    }
  }

  &.is-label-left {
    .@{prefix}-item__label {
      text-align: left;
    }
  }
}
</style>
