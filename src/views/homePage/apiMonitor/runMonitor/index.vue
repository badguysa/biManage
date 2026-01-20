<template>
  <div class="runMonitor">

    <div class="runMonitor_item apiCalledTotal">
      <div class="item_right">
        <div class="item_count">
          <!-- <a-tooltip>
            <template #title>1335</template> -->
          <span class="num">{{ apiRunInfo?.outTotalReqCount || 0 }}</span>
          <!-- </a-tooltip> -->
          <span class="unit">{{ t('overview.times') }}</span>
        </div>
        <div class="item_name">{{ t('overview.apiCalledTotal') }}</div>
      </div>
      <div class="item_img">
        <img src="@/assets/images/monitor_run.png" alt="">
      </div>
      <tips tipsType="totalCallNum"/>
    </div>
    <div class="runMonitor_item outflowApiTotal">
      <div class="item_right">
        <div class="item_count">
          <!-- <a-tooltip>
            <template #title>1335</template> -->
          <span class="num">{{ apiRunInfo?.outTotalCount || 0 }}</span>
          <!-- </a-tooltip> -->
          <span class="unit">{{ t('overview.times') }}</span>
        </div>
        <div class="item_name">{{ t('overview.outflowApiTotal') }}</div>
      </div>
      <div class="item_img">
        <img src="@/assets/images/monitor_export.png" alt="">
      </div>
      <tips tipsType="createAPINum"/>
    </div>
    <div class="runMonitor_item inflowApiErrorTotal">
      <div class="item_right">
        <div class="item_count">
          <!-- <a-tooltip>
            <template #title>1335</template> -->
          <span class="num">{{ apiRunInfo?.inExcCount || 0 }}</span>
          <!-- </a-tooltip> -->
          <span class="unit">{{ t('overview.times') }}</span>
        </div>
        <div class="item_name">{{ t('overview.inflowApiErrorTotal') }}</div>
      </div>
      <div class="item_img">
        <img src="@/assets/images/monitor_waring.png" alt="">
      </div>
      <tips tipsType="importAPIExecptionNum"/>
    </div>
    <div class="runMonitor_item outflowApiErrorTotal">
      <div class="item_right">
        <div class="item_count">
          <!-- <a-tooltip>
            <template #title>1335</template> -->
          <span class="num">{{ apiRunInfo?.outExcCount || 0 }}</span>
          <!-- </a-tooltip> -->
          <span class="unit">{{ t('overview.times') }}</span>
        </div>
        <div class="item_name">{{ t('overview.outflowApiErrorTotal') }}</div>
      </div>
      <div class="item_img">
        <img src="@/assets/images/monitor_danger.png" alt="">
      </div>
      <tips tipsType="callExecptionNum" tipsPlacement="topLeft"/>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import homeStore from '@/Stores/homeStore';
import { storeToRefs } from 'pinia';
import tips from '@/components/tips'

const useHomeStore = homeStore()
const { apiRunInfo } = storeToRefs(useHomeStore)
const { locale, t } = useI18n()
</script>

<style lang="less" scoped>
.runMonitor {
  display: flex;
  height: 110px;
  gap: 20px;
  margin: 20px 0;
  overflow: hidden;
  &:hover {
    overflow: auto;
  }
  /* 不换行显示子项 */
  .runMonitor_item {
    width: 397px;
    height: 100%;
    padding: 0px 40px;
    align-items: center;
    border-radius: 10px;
    flex-shrink: 0;
    display: flex;
    position: relative;

    .item_right {
      .item_count {
        .num {
          color: #FFF;
          font-variant-numeric: lining-nums tabular-nums;
          font-size: 30px;
          font-style: normal;
          font-weight: 400;
          line-height: normal;
          // overflow: hidden;
          // max-width: 135px;
          // display: inline-block;
          // text-overflow: ellipsis;
          // white-space: nowrap;
        }

        .unit {
          padding-left: 10px;
          color: #FFF;
          font-size: 13px;
          font-style: normal;
          font-weight: 400;
          line-height: normal;
        }
      }

      .item_name {
        margin-top: 8px;
        color: #FFF;
        font-size: 13px;
        font-style: normal;
        font-weight: 400;
        line-height: normal;
      }
    }

    .item_img {
      position: absolute;
      right: 20px;
      bottom: 0;

      img {
        width: 88px;
      }
    }
  }

  .apiCalledTotal {
    background: linear-gradient(140deg, #356FFF 0%, #61AAFF 100%);
  }

  .outflowApiTotal {
    background: linear-gradient(144deg, #6257FF 0%, #8490FF 100%);
  }

  .inflowApiErrorTotal {
    background: linear-gradient(140deg, #FF6404 0%, #FF9538 100%);
  }

  .outflowApiErrorTotal {
    background: linear-gradient(136deg, #FE9F00 0%, #FEB200 100%);
  }
}

.runMonitor::-webkit-scrollbar-thumb {
  background-color: transparent;
}

.runMonitor:hover::-webkit-scrollbar-thumb {
  background-color: #dadfe5;
}
</style>