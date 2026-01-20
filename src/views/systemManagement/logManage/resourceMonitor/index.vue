<template>
    <div class="manageWrapper">
        <a-spin :spinning="logMonitorRefreshLoading">
            <div class="topContainer">
                <div class="leftContent">
                    <span class="selectLabel">集群</span>
                    <a-select
                        v-model:value="chooseMachine"
                        class="selectOptions"
                        :options="nodeOptions"
                        @change="handleChange"
                    >
                        <template #suffixIcon><BiIcon name="dropDown" color="#ACB4BF" class="svgIcon"/></template>
                    </a-select>
                </div>
                <div class="rightContent">
                    <span @click="refresh" class="refresh"><img src="@/assets/icons/reload.png" alt="">{{ t('overview.refresh') }}</span>
                    <a-date-picker :locale="locale === 'lo' ? Lo : zhCN" format="YYYY-MM-DD" @change="dateChange" style="width: 160px;" />
                </div>
            </div>
            <div class="mainContainer">
                <nodeUsageRate></nodeUsageRate>
                <nodeLoad></nodeLoad>
            </div>
        </a-spin>
    </div>
</template>
<script setup>
import dayjs from 'dayjs';
import { useI18n } from 'vue-i18n';
import Lo from '@/locale/lang/lo-datepicker'
import zhCN from 'ant-design-vue/es/date-picker/locale/zh_CN';
import { message } from 'ant-design-vue';
import { storeToRefs } from 'pinia';
import { systemManageStore } from '@/Stores/systemManageStore';
import nodeUsageRate from './nodeUsageRate/index.vue'
import nodeLoad from './nodeLoad/index.vue'

const { locale, t } = useI18n()

const useSystemManageStore = systemManageStore()
const { logMonitorRefreshLoading, chooseMachine, nodeOptions } = storeToRefs(useSystemManageStore)

onMounted(() => {
    useSystemManageStore.changeLogMonitorRefreshLoading(true)
    useSystemManageStore.getLogMonitorData()
    useSystemManageStore.getTrendData()
    datePickerLocal()
})

const handleChange = (value) => {
    useSystemManageStore.setChooseMachine(value)
    useSystemManageStore.getLogMonitorData(false)
};

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
    useSystemManageStore.changeLogDateValue(b)
    refresh()
}

const refresh = () => {
    useSystemManageStore.changeLogMonitorRefreshLoading(true)
    useSystemManageStore.getLogMonitorData(false)
    useSystemManageStore.getTrendData()
}

onUnmounted(()=>{
    useSystemManageStore.resetMonitorData()
})
</script>
<style lang="less" scoped>
.manageWrapper {
    width: 100%;
    height: calc(100% - 36px);
    overflow: auto;
    display: flex;
    flex-direction: column;
    position: relative;
    .topContainer{
        background-color: #fff;
        padding: 20px;
        border-radius: 0 4px 4px 4px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        .leftContent{
            display: flex;
            align-items: center;
            .selectLabel{
                font-size: 14px;
                font-weight: 400;
                color: #000000;
                margin-right: 12px;
            }
            .selectOptions{
                width: 240px;
                height: 34px;
                color: #131B26;
                font-size: 14px;
                border-radius: 4px;
                border: 1px solid #D4D6D9;
                .svgIcon{
                    width: 12px;
                    height: 12px;
                }
            }
            :deep(.ant-select-selector){
                background-color: white !important;
            }
        }
        .rightContent{
            display: flex;
            align-items: center;
            font-size: 14px;
            .refresh{
                margin: 0 20px;
                cursor: pointer;
                color: #2B67FF;
                img {
                    width: 14px;
                    height: 14px;
                    margin-right: 4px;
                }
            }
            :deep(.ant-picker){
                background-color: white;
            }
        }
    }
    .mainContainer{
        overflow: hidden auto;
    }
}
</style>