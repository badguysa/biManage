<script setup>
import back from '@/components/back'
import reportChart from './componennts/reportChart.vue'
import { getTablepReortInfo } from '@/apis/dataStandard'
import { computed, nextTick, onMounted, reactive } from 'vue'
import { message } from 'ant-design-vue'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

const props = defineProps({
  needExport: {
    type: Boolean,
    default: false
  }
})
const emits = defineEmits(['back', 'exportComplelte'])

const detailState = inject('STANDARD_REPORT_DETAIL')

const checkDay = computed(() => detailState.dateTime.format('YYYYMMDD'))

const isGlobalReport = computed(() => detailState.reportId === '')

const chartData = reactive({
  // 校验表异常 TOP 10
  topTenTables: [],
  // 异常数据分布情况
  abnormalList: [],
  // 校验通过率
  checkPassRate: '',
  // 报告生成时间
  checkDay,
  // 是否为全局质量报告 
  isGlobalReport
})

provide('STANDARD_CHART_DATA', chartData)

const cardList = reactive({
  standardModel: {
    label: '标准模型',
    num: '-',
    icon: 'cube',
    unit: '个',
    bgc: 'linear-gradient(97.83deg, #356FFF 5.97%, #61AAFF 101.98%)'
  },
  checkModel: {
    label: '检测模型',
    num: '-',
    icon: 'cube',
    unit: '个',
    bgc: 'linear-gradient(98.98deg, #6257FF 7.84%, #8490FF 106.04%)'
  },
  tableNum: {
    label: '检测表',
    num: '-',
    icon: 'table',
    unit: '个',
    bgc: 'linear-gradient(98.13deg, #00C792 8.12%, #36D9B8 106.89%)'
  },
  abnormalTableNum: {
    label: '异常表',
    num: '-',
    icon: 'warning',
    unit: '个',
    bgc: 'linear-gradient(98.13deg, #FF6404 8.12%, #FF9538 106.89%)'
  },
  checkNum: {
    label: '检测数量',
    num: '-',
    icon: 'symbol',
    unit: '条',
    bgc: 'linear-gradient(97.46deg, #FE9F00 3.36%, #FEB200 100%)'
  },
  checkAbnormalNum: {
    label: '检测异常数据量',
    num: '-',
    icon: 'warning',
    unit: '条',
    bgc: 'linear-gradient(98.13deg, #FF6404 8.12%, #FF9538 106.89%)'
  }
})

onMounted(async () => {
  getTableInfo()
  // getGroupInfo()
  await nextTick()
  props.needExport && exportFn()
})

const exportFn = () => {
  message.info('导出中，请稍后')
  setTimeout(exportPdf, 1000)
}

const exportPdf = async () => {
  let elm = document.querySelector('.report-wrap>.main-wrap')
  let canvasImage = await html2canvas(elm)
  // 将图像添加到 PDF
  const imgData = canvasImage.toDataURL('image/png');
  const imgWidth = 1000;
  const imgHeight = (imgWidth * canvasImage.height) / canvasImage.width; // 保持宽高比
  // 创建一个新的 jsPDF 实例
  const pdf = new jsPDF('l', 'px', [imgWidth, imgHeight]);
  pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
  pdf.save(`${detailState.reportName}-质量报告-${checkDay.value}.pdf`);
  emits('exportComplelte')
}

// 表维度数据 
const getTableInfo = () => {
  getTablepReortInfo({
    libId: detailState.reportId,
    checkDay: checkDay.value,
    // 下载质量报告 增加参数 记录下载操作日志
    isDownload: props.needExport ? 1 : undefined
  }).then(res => {
    if (res.code !== 1) return message.error(res.message)
    if (!res.data) return

    let reportData = res.data

    for (let key in cardList) {
      cardList[key].num = reportData[key]
    }

    chartData.checkPassRate = 1 - reportData.checkAbnormalNum / reportData.checkNum

    // 校验表异常 TOP 10
    chartData.topTenTables = reportData.topTenTables ?? []

    chartData.abnormalList = reportData.abnormalRateList ?? []
  })
}

</script>

<template>
  <div class="report-wrap">
    <back @backFn="$emit('back')" />
    <div class="main-wrap">
      <!-- 顶部卡片 -->
      <div class="card-list">
        <div v-for="(value, key) in cardList" class="card-wrap" :style="{
          backgroundImage: value.bgc
        }">
          <div class="info-container">
            <div class="info-wrap">
              <span class="num">{{ value.num }}</span>
              <span class="unit">{{ value.unit }}</span>
            </div>
            <span class="label">{{ value.label }}</span>
          </div>
          <BiIcon :name="value.icon" />
        </div>
      </div>
      <!-- 图表 -->
      <reportChart />
    </div>
  </div>
</template>

<style lang="less" scoped>
.report-wrap {
  background-color: #fff;
  height: calc(100% - 36px);

  .main-wrap {
    padding: 20px;
    height: calc(100% - 36px);
    display: flex;
    flex-direction: column;
    gap: 20px;
    overflow: auto;

    .card-list {
      display: flex;
      gap: 20px;
      width: 100%;
      height: 100px;
      flex-shrink: 0;
      overflow: auto;

      .card-wrap {
        padding: 20px 40px;
        color: #fff;
        border-radius: 10px;
        font-size: 13px;
        width: 255px;
        height: 100%;
        display: flex;
        justify-content: space-between;
        position: relative;
        flex-shrink: 0;
        flex-grow: 1;

        .info-wrap {
          display: flex;
          align-items: center;
          line-height: 33px;
          gap: 6px;
          margin-bottom: 6px;
          z-index: 2;
          position: relative;

          .num {
            font-size: 30px;
            display: inline-block;
            max-width: 185px;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }

        svg {
          width: 88px;
          height: 88px;
          position: absolute;
          right: 18px;
          bottom: 0;
          z-index: 1;
        }
      }
    }
  }
}
</style>
