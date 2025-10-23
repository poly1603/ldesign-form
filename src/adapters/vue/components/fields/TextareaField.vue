<template>
  <div class="ldesign-textarea-field">
    <div class="ldesign-textarea-wrapper" :class="wrapperClass">
      <textarea
        :id="id"
        ref="textareaRef"
        v-model="textValue"
        :name="name"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :rows="rows"
        :maxlength="maxLength"
        :style="textareaStyle"
        class="ldesign-textarea"
        @input="handleInput"
        @change="handleChange"
        @blur="handleBlur"
        @focus="handleFocus"
      />
    </div>

    <div v-if="showCount || showMarkdownPreview" class="ldesign-textarea-footer">
      <!-- 字符计数 -->
      <div v-if="showCount && maxLength" class="ldesign-textarea-count">
        {{ textValue?.length || 0 }} / {{ maxLength }}
      </div>

      <!-- Markdown 预览切换 -->
      <div v-if="showMarkdownPreview" class="ldesign-textarea-actions">
        <button
          type="button"
          class="ldesign-btn-link"
          @click="toggleMarkdownPreview"
        >
          {{ markdownPreviewVisible ? '编辑' : '预览' }}
        </button>
      </div>
    </div>

    <!-- Markdown 预览 -->
    <div
      v-if="markdownPreviewVisible"
      class="ldesign-markdown-preview"
      v-html="markdownHTML"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'

interface Props {
  id?: string
  name?: string
  modelValue?: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  rows?: number
  autosize?: boolean | { minRows?: number; maxRows?: number }
  showCount?: boolean
  maxLength?: number
  showMarkdownPreview?: boolean
  error?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  rows: 3,
  autosize: false,
  showCount: false,
  showMarkdownPreview: false,
  error: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'change': [value: string]
  'blur': [event: FocusEvent]
  'focus': [event: FocusEvent]
}>()

const textareaRef = ref<HTMLTextAreaElement>()
const textValue = ref(props.modelValue || '')
const isFocused = ref(false)
const markdownPreviewVisible = ref(false)
const textareaHeight = ref<string>()

const wrapperClass = computed(() => ({
  'is-disabled': props.disabled,
  'is-focused': isFocused.value,
  'is-error': props.error
}))

const textareaStyle = computed(() => {
  if (textareaHeight.value) {
    return { height: textareaHeight.value }
  }
  return {}
})

// 简单的 Markdown 转 HTML（实际项目中应使用专门的库）
const markdownHTML = computed(() => {
  if (!textValue.value) return ''
  
  let html = textValue.value
  // 标题
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>')
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>')
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>')
  // 粗体
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  // 斜体
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')
  // 换行
  html = html.replace(/\n/g, '<br>')
  
  return html
})

// 监听外部值变化
watch(() => props.modelValue, (newVal) => {
  textValue.value = newVal || ''
  if (props.autosize) {
    nextTick(() => adjustHeight())
  }
})

// 监听 autosize 变化
watch(() => props.autosize, () => {
  if (props.autosize) {
    nextTick(() => adjustHeight())
  } else {
    textareaHeight.value = undefined
  }
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  textValue.value = target.value
  emit('update:modelValue', textValue.value)
  
  if (props.autosize) {
    adjustHeight()
  }
}

const handleChange = () => {
  emit('change', textValue.value)
}

const handleBlur = (event: FocusEvent) => {
  isFocused.value = false
  emit('blur', event)
}

const handleFocus = (event: FocusEvent) => {
  isFocused.value = true
  emit('focus', event)
}

const toggleMarkdownPreview = () => {
  markdownPreviewVisible.value = !markdownPreviewVisible.value
}

// 自动调整高度
const adjustHeight = () => {
  if (!textareaRef.value) return

  const textarea = textareaRef.value
  textarea.style.height = 'auto'
  
  let minHeight = 0
  let maxHeight = Infinity

  if (typeof props.autosize === 'object') {
    if (props.autosize.minRows) {
      const lineHeight = parseInt(getComputedStyle(textarea).lineHeight)
      minHeight = props.autosize.minRows * lineHeight
    }
    if (props.autosize.maxRows) {
      const lineHeight = parseInt(getComputedStyle(textarea).lineHeight)
      maxHeight = props.autosize.maxRows * lineHeight
    }
  }

  const scrollHeight = textarea.scrollHeight
  let height = Math.max(minHeight, Math.min(maxHeight, scrollHeight))
  
  textareaHeight.value = `${height}px`
}

// 聚焦方法
const focus = () => {
  textareaRef.value?.focus()
}

// 失焦方法
const blur = () => {
  textareaRef.value?.blur()
}

onMounted(() => {
  if (props.autosize) {
    adjustHeight()
  }
})

defineExpose({
  focus,
  blur,
  textareaRef
})
</script>

<style lang="less" scoped>
.ldesign-textarea-field {
  width: 100%;
}

.ldesign-textarea-wrapper {
  position: relative;
  display: inline-block;
  width: 100%;
  background-color: var(--color-bg-container);
  border: var(--size-border-width-thin) solid var(--color-border-input);
  border-radius: var(--size-radius-sm);
  transition: all var(--size-duration-normal);

  &:hover:not(.is-disabled) {
    border-color: var(--color-border-input-hover);
  }

  &.is-focused {
    border-color: var(--color-border-input-focus);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-primary-default) 10%, transparent);
  }

  &.is-error {
    border-color: var(--color-border-input-error);

    &:hover,
    &.is-focused {
      border-color: var(--color-border-input-error);
    }

    &.is-focused {
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-danger-default) 10%, transparent);
    }
  }

  &.is-disabled {
    background-color: var(--color-bg-component-disabled);
    cursor: not-allowed;

    .ldesign-textarea {
      cursor: not-allowed;
    }
  }
}

.ldesign-textarea {
  width: 100%;
  padding: var(--size-spacing-xs) var(--size-spacing-lg);
  font-size: var(--size-font-base);
  line-height: var(--size-line-normal);
  color: var(--color-text-primary);
  background: transparent;
  border: none;
  outline: none;
  resize: vertical;
  font-family: var(--size-font-family);

  &::placeholder {
    color: var(--color-text-placeholder);
  }

  &:disabled {
    color: var(--color-text-disabled);
    resize: none;
  }
}

.ldesign-textarea-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--size-spacing-xs);
  font-size: var(--size-font-sm);
}

.ldesign-textarea-count {
  color: var(--color-text-tertiary);
}

.ldesign-textarea-actions {
  .ldesign-btn-link {
    padding: 0;
    font-size: var(--size-font-sm);
    color: var(--color-primary-default);
    background: none;
    border: none;
    cursor: pointer;
    transition: color var(--size-duration-normal);

    &:hover {
      color: var(--color-primary-hover);
    }
  }
}

.ldesign-markdown-preview {
  margin-top: var(--size-spacing-lg);
  padding: var(--size-spacing-lg);
  background-color: var(--color-bg-component);
  border-radius: 4px;
  font-size: 14px;
  line-height: 1.5715;

  h1, h2, h3 {
    margin: 12px 0 8px;
    font-weight: 600;
  }

  h1 {
    font-size: 24px;
  }

  h2 {
    font-size: 20px;
  }

  h3 {
    font-size: 16px;
  }

  strong {
    font-weight: 600;
  }

  em {
    font-style: italic;
  }
}
</style>






