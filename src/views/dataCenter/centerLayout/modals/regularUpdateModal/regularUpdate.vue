<script setup>
import dayjs from 'dayjs'
import myModal from '@/components/myModal'
import counterInput from '@/components/counterInput'
import { rateList, weekDayList, monthList } from '@/constants/regularUpdate'
import { parseCronStr, getUpdateTipsDetail } from '@/utils/regularUpdate'
import { message } from 'ant-design-vue'

const useModalStore = modalStore()
const useMainStore = mainStore()

const { systemConfig, isDataStandardCheck, isApiCallFrequency } = storeToRefs(useMainStore)

const currentDate = dayjs().date()

const timeUpdateState = reactive({
  rate: 'minute',
  minute: {
    step: 10
  },
  hour: {
    step: 1,
    startHour: 0,
    startMinute: 0
  },
  day: {
    step: 1,
    startHour: 0,
    startMinute: 0
  },
  week: {
    step: 1,
    days: [1],
    startHour: 0,
    startMinute: 0
  },
  month: {
    months: [dayjs().month()+1],
    days: [currentDate],
    startHour: 0,
    startMinute: 0
  }
})

const props = defineProps({
  pageId: {
    type: String,
    required: true
  }
})

// 月份天数 1~31
const monthDayArray = Array.from({length: 31}).map((_, i) => i+1)

onMounted(() => {
  resolveCronStr()
})

const minuteMin = computed(()=>{
  if(systemConfig.value.supportShortInterval){
    return 0
  } else {
    return 5
  }
})

const selectMonthDay = (item) => {
  let monthDays = timeUpdateState.month.days
  if(monthDays.includes(item)) {
    timeUpdateState.month.days = monthDays.filter(it => it !== item)
  } else {
    timeUpdateState.month.days.push(item)
    timeUpdateState.month.days.sort((a, b) => a - b)
  }
}

const closeModal = () => {
  useModalStore.changeRegularUpdateModalVisible()
}

// 确认回调
const confirmFn = () => {
  let targetState = timeUpdateState[timeUpdateState.rate]
  let cronStr = ''
  switch(timeUpdateState.rate) {
    case 'minute':
      cronStr = `0 0/${targetState.step} * * * ?`
      break
    case 'hour':
      cronStr = `0 ${targetState.startMinute} ${targetState.startHour}/${targetState.step} * * ?`
      break
    case 'day':
      cronStr = `0 ${targetState.startMinute} ${targetState.startHour} 1/${targetState.step} * ?`
      break
    case 'week':  // 0 0 0 ? * 0,1 【每周日和周一的0点0分】
      let dayStr = targetState.days.join(',')
      cronStr = `0 ${targetState.startMinute} ${targetState.startHour} ? * ${dayStr}`
      break
    case 'month':
      cronStr = `0 ${targetState.startMinute} ${targetState.startHour} ${targetState.days.join(',')} ${targetState.months.join(',')} ?`
      break
  }

  useMainStore.setRegularUpdateInfo({
    cronStr,
    tips: getUpdateTipsDetail(timeUpdateState[timeUpdateState.rate], timeUpdateState.rate)
  },props.pageId)

  closeModal()
}

// 最近运行时间
const recentlyRunTime = (index) => {
  let targetState = timeUpdateState[timeUpdateState.rate]
  let targetTime = null
  switch(timeUpdateState.rate) {
    case 'minute':
      targetTime =  _getMinuteTargetTime(targetState, index)
      break
    case 'hour':
      targetTime = _getHourTargetTime(targetState, index)
      break
    case 'day':
      targetTime = _getDayTargetTime(targetState, index)
      break
    case 'week':
      targetTime = _getWeekTargetTime(targetState, index)
      break
    case 'month':
      targetTime = _getMonthTargetTime(targetState, index)
      break
  }

  return targetTime?.format('YYYY-MM-DD HH:mm')


  function _getMinuteTargetTime(state, index) {
    let step = state.step
    let startTime = dayjs().startOf('hour')

    while(startTime.isBefore(dayjs())){
      startTime = startTime.add(step, 'minute')
    }

    return startTime.add(step * index, 'minute')
  }

  function _getHourTargetTime(state, index) {
    let { step, startHour, startMinute } = state
    // 获取指定起始时间
    let startTime = dayjs().startOf('day').hour(startHour).minute(startMinute)

    // 判断起始时间是否在当前时间之前
    while(startTime.isBefore(dayjs())){
      startTime = startTime.add(step, 'hour')
    }

    return startTime.add(step * index, 'hour')
  }

  function _getDayTargetTime(state, index) {
    let { step, startHour, startMinute } = state
    // 获取指定起始时间
    let startTime = dayjs().startOf('day').hour(startHour).minute(startMinute)

    // 判断起始时间是否在当前时间之前
    while(startTime.isBefore(dayjs())){
      startTime = startTime.add(step, 'day') 
    }

    return startTime.add(step * index, 'day')
  }

  function _getWeekTargetTime(state, index) {
    let { step, days, startHour, startMinute } = state
    let dayIndex = 0

    days = days.sort((a, b) => a - b)

    // 首次执行时间
    let startTime = dayjs().startOf('week')
      .add(step - 1, 'week')
      // .add(days[dayIndex], 'day')
      .day(days[dayIndex])
      .hour(startHour).minute(startMinute)

    // 与当前时间对比 矫正首次执行时间
    while(startTime.isBefore(dayjs())) {
      let preDay = days[dayIndex], nextDay = days[++dayIndex]
      if(!nextDay) {
        // 重置时间为上次循环第一天
        // startTime = startTime.subtract(preDay - days[0], 'day').add(step, 'week')
        startTime = startTime.day(days[0]).add(step, 'week')
        dayIndex = 0
        break
      }
      startTime = startTime.day(nextDay)
    }

    // 递归计算指定次数时间
    while(index > 0) {
      let preDay = days[dayIndex], nextDay = days[++dayIndex]
      if(!nextDay) {
        // 重置时间为上次循环第一天
        startTime = startTime.subtract(preDay - days[0], 'day').add(step, 'week')
        dayIndex = 0
      } else {
        startTime = startTime.add(nextDay - preDay, 'day')
      }
      index--
    }

    return startTime
  }

  function _getMonthTargetTime(state, index) {
    let { months, days, startHour, startMinute } = state
    let monthIndex = 0, dayIndex = 0

    // 首次执行时间
    let startTime = dayjs().startOf('year')
      .month(months[monthIndex] - 1)
      .date(days[dayIndex])
      .hour(startHour).minute(startMinute)

    while(startTime.isBefore(dayjs())) {
      let nextDay = days[++dayIndex]
      if(!nextDay) {
        let nextMonth = months[++monthIndex]
        dayIndex = 0
        if(!nextMonth) {
          monthIndex = 0
          startTime = startTime.add(1, 'year').month(months[0] - 1).date(days[0])
        } else {
          startTime = startTime.month(nextMonth - 1).date(days[0])
        }
      } else {
        startTime = startTime.date(nextDay)
      }
    }

    while(index > 0) {
      let nextDay = days[++dayIndex]
      if(!nextDay) {
        let nextMonth = months[++monthIndex]
        dayIndex = 0
        if(!nextMonth) {
          monthIndex = 0
          startTime = startTime.add(1, 'year').month(months[0] - 1).date(days[0])
        } else {
          startTime = startTime.month(nextMonth - 1).date(days[0])
        }
      } else {
        startTime = startTime.date(nextDay)
      }
      index--
    }

    return startTime
  }
}

// 定时计划垂直布局
const verticalLayout = computed(() => 
  ['week', 'month'].includes(timeUpdateState.rate)
)

// 解析cron表达式
const resolveCronStr = () => {
  let regularUpdateInfo = useMainStore.getRegularUpdateInfo(props.pageId)
  let cronStr = regularUpdateInfo.cronStr
  let { parseRes, rateUnit } = parseCronStr(cronStr)

  // 无计划 数据标准校验周期使用
  if(cronStr === '') {
    timeUpdateState.rate = 'none'
  }
  switch(rateUnit){
    case 'minute':
      timeUpdateState.rate = 'minute'
      timeUpdateState.minute = parseRes
      break
    case 'hour':
      timeUpdateState.rate = 'hour'
      timeUpdateState.hour = parseRes
      break
    case 'day':
      timeUpdateState.rate = 'day'
      timeUpdateState.day = parseRes
      break
    case 'week':
      parseRes.days = parseRes.days
      timeUpdateState.rate = 'week'
      timeUpdateState.week = parseRes
      break
    case 'month':
      timeUpdateState.rate = 'month'
      timeUpdateState.month = parseRes
      break
    default:
      break
  }
}

const filterRateList = computed(() => {
  // 数据标准校验周期/api导入设置按时间请求 特判 显示分钟&小时
  return isDataStandardCheck.value || isApiCallFrequency.value ?
    rateList.filter(it => !['minute', 'hour'].includes(it.value)) :
    rateList
})

watch(() => timeUpdateState.week.days, (nv, ov) => {
  if(!nv.length) {
    message.warn('最少选择一个日程')
    timeUpdateState.week.days = ov
  }
})

watch(() => timeUpdateState.month.months, (nv, ov) => {
  if(!nv.length) {
    message.warn('最少选择一个日程')
    timeUpdateState.month.months = ov
  }
})

watch(() => timeUpdateState.month.days, (nv, ov) => {
  if(!nv.length) {
    message.warn('最少选择一个日程')
    timeUpdateState.month.days = ov
  }
})

onUnmounted(() => {
  // 重置特判标识
  useMainStore.setIsDataStandardCheck(false)
  useMainStore.setIsDataStandardCheck(false)
})

</script>

<template>
  <myModal width="640px" modalName="定时更新" @onCancel="closeModal" @onConfirm="confirmFn">
    <template #modal-body>
      <div class="modalWrap">
        <div class="topArea">
          <label class="topLabel">定时计划</label>
          <div class="setWrap">
            <a-select class="rateSelect" v-model:value="timeUpdateState.rate">
              <a-select-option v-for="rate in filterRateList" :value="rate.value"> {{ rate.label }}</a-select-option>
            </a-select>
            <div class="stepSizeWrap">
              <div :class="{stepContainer: true, verticalWrap: verticalLayout}">

                <!-- 每分 -->
                <template v-if="timeUpdateState.rate === 'minute'">
                  <span>每</span><counterInput v-model="timeUpdateState.minute.step" :minValue="minuteMin" :maxValue="59"/><span>分</span> 
                </template>

                <!-- 每时 -->
                <template v-else-if="timeUpdateState.rate === 'hour'">
                  <span>每</span><counterInput v-model="timeUpdateState.hour.step" :maxValue="23"/><span>时，</span>
                  <span>从</span><counterInput v-model="timeUpdateState.hour.startHour" :minValue="0" :maxValue="23"/><span>时</span>
                  <counterInput v-model="timeUpdateState.hour.startMinute" :minValue="0" :maxValue="59"/><span>分 开始</span> 
                </template>

                <!-- 每日 -->
                <template v-else-if="timeUpdateState.rate === 'day'">
                  <span>每</span><counterInput v-model="timeUpdateState.day.step" :maxValue="31"/><span>天，</span>
                  <span>从</span><counterInput v-model="timeUpdateState.day.startHour" :minValue="0" :maxValue="23"/><span>时</span>
                  <counterInput v-model="timeUpdateState.day.startMinute" :minValue="0" :maxValue="59"/><span>分 开始</span>
                </template>

                <!-- 每周 -->
                <template v-if="timeUpdateState.rate === 'week'">
                  <!-- <div class="setItem"> 
                    <span>每</span><counterInput v-model="timeUpdateState.week.step" :maxValue="5"/><span>周 </span>
                  </div> -->
                  <a-checkbox-group 
                    class="weekGroup" 
                    v-model:value="timeUpdateState.week.days" 
                    name="week" 
                    :options="weekDayList" 
                  />
                  <div class="setItem lastItem">
                    <counterInput v-model="timeUpdateState.week.startHour" :minValue="0" :maxValue="23"/><span>时</span> 
                    <counterInput v-model="timeUpdateState.week.startMinute" :minValue="0" :maxValue="59"/><span>分 开始</span>
                  </div>
                </template>

                <!-- 每月 -->
                <template v-if="timeUpdateState.rate === 'month'">
                  <div class="monthItem">
                    <span>月</span>
                    <a-checkbox-group v-model:value="timeUpdateState.month.months" name="month" :options="monthList" />
                  </div>
                  <div class="monthItem">
                    <span>日</span>
                    <div class="monthDayWrap">
                      <span 
                        :class="{ 
                          dayItem: true, 
                          currentDay: it === currentDate, 
                          active: timeUpdateState.month.days.includes(it) 
                        }" 
                        v-for="it in monthDayArray" 
                        @click="selectMonthDay(it)"
                      > {{ it }}</span>
                    </div>
                  </div> 
                  <div class="monthItem">
                    <span>时分</span>
                    <div class="inputWrap">
                      <counterInput v-model="timeUpdateState.month.startHour" :minValue="0" :maxValue="23"/><span>时</span> 
                      <counterInput v-model="timeUpdateState.month.startMinute" :minValue="0" :maxValue="59"/><span>分 开始</span>
                    </div>
                  </div>
                </template>

              </div>
            </div>
            <span class="tips">{{ getUpdateTipsDetail(timeUpdateState[timeUpdateState.rate], timeUpdateState.rate) }}</span>
          </div>
        </div>
        <div class="bottomArea" v-if="timeUpdateState.rate !== 'none'">
          <div class="crossLine">最近5次运行时间</div>
          <ul>
            <li v-for="(_, index) in 5">{{ recentlyRunTime(index) }}</li>
          </ul>
        </div>
      </div>
    </template>
  </myModal>
</template>

<style lang="less" scoped>
.modalWrap {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  .topArea {
    display: flex;
    gap: 12px;
    padding: 10px 0;
    .topLabel{
      padding-top: 4px;
      flex-shrink: 0;
    }
    .setWrap {
      display: flex;
      flex-direction: column;
      gap: 16px;
      .rateSelect {
        width: 300px;
      }
      .stepSizeWrap {
        .stepContainer {
          display: flex;
          align-items: center;
          &.verticalWrap{
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
          .setItem{
            display: flex;
            align-items: center;
            &.lastItem{
              .counterWrap:first-of-type{
                margin-left: 0;
              }
            }
          }
          .ant-checkbox-group{
            display: flex;
            flex-wrap: wrap;
            gap: 10px 20px;
            :deep(.ant-checkbox-group-item){
              height: 20px;
              margin: 0;
            }
            
            :deep(.ant-checkbox + span){
              padding-left: 10px;
              padding-right: 0;
            }
          }
          .monthItem{
            display: flex;
            gap: 20px;
            &>span{
              flex-basis: 28px;
              flex-shrink: 0;
            }
            .monthDayWrap{
              width: 268px;
              display: grid;
              grid-template-columns: repeat(7, 28px);
              gap: 8px;
              border-radius: 4px;
              border: 1px solid #F2F2F2;
              padding: 12px;
              .dayItem{
                height: 28px;
                text-align: center;
                line-height: 28px;
                user-select: none;
                cursor: pointer;
                &.currentDay{
                  border-radius: 50%;
                  color: #131B26;
                  background-color: #E5ECFF;
                }
                &.active{
                  border-radius: 50%;
                  background-color: #2B67FF;
                  color: #fff;
                }
              }
            }
            .inputWrap{
              display: flex;
              .counterWrap:first-of-type{
                margin-left: 0;
              }
            }
          }
        }
      }
      .tips {
        font-weight: 500;
        color: #ff7d00;
        line-height: 20px;
      }
    }
  }
  .bottomArea {
    .crossLine{
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      line-height: 20px;
      &::before,
      &::after{
        content: '';
        display: inline-block;
        height: 1px;
        background-color: #F0F0F0;
        flex-grow: 1;
      }
    }
    ul{
      margin-bottom: 0;
      li{
        margin-top: 10px;
        line-height: 20px;
      }
    }
  }
}
</style>
