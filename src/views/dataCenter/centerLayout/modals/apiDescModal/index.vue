<template>
    <div class='apiDescModal'>
        <div class="maskLayer"></div>
        <div class="popDiv wid560">
            <div class="popuHead">
                <span class="popClose fr" @click="cancel"><img class="img1" :src="closeImg" /></span>
                <p class="fl colorDeep">{{ modalTitle }}</p>
            </div>
            <div class='modalBody'>
                <template v-if="apiDescType === 1">
                    <p>
                        {{ t('api.apiDescText.line1') }}
                    </p>
                    <highlightjs autodetect :code="locale === 'lo' ? loPushDesc : chPushDesc" />
                    <p>{{ t('api.apiDescText.line2') }}</p>
                    <p>{{ t('api.apiDescText.line3') }} {{ interfaceAddress }}</p>
                    <p>{{ t('api.apiDescText.line4') }}</p>
                    <p>{{ t('api.apiDescText.line5') }}</p>
                    <!-- <p>{{ t('api.apiDescText.line6') }}</p> -->
                </template>
                <template v-if="apiDescType === 2">
                    <p>{{ t('api.apiDescText.line7') }}</p>
                    <highlightjs autodetect :code="locale === 'lo' ? loPullDesc : chPullDesc" />
                    <p>{{ t('api.apiDescText.line8') }}</p>
                    <p>{{ t('api.apiDescText.line9') }}</p>
                    <!-- <p>{{ t('api.apiDescText.line10') }}</p> -->
                </template>
                <template v-if="apiDescType === 3">
                    <highlightjs autodetect :code="locale === 'lo' ? loPushDesc : chPushDesc"></highlightjs>
                </template>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { mainStore } from '@/Stores/mainStore';
import { modalStore } from '@/Stores/modalStore';
import { storeToRefs } from 'pinia';
import { chPullDesc, chPushDesc, loPullDesc, loPushDesc } from '@/utils/config'
import closeImg from '@/assets/icons/close.png'
import { useI18n } from 'vue-i18n';
const { t, locale } = useI18n()
const useMainStore = mainStore()
const useModalStore = modalStore()
const { apiDescType, systemConfig } = storeToRefs(useMainStore)
const modalTitle = computed(() => {
    if (apiDescType.value === 1) return t('api.apiIncrPushDesc')
    if (apiDescType.value === 2) return t('api.apiIncrPullDesc')
    if (apiDescType.value === 3) return t('api.apiStructureDesc')
})
const cancel = () => {
    useModalStore.changeApiDescModalVisible()
}

// 接口地址
const interfaceAddress = computed(() => {
    return systemConfig.value.mirror ? 
        location.host :
        'https://appswh.chaoxing.com/biapi/apiIncrUpdate'
})

</script>

<style lang="less" scoped>
.apiDescModal {
    p {
        margin-bottom: 8px;
    }
    :deep(.hljs) {
        background: #E9E9E9;
    }
    .img1 {
        width: 16px;
    }
    .modalBody {
        padding: 30px;
    }
}
</style>