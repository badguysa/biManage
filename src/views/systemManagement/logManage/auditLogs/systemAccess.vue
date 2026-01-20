<template>
    <a-spin :spinning="systemAccessLoading">
    <div class="tableWrapper">
        <div class="tableBox">
            <table class="tableContainer">
                <tr>
                    <td class="column-5">{{ t('logManage.index') }}</td>
                    <td class="column-average">{{ t('logManage.time') }}</td>
                    <td class="column-average">
                        <a-dropdown class="statu_dropdown">
                            <a class="status_text" @click.prevent>
                                {{ t('logManage.description') }}
                                <img src="@/assets/icons/blue_arrow.png" alt="">
                            </a>
                            <template #overlay>
                                <a-menu class="statu_dropdown">
                                    <a-menu-item v-for="item in descriptionList" :key="item.value" @click="filterData(item, 0)">
                                        <img v-if="item.isSelect && filterNumber[0] > 1" src="@/assets/icons/is_select.png" alt="">
                                        <img v-else-if="item.isSelect && filterNumber[0] === 1" src="@/assets/icons/disabled_select.png" alt="">
                                        <img v-else src="@/assets/icons/not_select.png" alt="">
                                        <span>{{ t(item.label) }}</span>
                                    </a-menu-item>
                                </a-menu>
                            </template>
                        </a-dropdown>
                    </td>
                    <td class="column-average">
                        <a-dropdown class="statu_dropdown">
                            <a class="status_text" @click.prevent>
                                {{ t('logManage.result') }}
                                <img src="@/assets/icons/blue_arrow.png" alt="">
                            </a>
                            <template #overlay>
                                <a-menu class="statu_dropdown">
                                    <a-menu-item v-for="item in resultList" :key="item.value" @click="filterData(item, 1)">
                                        <img v-if="item.isSelect && filterNumber[1] > 1" src="@/assets/icons/is_select.png" alt="">
                                        <img v-else-if="item.isSelect && filterNumber[1] === 1" src="@/assets/icons/disabled_select.png" alt="">
                                        <img v-else src="@/assets/icons/not_select.png" alt="">
                                        <span>{{ t(item.label) }}</span>
                                    </a-menu-item>
                                </a-menu>
                            </template>
                        </a-dropdown>
                    </td>
                    <td class="column-average">{{ t('logManage.operator') }}</td>
                    <td class="column-average">{{ t('logManage.operatorIP') }}</td>
                    <td class="column-15">{{ t('logManage.operatingSystem') }}</td>
                    <td class="column-average">{{ t('logManage.operationBrowser') }}</td>
                </tr>
                <template v-if="systemAccessList.length">
                    <tr v-for="(item,index) in systemAccessList" :key="item.id">
                        <td><div :title="computeIndex(index) || '-'">{{ computeIndex(index) }}</div></td>
                        <td><div :title="formatTimeToSecond(item.createTime).slice(0, -3) || '-'">{{ formatTimeToSecond(item.createTime).slice(0, -3) }}</div></td>
                        <td>
                            <div>
                                {{ item.action ? t('logManage.login') : t('logManage.logout') }}
                            </div>
                        </td>
                        <td>
                            <div :style="({color: item.status ? '#00B42A' : '#F53F3F'})">
                                {{ item.status ? t('logManage.success') : t('logManage.fail') }}
                            </div>
                        </td>
                        <td><div :title="item.uname || '-'">{{ item.uname }}</div></td>
                        <td><div :title="item.ip || '-'">{{ item.ip }}</div></td>
                        <td><div :title="item.os || '-'">{{ item.os }}</div></td>
                        <td><div :title="item.browser || '-'">{{ item.browser }}</div></td>
                    </tr>
                </template>
            </table>
        </div>
    </div>
    </a-spin>
    <div class="noData" v-if="!systemAccessList.length && !systemAccessLoading">
        <img src="@/assets/images/img_null.png" alt="" />
        <p>{{ (accessConfig.perMgrAuth && accessConfig.perMgrAuth.read == 0) ? t('common.noAuth') : t('common.noData') }}</p>
    </div>
    <div class="page" v-if="systemAccessListTotal > 12">
        <a-pagination 
            v-model:current="systemAccessPageNumber" 
            :total="systemAccessListTotal"
            :pageSize="12"
            show-less-items 
            @change="pageChange"
        />
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia';
import { mainStore } from '@/Stores/mainStore';
import { systemManageStore } from '@/Stores/systemManageStore';
import { formatTimeToSecond } from '@/utils/utils'
import { message } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n()
const useMainStore = mainStore()
const { accessConfig } = storeToRefs(useMainStore)
const useSystemManageStore = systemManageStore()
const { descriptionList, resultList, systemAccessLoading, systemAccessList, systemAccessPageNumber, logAuditDateValue, systemAccessListTotal } = storeToRefs(useSystemManageStore)

watch(() => logAuditDateValue.value, () => {
    useSystemManageStore.initSystemAccessList()
})
const filterNumber = computed(() => {
    return [
        descriptionList.value.filter(i => i.isSelect).length,
        resultList.value.filter(i => i.isSelect).length,
    ]
})
const computeIndex = (index)=> {
    return (systemAccessPageNumber.value - 1) * 12 + index + 1;
}
const filterData = (record, type) => {
    record.isSelect = !record.isSelect
    if (!record.isSelect) {
        switch(type){
            case 0:
                if (!descriptionList.value.filter(item => item.isSelect).length) {
                    record.isSelect = true
                    return
                }
                break;
            case 1:
                if (!resultList.value.filter(item => item.isSelect).length) {
                    record.isSelect = true
                    return
                }
                break;
        }
    }
    useSystemManageStore.initSystemAccessList()   
}

const pageChange = () => {
    useSystemManageStore.initSystemAccessList()   
}


</script>

<style lang="less" scoped>
    .ant-spin-nested-loading{
        height: calc(100% - 100px);
        /deep/ .ant-spin-container{
            height: 100%;
        }
    }
    
    .tableWrapper {
        position: relative;
        overflow: auto;
        height: 100%;
        
        .search {
            width: 210px;
            height: 30px;
            position: relative;
            margin-bottom: 16px;
            input {
                width: 208px;
                height: 30px;
                padding-right: 33px;
            }
            .sear {
                width: 16px;
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                right: 13px;
                cursor: pointer;
            }
            .clear {
                position: absolute;
                top: 15.5px;
                right: 46.6px;
                width: 16px;
                cursor: pointer;
            }
        }
        .tableBox{
            height: calc(100% - 46px);
            overflow-y: auto;
            .tableContainer {
                width: 100%;
                .status_text {
                    display: inline-block;
                    width: 80%;
                    color: #3d82f2;
                    img {
                        width: 10px;
                    }
                }
                td {
                    height: 40px;
                    max-height: 56px;
                    // width: calc(100% / 8);
                    border: 1px solid #e0ebff;
                    padding: 10px;
                    font-size: 13px;
                    & > div {
                        max-width: 100%;
                        max-height: 56px;
                        display: -webkit-box;
                        -webkit-line-clamp: 2;
                        -webkit-box-orient: vertical;
                        overflow: hidden;
                        &.operateWrap{
                            white-space: nowrap;
                        }
                        & > span {
                            color: #3d82f2;
                            cursor: pointer;
                            margin-right: 16px;
                        }
                    }
                }
                .column-5 {
                    width: 5%;
                }
                .column-15 {
                    width: 15%;
                }
                .column-average{
                    width: calc(80% / 6 );
                }
                tr {
                    &:nth-of-type(odd) {
                        background-color: #f7faff;
                    }
                    &:first-of-type {
                        background-color: #ecf3ff;
                    }
                }
                .apiUrl {
                    color: #3d82f2;
                    cursor: pointer;
                }
                .ban {
                    cursor: not-allowed;
                    opacity: .4;
                }
            }
        }
    }
    .noData {
        text-align: center;
        top: 50%;
        left: 50%;
        position: absolute;
        transform: translate(-50%, -50%);
        img {
            width: 180px;
            height: 130px;
        }
        p {
            font-weight: 400;
            font-size: 14px;
            color: rgba(0, 0, 0, 0.4);
        }
    }
    .page {
        position: absolute;
        bottom: 10px;
        left: 50%;
        transform: translateX(-50%);
    }
</style>
