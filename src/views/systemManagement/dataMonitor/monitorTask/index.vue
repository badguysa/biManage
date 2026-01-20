<script setup>
import mainArea from '@/views/systemManagement/layouts/mainArea.vue'
import back from '@/components/back'
import zhCN from 'ant-design-vue/es/date-picker/locale/zh_CN'
import {
  monitorObj,
  excuteSuccess,
  excuteFail,
  excuting,
  unexcute,
  analyze,
  CARD_TYPES
} from './constants'
import { viewMonitorDetail, getTaskTableSummary } from '@/apis/dataMonitor'
import dataTable from './dataTablePreview.vue'
import otherTable from './otherTablePreview.vue'

const props = defineProps(['viewId'])
const emits = defineEmits(['back'])

const monitorInfo = ref({})

const currentType = ref(CARD_TYPES.MONITOR_OBJ)

const dateStr = ref('')

// 默认展示数据表
const showDefault = ref(false)

const cardList = reactive([
  {
    key: CARD_TYPES.MONITOR_OBJ,
    name: '监控对象',
    icon: monitorObj,
    num: 0
  },
  {
    key: CARD_TYPES.SUCCESS_NUM,
    name: '运行成功任务数',
    icon: excuteSuccess,
    num: 0
  },
  {
    key: CARD_TYPES.FAIL_NUM,
    name: '运行失败任务数 ',
    icon: excuteFail,
    num: 0
  },
  {
    key: CARD_TYPES.EXCUTING_NUM,
    name: '运行中任务数',
    icon: excuting,
    num: 0
  },
  {
    key: CARD_TYPES.UN_EXCUTE,
    name: '未运行对象 ',
    icon: unexcute,
    num: 0
  },
  {
    key: CARD_TYPES.EXCEPTION_ANALYZE,
    name: '潜在异常分析',
    icon: analyze
  }
])
const tabList = reactive([
  {
    key: 'dataTable',
    label: '数据表'
  },
  {
    key: 'dataSource',
    label: '数据源'
  },
  {
    key: 'pushTask',
    label: '推送任务'
  }
])

const selectedTab = computed(() => {
  let target = tabList.find(it => it.select === true)
  if (target) {
    return target
  }
  // 默认显示监控数据表
  return { key: 'dataTable' }
})

provide('MONITOR_TASK_INFO', monitorInfo)
provide('MONITOR_TAB_TYPE', selectedTab)
provide('MONITOR_DATE_STR', dateStr)

onMounted(async () => {
  await getMonitorDetail()
  // if(!showDefault.value) {
    getSummary()
  // }
})

const getMonitorDetail = () => {
  return new Promise((resolve, reject) => {
    viewMonitorDetail(props.viewId)
      .then(res => {
        if (res.code === 1) {
          monitorInfo.value = res.data
          initTabList()
        }
        resolve()
      })
      .catch(e => reject(e))
  })
}

const getSummary = () => {
  getTaskTableSummary({ 
    collectionId: props.viewId, 
    day: dateStr.value
   }).then(res => {
    if (res.code === 1) {
      let dataInfo = res.data
      cardList[1].num = dataInfo.numberOfCompleted
      cardList[2].num = dataInfo.numberOfFailed
      cardList[3].num = dataInfo.numberOfRunning
      cardList[4].num = dataInfo.numberOfNotRun
    }
  })
}

const initTabList = () => {
  if (monitorInfo.value.tables?.length || monitorInfo.value.groupIds?.length) {
    tabList[0].show = true
  }
  if (monitorInfo.value.dataSourceIds?.length) {
    tabList[1].show = true
  }
  if (monitorInfo.value.pushTopicIds?.length || monitorInfo.value.pushCollectionIds?.length) {
    tabList[2].show = true
  }

  // 选中首个tab
  let firstTab = tabList.find(it => it.show)
  if (firstTab) {
    firstTab.select = true
  } else {
    // 无选中tab 默认选中监控数据表 展示 -
    // showDefault.value = true
    // cardList.forEach((it) => {
    //   it.num = '-'
    // })
  }
}

const selectTab = item => {
  tabList.forEach(tab => (tab.select = false))
  item.select = true
}

const dateChange = (_, str) => {
  dateStr.value = str.split('-').join('')
  getSummary()
}

const showTabList = computed(() => {
  return tabList.filter(it => it.show)
})
</script>

<template>
  <div class="main-contaienr">
    <div class="main-wrap">
      <back @backFn="$emit('back', true)" />
      <mainArea>
        <template #title>
          <div class="title-wrap">
            <p :title="monitorInfo.name">{{ monitorInfo.name }}</p>
            <span>监控当天任务运行情况</span>
          </div>
        </template>
        <template #topRight v-if="[0, 1].includes(showTabList.length)">
          <div class="right-wrap">
            <span>仅保留近一周记录</span>
            <a-date-picker
              :locale="zhCN"
              format="YYYY-MM-DD"
              @change="dateChange"
              style="width: 220px"
            />
          </div>
        </template>
        <div class="task-wrap">
          <div class="opereate-wrap" v-if="showTabList.length > 1">
            <div class="tab-container">
              <div
                :class="{ tab: true, active: !!item.select }"
                @click="selectTab(item)"
                v-for="item in showTabList"
              >
                {{ item.label }}
              </div>
            </div>
            <div class="right-wrap">
              <span>仅保留近一周记录</span>
              <a-date-picker
                :locale="zhCN"
                format="YYYY-MM-DD"
                @change="dateChange"
                style="width: 220px"
              />
            </div>
            
          </div>
          <template v-if="selectedTab.key === 'dataTable'">
            <div class="card-wrap">
              <div
                @click="currentType = item.key"
                :class="{ card: true, active: currentType === item.key }"
                v-for="item in cardList"
              >
                <div class="icon-wrap">
                  <img :src="item.icon" />
                </div>
                <div class="content-wrap">
                  <span class="num" v-if="item.num !== undefined">{{ item.num }}</span>
                  <span class="label">{{ item.name }}</span>
                </div>
              </div>
            </div>
            <dataTable
              @setMonitorObjNum="total => (cardList[0].num = total)"
              :current-type="currentType"
              :dateStr="dateStr"
              :collectionId="viewId"
            />
          </template>
          <otherTable v-else :type="selectedTab.key" :dateStr="dateStr" :collectionId="viewId" />
        </div>
      </mainArea>
    </div>
  </div>
</template>

<style lang="less" scoped>
.main-contaienr {
  width: 100%;
  height: calc(100% - 36px);
  overflow: auto;
}
.main-wrap {
  background-color: #fff;
  height: 100%;
  .mainArea {
    overflow: auto;
  }
  .title-wrap {
    display: flex;
    align-items: center;
    gap: 12px;
    height: 25px;
    p {
      max-width: 300px;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      font-weight: 600;
      font-size: 18px;
      color: #000000cc;
      margin: 0;
    }
    span {
      font-size: 12px;
      color: #00000066;
    }
  }
  .right-wrap{
    display: flex;
    align-items: center;
    color: #00000066;
    font-size: 14px;
    gap: 30px;
  }
  .task-wrap {
    height: calc(100% - 45px);
    overflow: auto;
    .opereate-wrap {
      display: flex;
      justify-content: space-between;
      margin-bottom: 16px;
      .tab-container {
        height: 36px;
        display: flex;
        align-items: center;
        background: #f3f3f3;
        padding: 3px;
        border-radius: 8px;
        .tab {
          color: #00000066;
          cursor: pointer;
          line-height: 30px;
          padding: 0 16px;

          &.active {
            border-radius: 6px;
            background-color: #fff;
            font-weight: 600;
            color: #000000cc;
          }
        }
      }
    }
    .card-wrap {
      height: 100px;
      display: flex;
      gap: 20px;
      overflow: auto;
      .card {
        padding: 20px 32px;
        border-radius: 10px;
        flex-grow: 1;
        border: 2px solid #fff;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: space-between;
        &:first-of-type {
          &:hover {
            border-color: #5188ff;
          }
          &.active {
            border-color: #5188ff;
          }
          background: linear-gradient(98.68deg, #ebf2ff 0%, rgba(235, 242, 255, 0.5) 100%);
        }
        &:nth-of-type(2) {
          &:hover {
            border-color: #ff6404;
          }
          &.active {
            border-color: #ff6404;
          }
          background: linear-gradient(98.68deg, #fff2f3 0%, rgba(255, 242, 243, 0.5) 100%);
        }
        &:nth-of-type(3) {
          &:hover {
            border-color: #00a3da;
          }
          &.active {
            border-color: #00a3da;
          }
          background: linear-gradient(97.95deg, #ebfaff 0.55%, rgba(235, 250, 255, 0.75) 99.51%);
        }
        &:nth-of-type(4) {
          &:hover {
            border-color: #6257ff;
          }
          &.active {
            border-color: #6257ff;
          }
          background: linear-gradient(98.68deg, #f4f2ff 0%, rgba(244, 242, 255, 0.5) 100%);
        }
        &:nth-of-type(5) {
          &:hover {
            border-color: #00c792;
          }
          &.active {
            border-color: #00c792;
          }
          background: linear-gradient(98.68deg, #e8fcf7 0%, rgba(232, 252, 247, 0.75) 100%);
        }
        &:last-of-type {
          &:hover {
            border-color: #fe9f00;
          }
          &.active {
            border-color: #fe9f00;
          }
          background: linear-gradient(98.68deg, #fff7eb 0%, rgba(255, 247, 235, 0.75) 100%);
        }
        .icon-wrap {
          flex-shrink: 0;
          width: 56px;
          height: 56px;
          background-color: #fff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          img {
            width: 24px;
            height: 24px;
          }
        }
        .content-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          .num {
            font-size: 30px;
            color: #000000cc;
          }
          .label {
            white-space: nowrap;
            text-align: center;
            font-size: 14px;
            color: #00000099;
          }
        }
      }
    }
  }
}
</style>
