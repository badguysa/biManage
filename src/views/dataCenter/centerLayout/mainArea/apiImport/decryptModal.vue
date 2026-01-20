<template>
    <myModal modalName="解密" @onCancel="onCancel" @onConfirm="onConfirm" width="560px" okText="解密">
        <template #modal-body>
            <div class="table-container">
                <table ref="tableRef">
                    <thead>
                        <tr>
                            <th>解密层级</th>
                            <th>解密方式</th>
                            <th>密钥</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="list-group-item" v-for="(element, index) in dataList" :key="index">
                            <td class="common-td">
                                <span>{{ element.title }}</span>
                            </td>
                            <td class="select-td">
                                <a-select 
                                    style="width: 100%"
                                    v-model:value="element.cryptoType"
                                    @select="updateDataList(element)"
                                >
                                    <a-select-option 
                                        v-for="opItem in typeList" 
                                        :key="opItem.value" 
                                        :value="opItem.value"
                                        :title="opItem.label"
                                    >
                                        {{ opItem.label }}
                                    </a-select-option>
                                </a-select>
                            </td>
                            <td class="input-td">
                                <input ref="inputRef" @blur="updateDataList(element)" class="ipt" type="text"
                                    v-model="element.key" placeholder="请输入" >
                            </td>
                            <td class="oper-td">
                                <div>
                                    <span @click="deleteDecrypt(index+1)" :class="{ 'disabled': index+1 !== dataList.length}">{{ t('common.delete') }}</span>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div class="add-params">
                    <a-tooltip placement="bottom" v-if="decryptDisabled">
                        <template #title>
                            <span>完成当前解密后，再次打开解密弹窗添加多层解密</span>
                        </template>
                        <myButton class="add-btn" :disabled="decryptDisabled"  @click="addDecrypt()">
                            <img src="@/assets/icons/plus.png" style="width: 16px;" alt="解密" />{{t('api.decryption') }}
                        </myButton>
                    </a-tooltip>
                    <myButton class="add-btn" @click="addDecrypt()" v-else>
                        <img src="@/assets/icons/plus.png" style="width: 16px;" alt="解密" />{{ t('api.decryption') }}
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
import { numberToChinese } from '@/utils/utils.js'
import myButton from '@/components/buttons/myButton'
import { mainStore } from '@/Stores/mainStore';
import { apiDecryptHandle } from '@/apis/apiImport/index.js'
import { cloneDeep } from 'lodash'
import { message } from 'ant-design-vue';

const useMainStore = mainStore()
const { decrypts, decryptDisabled } = storeToRefs(useMainStore)

const emits = defineEmits(["modalCancel", "modalConfirm"])
const { t } = useI18n()
const typeList = [
    {
        label: 'AES',
        value: 'AES'
    },
]
const onCancel = () => {
  emits('modalCancel')
}

const dataList = computed(()=>{
    if(decrypts.value.length === 0){
        // 设置默认值
        return [
            {
                id: 1,
                title:'一层解密',
                cryptoType: 'AES',
                key: '',
                jsonPaths: [],
            },
        ]
    } else {
        return decrypts.value
    }
})

const updateDataList = (element) => {
    const dataArr = dataList.value.map((item) => {   
      if (item.id === element.id) {  
        return {  
          ...item, 
          ...element,
        };  
      }
      return item;
    })
    useMainStore.setDecrypts(dataArr)
}

const addDecrypt = () =>{
    const dataArr  = cloneDeep(dataList.value)
    const nextTitle = `${numberToChinese(dataArr.length + 1)}层解密`
    dataArr.push(
        {
            id: dataArr.length + 1,
            title: nextTitle,
            cryptoType: 'AES',
            key: '',
            jsonPaths: [],
        }
    )
    useMainStore.setDecrypts(dataArr)
    useMainStore.setDecryptDisabled(true)
    
}

// 解密
const onConfirm = ()=> {
    if (dataList.value.some(item => !item.key || item.key.trim() === '')) {  
        return message.warning('请输入密钥')
    }
    if (dataList.value.some(item => item.key.length !== 16)) {  
        return message.warning('密钥需固定16位')
    }
    useMainStore.setDecryptDisabled(false)
    emits('modalConfirm')
}

// 删除解密
const deleteDecrypt = (index) => {
    if(index !== dataList.value.length){
        return
    }
    const dataArr  = cloneDeep(dataList.value)
    dataArr.pop()
    useMainStore.setDecrypts(dataArr)
    useMainStore.setDecryptDisabled(false)
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