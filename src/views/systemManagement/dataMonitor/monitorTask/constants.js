import monitorObj from '@/assets/icons/monitor-obj.png'
import excuteSuccess from '@/assets/icons/excute-success.png'
import excuteFail from '@/assets/icons/excute-fail.png'
import excuting from '@/assets/icons/excuting.png'
import unexcute from '@/assets/icons/unexcute.png'
import analyze from '@/assets/icons/analyze.png'

const monitorTypeMap = {
  monitorObj: {
    label: '监控对象',
    tips: '监控的全部任务表'
  },

  excuteSuccessNum: {
    label: '运行成功任务',
    tips: '今日运行成功的任务总数 (包含重复运行的任务) '
  },

  excuteFailedNum: {
    label: '运行失败任务',
    tips: '今日运行失败的任务总数 (包含重复运行的任务)'
  },

  excutingNum: {
    label: '运行中任务',
    tips: '当前正在运行中的任务总数'
  },

  unExcuteObj: {
    label: '未运行对象',
    tips: '今日还未运行过的任务总数'
  },

  exceptionAnalyze: {
    label: '运行时长TOP10任务',
    tips: '监控当天运行时长较长的任务'
  }
}

const CARD_TYPES = {
  MONITOR_OBJ: 'monitorObj',
  SUCCESS_NUM: 'excuteSuccessNum',
  FAIL_NUM: 'excuteFailedNum',
  EXCUTING_NUM: 'excutingNum',
  UN_EXCUTE: 'unExcuteObj',
  EXCEPTION_ANALYZE: 'exceptionAnalyze',
}

const statusMap = {
  COMPLETED: '已完成',
  FAILED: '失败',
  RUNNING: '运行中',
  STOPPED: '手动停止',
  EXCEPTION: '异常',
  NOT_RUN: '未运行'
}

export {
  monitorObj,
  excuteSuccess,
  excuteFail,
  excuting,
  unexcute,
  analyze,
  monitorTypeMap,
  statusMap,
  CARD_TYPES
}
