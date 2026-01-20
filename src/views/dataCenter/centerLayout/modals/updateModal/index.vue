
<template>
    <div class='updateModal' v-if="updateModalVisible">
        <div class="maskLayer"></div>
        <div class="popDiv wid400">
            <div class="popHead">
                <a href="#" class="popClose fr" @click="cancel"><img style="width: 16px;" :src="closeImg" /></a>
                <p class="fl colorDeep">更新策略</p>
            </div>

            <div class='modalBody'>
                <a-form ref="formRef" :model="formState" v-bind="layout">
                    <a-form-item name="updatePolicy" label="更新策略" :rules="[{ required: true, message: '请选择更新策略' }]">
                        <a-radio-group v-model:value="formState.updatePolicy" name="checkboxgroup" :options="checkOptions" />
                    </a-form-item>
                <div class='row' style="height: 65px">
                    <div class='col1'>更新频率</div>
                    <div class='col2' style="height: 60px">
                        <!-- <a-select :options="option" style="width: 276px" value="重复执行" :disabled="true"></a-select> -->
                        <div class='col3'>
                            <span style="margin-right: 8px">每</span>
                            <a-input-number v-model:value="formState.updateRate" :min="1" style="margin-right: 8px; width: 56px" />
                            <a-select :options='timeOption' v-model:value="formState.updateUnit" style="width: 100px; margin-right: 8px">
                            </a-select>
                            <span style="margin-right: 8px">执行一次</span>
                        </div>
                    </div>
                </div>
                <div v-if="showDependColumn">
                    <a-form-item 
                        name="dependColumn" 
                        label="更新依据" 
                        :rules="[{ required: true, message: '请选择更新依据' }]"
                    >
                        <a-select 
                            notFoundContent="暂无该数据" 
                            showSearch
                            style="width: 256px" 
                            v-model:value="formState.dependColumn" 
                        >
                            <a-select-option 
                                v-for="item in updateTable.dependColumns"
                                :key="item.columnName" 
                                :value="item.columnName"
                            >
                                <span role="img">
                                    <img style="width: 16px" :src="getIconSrc(item)" alt="" />
                                </span>
                                {{ item.columnAlias || item.columnName }}
                            </a-select-option>
                        </a-select>
                    </a-form-item>
                </div>
                    <!-- <div class='col1'>更新依据</div>
                    <div class='col2'>
                        <a-select showSearch :options='option' v-model:value="formState.dependColumn" style="width: 276px"
                            notFoundContent="暂无该数据"></a-select>
                    </div> -->
                </a-form>
            </div>

            <div class="popBottom shadowBox">
                <myButton class="fr mr25" @click="onOk" type="primary">确定</myButton>
                <myButton class="fr mr25" @click='cancel'>取消</myButton>
            </div>
        </div>
    </div>
</template>

<script setup>
import { reactive, ref, onMounted, computed } from 'vue';
import { getIconSrc } from '@/utils/utils';
import { modalStore } from '@/Stores/modalStore';
import { mainStore } from '@/Stores/mainStore';
import { storeToRefs } from 'pinia'
import closeImg from '@/assets/icons/close.png'
import myButton from '../../../../../components/buttons/myButton'
const useModalStore = modalStore()
const useMainStore = mainStore()
const { updateModalVisible } = storeToRefs(useModalStore)
const { updatePolicyData, updateId } = storeToRefs(useMainStore)
const formRef = ref()
const layout = {
    labelCol: { span: 6 },
    wrapperCol: {
        span: 15,
        offset: 1
    }
}
const showDependColumn = computed(() => {
    if (formState.updatePolicy === 'FULL_UPDATE') {
        formState.dependColumn = ''
        return false
    }
    return true
})

const updateTable = computed(() => {
    return updatePolicyData.value.find(item => item.updateId === updateId.value)
})

const timeOption = [{
    value: 0,
    label: '小时'
}, {
    value: 1,
    label: '天'
}]
const checkOptions = [
    { label: '全量更新', value: 'FULL_UPDATE' },
    { label: '增量更新', value: 'INCR_UPDATE' }
]
let formState = reactive({
    updatePolicy: '',
    updateRate: 1,
    updateUnit: 0,
    dependColumn: ''
})
onMounted(() => {
    initForm()
})
const initForm = () => {
    formState.updatePolicy = updateTable.value.updatePolicy
    formState.updateRate = updateTable.value.updateParams.updateRate
    formState.updateUnit = updateTable.value.updateParams.updateUnit
    formState.dependColumn = updateTable.value.updateParams.dependColumn
}
const cancel = () => {
    useModalStore.changeUpdateModalVisible()
}
const onOk = () => {
    formRef.value.validateFields().then((res) => {
        if (res) {
            const updateData = {
                updateId: updateId.value,
                dependColumns: updateTable.value.dependColumns,
                updatePolicy: formState.updatePolicy,
                updateParams: {
                    updateType: 1,
                    updateRate: formState.updateRate,
                    updateUnit: formState.updateUnit,
                    dependColumn: formState.dependColumn
                }
            }
            // 更新更新策略
            useMainStore.setUpdatePolicyData(updateData, 2)
            useModalStore.changeUpdateModalVisible()
        }
    })
}
</script>

<style lang="less" scoped>
.updateModal {
    font-family: 'PingFang SC';
    font-style: normal;
    :deep(.ant-form-item) {
        margin-bottom: 0px;
    }
    .modalBody {
        height: 170px;

        .row {
            display: grid;
            grid-template-columns: 100px 284px;
            height: 32px;
            align-items: center;
            // margin-bottom: 15px;

            .col1 {
                padding-left: 24px;
            }

            .col2 {
                height: 32px;
                display: flex;
                align-items: center;
                flex-wrap: wrap;

                .ml8mr20 {
                    margin-left: 8px;
                    margin-right: 20px;
                }

                .wid276 {
                    width: 276px;
                }

                .col3 {
                    height: 60px;
                    display: flex;
                    align-items: center;
                }
            }
        }
    }
}
</style>