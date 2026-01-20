
import { weekDayList } from '@/constants/regularUpdate'

// 获取定时更新提示语
export const getReularUpdateTips = (cronStr, type) => {
  let rateInfo = ''
  let { parseRes, rateUnit } = parseCronStr(cronStr)
  let step = parseRes.step

  switch(rateUnit){
    case 'minute':
      rateInfo = `每${step}分钟`
      break
    case 'hour':
      rateInfo = `每${step}小时`
      break
    case 'day':
      rateInfo = `每${step}天`
      break
    case 'week':
      rateInfo = `每周`
      break
    case 'month':
      rateInfo = `每月`
      break
    default:
      break
  }

  if (type === 'rate') {  // 更新频率
    return rateInfo
  } else if (type === 'detail') {   // 更新详细信息
    return getUpdateTipsDetail(parseRes, rateUnit)
  }
}

export const getUpdateTipsDetail = (targetState, rateType) => {
  switch(rateType) {
    case 'minute':
      return `每 ${targetState.step} 分钟 更新`
    case 'hour':
      return `每隔 ${targetState.step} 小时，从 ${targetState.startHour} 点 ${targetState.startMinute } 分 开始更新`
    case 'day':
      return `每隔 ${targetState.step} 天，从 ${targetState.startHour} 点 ${targetState.startMinute } 分 开始更新`
    case 'week':
      let weekStr = targetState.days.map(item => 
        weekDayList.find(it => it.value === item)?.label
      ).join('、')
      return `每周，从 ${weekStr} 的 ${targetState.startHour} 点 ${targetState.startMinute } 分 开始更新`
    case 'month':
      return `${targetState.months.join('、')} 月的 ${targetState.days.join('、')} 日的 ${targetState.startHour} 点 ${targetState.startMinute} 分更新`
    default:
      return ''
  }
}

// 解析cron表达式
export const parseCronStr = cronStr => {
  let parseRes = {}, rateUnit = ''
  let stepRegRes, startHourRegRes, startMinuteRegRes
  
  if (cronStr.includes('* * * ?')) {  // 每分钟更新
    rateUnit = 'minute'
    stepRegRes = cronStr.match(/\/(\d+) /)
    parseRes.step = stepRegRes ? Number(stepRegRes[1]) : 1
  } else if (cronStr.includes('* * ?')) {  // 每小时更新
    rateUnit = 'hour'
    stepRegRes = cronStr.match(/\/(\d+) /)
    startHourRegRes = cronStr.match(/ (\d+)\//)
    startMinuteRegRes = cronStr.match(/ (\d+) /)
    parseRes.step = stepRegRes ? Number(stepRegRes[1]) : 1
    parseRes.startHour = startHourRegRes ? Number(startHourRegRes[1]) : 1
    parseRes.startMinute = startMinuteRegRes ? Number(startMinuteRegRes[1]) : 1
  } else if (cronStr.includes('* ?')) {  // 每天更新
    rateUnit = 'day'
    stepRegRes = cronStr.match(/\/(\d+) /)
    startHourRegRes = cronStr.match(/\d+ (\d+) \d+\//)
    startMinuteRegRes = cronStr.match(/\d+ (\d+) \d+/)
    parseRes.step = stepRegRes ? Number(stepRegRes[1]) : 1
    parseRes.startHour = startHourRegRes ? Number(startHourRegRes[1]) : 1
    parseRes.startMinute = startMinuteRegRes ? Number(startMinuteRegRes[1]) : 1
  } else if (cronStr.includes('? *')) {  // 每周更新  0 38 15 ? * 6,7
    rateUnit = 'week'
    let daysRegRes = cronStr.match(/\* (.*)\b/)
    startHourRegRes = cronStr.match(/\d+ (\d+) \?/)
    startMinuteRegRes = cronStr.match(/\d+ (\d+) \d+/)
    parseRes.step =  1
    parseRes.days = daysRegRes ? daysRegRes[1].split(',').map(it => Number(it)) : [1]
    parseRes.startHour = startHourRegRes ? Number(startHourRegRes[1]) : 1
    parseRes.startMinute = startMinuteRegRes ? Number(startMinuteRegRes[1]) : 1
  } else if (cronStr.endsWith(' ?')) {  // 每月更新  '0 25 2 16,17,18 1,2,3 ?'
    rateUnit = 'month'
    let splitRes = cronStr.split(' ')
    parseRes.months = splitRes.at(-2).split(',').map(it => Number(it))
    parseRes.days = splitRes.at(-3).split(',').map(it => Number(it))
    parseRes.startHour = Number(splitRes[2])
    parseRes.startMinute = Number(splitRes[1])
  }

  return {
    parseRes,
    rateUnit
  }
}
