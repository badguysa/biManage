<template>
    <div class="standardImportPage">
        <div class="standardImportHead">
            <div class="back">
                <div class="backbox" @click="goBack"><img src="@/assets/icons/return.png" alt="">{{ t('common.back') }}</div>
            </div>
            <div class="headBox">
                <div class="add">
                    <div class="text">{{ dataCenterImportStandardStatus ? t('indexPage.updateStandard') : t('indexPage.importStandard') }}</div>
                    <div class="iptGroup">
                        <div>
                            <span class="textColor text1">{{ t('dataStandard.currentStandard') }}</span>
                            <!-- 跳转有问题 -->
                            <span class="name" @click="jumpTo()">{{ state.name || '--' }}</span>
                            <img v-if="state.name" class="img" @click="jumpTo()" src="@/assets/icons/right_arrow.png" alt="" />
                        </div>
                    </div>
                </div>
                <div class="leftConfig">
                    <myButton type="primary" @click="importConfirm">{{ t('common.confirm') }}</myButton>
                </div>
            </div>
        </div>
        <div class="codeSet">
            <div class="codeSelect">
                <div class="text">{{ t('selfConfig.selectDataTable') }}</div>            
                <importStandardTree @emitSelect="getDetail"></importStandardTree>
            </div>
            <div class="tableContainer">
                <p class="title">{{ t('dataStandard.ruleContent') }}</p>
                <standardRuleTable v-if="state.attrs.length" :dataList="state.attrs"> </standardRuleTable>
                <div class="noData" v-else>
                    <img src="@/assets/images/img_null.png" alt="" />
                    <div class="text">{{ t('common.noContent') }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { mainStore } from '@/Stores/mainStore'
import myButton from '@/components/buttons/myButton.vue'
import importStandardTree from '@/views/dataCenter/centerLayout/components/standardTree/index.vue'
import standardRuleTable from './standardTable.vue'
import { useI18n } from 'vue-i18n'
import { dataStandardStore } from '@/Stores/dataStandardStore';
import { importStandardTable } from '@/apis/dataStandard/index.js'
import { apiManageStore } from '@/Stores/apiManageStore';
import { cloneDeep } from 'loadsh'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue';
import { handleEditDataList } from '@/hooks/dataStandard/useGetRuleText.js'
import { SYSTEM_MENU_MAP } from '@/constants/systemManage'

const useApiManageStore = apiManageStore()
const useDataStandardStore = dataStandardStore()
const useMainStore = mainStore()
const { activeTabKey, indexTableActiveId } = storeToRefs(useMainStore)
const { dataCenterImportStandardDetail, groupObject, dataCenterImportStandardStatus, dataCenterImportStandardKey, leftDataList } = storeToRefs(useDataStandardStore)
const { t } = useI18n()
const state = reactive({
    id: '',
    name: '',
    libId: '',
    description: '',
    attrs: [],
})
const router = useRouter()
const activeTableId = computed(() => {
    let activeData = {}
    if (indexTableActiveId.value.length) {
        activeData = indexTableActiveId.value.find(i => i.tabId === activeTabKey.value)
    }
    if (activeData) {
        return activeData.id
    } 
    return ''
})
// 返回
const goBack = () => {
    useMainStore.setPageId('pageTable')
}

const getDetail = async()=> {
    await useDataStandardStore.getImportStandardTable(dataCenterImportStandardKey.value)
    let dataClone = cloneDeep(dataCenterImportStandardDetail.value)
    dataClone = {
        ...dataClone,
        attrs: handleEditDataList(dataClone.attrs)
    }
    const { name, libId, description, attrs, id }  = dataClone
    state.name = name
    state.libId = libId
    state.id = id
    state.description = description
    state.attrs = attrs
}

const jumpTo = async ()=>{
    if(!state.name) return
    useDataStandardStore.updateActiveStandardKey(dataCenterImportStandardDetail.value.libId)
    useApiManageStore.setActiveMenuName(SYSTEM_MENU_MAP.STANDARD_MANAGE)
    useApiManageStore.addApiTab({
        name: 'dataStandard.standardManage',
        id: SYSTEM_MENU_MAP.STANDARD_MANAGE,
        path: '/system/dataStandard',
    })
    useApiManageStore.setApiPageId('dataStandardManagePage')
    await useDataStandardStore.getLeftDataListFn()
    const expendIndex = leftDataList.value.findIndex((item)=> item.id === groupObject.value?.outItem?.id)
    if(expendIndex > -1){
        useDataStandardStore.setStandardExpendIndex(1)
    }
    useDataStandardStore.setIsInitMount(true)
    return router.push('/system/dataStandard')
}

const importConfirm = async()=> {
    const params = {
        emptyTableId: activeTableId.value,
        standardId: state.id,
    }
    const res = await importStandardTable(params)
    if(res.code ===1){
        useMainStore.setIndexTableActiveId(activeTableId.value, activeTabKey.value)
        useMainStore.setPageId('pageTable')
        message.success(res.message)
        useApiManageStore.initRedDot()
    }else{
        message.error(res.message)
    }
}
</script>

<style lang="less" scoped>
.standardImportPage {
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 12px;
    .standardImportHead {
        width: 100%;
        background-color: #fff;

        .back {
            height: 36px;
            padding: 8px 16px;
            border-bottom: 1px solid rgba(0, 0, 0, 0.07);

            .backbox {
                width: 60px;
                height: 20px;
                display: flex;
                align-items: center;
                font-weight: 400;
                font-size: 14px;
                color: #3D82F2;
                cursor: pointer;

                span {
                    display: flex;
                    align-items: center;
                }

                img {
                    width: 16px;
                    margin-right: 4px;
                }
            }
        }

        .headBox {
            width: 100%;
            padding: 12px 16px;
            display: flex;
            justify-content: space-between;

            .add {
                .text {
                    height: 25px;
                    font-weight: 600;
                    font-size: 18px;
                    color: rgba(0, 0, 0, 0.8);
                    margin-bottom: 16px;
                }

                .iptGroup {
                    height: 32px;
                    display: flex;
                    align-items: center;
                    margin-bottom: 4px;

                    .textColor {
                        font-weight: 400;
                        font-size: 14px;
                        color: rgba(0, 0, 0, 0.8);
                    }

                    .text1 {
                        margin-right: 20px;
                    }

                    .name{
                        color:#3D82F2;
                        cursor: pointer;
                    }
                    .img {
                        width: 12px;
                        height: 12px;
                        margin-left: 10px;
                        cursor: pointer;
                    }
                }
            }

            .leftConfig {
                margin-top: 16px;
                margin-right: 16px;

                .update {
                    height: 20px;
                    display: flex;
                    align-items: center;
                    margin-top: 16px;
                    justify-content: flex end;

                    .text3 {
                        margin-left: 4px;
                    }
                }
            }
        }
    }

    .codeSet {
        width: 100%;
        display: flex;
        gap: 12px;
        overflow: hidden;
        flex-grow: 1;
        .codeSelect {
            background: #fff;
            padding: 12px 0;
            .text {
                width: 240px;
                height: 20px;
                font-weight: 400;
                font-size: 14px;
                color: rgba(0, 0, 0, 0.8);
                padding-left: 12px;
            }
            .search {
                width: 240PX;
                height: 46px;
                padding: 8px 12px;
                position: relative;
                input {
                    width: 216px;
                    height: 30px;
                }
                .sear {
                    width: 16px;
                    position: absolute;
                    top: 16px;
                    right: 22.6px;
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

        }
        .tableContainer{
            padding: 12px;
            background: #fff;
            border-radius: 4px;
            position: relative;
            width: calc(100vw - 452px);
            min-width: 1050px;
            overflow: auto;
            flex-grow: 1;
            .title{
                color: rgba(0, 0, 0, 0.8);
                font-size: 14px;
                line-height: 20px;
                font-weight: 400;
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
                .text {
                    color: rgba(0, 0, 0, 0.40);
                    font-family: PingFang SC;
                    font-size: 14px;
                    font-style: normal;
                    font-weight: 400;
                    line-height: normal;
                }
            }
        }
    }
}
</style>