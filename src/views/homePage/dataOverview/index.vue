<template>
<div class="data-overview">
<div class="header">
    <div>
        {{ t('overview.lastUpdateTime') }} {{ lastBoardTask.time || '-' }}
        <span @click="refresh" class="refresh"><img src="@/assets/icons/refresh.png" alt="">
            {{ refreshing ? t('indexPage.loading') : t('overview.refresh') }}
        </span>
        <a-date-picker 
            :locale="locale === 'lo' ? Lo : zhCN"
            format="YYYY-MM-DD"
            @change="dateChange"
            style="width: 160px;"
        />
    </div>
</div>
<div class="container">
    <dataVolume />
    <tableVolume />
    <collectionVolume />
    <standardVolume />
</div>
</div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import dataVolume from './dataVolume';
import tableVolume from './groupVolume'
import collectionVolume from './collectionVolume'
import standardVolume from './standardVolume'
import homeStore from '@/Stores/homeStore';
import { refreshDataBoard } from '@/apis/board';
import { message } from 'ant-design-vue';
import { storeToRefs } from 'pinia';
import dayjs from 'dayjs';
import { useI18n } from 'vue-i18n';
import Lo from '@/locale/lang/lo-datepicker'
import zhCN from 'ant-design-vue/es/date-picker/locale/zh_CN';
const useHomeStore = homeStore()
const { lastBoardTask } = storeToRefs(useHomeStore)
const { locale, t } = useI18n()
const dateValue = ref('')
const refreshing = ref(false)

onMounted(() => {
    useHomeStore.getBoardData()
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
    dateValue.value = b.split('-').join('')
    initBoardData()
}
const refresh = () => {
    if(refreshing.value) return
    
    const hide = message.loading(t('overview.loadingData'), 0)
    refreshing.value = true
    refreshDataBoard().then(res => {
        refreshing.value = false
        if (res.code === 1) {
            useHomeStore.getBoardData()
        } else {
            message.error(res.message)
        }
        hide()
    })
}
const initBoardData = () => {
    useHomeStore.getTop5Data({
        dateValue: dateValue.value
    })
    useHomeStore.getTodayData({
        dateValue: dateValue.value
    })
    useHomeStore.getTopicDataSet({
        dateValue: dateValue.value
    })
    useHomeStore.getCollectionRunningData({
        dateValue: dateValue.value
    })
    useHomeStore.getstandardRunningData()
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
        justify-content: flex-end;
        color: rgba(0, 0, 0, 0.60);
        font-size: 14px;
        font-weight: 400;
        margin-bottom: 12px;
        &>div{
            display: flex;
            align-items: center;
        }
        .refresh {
            color: #2B67FF;
            margin: 0 20px;
            display: flex;
            align-items: center;
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
        height: calc(100% - 44px);
        padding: 20px;
        padding-top: 0;
        overflow: hidden auto;
    }
}
</style>