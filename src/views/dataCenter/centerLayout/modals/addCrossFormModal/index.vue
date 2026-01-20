<template>
    <myModal modalName="跨单位导入" @onCancel="onCancel" @onConfirm="onConfirm" width="560px" okText="连接">
        <template #modal-body>
            <div class="table-container">
                <table ref="tableRef">
                    <thead>
                        <tr>
                            <th>单位FID</th>
                            <th>表单ID</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="list-group-item" v-for="(element, index) in dataList" :key="index">
                            <td class="input-td">
                                <input ref="inputRef" @blur="updateDataList(element)" :class="{'ipt': true, 'isError': index===errorFidIndex}" type="text"
                                    v-model="element.fid" placeholder="请输入" >
                            </td>
                            <td class="input-td">
                                <input ref="inputRef" @blur="updateDataList(element)" :class="{'ipt': true, 'isError': index===repeatIndex}" type="text"
                                    v-model="element.formId" placeholder="请输入" >
                            </td>
                            <td class="oper-td">
                                <div>
                                    <span @click="deleteItem(index)">{{ t('common.delete') }}</span>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div class="add-params">
                    <myButton class="add-btn" @click="add()">
                        <img src="@/assets/icons/plus.png" style="width: 16px;" alt="添加" />{{t('common.add') }}
                    </myButton>
                </div>
            </div>
        </template>
    </myModal>
</template>
<script setup>
import { ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import myModal from '@/components/myModal'
import myButton from '@/components/buttons/myButton'
import { mainStore } from '@/Stores/mainStore';
import { modalStore } from '@/Stores/modalStore';
import { apiDecryptHandle } from '@/apis/apiImport/index.js'
import { cloneDeep } from 'lodash'
import { message } from 'ant-design-vue';

const useMainStore = mainStore()
const useModalStore = modalStore()
const { crossFormList, userInfo, systemConfig } = storeToRefs(useMainStore)

const emits = defineEmits(["modalConfirm"])
const { t } = useI18n()
const repeatIndex = ref(-1)
const errorFidIndex = ref(-1)

const dataList = computed(()=>{
    if(crossFormList.value.length === 0){
        // 设置默认值
        return [
            {
                fid: '',
                formId: '',
            },
        ]
    } else {
        return crossFormList.value
    }
})

const updateDataList = (element, index) => {
    const dataArr = dataList.value.map((item, i) => {   
      if (i === index) {  
        return {  
          ...item, 
          ...element,
        };  
      }
      return item;
    })
    useMainStore.setCrossFormList(dataArr)
}

const add = () =>{
    const dataArr  = cloneDeep(dataList.value)
    dataArr.push(
        {
            fid: '',
            formId: '',
        }
    )
    useMainStore.setCrossFormList(dataArr)
}

// 连接
const onConfirm = ()=> {
    const dataArr  = cloneDeep(dataList.value).filter(item => item.fid!=='' || item.formId!=='')
    if(isError(dataArr)) return
    useMainStore.setCrossFormList(dataArr)
    emits('modalConfirm')
    useModalStore.changeAddCrossFormModalVisible()
}

const onCancel = () => {
    useModalStore.changeAddCrossFormModalVisible()
}

// 删除
const deleteItem = (index) => {
    const dataArr  = cloneDeep(dataList.value).filter((item, i)=> i !== index)
    useMainStore.setCrossFormList(dataArr)
}


const isError = (dataArr)=> {
    errorFidIndex.value = -1
    repeatIndex.value = -1
    if(isRepeat(dataArr) || isErrorFid(dataArr)){
        return true
    }
    return false
}

const isRepeat = (dataArr)=>{
    const nameCount = {}
    for (let i = 0; i < dataArr.length; i++) {
        const formId = dataArr[i].formId;
        const fid = dataArr[i].fid;
        if(fid && !formId){
            repeatIndex.value = i
            message.error('表单ID不允许为空')
            return true;
        }
        if (nameCount[formId]) {
            // 如果 formId 已经存在于nameCount中，表示重复
            repeatIndex.value = i
            message.error('表单ID不允许重复')
            return true;
        } else {
            // 否则将 formId加入nameCount中，并计数为1
            nameCount[formId] = 1;
        }
    }
    return false
}

const isErrorFid = (dataArr)=> {
    const currentFid = userInfo.value.fid
    const empowerFids =  systemConfig.value.formCrossUnitFids ? systemConfig.value.formCrossUnitFids.split('、') : []
    errorFidIndex.value = dataArr.findIndex((item)=> item.fid === currentFid)
    if(errorFidIndex.value > -1){
        message.error('请填写非本单位FID')
        return true
    }
    errorFidIndex.value = dataArr.findIndex((item)=> !empowerFids.includes(item.fid))
    if(errorFidIndex.value > -1){
        message.error('FID未授权, 请联系中台管理员授权后导入')
        return true
    }
    return false    
}

</script>
<style lang="less" scoped>
.table-container{
    padding: 24px 30px;
    table {
        border-collapse: collapse;
        border-spacing: 0;
        width: 100%;
        padding: 20px;
        thead tr {
            td {
                border: 1px solid #E0EBFF;
                background: #ECF3FF;
                height: 36px;
                padding: 0px 8px;
                line-height: 1;
            }
            th {
                text-align: left;
                border: 1px solid #E0EBFF;
                background: #ECF3FF;
                height: 36px;
                padding: 0px 10px;
                line-height: 1;
                position: relative;
                font-weight: 500;
            }
        }
        .list-group-item {
            height: 36px;
            td {
                height: 36px;
                padding: 4px 8px;
                border: 1px solid #E0EBFF;
                width: calc(100% / 4);
            }
            .select-td {
                :deep(.ant-select .ant-select-selector){
                    width: 100%;
                    background: #F3F3F3;
                }
            }
            .input-td{
                width: calc(100% / 3);
                .ipt{
                    width: 100%;
                    background: white;
                    border: 1px solid #EBEBEB;
                }
                .isError{
                    border: 1px solid red;
                    box-shadow: none;
                }
            }
            .oper-td {
                width: calc(100% / 5);
                span {
                    color: #3d82f2;
                    cursor: pointer;
                    margin-right: 16px;
                }
                .disabled{
                    color: #2B67FF;
                    opacity: 0.3;
                }
            }
        }
    }
    .add-params{
        .add-btn{
            box-sizing: border-box;
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: center;
            gap: 2px;
            height: 28px;
            margin-top: 16px;
        }
    }
}
</style>