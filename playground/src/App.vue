<script setup lang="ts">
import { ref, markRaw, computed } from 'vue'
import { LForm } from '@ldesign/form-vue'
import type { VueFormFieldConfig } from '@ldesign/form-vue'
import LInput from './components/LInput.vue'
import LSelect from './components/LSelect.vue'

// 表单数据
const formData = ref({
  name: '',
  gender: '',
  age: '',
  email: '',
  phone: '',
  idCard: '',
  birthday: '',
  education: '',
  occupation: '',
  company: '',
  address: '',
  city: '',
  postalCode: '',
  country: '',
  emergencyContact: '',
  emergencyPhone: '',
  remark: ''
})

// 表单配置 - 包含多种span的字段，用于测试极端情况
const formOptions: VueFormFieldConfig[] = [
  {
    name: 'name',
    label: '姓名',
    component: markRaw(LInput),
    props: { placeholder: '请输入姓名' },
    rules: [{ required: true, message: '请输入姓名' }]
  },
  {
    name: 'gender',
    label: '性别',
    component: markRaw(LSelect),
    props: {
      placeholder: '请选择',
      options: [
        { label: '男', value: 'male' },
        { label: '女', value: 'female' }
      ]
    }
  },
  {
    name: 'age',
    label: '年龄',
    component: markRaw(LInput),
    props: { placeholder: '请输入年龄', type: 'number' }
  },
  {
    name: 'idCard',
    label: '身份证号码',
    span: 2,  // 占2列
    component: markRaw(LInput),
    props: { placeholder: '请输入18位身份证号' },
    rules: [{ required: true, message: '请输入身份证号' }]
  },
  {
    name: 'email',
    label: '电子邮箱',
    component: markRaw(LInput),
    props: { placeholder: '请输入邮箱' },
    rules: [{ required: true, message: '请输入邮箱' }]
  },
  {
    name: 'phone',
    label: '手机号码',
    component: markRaw(LInput),
    props: { placeholder: '请输入手机号' }
  },
  {
    name: 'birthday',
    label: '出生日期',
    component: markRaw(LInput),
    props: { placeholder: '请选择日期', type: 'date' }
  },
  {
    name: 'education',
    label: '学历',
    component: markRaw(LSelect),
    props: {
      placeholder: '请选择学历',
      options: [
        { label: '高中', value: 'high' },
        { label: '本科', value: 'bachelor' },
        { label: '硕士', value: 'master' },
        { label: '博士', value: 'doctor' }
      ]
    }
  },
  {
    name: 'occupation',
    label: '职业',
    component: markRaw(LInput),
    props: { placeholder: '请输入职业' }
  },
  {
    name: 'company',
    label: '工作单位',
    span: 2,  // 占2列
    component: markRaw(LInput),
    props: { placeholder: '请输入工作单位全称' }
  },
  {
    name: 'address',
    label: '详细地址',
    span: 2,  // 占2列
    component: markRaw(LInput),
    props: { placeholder: '请输入详细地址（省/市/区/街道/门牌号）' }
  },
  {
    name: 'city',
    label: '城市',
    component: markRaw(LSelect),
    props: {
      placeholder: '请选择城市',
      options: [
        { label: '北京', value: 'beijing' },
        { label: '上海', value: 'shanghai' },
        { label: '广州', value: 'guangzhou' },
        { label: '深圳', value: 'shenzhen' }
      ]
    }
  },
  {
    name: 'postalCode',
    label: '邮编',
    component: markRaw(LInput),
    props: { placeholder: '请输入邮编' }
  },
  {
    name: 'country',
    label: '国家/地区',
    component: markRaw(LSelect),
    props: {
      placeholder: '请选择国家',
      options: [
        { label: '中国', value: 'china' },
        { label: '美国', value: 'usa' },
        { label: '日本', value: 'japan' }
      ]
    }
  },
  {
    name: 'emergencyContact',
    label: '紧急联系人',
    component: markRaw(LInput),
    props: { placeholder: '请输入紧急联系人姓名' }
  },
  {
    name: 'emergencyPhone',
    label: '紧急联系电话',
    component: markRaw(LInput),
    props: { placeholder: '请输入紧急联系电话' }
  },
  {
    name: 'remark',
    label: '备注说明',
    span: 3,  // 占3列 - 测试极端情况
    component: markRaw(LInput),
    props: { placeholder: '请输入备注信息' }
  }
]

// 表单引用
const formRef = ref<InstanceType<typeof LForm> | null>(null)

// 配置选项
const previewRows = ref(1)
const buttonPosition = ref<'inline' | 'newline'>('inline')
const labelPosition = ref<'left' | 'top'>('left')  // 标签位置：左侧或顶部
const labelTextAlign = ref<'left' | 'right'>('right')  // 标签文字对齐（仅左侧时有效）
const adjustLastCol = ref(false)
const colWidth = ref(240) // 默认240px，1000px容器可显示4列
const labelWidth = ref<number | undefined>(undefined) // 标签宽度，undefined表示自动计算
const labelWidthMode = ref<'visible' | 'all'>('visible') // 标签宽度计算模式：visible=仅可见字段，all=全部字段

// 计算实际的labelAlign值
const labelAlign = computed(() => {
  if (labelPosition.value === 'top') return 'top'
  return labelTextAlign.value
})

// 事件处理
function handleSubmit(data: any) {
  console.log('提交数据:', data)
  alert('提交成功！\n' + JSON.stringify(data, null, 2))
}

function handleReset(data: any) {
  console.log('重置数据:', data)
}

function handleExpand(expanded: boolean) {
  console.log('展开状态:', expanded)
}
</script>

<template>
  <div class="playground">
    <header class="playground__header">
      <h1>LDesign Form Playground</h1>
      <p>表单布局演示</p>
    </header>

    <main class="playground__main">
      <!-- 配置面板 -->
      <section class="config-panel">
        <h3>配置选项</h3>
        <div class="config-panel__grid">
          <div class="config-item">
            <label>预览行数:</label>
            <select v-model.number="previewRows">
              <option :value="0">显示全部</option>
              <option :value="1">1 行</option>
              <option :value="2">2 行</option>
              <option :value="3">3 行</option>
            </select>
          </div>
          <div class="config-item">
            <label>按钮位置:</label>
            <select v-model="buttonPosition">
              <option value="inline">行内</option>
              <option value="newline">独立行</option>
            </select>
          </div>
          <div class="config-item">
            <label>标签位置:</label>
            <select v-model="labelPosition">
              <option value="left">左侧</option>
              <option value="top">顶部</option>
            </select>
          </div>
          <div class="config-item" v-if="labelPosition === 'left'">
            <label>标签对齐:</label>
            <select v-model="labelTextAlign">
              <option value="right">右对齐</option>
              <option value="left">左对齐</option>
            </select>
          </div>
          <div class="config-item" v-if="labelPosition === 'left'">
            <label>标签宽度:</label>
            <input type="number" v-model.number="labelWidth" min="60" max="200" step="10" placeholder="自动" />
          </div>
          <div class="config-item" v-if="labelPosition === 'left' && !labelWidth">
            <label>宽度计算:</label>
            <select v-model="labelWidthMode">
              <option value="visible">仅可见字段</option>
              <option value="all">全部字段</option>
            </select>
          </div>
          <div class="config-item">
            <label>列宽(px):</label>
            <input type="number" v-model.number="colWidth" min="200" max="400" step="20" />
          </div>
          <div class="config-item">
            <label>
              <input type="checkbox" v-model="adjustLastCol" />
              自动铺满末列
            </label>
          </div>
        </div>
      </section>

      <!-- 表单演示 -->
      <section class="form-demo">
        <h3>表单演示</h3>
        <div class="form-demo__container">
          <LForm
            ref="formRef"
            v-model="formData"
            :options="formOptions"
            :preview-rows="previewRows"
            :button-position="buttonPosition"
            :label-align="labelAlign"
            :label-width="labelWidth"
            :label-width-mode="labelWidthMode"
            :adjust-last-col="adjustLastCol"
            :col-width="colWidth"
            :min-cols="1"
            :max-cols="4"
            :gutter="16"
            @submit="handleSubmit"
            @reset="handleReset"
            @expand="handleExpand"
          />
        </div>
      </section>

      <!-- 数据预览 -->
      <section class="data-preview">
        <h3>表单数据</h3>
        <pre>{{ JSON.stringify(formData, null, 2) }}</pre>
      </section>
    </main>
  </div>
</template>

<style scoped lang="less">
.playground {
  min-height: 100vh;
  background-color: #f5f7fa;

  &__header {
    background: linear-gradient(135deg, #0052d9 0%, #0044b4 100%);
    color: #fff;
    padding: 32px;
    text-align: center;

    h1 {
      font-size: 28px;
      font-weight: 600;
      margin-bottom: 8px;
    }

    p {
      font-size: 14px;
      opacity: 0.8;
    }
  }

  &__main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px;
  }
}

.config-panel,
.form-demo,
.data-preview {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  h3 {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #e5e6eb;
  }
}

.config-panel {
  &__grid {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
  }
}

.config-item {
  display: flex;
  align-items: center;
  gap: 8px;

  label {
    font-size: 14px;
    color: #4e5969;
    white-space: nowrap;
  }

  select,
  input[type="number"] {
    height: 32px;
    padding: 0 12px;
    border: 1px solid #dcdcdc;
    border-radius: 6px;
    font-size: 14px;
    outline: none;

    &:focus {
      border-color: #0052d9;
    }
  }

  input[type="number"] {
    width: 100px;
  }

  input[type="checkbox"] {
    width: 16px;
    height: 16px;
  }
}

.form-demo {
  &__container {
    padding: 20px;
    background: #fafafa;
    border-radius: 6px;
    border: 1px dashed #dcdcdc;
  }
}

.data-preview {
  pre {
    background: #f5f7fa;
    padding: 16px;
    border-radius: 6px;
    font-size: 13px;
    line-height: 1.6;
    overflow-x: auto;
  }
}
</style>
