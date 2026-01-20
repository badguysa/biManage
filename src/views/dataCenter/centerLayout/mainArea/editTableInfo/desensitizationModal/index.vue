<template>
<myModal
    :modalName="t('indexPage.desensitizedSet')"
    @onCancel="onCancel"
    @onConfirm="onConfirm"
>
<template #modal-body>
    <div class="desensitizationModal">
        <div class="flex-box">
            <div>{{ t('indexPage.rule') }}</div>
            <a-select class="width100" v-model:value="formState.rule">
                <a-select-option value="none">{{ t('indexPage.notDesensitize') }}</a-select-option>
                <a-select-option value="replace">{{ t('indexPage.coverDesensitize') }}</a-select-option>
            </a-select> 
        </div>
        <template v-if="formState.rule == 'replace'">
            <div class="flex-box">
                <div>{{ t('indexPage.coveredBy') }}</div>
                <input class="width70" type="text" v-model="formState.character">
                <div>{{ t('indexPage.replace') }}</div>
            </div>
            <div class="flex-box">
                <a-select class="width70" v-model:value="formState.mode">
                    <a-select-option value="cover">{{ t('indexPage.cover') }}</a-select-option>
                    <a-select-option value="reserve">{{ t('indexPage.save') }}</a-select-option>
                </a-select> 
                {{ t('indexPage.from') }}
                <a-input-number :precision="0" class="width70" v-model:value="formState.start" :min="0" />
                {{ t('indexPage.to') }}
                <a-input-number :precision="0" class="width70" v-model:value="formState.end" :min="0" />
                {{ t('indexPage.place') }}
            </div>
        </template>
    </div>
</template>
</myModal>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import myModal from '@/components/myModal';
const { t } = useI18n()
const emits = defineEmits(["modalCancel", "modalConfirm"])
const props = defineProps({
    setItem: {
        default: null
    }
})
const formState = ref({
    rule: "none",
    mode: "cover",
    character: "*",
    start: '',
    end: ''
})
watch(() => formState.value.start, () => {
    if (formState.value.start > formState.value.end && formState.value.end > 0) {
        formState.value.start = formState.value.end - 1
    }
})
onMounted(() => {
    if (props.setItem?.sensitiveConfig) {
        formState.value = props.setItem.sensitiveConfig
    }
})
const onCancel = () => { 
    emits('modalCancel')
}
const onConfirm = () => {
    emits('modalConfirm', formState.value)
}
</script>

<style lang="less" scoped>
.desensitizationModal {
    width: 400px;
    padding: 30px 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    .flex-box {
        display: flex;
        height: 32px;
        align-items: center;
        gap: 10px;
        :deep(.ant-input-number-focused) {
            background: #F3F3F3;
            box-shadow: inset 0px 0px 0px 2px #3D82F2;
            outline: none; 
        }
        .width100 {
            width: 100px;
        }
        .width70 {
            width: 70px;
        }

    }
}
</style>