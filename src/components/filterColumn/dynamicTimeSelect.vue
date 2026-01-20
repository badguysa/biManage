<script setup>
import dayjs from 'dayjs'
import zhCN from 'ant-design-vue/es/date-picker/locale/zh_CN'
import Lo from '@/locale/lang/lo-datepicker'
import counterInput from '@/components/counterInput'
import { computed } from 'vue'

// 接口对接 https://noteyd.chaoxing.com/pc/0ed2bae9-e21b-4a68-9b59-febb39133a86

const props = defineProps({
  timeState: Object
})

const emits = defineEmits(['updateTimeState'])

const visible = ref(false)
const state = reactive({
  tabIndex: 0,
  fixed: {
    date: dayjs(),
    time: dayjs(),
  },
  dynamic: {
    stepType: 'year',
    num: 0,
    // 前/后
    direction: 'before',
    // 相对时间 1,2,3
    position: 1
  }
})

const { locale } = useI18n()

const tabList = ['年/月/日', '动态时间']

const dynamicTimeTypeList = [
  { label: '年', value: 'year' },
  { label: '月', value: 'month' },
  { label: '周', value: 'week' },
  { label: '天', value: 'day' },
  { label: '小时', value: 'hour' },
]

const timeBeforeAfterOptions = [
  { label: '前', value: 'before' },
  { label: '后', value: 'after' }
]

onMounted(() => {
  echoState()
  datePickerLocal()
})

// 回显动态时间相关字段
const echoState = () => {
  let dynamicTimeObj = props.timeState.dynamicTime
  // 不含动态时间字段 未静态时间 无需回显 
  if(!dynamicTimeObj) return

  let target = null

  // 回显动态时间类型
  for(let item of dynamicTimeTypeList) {
    if(item.value in dynamicTimeObj) {
      target = dynamicTimeObj[item.value]
      state.dynamic.stepType = item.value
      break
    }
  }

  state.tabIndex = 1
  state.dynamic.direction = target < 0 ? 'before' : 'after'
  state.dynamic.num = Math.abs(target)
  state.dynamic.position = dynamicTimeObj.position
}

const isDynamicTime = computed(() => state.tabIndex === 1)

const dynamicLabel = computed(() => {
  return dynamicTimeTypeList.find(it => it.value === state.dynamic.stepType).label ?? '年'
})

const dynamicFlagOptions = computed(() => {
  let list = []

  switch (state.dynamic.stepType) {
    case 'year':
      list = ['当天', '年初', '年末']
      break
    case 'month':
      list = ['当天', '月初', '月末']
      break
    case 'week':
      list = ['当天', '周初', '周末']
      break
    case 'day':
      list = ['空', '月初', '月末']
      break
    case 'hour':
      break
  }

  return list.map((it, i) => ({
    label: it,
    value: i + 1
  }))
})

// 最近一次运行时间
const lastRunTime = computed(() => {
  let { num, stepType, position, direction } = state.dynamic
  let opearteMethod = direction === 'after' ? 'add' : 'subtract'
  let date = dayjs()
  switch (stepType) {
    case 'year':
    case 'month':
    case 'week':
      date = date[opearteMethod](num, stepType)
      if (position === 2) {
        date = date.startOf(stepType)
      } else if (position === 3) {
        date = date.endOf(stepType)
      }
      break
    case 'day':
      date = date[opearteMethod](num, 'day')
      if (position === 2) {
        // 月初
        date = date.startOf('month')
      } else if (position === 3) {
        // 月末
        date = date.endOf('month')
      }
      break
    case 'hour':
      date = date[opearteMethod](num, 'hour')
      break
  }

  return date.format(stepType === 'hour' ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD')
})

// 固定时间
const fixedTimeStr = computed(() => {
  return  `${state.fixed.date.format('YYYY-MM-DD')} ${state.fixed.time.format('HH:mm:ss')}`
})

const minValue = computed(() => {
  let min = +Infinity
  switch (state.dynamic.stepType) {
    case 'year':
      min = 0
      break
    case 'month':
      min = 0
      break
    case 'week':
      min = 0
      break
    case 'day':
      min = 0
      break
    case 'hour':
      min = 0
      break
  }
  return min
})

const maxValue = computed(() => {
  let max = +Infinity
  switch (state.dynamic.stepType) {
    case 'year':
      max = 10
      break
    case 'month':
      max = 24
      break
    case 'week':
      max = 99
      break
    case 'day':
      max = 365
      break
    case 'hour':
      max = 48
      break
  }
  return max
})

const datePickerLocal = async () => {
  if (locale.value === 'lo') {
    const lo = await import('dayjs/locale/lo')
    dayjs.locale(lo)
  } else {
    const zh = await import('dayjs/locale/zh-cn')
    dayjs.locale(zh)
  }
}

watch(locale, () => {
  datePickerLocal()
})

const changeHandle = () => {
  state.dynamic.num = 0
  state.dynamic.direction = 'before'
  state.dynamic.position = 1
}

const clearFn = () => {
  if (isDynamicTime.value) {
    state.dynamic = {
      stepType: 'year',
      num: 1,
      direction: 'before',
      position: 1
    }
    return
  }
  state.fixed = {
    date: '',
    time: ''
  }
}

const nowFn = () => {
  state.fixed = {
    date: dayjs(),
    time: dayjs()
  }
}

const confirmFn = () => {
  visible.value = false
  if (isDynamicTime.value) {
    let targetValue = state.dynamic.num
    if (state.dynamic.direction === 'before') {
      targetValue = 0 - targetValue
    }
    emits('updateTimeState', 'dynamic', props.timeState, lastRunTime.value, {
      [state.dynamic.stepType]: targetValue,
      position: state.dynamic.position
    })
  } else if (state.fixed.date && state.fixed.time) {
    emits('updateTimeState', 'normal', props.timeState, fixedTimeStr.value)
  }
}

defineExpose({
  reset() {
    state.tabIndex = 0
    state.fixed = {
      date: dayjs(),
      time: dayjs(),
    }
    state.dynamic = {
      stepType: 'year',
      num: 1,
      direction: 'before',
      position: 1
    }
  }
})
</script>

<template>
  <a-dropdown :trigger="['click']" v-model:visible="visible">
    <BiInput :modelValue="props.timeState.content" placeholder="请设置日期" readonly />
    <span>1111</span>
    <template #overlay>
      <div class="time-wrap">
        <div class="top-tab">
          <div :class="{ active: index === state.tabIndex }" v-for="(tab, index) in tabList">
            <span @click="state.tabIndex = index">{{ tab }}</span>
          </div>
        </div>
        <div class="main-wrap">
          <div class="fixed-time" v-if="!isDynamicTime">
            <div class="canlendar-wrap">
              <a-calendar :locale="locale === 'lo' ? Lo : zhCN" v-model:value="state.fixed.date" :fullscreen="false" />
            </div>
            <div class="date-time-wrap">
              <a-time-picker :locale="locale === 'lo' ? Lo : zhCN" v-model:value="state.fixed.time" />
            </div>
          </div>
          <div class="dynamic-time" v-else>
            <div class="dynamic-type">
              <span>相对当前时间</span>
              <a-radio-group v-model:value="state.dynamic.stepType" @change="changeHandle">
                <a-radio v-for="type in dynamicTimeTypeList" :value="type.value">{{ type.label }}</a-radio>
              </a-radio-group>
            </div>
            <div class="dynamic-value">
              <!-- <BiInput type="number" style="width: 100px;" v-model="state.dynamic.num" @input="inputHandle" /> -->
              <counterInput v-model="state.dynamic.num" :minValue="minValue" :maxValue="maxValue" />
              <span>{{ dynamicLabel }}</span>
              <a-select class="dynamic-select" :options="timeBeforeAfterOptions"
                v-model:value="state.dynamic.direction" />
            </div>
            <div class="dynamic-flag" v-if="state.dynamic.stepType !== 'hour'">
              <a-select style="width: 100%;" :options="dynamicFlagOptions" v-model:value="state.dynamic.position" />
            </div>
            <div class="sperate-wrap">
              最近一次运行时间
            </div>
            <span>{{ lastRunTime }}</span>
          </div>
        </div>
        <div class="btn-wrap">
          <div class="left">
            <span @click="clearFn">清空</span>
            <span v-if="!isDynamicTime" @click="nowFn">现在</span>
          </div>
          <div class="right">
            <BiButton type="primary" @click="confirmFn">确定</BiButton>
          </div>
        </div>
      </div>
    </template>
  </a-dropdown>
</template>

<style lang='less' scoped>
.time-wrap {
  width: 450px;
  border-radius: 4px;
  box-shadow: 0px 2px 12px rgba(0, 37, 89, 0.2);
  background-color: #fff;

  .top-tab {
    height: 40px;
    display: flex;
    align-items: center;
    border-bottom: 1px solid #F2F2F2;

    &>div {
      font-weight: 500;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 50%;
      height: 100%;

      span {
        cursor: pointer;
      }

      &:last-of-type {
        border-left: 1px solid #F2F2F2;
      }

      &.active {
        color: #2B67FF;
      }
    }
  }

  .main-wrap {
    height: 308px;

    .fixed-time {
      height: 100%;
      display: flex;
      position: relative;

      .canlendar-wrap {
        :deep(.ant-picker-calendar) {
          height: 100%;

          .ant-picker-calendar-header {
            width: 305px;
            justify-content: flex-start;
            padding: 8px;

            .ant-picker-calendar-year-select,
            .ant-picker-calendar-month-select {
              flex-grow: 1;
            }

            .ant-picker-calendar-mode-switch {
              display: none;
            }

            .ant-select-selector {
              height: 32px;
              box-shadow: none;
            }

            .ant-select-selection-item {
              line-height: 32px;
            }
          }

          .ant-picker-panel {
            height: calc(100% - 48px);
          }

        }
      }

      .date-time-wrap {
        position: absolute;
        top: 8px;
        right: 10px;

        :deep(.ant-picker) {
          border: none;
          height: 32px;

          &.ant-picker-focused {
            box-shadow: none;
          }
        }
      }
    }

    .dynamic-time {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      color: #0A2040;
      font-size: 14px;

      .dynamic-type {
        &>span {
          margin-right: 20px;
        }
      }

      .dynamic-value {
        display: flex;
        align-items: center;
        gap: 6px;

        .dynamic-select {
          flex-grow: 1;
        }

        :deep(.counterWrap) {
          margin: 0;
          height: 32px;

          &>* {
            height: 100%;
          }
        }
      }

      .sperate-wrap {
        display: flex;
        align-items: center;
        gap: 10px;

        &::before,
        &::after {
          content: '';
          display: inline-block;
          height: 1px;
          background-color: #F0F0F0;
          flex-grow: 1;
        }
      }
    }
  }

  .btn-wrap {
    height: 50px;
    font-size: 14px;
    padding: 15px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid #F2F2F2;

    .left {
      display: flex;
      align-items: center;
      gap: 20px;

      span {
        color: #2B67FF;
        cursor: pointer;
      }
    }
  }
}
</style>