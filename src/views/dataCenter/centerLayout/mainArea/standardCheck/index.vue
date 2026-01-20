<template>
    <div class="standardCheckPage">
        <div class="standardCheckHead">
            <div class="back">
                <div class="backbox" @click="goBack"><img src="@/assets/icons/return.png" alt="">{{ t('common.back') }}</div>
            </div>
            <div class="headBox">
                <div class="add">
                    <div class="text">
                        <span>{{ t('dataStandard.dataStandard') }}</span>
                        <span @click="showCheckRecord" class="record">
                            <img src="@/assets/icons/time_blue.png">
                            {{ t('dataStandard.standardRecord') }}
                        </span>
                    </div>
                    <div class="iptGroup">
                        <div class="curStandard">
                            <span class="textColor text1">{{ t('dataStandard.currentStandard') }}</span>
                            <div class="jumpBtn" :style="{backgroundColor:state.name? '#E8F2FF' : ''}">
                                <span class="name" @click="jumpTo()">{{ state.name || '--' }}</span>
                                <img v-if="state.name" class="img" @click="jumpTo()" src="@/assets/icons/right_arrow.png" alt="" />
                                <div v-if="state.name" class="imgback" @click="clear"></div>
                            </div>                            
                        </div>
                    </div>
                </div>
                <div class="leftConfig">
                    <myButton type="primary" @click="confirm">{{ t('common.confirm') }}</myButton>
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
                <standardRuleTable 
                    v-if="indexTableColumns.length"
                    :targetFiled="targetFiled"
                    :tableColumns="indexTableColumns" 
                    :tableData="indexTableData" 
                    :standardList="standardList" 
                    @updateCheckColumn="getCheckColumn"
                    :standardTipList="standardTipList" 
                />
                <div class="noData" v-else>
                    <img src="@/assets/images/img_null.png" alt="" />
                    <div class="text">{{ t('common.noData') }}</div>
                </div>
            </div>
        </div>
        <!-- 标准记录弹窗 -->
        <recordTableModal v-if="showModal" @modalCancel="showModal = false"/>
    </div>
</template>

<script setup>
import { mainStore } from '@/Stores/mainStore'
import myButton from '@/components/buttons/myButton.vue'
import importStandardTree from '@/views/dataCenter/centerLayout/components/standardTree/index.vue'
import recordTableModal from '@/views/dataCenter/centerLayout/modals/standardRecordModal/index.vue'
import standardRuleTable from './checkTable.vue'
import { useI18n } from 'vue-i18n'
import { dataStandardStore } from '@/Stores/dataStandardStore';
import { importCheckStandardTable ,cancelRelat, getStandardConfig } from '@/apis/dataStandard/index.js'
import { apiManageStore } from '@/Stores/apiManageStore';
import { fieldTypeList ,brainFieldTypeList } from '@/constants/dataStandard'
import { cloneDeep } from 'loadsh'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue';
import { handleEditDataList } from '@/hooks/dataStandard/useGetRuleText.js'
import { SYSTEM_MENU_MAP } from '@/constants/systemManage'
import { onMounted } from 'vue'

const useApiManageStore = apiManageStore()
const useDataStandardStore = dataStandardStore()
const useMainStore = mainStore()
const { activeTabKey, indexTableColumns, indexTableData, indexTableActiveId, indexTableDesc } = storeToRefs(useMainStore)
const { dataCenterImportStandardDetail, groupObject, dataCenterImportStandardStatus, dataCenterImportStandardKey, leftDataList } = storeToRefs(useDataStandardStore)
const { t } = useI18n()
const state = reactive({
    id: '',
    name: '',
    libId: '',
    description: '',
    attrs: [],
    checkColumn: {}, // 添加校验的选项列
})
const stateIdback =  ref('') //进入页面时候的stateId，用于判断是否需要取消数据标准
const router = useRouter()
const showModal = ref(false)
const cancelStateId = ref('') //要取消的数据标准id

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

const standardTipList =  ref([])
const standardList = ref([])
const isAlias = ref(false)
// 从全局配置获取如何匹配
const getSatnarddetail = async() =>{    
    let res = await getStandardConfig()
    if(res.code === 1){
        let data = res.data || false
        if(!data){
            //没有配置的时候默认使用物理字段名
            isAlias.value = false
            return;
        }   
        let nameArr = res.data.standardGlobalManage.fieldNameCheck.split(',')
        if(!nameArr.includes(dataCenterImportStandardKey.value)){
            isAlias.value = res.data.standardGlobalManage.fieldMatchingCheck == 2 ? true : false
        }
    }
}

const getStandardTipList = (standardArr)=>{
    if(!standardArr) return
    let targetFieldName = isAlias.value ? 'columnAlias' : 'columnName'
    targetFiled.value = targetFieldName
    let fieldName = isAlias.value ? 'name' : 'fieldName'

    let result = {}
    
    indexTableColumns.value.forEach(item => {
        if (item.hasOwnProperty(targetFieldName)) {
            let obj = standardArr.find((it)=> it[fieldName] === item[targetFieldName])
            if(obj) {
                result[item[targetFieldName]] = obj;
            }
        }
    });
    return [result]
}

// 返回
const goBack = () => {
    useMainStore.setPageId('pageTable')
}

const getDetail = async()=> {
    if(!dataCenterImportStandardKey.value){
        return
    }
    await useDataStandardStore.getImportStandardTable(dataCenterImportStandardKey.value)
    if(!Object.values(dataCenterImportStandardDetail.value).length) {
        return
    }
    let dataClone = cloneDeep(dataCenterImportStandardDetail.value)
    dataClone = {
        ...dataClone,
        attrs: handleEditDataList(dataClone.attrs)
    }
    standardTipList.value = getStandardTipList(dataClone.attrs)    
    const { name, libId, description, attrs, id }  = dataClone
    state.name = name
    state.libId = libId
    state.id = id
    state.description = description
    state.attrs = attrs
    standardList.value = state.attrs.map((attr)=>{
        let typeObj = fieldTypeList.find((type)=> type.value === attr.dataType) || brainFieldTypeList.find((type)=> type.value === attr.dataType)
        return {
            ...attr,
            imgSrc: typeObj.imgSrc,
            label: attr.name,
            value: attr.fieldName,
            groupType: dataClone.groupType == 'STD_BRAIN' ? '1' : '0'
        }
    })
}

const jumpTo = async()=>{
    if(!state.name) return
    useDataStandardStore.updateActiveStandardKey(dataCenterImportStandardDetail.value.libId)
    useApiManageStore.setActiveMenuName(SYSTEM_MENU_MAP.STANDARD_MANAGE)
    useApiManageStore.addApiTab({
        name: 'dataStandard.standardManage',
        id: SYSTEM_MENU_MAP.STANDARD_MANAGE,
        path: '/system/dataStandard'
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

const clear = () => { 
    // 没有关联的时候直接清空 
        cancelStateId.value = state.id
        state.name = ''
        state.libId = ''
        state.id = ''
        state.description = ''
        state.attrs = []
        standardList.value = []
        useDataStandardStore.updateImportStandardKey('')
        return
}

const cancelRelation =async ()=>{
    let data = {
        stableId: cancelStateId.value,
        tableId: activeTableId.value
    }
    let res = await cancelRelat(data)
    if (res.code == 1) {
        state.name = ''
        state.libId = ''
        state.id = ''
        state.description = ''
        state.attrs = []
        standardList.value = []
        useDataStandardStore.updateImportStandardKey('')
        useMainStore.setPageId('pageTable')
        message.success('取消关联成功')
    }
}

const confirm = async()=>{
    console.log(stateIdback.value,state.id);
    
    //之前没有关联的表
    if(!stateIdback?.value?.length>0){
        importConfirm()
    }else{
        //之前关联过表了，但是要关联新的
        if(state?.id?.length>0){
            importConfirm()
        }else{
            //之前关联过了，但是要取消
            cancelRelation()
        }
    }
}

const importConfirm = async()=> {
    const jsonData = {
        id: activeTableId.value,
        standardTableId: state.id,
    }
    const res = await importCheckStandardTable(jsonData)
    if(res.code ===1){
        useMainStore.setIndexTableActiveId(activeTableId.value, activeTabKey.value)
        useMainStore.setPageId('pageTable')
        message.success(res.message)
        useApiManageStore.initRedDot()
    }else {
        message.error(res.message)
    }
}

const showCheckRecord = ()=> {
    showModal.value = true
}
const getCheckColumn = (obj) => {
    state.checkColumn = obj
}

// 标准表与数据表匹配的字段名称
const targetFiled = ref('')

onMounted(async()=>{    
    stateIdback.value = dataCenterImportStandardKey.value
    await getSatnarddetail()
})
</script>

<style lang="less" scoped>
.standardCheckPage {
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 12px;
    overflow-x: hidden;
    .standardCheckHead {
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
                    .record {
                        font-weight: 400;
                        font-size: 14px;
                        color: #3d82f2;
                        cursor: pointer;
                        margin-left: 20px;

                        img {
                            margin-top: -3px;
                            width: 14px;
                        }
                    }
                }

                .iptGroup {
                    height: 32px;
                    display: flex;
                    align-items: center;
                    margin-bottom: 4px;
                    .curStandard {
                        height: 26px;
                        display: flex;
                        align-items: center;
                        .jumpBtn {
                            position: relative;
                            height: 26px;
                            display: flex;
                            align-items: center;
                            padding: 4px 8px;
                            color: #2B67FF;
                            border-radius: 4px;
                            &:hover {
                                .imgback{
                                    display: block;
                                }
                            }   
                            .imgback {
                                display: none;
                                height: 20px;
                                width: 20px;
                                right: -10px;
                                top: -10px;
                                position: absolute;
                                background: url("@/assets/icons/close_dark.png") no-repeat;
                                background-size: 14px 14px;
                                background-position: center;
                                cursor: pointer;
                            }
                        }
                    }

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
            width: 100%;
            // width: calc(100vw - 452px);
            // min-width: 1050px;
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