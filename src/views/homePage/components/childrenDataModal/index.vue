<template>
<myModal
    :modal-name="tempData?.name"
    :showBottom="false"
    width="840px"
    @onCancel="onCancel"
>
    <template #modal-body>
        <div class="chlidrenDataModal">
            <div :class="['parent-node', `back${tempData.index}`]">
                <div class="data-header">
                    <div :style="{width: locale === 'lo' ? '35px' : '16px'}" class="icon orange-gradient"><span style="transform: scale(0.8);line-height: 16px;">{{ t('overview.parent') }}</span></div>
                    <div class="data-name">{{ tempData?.name }}</div>
                </div>
                <div class="data-body">
                    <div class="data-item">
                        <div class="data-title">{{ t('overview.tableSize') }}</div>
                        <div class="data-size">
                            {{ parentTables || 0 }}
                            <span class="data-unit">{{ t('overview.number') }}</span>
                        </div>
                        <div class="data-subtitle">
                            <span>{{ t('overview.compareYesterday') }} {{ tempData?.incTotalTables || 0 }} </span>
                            <img v-if="tempData?.incTotalTables > 0" src="@/assets/icons/increase.png" /> 
                            <img v-if="tempData?.incTotalTables < 0" src="@/assets/icons/decrease.png" /> 
                        </div>
                    </div>
                    <div class="data-item">
                        <div class="data-title">{{ t('overview.dataSize') }}</div>
                        <div class="data-size">
                            {{ parentDatas }}
                            <span class="data-unit">{{ t('overview.piece') }}</span>
                        </div>
                        <div class="data-subtitle">
                            <span>{{ t('overview.compareYesterday') }} {{ tempData?.incTotalDatas }} </span>
                            <img v-if="tempData?.incTotalDatas > 0" src="@/assets/icons/increase.png" /> 
                            <img v-if="tempData?.incTotalDatas < 0" src="@/assets/icons/decrease.png" /> 
                        </div>
                    </div>
                </div>
            </div>
            <div class="child-body">
                <div class="child-node" v-for="item in tempData?.subGroupList" :key="item.id">
                    <div class="data-header">
                        <div :style="{width: locale === 'lo' ? '35px' : '16px'}" class="icon gray-gradient"><span style="transform: scale(0.8);line-height: 16px;">{{ t('overview.child') }}</span></div>
                        <div class="data-name">{{ item?.name }}</div>
                    </div>
                    <div class="data-body">
                        <div class="data-item">
                            <div class="data-title">{{ t('overview.tableSize') }}</div>
                            <div class="data-size">
                                <div class="value">
                                    <a-tooltip>
                                        <template #title>
                                            {{ item.totalTables }}
                                        </template>
                                        <span class="total-data">{{ item.totalTables }}</span>
                                    </a-tooltip>
                                    <span class="data-unit">{{ t('overview.number') }}</span>
                                </div>
                            </div>
                            <div class="data-subtitle">
                                <span>{{ t('overview.compareYesterday') }}</span>
                                <a-tooltip>
                                    <template #title>
                                        {{ item.incTotalTables }}
                                    </template>
                                    <span style="max-width: 37px;" class="incr-num text-ellipsis">{{ item.incTotalTables }}</span>
                                </a-tooltip>
                                <img v-if="item?.incTotalDatas > 0" src="@/assets/icons/increase.png" /> 
                                <img v-if="item?.incTotalDatas < 0" src="@/assets/icons/decrease.png" /> 
                            </div>
                        </div>
                        <div class="data-item">
                            <div class="data-title">{{ t('overview.dataSize') }}</div>
                            <div class="data-size">
                                <div class="value">
                                    <a-tooltip>
                                        <template #title>
                                            {{ item.totalDatas }}
                                        </template>
                                        <span class="total-data">{{ item.totalDatas }}</span>
                                    </a-tooltip>
                                    <span class="data-unit">{{ t('overview.piece') }}</span>
                                </div>
                            </div>
                            <div class="data-subtitle">
                                <span>{{ t('overview.compareYesterday') }}</span>
                                <a-tooltip>
                                    <template #title>
                                        {{ item.incTotalDatas }}
                                    </template>
                                    <span style="max-width: 43px;" class="incr-num text-ellipsis">{{ item.incTotalDatas }}</span>
                                </a-tooltip>
                                <img v-if="item?.incTotalDatas > 0" src="@/assets/icons/increase.png" /> 
                                <img v-if="item?.incTotalDatas < 0" src="@/assets/icons/decrease.png" /> 
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </template>
</myModal>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import myModal from '@/components/myModal';
import { modalStore } from '@/Stores/modalStore'
import homeStore from '@/Stores/homeStore'
import { useI18n } from 'vue-i18n'
const { t, locale } = useI18n()
const useHomeStore = homeStore()
const useModalStore = modalStore()
const { tempData } = storeToRefs(useHomeStore)
const parentTables = ref(0)
const parentDatas = ref(0)
onMounted(() => {
    let childTables = 0
    let childDatas = 0
    tempData.value?.subGroupList.forEach(item => {
        childTables += Number(item.totalTables)
        childDatas += Number(item.totalDatas)
    })
    const { totalDatas, totalTables } = tempData.value
    parentTables.value = Number(totalTables) - childTables
    parentDatas.value = Number(totalDatas) - childDatas
})
onUnmounted(() => {
    // useHomeStore.changeTempData(null)
})
const onCancel = () => {
    useModalStore.changeChildrenDataModalVisible()
}
</script>

<style lang="less" scoped>
.chlidrenDataModal {
    height: 547px;
    width: 840px;
    overflow-y: auto;
    padding: 20px;
    .back1 {
        background: linear-gradient(180deg, #FFF2F3 0%, rgba(255, 242, 243, 0.00) 100%);
        .group-img {
            background: linear-gradient(140deg, #F53646 0%, #FF6B4E 100%); 
        }
    }

    .back2 {
        background: linear-gradient(180deg, #FFF7EB 0%, rgba(255, 247, 235, 0.00) 100%);
        .group-img {
            background: linear-gradient(144deg, #FFA01B 0%, #FEC928 100%);
        }
    }

    .back3 {  
        background: linear-gradient(180deg, #EBF2FF 0%, rgba(235, 242, 255, 0.00) 100%);
        .group-img {
            background: linear-gradient(140deg, #356FFF 0%, #61AAFF 100%);
        }
    }

    .back4 {
        background: linear-gradient(180deg, #E8FCF7 0%, rgba(235, 255, 250, 0.00) 100%);
        .group-img {
            background: linear-gradient(140deg, #00C792 0%, #36D9B8 100%);
        }
    }
    .total-data {
        overflow: hidden;
        max-width: 108px;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin-right: 4px;
        display: inline-block;
    }
    .text-ellipsis {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .parent-node {
        width: 100%;
        height: 170px;
        padding: 20px;
        border-radius: 4px;
        margin-bottom: 20px;
    }
    .child-body {
        width: 100%;
        display: flex;
        gap: 20px;
        flex-wrap: wrap;
        .child-node {
            width: 385px;
            height: 170px;
            padding: 20px;
            border-radius: 4px;
            background: linear-gradient(180deg, #F7F8FA 0%, rgba(241, 241, 241, 0.00) 100%);
        }
    }
    .data-header {
        height: 20px;
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 20px ;
    }
    .data-name {
        color: var(--text-color-primary, rgba(0, 0, 0, 0.80));
        font-variant-numeric: lining-nums tabular-nums;
        text-overflow: ellipsis;
        font-size: 14px;
        font-style: normal;
        font-weight: 600;
        line-height: normal;
        max-width: 80%;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
    .data-body {
        display: flex;
    }
    .incr-num {
        margin-left: 2px;
    }
    .data-item {
        flex: 1;
        padding: 0 26px;
        .data-title {
            color: rgba(0, 0, 0, 0.80);
            font-family: PingFang SC;
            font-size: 14px;
            font-style: normal;
            font-weight: 500;
            line-height: normal;
        }
        .data-size {
            color: rgba(0, 0, 0, 0.80);
            font-family: D-DIN;
            font-size: 28px;
            font-style: normal;
            font-weight: 700;
            margin: 10px 0;
            line-height: normal;
        }
        .value {
            display: flex;
            align-items: center;
        }
        .data-unit {
            color: rgba(0, 0, 0, 0.80);
            font-family: PingFang SC;
            font-size: 14px;
            font-style: normal;
            font-weight: 500;
            line-height: normal;
        }
        .data-subtitle {
            color: rgba(0, 0, 0, 0.60);
            font-family: PingFang SC;
            font-size: 14px;
            font-style: normal;
            font-weight: 400;
            line-height: normal;
            display: flex;
            align-items: center;
            img {
                width: 12px;
                margin-left: 6px;
            }
        }
    }
    .orange-gradient {
        background: linear-gradient(136deg, #FE9F00 0%, #FEB200 100%);
    }
    .gray-gradient {
        background: linear-gradient(140deg, #9DA0A5 0%, #B6BABF 100%);
    }
    .icon {
        display: flex;
        width: 16px;
        height: 16px;
        justify-content: center;
        align-items: center;
        border-radius: 3px;
        margin-right: 12px;
        font-size: 10px;
        font-style: 1;
        font-weight: 600;
        color: #FFF;
    }
}
</style>