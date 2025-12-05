/**
 * @ldesign/form-vue
 * Vue 3 表单适配器
 */

import type { App, Plugin } from 'vue'
import type { FormPluginOptions } from './types'

// 组件
import { LForm, LFormItem } from './components'

// 组合式函数
export { useForm, createReactiveForm } from './composables/useForm'
export { useFormField } from './composables/useFormField'
export { useFormContext, provideFormContext, createFormContext } from './composables/useFormContext'

// 指令
import { vFormField } from './directives/vFormField'
import { vFormValidate } from './directives/vFormValidate'
export { vFormField, vFormValidate }

// 常量
export { FORM_CONTEXT_KEY, FORM_ITEM_CONTEXT_KEY, DEFAULT_CONFIG } from './constants'

// 类型
export * from './types'

// 组件导出
export { LForm, LFormItem }

// 样式
import './styles'

/**
 * 安装插件
 */
function install(app: App, options: FormPluginOptions = {}): void {
  const { prefix = 'L', registerComponents = true, registerDirectives = true } = options

  // 注册组件
  if (registerComponents) {
    app.component(`${prefix}Form`, LForm)
    app.component(`${prefix}FormItem`, LFormItem)
  }

  // 注册指令
  if (registerDirectives) {
    app.directive('form-field', vFormField)
    app.directive('form-validate', vFormValidate)
  }
}

// 默认导出插件
const FormPlugin: Plugin = {
  install
}

export default FormPlugin

// 版本
export const version = '1.0.0'
