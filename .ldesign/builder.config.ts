/**
 * @ldesign/form 构建配置
 * 
 * 框架无关的表单管理库，支持 Vue 3、Lit、React 适配器
 * 使用 vueLibrary 预设作为基础
 */

import { defineConfig, vueLibrary } from '@ldesign/builder'

export default defineConfig(
  vueLibrary({
    // UMD 构建配置
    umd: {
      enabled: true,
      name: 'LDesignForm', // UMD 全局变量名
    },

    // 排除非生产代码
    exclude: [
      '**/examples/**',
      '**/example/**',
      '**/__tests__/**',
      '**/*.test.*',
      '**/*.spec.*',
      '**/demo/**',
      '**/dev/**',
      '**/docs/**',
      '**/tests/**',
      '**/e2e/**',
      '**/scripts/**',
      '**/summary/**',
      '**/playwright.config.*',
      '**/vite.config.*',
      '**/vitest.config.*'
    ],

    // 外部依赖
    external: [
      'vue', // Vue 3 集成
      'lit', // Lit 适配器
      'lodash-es' // 工具库
    ],

    // 全局变量映射
    globals: {
      'vue': 'Vue',
      'lit': 'Lit',
      'lodash-es': '_'
    },

    // Vue 配置
    vue: {
      version: 3,
      onDemand: false,
      jsx: {
        enabled: false // Form 不使用 JSX
      },
      template: {
        precompile: true
      }
    },

    // 样式处理配置（Less）
    style: {
      extract: true,
      minimize: true,
      autoprefixer: true,
      preprocessor: 'less'
    },

    // TypeScript 配置
    typescript: {
      declaration: true,
      target: 'ES2020',
      module: 'ESNext'
    },

    // 性能优化
    performance: {
      treeshaking: true,
      minify: false
    }
  })
)
