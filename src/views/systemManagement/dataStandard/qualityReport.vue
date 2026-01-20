<script setup>
import reportDetail from './reportDetail.vue'
import Lo from '@/locale/lang/lo-datepicker'
import zhCN from 'ant-design-vue/es/date-picker/locale/zh_CN'
import { getAllStandradReport } from '@/apis/dataStandard'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import useScrollBottom from '@/hooks/common/useScrollBottom'

const { locale } = useI18n()

const detailState = reactive({
  show: false,
  reportId: '',
  reportName: '',
  dateTime: dayjs()
})

const params = reactive({
  current: 1,
  searchVal: '',
  size: 20,
  total: 0
})

const isExport = ref(false)

const reportList = reactive({
  global: [{
    id: '',
    name: '全平台质量报告'
  }],
  standard: []
})

onMounted(() => {
  getReportListInfo()
})

// 获取 标准库质量报告
const getReportListInfo = () => {
  getAllStandradReport({
    pageNum: params.current,
    pageSize: params.size,
  }).then(res => {
    if (res.code !== 1) return message.error(res.message)
    params.total = Number(res.data.total)
    reportList.standard.push(...res.data.records)
  })
}

const datTimeStr = computed(() => detailState.dateTime.format('YYYY.MM.DD'))

provide('STANDARD_REPORT_DETAIL', detailState)


// 触底加载
useScrollBottom('.report-container', removeScroll => {
  // console.log('bottom...')
  // 数据加载完毕
  if (reportList.standard.length >= params.total) {
    removeScroll()
    return
  }
  params.current += 1
  getReportListInfo()
})

const viewDetail = item => {
  detailState.show = true
  detailState.reportId = item.id
}

const downloadReport = async (item) => {
  isExport.value = true
  detailState.reportId = item.id
  detailState.reportName = item.name
}

const completeFn = () => {
  message.success('导出成功')
  isExport.value = false
}

</script>

<template>
  <div v-show="!detailState.show" class="main-wrap">
    <div class="top">
      <div class="title">质量报告</div>
      <div class="right-area">
        <span>仅保留近90天记录</span>
        <a-date-picker v-model:value="detailState.dateTime" :locale="locale === 'lo' ? Lo : zhCN" format="YYYY-MM-DD"
          style="width: 160px" />
      </div>
    </div>
    <div class="report-container">
      <div class="report-wrap" v-for="(list, key) in reportList">
        <span class="report-title">{{ key === 'global' ? '全局质量报告' : '标准库质量报告' }}</span>
        <div class="report-list">
          <div :class="['report-item', key === 'global' ? 'gobal-item' : 'standard-item']" v-for="r in list">
            <div class="info">
              <span class="name" :title="r.name">{{ r.name }}</span>
              <span class="time">{{ datTimeStr }}</span>
            </div>
            <div class="btn-wrap">
              <span class="download-btn" @click="downloadReport(r)">下载报告</span>
              <span class="view-detail" @click="viewDetail(r)">查看详情</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <reportDetail v-if="detailState.show" @back="detailState.show = false" />

  <!-- 导出pdf使用 -->
  <reportDetail v-if="isExport" needExport @exportComplelte="completeFn"/>
</template>

<style lang="less" scoped>
.main-wrap {
  background-color: #fff;
  height: calc(100% - 36px);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 40px;

  .top {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title {
      font-size: 18px;
      color: #000000cc;
      font-weight: 600;
    }

    .right-area {
      &>span {
        color: #00000099;
        font-size: 14px;
        margin-right: 20px;
      }
    }
  }

  .report-container {
    overflow: auto;
    height: calc(100% - 32px);
    display: flex;
    flex-direction: column;
    gap: 40px;

    .report-wrap {
      display: flex;
      flex-direction: column;
      gap: 16px;

      .report-title {
        font-size: 16px;
        color: #000000cc;
        font-weight: 600;
      }

      .report-list {
        display: flex;
        flex-wrap: wrap;
        gap: 40px;

        .report-item {
          width: 198px;
          height: 250px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          color: #fff;
          background-size: 100%;
          filter: drop-shadow(0.816326px 4.89796px 16.3265px rgba(0, 0, 0, 0.12));
          padding: 24px;

          &.gobal-item {
            background-image: url(@/assets/images/green-book-cover.png);
          }

          &.standard-item {
            background-image: url(@/assets/images/blue-book-cover.png);
          }

          .info {
            width: 100%;
            height: 130px;
            display: flex;
            gap: 8px;
            flex-direction: column;
            align-items: flex-start;

            .name {
              font-size: 16px;
              font-weight: 600;
              display: -webkit-box;
              -webkit-line-clamp: 3;
              /* 限制显示的行数 */
              -webkit-box-orient: vertical;
              overflow: hidden;
              text-overflow: ellipsis;
            }

            .time {
              font-size: 14px;
              font-weight: 500;
              color: #ffffff80;
            }
          }

          .btn-wrap {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 14px;

            &>span {
              cursor: pointer;
            }

            .download-btn {
              width: 126px;
              height: 32px;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              background-color: #ffffff4d;
              border: 1px solid;
              border-image-source: linear-gradient(180deg,
                  rgba(255, 255, 255, 0.5) 0%,
                  rgba(255, 255, 255, 0) 100%);
              border-radius: 4px;
            }

            .view-detail {
              font-size: 14px;
            }
          }
        }
      }
    }
  }
}
</style>
