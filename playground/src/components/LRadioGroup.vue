<script setup lang="ts">
interface Option {
  label: string
  value: string | number
}

defineProps<{
  modelValue?: string | number
  options?: Option[]
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

function onChange(value: string | number) {
  emit('update:modelValue', value)
}
</script>

<template>
  <div class="l-radio-group">
    <label
      v-for="opt in options"
      :key="opt.value"
      class="l-radio"
    >
      <input
        type="radio"
        class="l-radio__input"
        :checked="modelValue === opt.value"
        :disabled="disabled"
        @change="onChange(opt.value)"
      />
      <span class="l-radio__label">{{ opt.label }}</span>
    </label>
  </div>
</template>
