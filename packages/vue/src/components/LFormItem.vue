<script lang="ts">
/**
 * LFormItem 表单项组件
 */
import { defineComponent, inject, computed, ref, onMounted, onUnmounted, provide } from 'vue'
import type { PropType } from 'vue'
import type { FormRule } from '@ldesign/form-core'
import { FORM_CONTEXT_KEY, FORM_ITEM_CONTEXT_KEY, CLASS_PREFIX } from '../constants'
import type { FormContext } from '../types'
import { pxCompat } from '@ldesign/form-core'

export default defineComponent({
  name: 'LFormItem',
  props: {
    name: {
      type: String,
      required: true
    },
    label: {
      type: [String, Function] as PropType<string | (() => any)>,
      default: ''
    },
    rules: {
      type: Array as PropType<FormRule[]>,
      default: () => []
    },
    labelWidth: {
      type: [String, Number] as PropType<string | number>,
      default: undefined
    },
    labelAlign: {
      type: String as PropType<'left' | 'right' | 'top'>,
      default: undefined
    },
    required: {
      type: Boolean,
      default: undefined
    },
    colon: {
      type: Boolean,
      default: undefined
    },
    help: {
      type: String,
      default: ''
    },
    extra: {
      type: String,
      default: ''
    }
  },
  setup(props, { slots }) {
    const formContext = inject<FormContext | null>(FORM_CONTEXT_KEY, null)
    const error = ref<string>('')
    const validating = ref(false)

    // 是否必填
    const isRequired = computed(() => {
      if (props.required !== undefined) return props.required
      return props.rules?.some(rule => rule.required) ?? false
    })

    // 是否显示冒号
    const showColon = computed(() => {
      if (props.colon !== undefined) return props.colon
      return formContext?.colon ?? true
    })

    // 标签宽度
    const computedLabelWidth = computed(() => {
      if (props.labelWidth !== undefined) return pxCompat(props.labelWidth)
      if (formContext?.labelWidth !== undefined) return pxCompat(formContext.labelWidth)
      return 'auto'
    })

    // 标签对齐
    const computedLabelAlign = computed(() => {
      return props.labelAlign || formContext?.labelAlign || 'right'
    })

    // 验证字段
    async function validate(): Promise<any> {
      if (!formContext?.instance) return { valid: true }
      validating.value = true
      try {
        const result = await formContext.instance.validateField(props.name)
        error.value = result.valid ? '' : (result.message || '')
        return result
      } finally {
        validating.value = false
      }
    }

    // 清除验证
    function clearValidate(): void {
      error.value = ''
      formContext?.instance?.clearValidate([props.name])
    }

    // 提供表单项上下文
    provide(FORM_ITEM_CONTEXT_KEY, {
      name: props.name,
      validate,
      clearValidate
    })

    // 注册字段
    onMounted(() => {
      formContext?.registerField(props.name)
    })

    onUnmounted(() => {
      formContext?.unregisterField(props.name)
    })

    return {
      CLASS_PREFIX,
      error,
      validating,
      isRequired,
      showColon,
      computedLabelWidth,
      computedLabelAlign,
      validate,
      clearValidate
    }
  }
})
</script>

<template>
  <div
    :class="[
      `${CLASS_PREFIX}-item`,
      {
        'is-required': isRequired,
        'is-error': !!error,
        'is-validating': validating,
        [`is-label-${computedLabelAlign}`]: true
      }
    ]"
    :style="{
      display: 'flex',
      flexDirection: computedLabelAlign === 'top' ? 'column' : 'row',
      alignItems: 'flex-start',
      width: '100%'
    }"
  >
    <!-- 标签 -->
    <label
      v-if="label"
      :class="`${CLASS_PREFIX}-item__label`"
      :style="{ width: computedLabelWidth }"
    >
      <span v-if="isRequired" :class="`${CLASS_PREFIX}-item__required`">*</span>
      <span :class="`${CLASS_PREFIX}-item__label-text`">
        {{ typeof label === 'function' ? label() : label }}
      </span>
      <span v-if="showColon" :class="`${CLASS_PREFIX}-item__colon`">：</span>
    </label>

    <!-- 内容 -->
    <div :class="`${CLASS_PREFIX}-item__content`">
      <div :class="`${CLASS_PREFIX}-item__control`">
        <slot />
      </div>
      
      <!-- 错误信息 -->
      <Transition name="fade">
        <div v-if="error" :class="`${CLASS_PREFIX}-item__error`">
          {{ error }}
        </div>
      </Transition>
      
      <!-- 帮助信息 -->
      <div v-if="help" :class="`${CLASS_PREFIX}-item__help`">
        {{ help }}
      </div>
      
      <!-- 额外信息 -->
      <div v-if="extra" :class="`${CLASS_PREFIX}-item__extra`">
        {{ extra }}
      </div>
    </div>
  </div>
</template>

<style lang="less">
@prefix: ldesign-form;

.@{prefix}-item {
  display: flex !important;
  flex-direction: row !important;
  align-items: flex-start;
  width: 100%;

  // 标签
  &__label {
    flex-shrink: 0;
    line-height: 32px;
    color: #333;
    padding-right: 12px;
  }

  &__required {
    color: #e34d59;
    margin-right: 2px;
  }

  &__colon {
    margin-left: 2px;
  }

  // 内容
  &__content {
    flex: 1;
    min-width: 0;
  }

  &__control {
    width: 100%;
    
    // 不要给 input 添加默认边框，让组件自己处理
    // 避免与组件自身边框产生双层边框
  }

  &__error {
    margin-top: 4px;
    font-size: 12px;
    color: #e34d59;
  }

  &__help {
    margin-top: 4px;
    font-size: 12px;
    color: #666;
  }

  // 标签文字左对齐（标签在左侧，文字靠左）
  &.is-label-left {
    flex-direction: row !important;
    
    .@{prefix}-item__label {
      text-align: left;
    }
  }

  // 标签文字右对齐（标签在左侧，文字靠右）
  &.is-label-right {
    flex-direction: row !important;
    
    .@{prefix}-item__label {
      text-align: right;
    }
  }

  // 标签在顶部
  &.is-label-top {
    flex-direction: column !important;

    .@{prefix}-item__label {
      width: 100%;
      text-align: left;
      padding-right: 0;
      padding-bottom: 4px;
      line-height: 1.5;
    }
  }
}
</style>
