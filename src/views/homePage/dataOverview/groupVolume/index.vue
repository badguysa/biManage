<template>
<div class="group-volume">
    <div class="header">
        <img src="@/assets/icons/data-arrow.png" alt="">
        <span>{{ t('overview.topicSet') }}</span>
        <div v-if="topicDataSet?.length > 8">
            <div class="hide-text" @click="infoExpand = false" v-if="infoExpand">{{ t('selfConfig.putUp') }}<img src="@/assets/icons/top-arraw-icon.png"/></div>
            <div class="hide-text" @click="infoExpand = true" v-else>{{ t('selfConfig.expand') }}<img src="@/assets/icons/down-arraw-icon.png"/></div>
        </div>
    </div>
    <div class="group-layout">
        <a-spin :spinning="overviewLoading.topicDataSetLoading">
        <div class="group-list">
            <emptyView v-if="!topicDataSet.length" />
            <template v-else>
                <div class="group-item" :style="{ width: locale === 'lo' ? '790px' : '385px' }" v-for="(item, index) in showTopicDateSet" :key="item.id">
                    <div class="group-info">
                        <div class="icon group-img">
                            <img :src="item.icon || fileImg" alt="icon"/>
                        </div>
                        <div class="icon group-total" v-if="item.subGroupList?.length"><span style="transform: scale(0.8);line-height: 16px;">{{ t('overview.total') }}</span></div>
                        <a-tooltip>
                            <template #title>{{ item.name }}</template>
                            <span class="name" :style="{ maxWidth: item.subGroupList?.length ? '60%' : '80%' }">{{ item.name }}</span>
                        </a-tooltip>
                        <div v-if="item.subGroupList?.length" class="check-child" @click="checkChildrenData(item, index)">{{ t('overview.checkChildren') }} <img src="@/assets/icons/check-more.png" /></div>
                    </div>
                    <div class="data-info">
                        <div class="table-size">
                            <div class="title">{{ t('overview.tableSize') }}</div>
                            <div class="value">
                                <a-tooltip>
                                    <template #title>
                                        {{ item.totalTables }}
                                    </template>
                                    <span class="total-data" :style="{ maxWidth: locale === 'lo' ? '170px' : '108px' }">{{ item.totalTables }}</span>
                                </a-tooltip>
                                <span class="size">{{ t('overview.number') }}</span>
                            </div>
                            <div class="unit">
                                <span>{{ t('overview.compareYesterday') }}</span>
                                <a-tooltip>
                                    <template #title>
                                        {{ item.incTotalTables }}
                                    </template>
                                    <span :style="{ maxWidth: locale === 'lo' ? '130px' : '37px' }" class="incr-num text-ellipsis">{{ item.incTotalTables }}</span>
                                </a-tooltip>
                                <img v-if="item.incTotalTables > 0" src="@/assets/icons/increase.png" />
                                <img v-if="item.incTotalTables < 0" src="@/assets/icons/decrease.png" />
                            </div>
                        </div>
                        <div class="data-size">
                            <div class="title">{{ t('overview.dataSize') }}</div>
                            <div class="value">
                                <a-tooltip>
                                    <template #title>
                                        {{ item.totalDatas }}
                                    </template>
                                    <span class="total-data" :style="{ maxWidth: locale === 'lo' ? '170px' : '108px' }">{{ item.totalDatas }}</span>
                                </a-tooltip>
                                <span class="size">{{ t('overview.piece') }}</span>
                            </div>
                            <div class="unit">
                                <span>{{ t('overview.compareYesterday') }}</span>
                                <a-tooltip>
                                    <template #title>
                                        {{ item.incTotalDatas }}
                                    </template>
                                    <span :style="{ maxWidth: locale === 'lo' ? '130px' : '43px' }" class="incr-num text-ellipsis">{{ item.incTotalDatas }}</span>
                                </a-tooltip>
                                <img v-if="item.incTotalDatas > 0" src="@/assets/icons/increase.png" />
                                <img v-if="item.incTotalDatas < 0" src="@/assets/icons/decrease.png" />
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </div>
        </a-spin>
    </div>
</div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import homeStore from '@/Stores/homeStore'
import { modalStore } from '@/Stores/modalStore'
import emptyView from '@/components/empty'
import fileImg from '@/assets/Iconlibrary/tubiaoku(18).png'
import { useI18n } from 'vue-i18n';
const { t, locale } = useI18n()
const useModalStore = modalStore()
const useHomeStore = homeStore()
const { topicDataSet, overviewLoading } = storeToRefs(useHomeStore)
const infoExpand = ref(true)
const showTopicDateSet = computed(() => {
    if (infoExpand.value) {
        return topicDataSet.value
    } else {
        return topicDataSet.value.slice(0, 8)
    }
})
onMounted(() => {
})
const checkChildrenData = (record, index) => {
    record.index = (index % 4) + 1
    useHomeStore.changeTempData(record)
    useModalStore.changeChildrenDataModalVisible()
}
</script>

<style lang="less" scoped>
.group-volume {
    border-radius: 4px;
    border: 1px solid #E9E9E9;
    padding: 20px;
    .text-ellipsis {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .header {
        color: rgba(0, 0, 0, 0.80);
        font-size: 16px;
        font-weight: 600;
        position: relative;
        img {
            width: 20px;
            height: 20px; 
            margin-right: 5px;
        }
        .hide-text {
            color: #2B67FF;
            font-size: 14px;
            font-style: normal;
            font-weight: 400;
            line-height: normal;
            position: absolute;
            right: 0;
            top: 0;
            img {
                width: 10px;
                height: 10px;
                margin-left: 4px;
            }
        }
        .hide-text:hover {
            cursor: pointer;
        }
    }
    .group-layout {
        margin: 20px 0;
        overflow: hidden;
        &:hover {
            overflow: auto;
        }
        .group-list {
            min-width: 1600px;
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
            .group-item {
                border-radius: 4px;
                width: 357px;
                height: 170px;
                padding: 20px;
            }
            .group-total {
                background: linear-gradient(140deg, #FF6404 0%, #FF9538 100%);
            }
            .group-item:nth-child(4n+1) {
                background: linear-gradient(180deg, #FFF2F3 0%, rgba(255, 242, 243, 0.00) 100%);
                .group-img {
                    background: linear-gradient(140deg, #F53646 0%, #FF6B4E 100%); 
                }
            }

            .group-item:nth-child(4n+2) {
                background: linear-gradient(180deg, #FFF7EB 0%, rgba(255, 247, 235, 0.00) 100%);
                .group-img {
                    background: linear-gradient(144deg, #FFA01B 0%, #FEC928 100%);
                }
            }

            .group-item:nth-child(4n+3) {  
                background: linear-gradient(180deg, #EBF2FF 0%, rgba(235, 242, 255, 0.00) 100%);
                .group-img {
                    background: linear-gradient(140deg, #356FFF 0%, #61AAFF 100%);
                }
            }

            .group-item:nth-child(4n+4) {
                background: linear-gradient(180deg, #E8FCF7 0%, rgba(235, 255, 250, 0.00) 100%);
                .group-img {
                    background: linear-gradient(140deg, #00C792 0%, #36D9B8 100%);
                }
            }
            .blue-gradient {
                background: linear-gradient(140deg, #356FFF 0%, #61AAFF 100%);
            }
            .purple-gradient {
                background: linear-gradient(144deg, #6257FF 0%, #8490FF 100%);
            }
            .green-gradient {
                background: linear-gradient(140deg, #00C792 0%, #36D9B8 100%);
            }
            .orange-gradient {
                background: linear-gradient(140deg, #FF6404 0%, #FF9538 100%);
            }
            .group-info {
                height: 20px;
                display: flex;
                align-items: center; 
                position: relative;
                .check-child {
                    position: absolute;
                    right: 0;
                    top: 50%;
                    transform: translateY(-50%);
                    height: 100%;
                    display: flex;
                    align-items: center;
                    color: #2B67FF;
                    font-size: 14px;
                    font-weight: 400;
                    line-height: normal;
                    img {
                        width: 12px;
                        height: 12px;
                        margin-left: 4px;
                    }
                }
                .check-child:hover {
                    cursor: pointer;
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
                    img {
                        width: 12px;
                        height: 12px;
                    }
                }
                .name {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            }
            .data-info {
                margin-top: 20px;
                display: flex;
            }
            .table-size, .data-size {
                flex: 1;
                padding: 0 26px;
                .title {
                    color: rgba(0, 0, 0, 0.80);
                    font-size: 14px;
                    font-weight: 600;
                    line-height: 1;
                }
                .total-data {
                    overflow: hidden;
                    max-width: 108px;
                    display: inline-block;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                .value {
                    color: rgba(0, 0, 0, 0.80);
                    font-size: 28px;
                    font-weight: 700;
                    font-family: D-DIN;
                    margin: 10px 0;
                    line-height: 1;
                    display: flex;
                    align-items: center;
                    .size {
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
                    display: flex;
                    align-items: center;
                    .incr-num {
                        margin-left: 2px;
                    }
                    img {
                        width: 12px;
                        height: 12px;
                        margin-left: 6px;
                    }
                }
            }
        }
    }
    .group-layout::-webkit-scrollbar-thumb {
        background-color:transparent;
    }
    .group-layout:hover::-webkit-scrollbar-thumb {
        background-color: #dadfe5;
    }
}
</style>