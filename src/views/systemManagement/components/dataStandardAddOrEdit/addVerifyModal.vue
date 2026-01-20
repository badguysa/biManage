<template>
    <div class="mask">
        <div class="modal-container">
            <div class="container-top">
                <span class="title">{{ isEdit ? t('common.edit') : t('common.add')}}</span>
                <img src="@/assets/icons/close.png" alt="close" @click="onCancel" />
            </div>
            <div class="container-middle">
                <div class="ruleItem" v-for="(item,index) in dataList" :key="index">
                    <!-- 校验规则的类型 -->
                    <a-select 
                        class="small-wid"
                        v-model:value="item.imgType"
                        :showArrow="false"
                        :disabled="true"
                    >
                        <a-select-option 
                            v-for="opItem in fieldTypeList" 
                            :key="opItem.value" 
                            :value="opItem.value"
                            :title="t(opItem.label)"
                        >
                            <div style="display: flex;align-items: center;height: 100%;">
                                <img style="width: 16px;margin-right: 4px" :src="opItem.imgSrc" alt="">
                                <span>{{ t(opItem.label) }}</span>
                            </div>
                        </a-select-option>
                    </a-select>
                    <!-- 选择条件 -->
                    <a-select 
                        v-model:value="item.type" 
                        class="condition-sele mid-wid"
                        :disabled="disabledType"
                    >
                        <a-select-option 
                            :title="t(item.text)" 
                            v-for="item in operationList"
                            :value="item.symbol"
                            :style="{ borderBottom: item.border ? '1px solid #F2F3F5' : '' }"
                        >
                            {{ t(item.text) }}
                        </a-select-option>
                    </a-select>

                    <!-- 展示条件的值 -->
                    <template v-if="!(item.type === 'notnull' || item.type === 'isnull' || item.type === 'isblank' || item.type === 'notblank')">
                        <template v-if="item.imgType === 'CHARACTER' || item.imgType === 'NUMBER'">
                            <template v-if="!['between', 'notBetween'].includes(item.type)">
                                <a-input
                                    v-model:value.trim="item.value" 
                                    :key="index" 
                                    class="condition-input"
                                    placeholder="请输入" 
                                />
                            </template>
                            <template v-else>
                                <input
                                    class="condition-betw" 
                                    style="width: 105px;" 
                                    type="text" 
                                    v-model="item.betweenStartContent"
                                >
                                <a-select 
                                    class="condition-betw" 
                                    style="width: 60px;" 
                                    v-model:value="item.betweenStartSymbol"
                                >
                                    <a-select-option value="gt">{{ `<` }}</a-select-option>
                                    <a-select-option value="gte">{{ `<=` }}</a-select-option>
                                </a-select>
                                <span class="condition-betw">{{ t('selfConfig.value') }}</span>
                                <a-select 
                                    class="condition-betw" 
                                    style="width: 60px;" 
                                    v-model:value="item.betweenEndSymbol"
                                >
                                    <a-select-option value="lt">{{ `<` }}</a-select-option>
                                    <a-select-option value="lte">{{ `<=` }}</a-select-option>
                                </a-select>
                                <input 
                                    style="width: 105px;" 
                                    type="text" 
                                    v-model="item.betweenEndContent"
                                >
                            </template>
                        </template>
                        <template v-if="item.imgType === 'DATE_TIME'">
                            <!-- 日期介于  -->
                            <template v-if="['between', 'notBetween'].includes(item.type)">
                                <a-date-picker 
                                    show-time 
                                    placeholder=""
                                    format="YYYY-MM-DD HH:mm:ss" 
                                    valueFormat="YYYY-MM-DD HH:mm:ss"
                                    class="mid-wid condition-betw"
                                    v-model:value="item.betweenStartContent"
                                    :locale="locale === 'lo' ? Lo : zhCN"
                                    />
                                <span class="condition-betw">{{ t('selfConfig.to') }}</span>
                                <a-date-picker 
                                    show-time 
                                    placeholder=""
                                    class="mid-wid condition-betw"
                                    format="YYYY-MM-DD HH:mm:ss" 
                                    valueFormat="YYYY-MM-DD HH:mm:ss"
                                    v-model:value="item.betweenEndContent"
                                    :locale="locale === 'lo' ? Lo : zhCN"
                                />
                                </template>
                            <!-- 单个日期输入框 -->
                            <a-date-picker
                                v-else
                                show-time 
                                placeholder=""
                                :locale="locale === 'lo' ? Lo : zhCN"
                                format="YYYY-MM-DD HH:mm:ss"
                                valueFormat="YYYY-MM-DD HH:mm:ss"
                                class="mid-wid condition-betw"
                                v-model:value="item.value"
                            />
                        </template>
                        <!-- 日期格式下拉选择 -->
                        <!-- <template v-if="item.imgType === 'DATE'">
                            <a-auto-complete
                                v-model:value="item.value" 
                                style="width: 100%;margin-left: 5px;"
                                placeholder="自定义" 
                                :options="dateFormatList"
                            >
                            </a-auto-complete>
                        </template> -->
                    </template>
                    <!-- 删除 -->
                    <img
                        src="@/assets/icons/delete.png"
                        class="del"
                        @click="removeItem(index)"
                        alt="delete"
                    />
                </div>
                <div class="addRelationbtn" @click="addRule">
                    <img src="@/assets/icons/add_relation.png" alt="" />
                    {{ t('selfConfig.add') }}
                </div>
            </div>
            <div class="container-bottom">
                <button @click="onCancel">{{ t('common.cancel') }}</button>
                <button @click="onConfirm">{{ t('common.confirm') }}</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { fieldTypeList, dateFormatList } from '@/constants/dataStandard'
import { textOperationList, numberOperationList, timeOperationList } from '@/utils/config'
import zhCN from 'ant-design-vue/es/date-picker/locale/zh_CN'
import Lo from '@/locale/lang/lo-datepicker'
import dayjs from 'dayjs'
import { formatTimeToSecond } from '@/utils/utils.js'

const { t, locale  } = useI18n()
const emits = defineEmits(['modalCancel', 'modalConfirm'])
const dataList = ref([]) // 数据列表
const imgTypeList = ref() //下拉列表
const disabledType = ref(false) // 禁止条件下拉
const operationList = ref() //操作下拉选项


const props = defineProps({
    ruleLists: {
        type: Array,
        default: []
    },
    dataType: {
        type: String,
        default: 'CHARACTER'
    },
    isEdit:{
        type: Boolean,
        default: false
    }
})

onMounted(()=>{
    initData()
    datePickerLocal()
})

const datePickerLocal = async () => {
  if (locale.value === 'lo') {
    const lo = await import('dayjs/locale/lo')
    dayjs.locale(lo)
  } else {
    const zh = await import('dayjs/locale/zh-cn')
    dayjs.locale(zh)
  }
}

watch(locale, () => {
  datePickerLocal()
})


const initData = () =>{
    if(props.dataType === 'CHARACTER'){
        imgTypeList.value =  [fieldTypeList[0]]
        // 定义需要移除的索引
        const indicesToRemove = new Set([2, 3, 10, 11, 12, 13]);
        // 使用 reduce 方法过滤掉需要移除的索引位置的元素
        operationList.value = textOperationList.reduce((acc, item, index) => {
            if (!indicesToRemove.has(index)) {
                acc.push(item);
            }
            return acc;
        }, []);
    } else if(props.dataType === 'NUMBER'){
        imgTypeList.value = [fieldTypeList[1]]
        // 定义需要移除的索引
        const indicesToRemove = new Set([8, 9, 10, 11]);
        // 使用 reduce 方法过滤掉需要移除的索引位置的元素
        operationList.value = numberOperationList.reduce((acc, item, index) => {
            if (!indicesToRemove.has(index)) {
                acc.push(item);
            }
            return acc;
        }, []);
    }else if(props.dataType === 'DATE_TIME'){
        imgTypeList.value = [fieldTypeList[2]]
        // 定义需要移除的索引
        const indicesToRemove = new Set([7, 8, 9, 10]);
        // 使用 reduce 方法过滤掉需要移除的索引位置的元素
        operationList.value = timeOperationList.reduce((acc, item, index) => {
            if (!indicesToRemove.has(index)) {
                acc.push(item);
            }
            return acc;
        }, []);
    } 
    // 渲染数据
    if(props.ruleLists.length > 0){
        dataList.value =  props.ruleLists
    } else {
        dataList.value = [
            {
                imgType: props.dataType, // 图片
                type: '', // 操作类型
                value: undefined, // 值
                // 介于和不介于的内容值 start
                betweenStartContent: '', 
                betweenStartSymbol: 'gte',
                betweenEndContent: '',
                betweenEndSymbol: 'lte',
                // 介于和不介于的内容值 end
            }
        ]
    }
}

const onCancel = () => {
    emits('modalCancel')
}

const onConfirm = () => {
    dataList.value = dataList.value.filter((item)=> (item.type && item.value) || (item.betweenStartContent && item.betweenEndContent))
    emits('modalConfirm', dataList.value)
}

const addRule = ()=>{
    dataList.value.push({
        imgType: props.dataType, // 图片类型
        type: '', // 操作类型
        value: undefined, // 值
        // 介于和不介于的内容值 start
        betweenStartContent: '', 
        betweenStartSymbol: 'gte',
        betweenEndContent: '',
        betweenEndSymbol: 'lte',
        // 介于和不介于的内容值 end
    })
}


const removeItem = (index) => {
    dataList.value.splice(index,1)
}
</script>

<style lang="less" scoped>
.mask {
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.3);
    position: fixed;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9;
    .modal-container {
        width: 640px;
        background-color: #fff;
        border-radius: 8px;
        .container-top {
            width: 100%;
            padding: 15px 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 1px solid rgba(0, 0, 0, 0.07);
            .title {
                font-weight: 600;
                font-size: 16px;
                color: rgba(0, 0, 0, 0.8);
            }
            img {
                width: 16px;
                height: 16px;
                cursor: pointer;
            }
        }

        .container-middle {
            padding: 16px;
            border-bottom: 1px solid #F0F0F0;
            overflow-x: auto;
            .ruleItem{
                margin-bottom: 10px;
                display: flex;
                align-items: center;
                width: 608px;
                .condition-sele{
                    margin-left: 10px;
                    margin-right: 10px;
                }
                .condition-betw{
                    margin: 0 5px;
                }
                .condition-input{
                    min-width:240px;
                }
                .del{
                    width: 16px;
                    height: 16px;
                    cursor: pointer;
                    margin-left: 12px;
                }
                .mid-wid{
                    min-width:150px;
                }
                .small-wid{
                    min-width: 120px;
                }
            }
            .addRelationbtn {
                display: flex;
                align-items: center;
                width: 48px;
                height: 32px;
                color: #3d82f2;
                cursor: pointer;
                img {
                    width: 16px;
                    height: 16px;
                    margin-right: 4px;
                }
            }
        }

        .container-bottom {
            padding: 16px;
            display: flex;
            justify-content: right;

            button {
                padding: 6px 26px;
                border-radius: 4px;
                border: none;
                background-color: #fff;
                border: 1px solid #3d82f2;
                color: #3d82f2;
                font-weight: 400;
                font-size: 14px;
                line-height: 20px;
                cursor: pointer;
                &:hover {
                    background: rgba(61, 130, 242, 0.1);
                    border: 1px solid #2B67FF;
                }
                &:nth-of-type(2) {
                    color: #fff;
                    background-color: #3d82f2;
                    margin-left: 24px;
                    &:hover {
                        background: rgba(61, 130, 242, 0.8);
                    }
                }
            }
        }
    }
}
:deep(.ant-picker .ant-picker-clear svg){
    background: #F3F3F3;
}
</style>
