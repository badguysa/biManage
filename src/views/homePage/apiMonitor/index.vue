<template>
    <div class="data-overview">
        <a-spin :spinning="apiMonitorRefreshLoading">
            <div class="header">
                <div class="sub-header">
                    <img class="data-arrow" src="@/assets/icons/data-arrow.png" />
                    <div class="title">{{ t('overview.todayRunMonitor') }}</div>
                </div>
                <div>
                    {{ t('overview.lastUpdateTime') }} {{ lastApiMonitorTask.time || '-' }}
                    <span @click="refresh" class="refresh"><img src="@/assets/icons/reload.png" alt="">{{
                        t('overview.refresh') }}</span>
                    <a-date-picker :locale="locale === 'lo' ? Lo : zhCN" format="YYYY-MM-DD" @change="dateChange"
                        style="width: 160px;" />
                </div>
            </div>
            <div class="container">
                <runMonitor />
                <echartsVolume />
                <top5Volume />
            </div>
        </a-spin>
    </div>
</template>
<script setup>
import { onMounted, ref } from 'vue';
import homeStore from '@/Stores/homeStore';
import runMonitor from './runMonitor/index'
import echartsVolume from './echartsVolume/index'
import top5Volume from './top5Volume/index'
import { refreshApiDataBoard } from '@/apis/board';
import { message } from 'ant-design-vue';
import { storeToRefs } from 'pinia';
import dayjs from 'dayjs';
import { useI18n } from 'vue-i18n';
import Lo from '@/locale/lang/lo-datepicker'
import zhCN from 'ant-design-vue/es/date-picker/locale/zh_CN';
const useHomeStore = homeStore()
const { lastApiMonitorTask, apiMonitorRefreshLoading } = storeToRefs(useHomeStore)
const { locale, t } = useI18n()
const dateValue = ref('')
onMounted(() => {
    useHomeStore.changeApiMonitorRefreshLoading(true)
    useHomeStore.getApiMonitorData()
    datePickerLocal()
})
const datePickerLocal = async () => {
    if (locale.value === 'lo') {
        const lo = await import('dayjs/locale/lo');
        dayjs.locale(lo)
    } else {
        const zh = await import('dayjs/locale/zh-cn');
        dayjs.locale(zh)
    }
}
const dateChange = (a, b) => {
    useHomeStore.changeApiMonitorRefreshLoading(true)
    dateValue.value = b.split('-').join('')
    useHomeStore.changeApiDateValue(dateValue.value)
    initBoardData()
}
const refresh = () => {
    const hide = message.loading(t('overview.loadingData'), 2)
    refreshApiDataBoard().then(res => {
        if (res.code === 1) {
            useHomeStore.getApiMonitorData()
        } else {
            message.error(res.message)
        }
        hide()
    })
}
const initBoardData = () => {
    useHomeStore.getAvgRtTop5({
        dateValue: dateValue.value
    })
    useHomeStore.getApiFailCntTop5({
        dateValue: dateValue.value
    })
    useHomeStore.getApiTop5DataSet({
        dateValue: dateValue.value
    })
    // useHomeStore.getLastBoardTask()
    useHomeStore.getApiRunInfo({
        dateValue: dateValue.value
    })
    useHomeStore.getInApiInfo({
        dateValue: dateValue.value
    })
}
</script>
<style lang="less" scoped>
.data-overview {
    width: 100%;
    height: calc(100% - 36px);
    background-color: #fff;
    padding-top: 12px;

    :deep(.ant-spin-nested-loading) {
        height: 100%;

        .ant-spin-container {
            height: 100%;
        }
    }

    .header {
        padding: 0 20px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        color: rgba(0, 0, 0, 0.60);
        font-size: 14px;
        font-weight: 400;
        // margin-bottom: 12px;

        .sub-header {
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

        .refresh {
            color: #2B67FF;
            margin: 0 20px;

            img {
                width: 14px;
                height: 14px;
                margin-right: 4px;
            }
        }

        .refresh:hover {
            cursor: pointer;
        }
    }

    .container {
        height: calc(100% - 32px);
        padding: 20px;
        padding-top: 0;
        overflow: hidden auto;
    }
}
</style>