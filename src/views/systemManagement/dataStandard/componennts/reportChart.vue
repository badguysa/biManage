<script setup>
import * as echarts from 'echarts'
import { getGroupReportDetail, getReportByStandard, getGlobalReportList } from '@/apis/dataStandard'
import { message } from 'ant-design-vue'
import noData from '@/components/noData'
import basePagination from '@/components/pagination/base.vue'
import { abnormalRateColumns, abnormalDetailColumns } from '../constants'
import { nextTick } from 'vue'

const modalVisible = ref(false)
const standardChartData = inject('STANDARD_CHART_DATA')
const detailState = inject('STANDARD_REPORT_DETAIL')

// console.log('standardChartData', standardChartData)

let rateChart = null, distrubutionChart = null

const chartInstances = []

const abnormalRateparams = reactive({
  pageNum: 1,
  pageSize: 15,
  total: 0
})

const detailParams = reactive({
  pageNum: 1,
  pageSize: 15,
  total: 0
})

// 各标准库校验异常率
const abnormalRateList = ref([])

const modalTableData = ref([])

const legendData = ref([])

onMounted(() => {
  getAbnormalList()
})

// 全局校验通过率
watch(() => standardChartData.checkPassRate, async () => {
  await nextTick()
  initPassRateChart()
})

// 全局校验通过率
watch(() => standardChartData.abnormalList, async () => {
  await nextTick()
  initDistributionChart()
})

// 组件卸载 销毁echarts实例
onUnmounted(() => {
  chartInstances.forEach(instance => {
    instance.dispose()
  })
})

// 分组维度数据
const getAbnormalList = async () => {
  let pageParams = {
    pageNum: abnormalRateparams.pageNum,
    pageSize: abnormalRateparams.pageSize
  }

  try {
    let res = await (standardChartData.isGlobalReport ?
      getGlobalReportList({
        ...pageParams,
      }) :
      getGroupReportDetail({
        ...pageParams,
        libId: detailState.reportId,
        checkDay: standardChartData.checkDay
      })
    )

    if (res.code !== 1) return message.error(res.message)
    abnormalRateparams.total = Number(res.data?.total)
    abnormalRateList.value = res.data?.records ?? []
  } catch (e) {
    console.log('e', e)
  }
}

// 查看异常详情
const viewAbnormalDetail = async (record) => {
  let pageParams = {
    pageNum: detailParams.pageNum,
    pageSize: detailParams.pageSize
  }
  const res = await (standardChartData.isGlobalReport ?
    getGroupReportDetail({
      libId: record.groupId,
      checkDay: standardChartData.checkDay,
      ...pageParams,
    }) :
    getReportByStandard({
      standardId: record.standardTableId,
      checkDay: standardChartData.checkDay,
      ...pageParams,
    })
  )
  if (res.code !== 1) return message.error(res.message)
  detailParams.total = Number(res.data?.total)
  modalTableData.value = res.data?.records ?? []
  modalVisible.value = true
}

const initPassRateChart = () => {
  if (standardChartData.checkPassRate === '') return
  // 校验通过率
  if (!rateChart) {
    rateChart = echarts.init(document.querySelector('#passRateChart'))
    chartInstances.push(rateChart)
  }
  rateChart.setOption({
    series: [
      // 背景
      {
        animation: false,
        name: '总数',
        type: 'gauge',
        startAngle: 225,
        endAngle: -45,
        radius: 80,
        center: ['50%', '55%'],
        // 展示当前进度
        progress: {
          show: true,
          width: 15,
          roundCap: true,
          itemStyle: {
            color: '#0048FF33'
          }
        },
        // 仪表盘指针
        pointer: {
          show: false
        },
        // 仪表盘轴线相关配置
        axisLine: {
          show: false
        },
        // 刻度样式
        axisTick: {
          show: false
        },
        // 分隔线样式
        splitLine: {
          show: false
        },
        // 刻度标签
        axisLabel: {
          show: false
        },
        // 表盘中指针的固定点
        anchor: {
          show: false
        },
        detail: {
          fontSize: 12,
          fontWeight: 'normal',
          formatter: passRateTile.value,
          offsetCenter: ['0%', '15%']
        },
        data: [
          {
            value: Infinity
          }
        ]
      },
      // 内容
      {
        name: '开工',
        type: 'gauge',
        radius: 80,
        center: ['50%', '55%'],
        // 展示当前进度
        progress: {
          show: true,
          width: 15,
          roundCap: true,
          itemStyle: {
            color: '#2B67FF'
          }
        },
        // 仪表盘指针
        pointer: {
          show: false
        },
        // 仪表盘轴线相关配置
        axisLine: {
          show: false
        },
        // 刻度样式
        axisTick: {
          show: false
        },
        // 分隔线样式
        splitLine: {
          show: false
        },
        // 刻度标签
        axisLabel: {
          show: false
        },
        // 表盘中指针的固定点
        anchor: {
          show: false
        },
        detail: {
          borderRadius: 8,
          offsetCenter: ['0%', '-12%'],
          fontSize: 22,
          fontWeight: '600',
          formatter: function () {
            return formatPercentNumber(standardChartData.checkPassRate)
          },
          color: 'rgba(0,0,0,.65)'
        },
        data: [
          {
            value: standardChartData.checkPassRate * 100
          }
        ]
      }
    ]
  })
}

const initDistributionChart = () => {
  let allDataNum = standardChartData.abnormalList.reduce(
    (a, b) => Number(a.dataNum ?? a) + Number(b.value),
    0
  )

  if (allDataNum === 0) return

  legendData.value = standardChartData.abnormalList.map(it => ({
    name: it.name,
    rate: formatPercentNumber(Number(it.value)),
    value: parseInt(it.value * 100) 
  }))

  // 异常数据分布情况
  if (!distrubutionChart) {
    distrubutionChart = echarts.init(document.querySelector('#distributionChart'))
    chartInstances.push(distrubutionChart)
  }
  distrubutionChart.setOption({
    tooltip: {
      trigger: 'item',
      position: 'right'
      // position: function (pos, params, dom, rect, size) {
      //   // 鼠标在左侧时 tooltip 显示到右侧，鼠标在右侧时 tooltip 显示到左侧。
      //   var obj = {top: 60};
      //   obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 5;
      //   return obj;
      // }
    },
    color: ['#398CFF ', '#9CE6B6', '#FFDB5B', '#FE9F7F', '#C4AAF2'],
    series: [
      {
        type: 'pie',
        radius: [48, 60],
        center: ['25%', '50%'],
        label: {
          show: false
        },
        labelLine: {
          show: false
        },
        data: legendData.value
      }
    ]
  })
}

const passRateTile = computed(() => {
  return standardChartData.isGlobalReport ? '全局校验通过率' : '标准库校验通过率'
})

const detailModalName = computed(() => {
  return standardChartData.isGlobalReport ? '标准模型异常详情' : '数据表异常详情'
})

const detailModalColumns = computed(() => {
  // 标准表 不展示校验表数量 展示异常字段数量
  if (!standardChartData.isGlobalReport) {
    abnormalDetailColumns[0].title = '数据表名'
    abnormalDetailColumns.splice(1, 1,
      {
        title: '异常字段数量',
        dataIndex: 'abnormalColumnNum',
        key: 'abnormalColumnNum'
      }
    )
    abnormalDetailColumns[3] = {
      title: '异常数据量',
      key: 'abnormalDataNum',
      dataIndex: 'abnormalDataNum'
    }
  }else if(standardChartData.isGlobalReport){
    abnormalDetailColumns[0].title = '标准表名'
  }  
  return abnormalDetailColumns
})

const abnormalColumns = computed(() => {
  if (standardChartData.isGlobalReport) {
    abnormalRateColumns[0].title = '标准库名'
  } else {
    abnormalRateColumns[0].title = '标准表名'
  }
  return abnormalRateColumns
})

const standardAbnormalRate = (record) => {
  if (!record.abnormalDataNum || !record.dataNum) {
    return '0%'
  }
  return formatPercentNumber(record.abnormalDataNum / record.dataNum)
}

// 小数格式化为百分比
const formatPercentNumber = (num, digitNum = 2) => {
  let percentNumber = num * 100
  let str = String(percentNumber).split('.')

  if (str[1] && str[1].length > digitNum) {
    return percentNumber.toFixed(digitNum) + '%'
  }
  return percentNumber + '%'
}
</script>

<template>
  <div class="chart-wrap">
    <div class="top-chart">
      <!-- 校验通过率 -->
      <div class="pass-rate">
        <div class="top-title">
          <span class="arrow-icon"></span>
          <div class="title">{{ passRateTile }}</div>
        </div>
        <div id="passRateChart" v-if="standardChartData.checkPassRate !== ''"></div>
        <noData v-else />
      </div>
      <!-- 异常数据分布情况 -->
      <div class="distribution-wrap">
        <div class="top-title">
          <span class="arrow-icon"></span>
          <div class="title">异常数据分布情况</div>
        </div>
        <div class="inner-wrap" v-if="standardChartData.abnormalList.length">
          <div id="distributionChart"></div>
          <div class="legend-wrap">
            <div class="lengend-item" v-for="item in legendData">
              <i></i>
              <span class="legend-name" :title="item.name">{{ item.name }}</span>
              <span class="legend-rate">{{ item.rate }}</span>
            </div>
          </div>
        </div>
        <noData v-else />
      </div>
      <!-- 校验表异常 TOP 10 -->
      <div class="top10-wrap">
        <div class="top-title">
          <span class="arrow-icon"></span>
          <div class="title">校验表异常 TOP 10</div>
        </div>
        <div class="list-container" v-if="standardChartData.topTenTables.length">
          <div class="unusual-item" v-for="item in standardChartData.topTenTables">
            <span class="table-name" :title="item.tableAlias">{{ item.tableAlias }}</span>
            <div class="progress-bar">
              <div class="bar-inner" :style="{ width: `${item.abnormalRate * 100}%` }"></div>
            </div>
            <span class="percent">{{ formatPercentNumber(item.abnormalRate) }}</span>
          </div>
        </div>
        <noData v-else />
      </div>
    </div>
    <!-- 各标准库校验异常率 -->
    <div class="table-wrap">
      <div class="top-title">
        <span class="arrow-icon"></span>
        <div class="title">各标准{{ standardChartData.isGlobalReport ? '库' : '表' }}校验异常率</div>
      </div>
      <div class="table-contaienr">
        <BiTable :columns="abnormalColumns" :dataSource="abnormalRateList">
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'abnormalRate'">
              <span>{{ formatPercentNumber(record.abnormalRate) }}</span>
            </template>
            <template v-else-if="column.key === 'operate'">
              <span class="unusual-detail" @click="viewAbnormalDetail(record)">{{ detailModalName }}</span>
            </template>
          </template>
        </BiTable>
      </div>
      <basePagination v-if="abnormalRateparams.total > abnormalRateparams.pageSize"
        v-model:current="abnormalRateparams.pageNum" :total="abnormalRateparams.total"
        :pageSize="abnormalRateparams.pageSize" show-less-items @change="getAbnormalList" />
    </div>
  </div>
  <BiModal v-model:visible="modalVisible" :title="detailModalName" width="840px" :showFooter="false">
    <div style="height: 500px;">
      <div class="model-table-wrap">
        <BiTable :columns="detailModalColumns" :dataSource="modalTableData" :columnWidthInfo="{ tableName: 37 }">
          <template #bodyCell="{ column, record }">
            <!-- 异常数据率 -->
            <template v-if="column.key === 'abnormalRate'">
              <span v-if="standardChartData.isGlobalReport">{{ formatPercentNumber(record.abnormalRate) }}</span>
              <!-- 非全局 需前端计算异常率 -->
              <span v-else>{{ standardAbnormalRate(record) }}</span>
            </template>
          </template>
        </BiTable>
      </div>
      <basePagination class="modal-pagination" v-if="detailParams.total > detailParams.pageSize"
        v-model:current="detailParams.pageNum" :total="detailParams.total" :pageSize="detailParams.pageSize"
        show-less-items @change="getAbnormalList" />
    </div>
  </BiModal>
</template>

<style lang="less" scoped>
.chart-wrap {
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  gap: 20px;

  .top-chart>div,
  .table-wrap {
    border: 1px solid #e9e9e9;
    height: 238px;
    border-radius: 4px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    position: relative;

    .top-title {
      display: flex;
      align-items: center;
      gap: 5px;
      line-height: 22px;

      .arrow-icon {
        display: inline-block;
        width: 20px;
        height: 20px;
        background: url(@/assets/icons/data-arrow.png) 100% / cover;
      }

      .title {
        font-weight: 600;
        font-size: 16px;
        color: #000000cc;
      }

      &+div {
        flex-grow: 1;
      }
    }

    .table-contaienr {
      overflow: auto;
    }

    .pagination-wrap {
      text-align: center;
    }
  }

  .top-chart {
    display: flex;
    gap: 20px;
    overflow: auto
  }

  .pass-rate {
    width: 240px;
    flex-shrink: 0;
  }

  .distribution-wrap {
    width: 600px;
    overflow-y: auto;
    flex-shrink: 0;

    .inner-wrap {
      height: 100%;
      display: flex;

      &>div:first-of-type {
        width: 280px;
        height: 100%;
      }

      .legend-wrap {
        flex-grow: 1;
        display: flex;
        flex-direction: column;

        .lengend-item {
          display: flex;
          align-items: center;
          gap: 15px;
          color: #474C59;
          font-size: 12px;
          padding: 5px;

          .legend-name {
            width: 136px;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            /* 显示两行文本 */
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .legend-rate {
            width: 60px;
          }

          i {
            display: inline-block;
            width: 8px;
            height: 8px;
            border-radius: 2px;
          }

          &:nth-of-type(5n + 1)>i {
            background-color: #398CFF;
          }

          &:nth-of-type(5n + 2)>i {
            background-color: #9CE6B6;
          }

          &:nth-of-type(5n + 3)>i {
            background-color: #FFDB5B;
          }

          &:nth-of-type(5n + 4)>i {
            background-color: #FE9F7F;
          }

          &:nth-of-type(5n + 5)>i {
            background-color: #C4AAF2;
          }
        }
      }
    }
  }

  .top10-wrap {
    flex-grow: 1;
    min-width: 300px;
    overflow-y: auto;

    .list-container {
      .unusual-item {
        height: 32px;
        display: flex;
        align-items: center;
        gap: 16px;
        font-size: 14px;
        color: #000000cc;

        .table-name {
          width: 100px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .progress-bar {
          flex-grow: 1;
          height: 8px;
          background-color: #e9e9e9;
          border-radius: 10px;

          .bar-inner {
            height: 100%;
            border-radius: 10px;
            background: linear-gradient(97.83deg, #356fff 5.97%, #61aaff 101.98%);
          }
        }

        .percent {
          width: 40px;
        }
      }
    }
  }

  .table-wrap {
    width: 100%;
    flex-grow: 1;

    .unusual-detail {
      color: #2b67ff;
      font-size: 14px;
      cursor: pointer;
    }
  }

  :deep(.noData) {
    margin-top: 0;

    img {
      width: 160px;
    }
  }
}
</style>
<style>
.model-table-wrap {
  max-height: 450px;
  overflow: auto;
  margin-bottom: 20px;
}

.modal-pagination {
  text-align: center;
}
</style>
