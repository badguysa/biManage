<template>
  <div class="data-size">
    <div class="table-increase-data">
      <div class="sub-header">
        <img class="data-arrow" src="@/assets/icons/data-arrow.png" />
        <div class="title">{{ t('overview.interfaceRankingTime') }}</div>
      </div>
      <div class="top-five">
        <emptyView v-if="!avgRtTop5Data.length" />
        <div class="top-list" v-else>
          <div class="top-item" v-for="(item, index) in avgRtTop5Data" :key="index">
            <a-tooltip color="#212633"  overlayClassName="my_apimonitor_tooltip"
              @visibleChange="(val) => visibleChange(val, item)">
              <template #title>
                <div class="apiName"> {{ item.apiName }}</div>
                <a-spin size="small" :spinning="isSpinning">
                  <div class="table_list">
                    <div v-for="item in tableListByApi[item.apiName]" :key="item.id" class="list_item" @click="jumpToMenu(item)"><span
                        class="table_n">{{
                          item.tableAlias }}</span> <img src="@/assets/icons/toPush.png" alt=""></div>
                  </div>
                </a-spin>
              </template>
              <span class="name text-ellipsis">{{ item.apiName }}</span>
            </a-tooltip>
            <a-progress class="progress" :stroke-color="{ '0%': '#6257FF', '100%': '#8490FF' }"
              :percent="(item.pct || 0) * 100" :show-info="false" />
            <a-tooltip>
              <template #title>
                {{ Math.trunc((item.avgRt || 0)) + 'ms' }}
              </template>
              <span class="count text-ellipsis">{{ Math.trunc((item.avgRt || 0)) + 'ms' }}</span>
            </a-tooltip>

          </div>
        </div>
      </div>
      <tips tipsType="timeCosumeTop5"/>
    </div>
    <div class="table-increase-data">
      <div class="sub-header">
        <img class="data-arrow" src="@/assets/icons/data-arrow.png" />
        <div class="title">{{ t('overview.interfaceFailsMostTimes') }}</div>
      </div>
      <div class="top-five">
        <emptyView v-if="!apiFailTop5Data.length" />
        <div class="top-list" v-else>
          <div class="top-item" v-for="(item, index) in apiFailTop5Data" :key="index">
            <a-tooltip color="#212633" destroyTooltipOnHide overlayClassName="my_apimonitor_tooltip"
              @visibleChange="(val) => visibleChange(val, item)">
              <template #title>
                <div class="apiName"> {{ item.apiName }}</div>
                <a-spin size="small" :spinning="isSpinning">
                  <div class="table_list">
                    <div v-for="item in tableListByApi[item.apiName]" :key="item.id" class="list_item" @click="jumpToMenu(item)"><span
                        class="table_n">{{
                          item.tableAlias }}</span> <img src="@/assets/icons/toPush.png" alt=""></div>
                  </div>
                </a-spin>
              </template>
              <span class="name text-ellipsis">{{ item.apiName }}</span>
            </a-tooltip>

            <a-progress class="progress" :stroke-color="{ '0%': '#FF6404', '100%': '#FF9538' }"
              :percent="(item.pct || 0) * 100" :show-info="false" />
            <a-tooltip>
              <template #title>
                {{ item.totalCount || 0 }}
              </template>
              <span class="count text-ellipsis">{{ (item.totalCount || 0) + t('overview.times') }}</span>
            </a-tooltip>

          </div>
        </div>
      </div>
      <tips tipsType="failedNumTop5" tipsPlacement="topLeft"/>
    </div>
  </div>
</template>

<script setup>

import emptyView from '@/components/empty'
import { storeToRefs } from 'pinia';
import homeStore from '@/Stores/homeStore'
import { getTableByApiName } from '@/apis/board'
import { getGroupListApi } from '@/apis/group'
import { useRouter } from 'vue-router'
import _ from 'lodash'
// import top1 from '@/assets/icons/TOP_1.png'
// import top2 from '@/assets/icons/TOP_2.png'
// import top3 from '@/assets/icons/TOP_3.png'
// import top4 from '@/assets/icons/TOP_4.png'
// import top5 from '@/assets/icons/TOP_5.png'
import { useI18n } from 'vue-i18n';
import { ref } from 'vue';
import tips from '@/components/tips'

const { t } = useI18n()
const router = useRouter()
const useHomeStore = homeStore()
const { avgRtTop5Data, apiFailTop5Data } = storeToRefs(useHomeStore)
const treeData = ref()
import { innerJumpToMenu, outJumpToMenu } from '@/hooks/dataCenter/useGoMenuItem'

const top5Data = ref([
  {
    name: 32132,
    percent: 70,
    count: 34
  },
  {
    name: 32132,
    percent: 35,
    count: 34
  }, {
    name: 32132,
    percent: 30,
    count: 34
  }, {
    name: 32132,
    percent: 32,
    count: 34
  }, {
    name: 32132,
    percent: 10,
    count: 34
  }
])
const jumpToMenu = async(treeItem) => {
  // 跳转路由
  if (router.currentRoute.value.path.indexOf('datacenter') !== 1) {
      router.push('/datacenter')
  }
  // 获取左侧menu的值
  await getTreeData()
  let menuItem
  let subMenuItem
  treeData.value.forEach((item) =>{
    if(item.id === treeItem.groupId){
      menuItem = item
    }
    if(item.subList.length>0){
      item.subList.forEach((subItem) => {
        if(subItem.id ===  treeItem.groupId){
          subMenuItem = subItem
          menuItem = item
        }
      })
    }
  })
  if(menuItem){
    outJumpToMenu( menuItem, treeItem, router)
  }
  if(subMenuItem && menuItem){
    innerJumpToMenu(menuItem, subMenuItem, treeItem, router)
  }
}

const getTreeData = async ()=>{
  const res = await getGroupListApi()
  if(res.code == 1 ){
    treeData.value = res.data
  }
}

const tableListByApi = ref({})
const visibleChange = (val, item) => {
  if (val && !tableListByApi.value[item.apiName]) {
    isSpinning.value = true
    getTableData(item)
  }
}
const isSpinning = ref(false)
const getTableData = _.debounce((item) => {
  getTableByApiName({ apiName: item.apiName }).then(res => {
    if (res.code == 1) {
      tableListByApi.value[item.apiName] = res.data
    }
  }).finally(() => {
    isSpinning.value = false
  })
}, 500)
</script>
<style lang="less">
.my_apimonitor_tooltip {
  .ant-spin-blur {
    opacity: 0;
  }

  .ant-tooltip-inner {
    max-height: 180px !important;

    .apiName {
      color: #FFF;
      font-size: 13px;
      font-weight: 400;
    }

    .table_list {
      max-height: 120px;
      overflow: auto;
      min-height: 30px;

      .list_item {
        color: #9CC2FF;
        font-size: 13px;
        font-weight: 400;
        margin-bottom: 3px;
        display: flex;
        align-items: center;
        cursor: pointer;

        .table_n {
          display: inline-block;
          max-width: 215px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        img {
          width: 14px;
          height: 14px;
          margin-left: 4px;
        }
      }
    }
  }
}
</style>
<style lang="less" scoped>
.data-size {
  height: 260px;
  display: flex;
  align-items: center;
  margin-top: 20px;
  gap: 20px;
  overflow: hidden;
  &:hover {
    overflow: auto;
  }

  .text-ellipsis {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .today-data,
  .table-increase-data {
    padding: 20px;
    height: 100%;
    border-radius: 4px;
    border: 1px solid #E9E9E9;
    width: 820px;
    position: relative;

    .sub-header {
      width: 760px;
      display: flex;
      align-items: center;

      .data-arrow {
        width: 20px;
        height: 20px;
        margin-right: 5px;
      }

      .title {
        color: rgba(0, 0, 0, 0.80);
        font-size: 16px;
        font-weight: 600;
      }
    }
  }

  .today-data {
    .data-layout {
      height: 156px;
      display: flex;
      padding: 20px 0;
      gap: 20px;

      .data-item {
        width: 240px;
        padding: 0 40px;
        flex: 1;

        .title {
          color: rgba(0, 0, 0, 0.80);
          font-size: 14px;
          font-weight: 600;
          line-height: 1;
        }

        .value {
          color: rgba(0, 0, 0, 0.80);
          font-size: 28px;
          font-style: 1;
          font-weight: 700;
          margin: 16px 0;
          line-height: 1;

          span {
            font-size: 14px;
            font-weight: 600;
            margin-left: 6px;
          }
        }

        .unit {
          color: rgba(0, 0, 0, 0.60);
          font-size: 14px;
          font-weight: 400;
          line-height: 1;

          img {
            width: 12px;
            height: 12px;
            margin-left: 6px;
          }
        }
      }
    }
  }

  .table-increase-data {
    .top-five {
      height: 170px;
      padding: 10px 0;
      margin-top: 6px;

      .top-list {
        .top-item {
          display: flex;
          align-items: center;
          height: 35px;
          padding: 6px 0;
          color: rgba(0, 0, 0, 0.80);

          .sequence {
            width: 12px;
            height: 12px;
            margin-right: 16px;
          }

          .name {
            width: 142px;
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
          }

          .stat {
            width: 14px;
            height: 14px;
            cursor: pointer;
          }

          .progress {
            width: 70%;
            margin: 0 16px;
          }

          .count {
            // margin-right: 16px;
            display: inline-block;
            width: 50px;
            text-align: right;
          }
        }
      }
    }
  }
}

.data-size::-webkit-scrollbar-thumb {
  background-color: transparent;
}

.data-size:hover::-webkit-scrollbar-thumb {
  background-color: #dadfe5;
}

.table_list::-webkit-scrollbar-thumb {
  background-color: transparent;
}

.table_list:hover::-webkit-scrollbar-thumb {
  background-color: #dadfe5;
}
</style>