<template>
  <div class="data-size">
    <div class="echart_data">
      <div class="sub-header">
        <img class="data-arrow" src="@/assets/icons/data-arrow.png" />
        <div class="title">{{ t('overview.inflowInterfaceDetail') }}</div>
      </div>
      <div class="data-layout">
        <div class="api_count">
          <div class="name">{{ t('overview.interfaceAllCount') }}</div>
          <div class="num">
            <a-tooltip>
              <template #title>{{ apiInApiInfo?.totalCount || 0 }}</template>
              <span class="text-ellipsis">{{ apiInApiInfo?.totalCount || 0 }}</span>
            </a-tooltip>
            {{ t('overview.number') }}
          </div>
        </div>
        <div class="legend">
          <div class="legend_item" v-for="item in legendList" :key="item.name">
            <div class="dot" :style="{ backgroundColor: item.color }"></div>
            <div class="name">{{ item.name }}</div>
            <a-tooltip>
              <template #title>{{ item.value }}</template>
              <div class="value">{{ item.value }}</div>
            </a-tooltip>
            <div class="unit">{{ t('overview.number') }}</div>
          </div>
        </div>
        <div id="echartLine" class="echartDiv" style="width: 100%;height: 100%;">
        </div>
      </div>
      <tips tipsType="apiSitution"/>
    </div>
    <div class="table_data">
      <div class="sub-header">
        <img class="data-arrow" src="@/assets/icons/data-arrow.png" />
        <div class="title">{{ t('overview.datasetInterfaceMonitor') }}</div>
      </div>
      <table v-if="apiTop5DataSet.length" class="tableContainer">
        <tr v-for="(item, index) in apiTop5DataSet" :key="item.groupId">
          <td style="width:120px">{{ index + 1 }}</td>
          <td>{{ item.groupName || '' }}</td>
          <td>
            <div class="text">
              {{ t('overview.calledInterfaceCount') + ' ' }}
              <a-tooltip>
                <template #title>{{ item.apiTotalCount }}</template>
                <div class="value text-ellipsis ">{{ item.apiTotalCount }}</div>
              </a-tooltip>
            </div>
          </td>
          <td>
            <div class="text">
              {{ t('overview.interfaceCalledNumCount') + ' ' }}
              <a-tooltip>
                <template #title>{{ item.apiTotalReqCount }}</template>
                <div class="value text-ellipsis ">{{ item.apiTotalReqCount }}</div>
              </a-tooltip>
              <img v-if="item.apiTotalReqCount > 0" src="@/assets/icons/increase.png" />
              <img v-if="item.apiTotalReqCount < 0" src="@/assets/icons/decrease.png" />
            </div>
          </td>
          <td>
            <div class="hign_light" @click="checkDetail(item)">
              <img src="@/assets/icons/interface_info.png" />
              {{ t('overview.interfaceCalledDetail') }}
            </div>
          </td>

        </tr>

      </table>
      <emptyView v-else style="height: 200px;" />
      <tips tipsType="dataSetApiMonitor" tipsPlacement="topLeft"/>
    </div>
  </div>
</template>

<script setup>
import emptyView from '@/components/empty'
import { storeToRefs } from 'pinia';
import homeStore from '@/Stores/homeStore'
import { modalStore } from '@/Stores/modalStore';
import * as echarts from 'echarts';
import { useI18n } from 'vue-i18n';
import { nextTick, computed, reactive, ref, watch } from 'vue';
import tips from '@/components/tips'

const { t } = useI18n()
const useHomeStore = homeStore()
const useModalStore = modalStore()
const { apiInApiInfo, apiTop5DataSet } = storeToRefs(useHomeStore)
const legendList = computed(() => [
  {
    name: t('overview.executing'),
    color: '#4C96FF',
    value: apiInApiInfo.value?.runCount || 0
  }, {
    name: t('overview.executionSucceeded'),
    color: '#9FE6B8',
    value: apiInApiInfo.value?.successCount || 0
  },
  {
    name: t('overview.waitExecution'),
    color: '#B1A4F3',
    value: apiInApiInfo.value?.waitCount || 0
  },
  {
    name: t('overview.executionFailed'),
    color: '#FE9F7F',
    value: apiInApiInfo.value?.failCount || 0
  }
])
watch(() => apiInApiInfo.value, () => {
  nextTick(() => {
    echartInit()
  })
}, { immediate: true, deep: true })
const echartInit = () => {
  let myChart = echarts.init(document.getElementById('echartLine'));
  // 指定图表的配置项和数据
  let option = {
    color: ['#4C96FF', '#9FE6B8', '#B1A4F3', '#FE9F7F'],
    // legend: {
    //   orient: "vertical", // 控制水平排列
    //   top: "22%", // 调整位置
    //   left: "65%", // 距离右侧位置
    //   icon: "circle", // 修改小图标为圆形
    //   itemGap: 15, // 设置间距
    //   itemHeight: 10, // 修改圆形小图标的大小
    //   textStyle: {
    //     // 文字的样式
    //     color: "#828282",
    //     // rich: {
    //     //   threethree: {
    //     //     // 设置百分比这一列的样式
    //     //     color: "#E0E0E0",
    //     //   },
    //     // },
    //   },
    //   // formatter: (name) => {
    //   //   // formatter格式化函数动态呈现数据
    //   //   return `${name}`;
    //   // },
    // },


    series: [
      {
        name: '',
        type: 'pie',
        radius: ['47%', '65%'],
        center: ['42%', '50%'],
        data: [
          { value: apiInApiInfo.value?.runCount || 0, name: t('overview.executing') },
          { value: apiInApiInfo.value?.successCount || 0, name: t('overview.executionSucceeded') },
          { value: apiInApiInfo.value?.waitCount || 0, name: t('overview.waitExecution') },
          { value: apiInApiInfo.value?.failCount || 0, name: t('overview.executionFailed') },
        ],
        label: {
          normal: {
            show: false
          }
        },
        labelLine: {
          normal: {
            show: false
          }
        },

      }
    ]
  };
  // 使用刚指定的配置项和数据显示图表。
  myChart.setOption(option);
}
const checkDetail = (data) => {
  useHomeStore.changeInterfaceDetailData(data)
  useModalStore.changeInterfaceDetailModalVisible()
}

</script>

<style lang="less" scoped>
.data-size {
  height: 316px;
  display: flex;
  align-items: center;
  gap: 20px;
  overflow: hidden;
  &:hover{
    overflow: auto hidden;
  }
  .text-ellipsis {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .echart_data,
  .table_data {
    padding: 20px;
    height: 100%;
    border-radius: 4px;
    border: 1px solid #E9E9E9;
    flex-shrink: 0;
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

    .select-empty {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgba(0, 0, 0, .4);
    }

    .tableContainer {
      width: 100%;

      th,
      td {
        padding: 10px 16px;
        width: 268px;
        max-width: 300px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      th {
        color: rgba(0, 0, 0, 0.6);
        font-size: 14px;
        text-align: left;
      }

      td {
        color: rgba(0, 0, 0, 0.8);
        font-size: 14px;

        .text {
          display: flex;
          height: 100%;
          align-items: center;

          .value {
            margin-left: 6px;
            font-size: 16px;
            font-weight: 700;
            max-width: 100px;
            line-height: 26px;
          }

          img {
            width: 12px;
            height: 12px;
            margin-left: 6px;
          }
        }

        .hign_light {
          color: #2B67FF;
          cursor: pointer;
          display: flex;
          align-items: center;

          img {
            width: 12px;
            height: 12px;
            margin-right: 6px;
          }
        }

      }

      tr {
        &:nth-of-type(odd) {
          background-color: #F7FAFF;
        }
      }

      .input_desc {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .input {
          width: 100%;
          margin-right: 10px
        }

        img {
          cursor: pointer;
          width: 26px;
          height: 26px;
        }
      }

      .edit_desc {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .desc_text {
          width: calc(100% - 20px);
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 3;
          overflow: hidden;
          white-space: normal;
        }

        img {
          cursor: pointer;
          width: 14px;
          height: 14px;
        }
      }
    }
  }

  .echart_data {
    width: 560px;

    .data-layout {
      height: 100%;
      display: flex;
      padding: 20px 0;
      gap: 20px;
      position: relative;

      .legend {
        position: absolute;
        right: 50px;
        top: 50px;
        font-size: 12px;
        z-index: 1;

        .legend_item {
          display: flex;
          align-items: center;
          color: rgba(0, 0, 0, 0.60);
          font-size: 12px;
          font-style: normal;
          font-weight: 400;
          height: 24px;
          margin-top: 8px;

          .dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
          }

          .name {
            margin-left: 6px;
            line-height: 24px;
          }

          .value {
            max-width: 60px;
            margin: 0 6px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            color: rgba(0, 0, 0, 0.80);
            font-size: 14px;
            font-weight: 700;
            line-height: 24px;
          }

          .unit {
            line-height: 24px;
          }
        }
      }

      .api_count {
        position: absolute;
        left: 30px;
        top: 90px;
        z-index: 1;

        .name {
          color: rgba(0, 0, 0, 0.80);
          font-variant-numeric: lining-nums tabular-nums;
          font-size: 14px;
          font-style: normal;
          font-weight: 600;
        }

        .num {
          color: rgba(0, 0, 0, 0.80);
          font-size: 14px;
          font-style: normal;
          font-weight: 500;
          line-height: normal;
          margin-top: 10px;
          display: flex;
          align-items: center;

          span {
            font-size: 28px;
            font-weight: 700;
            padding-right: 5px;
            max-width: 100px;
            display: inline-block;
          }
        }
      }
    }
  }

  .table_data {
    width: 1068px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
}

.data-size::-webkit-scrollbar-thumb {
  background-color: transparent;
}

.data-size:hover::-webkit-scrollbar-thumb {
  background-color: #dadfe5;
}
</style>