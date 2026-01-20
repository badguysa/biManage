<template>
<myModal
    :modalName="t('indexPage.pageSetting')"
    @onConfirm="onConfirm"
    @onCancel="onCancel"
>
    <template #modal-body>
        <div class="setPageSizeModal">
            <a-form ref="formRef" class="step-box" :model="formState" :hideRequiredMark="true" validateTrigger="onChange">
                <a-form-item
                    :colon="false"
                    :label="t('indexPage.showPageSize')"
                    name="displaySize"
                    :rules="[{ required: true, validator: (rule, value) => customValidator(rule, value), trigger: 'change' }]"
                >
                    <a-input-number :precision="0" class="input-box" v-model:value="formState.displaySize" />
                </a-form-item>
            </a-form>
        </div>
    </template>
</myModal>
</template>
<script setup>
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { isNumber } from '@/utils/utils'
import { modalStore } from '@/Stores/modalStore.js'
import { mainStore } from '@/Stores/mainStore.js'
import myModal from '@/components/myModal'
const { t } = useI18n()
const useModalStore = modalStore()
const useMainStore = mainStore()
const { tablePages, indexTableDesc } = storeToRefs(useMainStore)
const formRef = ref()
const formState = ref({
    displaySize: 100
})
const maxNumber = computed(() => {
    return indexTableDesc.value.dataNum > 50000 ? 50000 : indexTableDesc.value.dataNum
})
onMounted(() => {
    const data = tablePages.value.find(item => item.id === indexTableDesc.value.id)
    if (data) {
        formState.value.displaySize = data.displaySize
    }
})
const customValidator = (rule, value) => {
    if (!value) {
        return Promise.reject(t('indexPage.cannotEmpty'))
    }
    if (!isNumber(value)) {
        return Promise.reject(t('indexPage.overMaxTip'))
    }
    if (value < 0 || value > maxNumber.value) {
        return Promise.reject(`${t('indexPage.pleaseEnter')}${maxNumber.value}${t('indexPage.validateText')}`)
    }
    return Promise.resolve()
}
const onConfirm = () => {
    formRef.value.validateFields().then(res => {
        const data = tablePages.value.find(item => item.id === indexTableDesc.value.id)
        useMainStore.changeTablePages({
            id: data.id,
            pageNum:  1,
            displaySize: formState.value.displaySize
        }, 'set')
        useMainStore.onlyGetPreviewData({
            id: data.id
        })
        useModalStore.changeSetPageSizeModalVisible()
    })
}
const onCancel = () => {
    useModalStore.changeSetPageSizeModalVisible()
}
</script>

<style lang="less" scoped>
.setPageSizeModal {
    width: 400px;
    padding: 30px 24px 6px 30px;
    :deep(.ant-input-number) {
        width: 100%;
    }
    :deep(.ant-input-number-focused) {
        background: #F3F3F3;
        box-shadow: inset 0px 0px 0px 2px #3D82F2;
        outline: none; 
    }
    :deep(.ant-form-item-label) {
        margin-right: 10px;
    }
    .step-box {
        display: flex;
        align-items: center;
        position: relative;
        .input-box {
            width: 134px;
            position: relative;
            .over {
                border: 1px solid #F53F3F;
            }
        }
        .step-input {
            padding-right: 25px;
        }
        .step-img {
            width: 20px;
            height: 13px;
            display: none;
            cursor: pointer;
        }
        .step-img:hover {
            transform: scale(1.05);
        }
        .add {
            position: absolute;
            top: 2px;
            right: 3px;
        }
        .minus {
            position: absolute;
            bottom: 2px;
            right: 3px;
        }
    }
}
</style>