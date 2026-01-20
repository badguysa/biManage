<template>
    <div className="exitTipModal">
        <div class="maskLayer"></div>
        <div class="popDiv wid400">
            <div class="popuHead">
                <span class="popClose fr">
                    <img style="width: 16px" src="@/assets/icons/close.png" @click="cancel" />
                </span>
                <p class="fl colorDeep">{{ t('common.tip') }}</p>
            </div>

            <div className="modalBody">
                {{ t('common.exitTip') }}
            </div>

            <div class="popuBottom shadowBox">
                <myButton class="fr mr25" type="primary" @click="onOk">{{ t('common.confirm') }}</myButton>
                <myButton class="fr mr25" @click="cancel">{{ t('common.cancel') }}</myButton>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onUnmounted } from 'vue';
import myButton from '@/components/buttons/myButton.vue';
import { modalStore } from '@/Stores/modalStore';
import { apiManageStore } from '@/Stores/apiManageStore';
import { apiConfigStore } from '@/Stores/apiConfigStore';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n';
import changeActiveMenu from '@/hooks/systemManage/useChangeActiveMenu'

const { t } = useI18n()
const router = useRouter()
const useModalStore = modalStore()
const useApiManageStore = apiManageStore()
const useApiConfigStore = apiConfigStore()
const { goPath, activeMenuName } = storeToRefs(useApiManageStore)
onUnmounted(() => {
    useApiManageStore.setGoPath('')
})
const onOk = () => {
    if(goPath.value.path === '/system/pushManage') {
        useApiManageStore.setApiPageId('pushManagePage')
    } else if(goPath.value.path === '/system/apiManage') {
        useApiManageStore.setApiPageId('apiManagePage')
    }
    
    // api管理 推送管理 重置pageId
    useApiManageStore.changeTabPageId('reset', activeMenuName.value)

    useApiConfigStore.goBack()
    router.push(goPath.value.path)
    useApiManageStore.addApiTab(goPath.value)
    changeActiveMenu(goPath.value)
    const events = {
        "/system/apiManage": () => useApiManageStore.initApiList(),
        "/system/pushManage": () => useApiManageStore.initCollectionList(),
        "/system/templateManage": () => useApiManageStore.initTemplateList(),
        "/system/authorityManage": () => useApiManageStore.initAuthorityList(),
        "/system/taskCenter": () => useApiManageStore.initTaskList(0)
    }
    if (Object.keys(events).includes(goPath.value.path)) {
        events[goPath.value.path]()
    }
    useModalStore.changeExitTipModalVisible()
}
const cancel = () => {
    useModalStore.changeExitTipModalVisible()
}

</script>

<style lang="less" scoped>
.exitTipModal {
    font-family: 'PingFang SC';
    font-style: normal;
    width: 100%;

    .modalBody {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        padding: 30px 24px;
        padding-left: 30px;
        gap: 16px;
        width: 400px;
        height: 82px;
        font-family: 'PingFang SC';
        font-style: normal;
        font-weight: 400;
        font-size: 16px;
        line-height: 22px;
        text-align: justify;
        color: rgba(0, 0, 0, 0.8);

        .text {
            font-weight: 600;
            margin: 0px 5px;
            color: #3d82f2;
        }
    }
}
</style>