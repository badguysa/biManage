<template>
    <div class="tabContainer">
        <div
            v-for="tab in showApiTabList"
            :key="tab.id"
            :class="tab.id === activeMenuName ? 'tabItem tabItemActive' : 'tabItem'"
            @click="toggleTabItem(tab)"
        >
            <a-tooltip>
                <template #title>
                    {{ needI18n(tab) ? t(tab.name) : tab.name }}
                </template>
                <span class="tabName">{{ needI18n(tab) ? t(tab.name) : tab.name }}</span>
            </a-tooltip>
            <img v-if="showApiTabList.length > 1" src="@/assets/icons/tabclose.png" alt="" @click.stop="closeTab(tab)" />
        </div>
    </div>
</template>

<script setup>
import { apiManageStore } from '@/Stores/apiManageStore'
import { modalStore } from '@/Stores/modalStore';
import { mainStore } from '@/Stores/mainStore'
import { apiConfigStore } from '@/Stores/apiConfigStore';
import { storeToRefs } from 'pinia'
import { useRouter, useRoute } from 'vue-router'
import {  isCustomizedMenuFid } from '@/utils/utils';
import {computed} from 'vue'
import changeActiveMenu from '@/hooks/systemManage/useChangeActiveMenu'
import { SYSTEM_MENU_MAP } from '@/constants/systemManage';

const { t } = useI18n()

const router = useRouter()
const route = useRoute()
const useMainStore = mainStore()
const useApiManageStore = apiManageStore()
const useModalStore = modalStore()
const useApiConfigStore = apiConfigStore()
const { apiTabList, activeMenuName, apiPageId, pushTopicPageNumber, pushRecordPageNumber } = storeToRefs(useApiManageStore)
const { routerPath, noticeChange } = storeToRefs(useMainStore)
const customizeSysTemRoute = ['/templateManage','/authorityManage','/langManage','/taskCenter']
const showApiTabList = computed(()=>{
    if(isCustomizedMenuFid()){
        //系统管理tab
        if(customizeSysTemRoute.some(i=>routerPath.value.includes(i))){
            if(apiTabList.value.length == 1){
                return [{
                    name: 'templateManage.templateManage',
                    id: SYSTEM_MENU_MAP.TEMPLATE_MANAGE,
                    path: '/system/templateManage',
                }]
            }
            const currentTabList = apiTabList.value.filter(item=>{
                return customizeSysTemRoute.some(i=>item.path.includes(i))
            })
            return currentTabList
        }else{
            // 数据服务tab
            const currentTabList = apiTabList.value.filter(item=>{
                return !customizeSysTemRoute.some(i=>item.path.includes(i))
            })
            return currentTabList
        }
    }else{
        return apiTabList.value
    }
})
// 判断是否需要国际化，如果是系统管理的路由的话则进行国际化，如果只是api详情则不能国际化
const needI18n = (tab) => {
    const noNeed = [
        tab.path.indexOf('/system/pushTopic') > -1, 
        tab.path.indexOf('/system/apiDetail') > -1,
        tab.path.indexOf('/system/pushRecord') > -1
    ]
    if (noNeed.includes(true)) return false
    return true
}

// 切换tab页
const toggleTabItem = (tab) => {
    if (tab.path === route.fullPath) return;
    // if (tab.path.indexOf('/system/apiDetail') > -1 && route.params.id !== tab.id) { // 如果是api详情，且切换的id不一致时
    //     useApiManageStore.initApiDetail({
    //         id: tab.id
    //     })
    // } else if (tab.path.indexOf('/system/pushTopic') > -1 && route.params.id !== tab.id) {
    //     pushTopicPageNumber.value = tab.page || 1
    //     useApiManageStore.initPushTopicList({
    //         collectionId: tab.id
    //     })
    // } else if (tab.path.indexOf('/system/pushRecord') > -1 && route.params.id !== tab.id) {
    //     pushRecordPageNumber.value = tab.page || 1
    //     useApiManageStore.setPushRecordMethod(tab.pushMethod)
    //     useApiManageStore.setPushDataMode(tab.pushDataMode)
    //     useApiManageStore.initPushRecordList({
    //         topicId: tab.id
    //     })
    // }

    // 在api管理或者主题管理页面进行自助配置
    let isSelfConfig = (route.fullPath === '/system/apiManage' || route.fullPath.indexOf('/system/pushManage')> -1) && ['addApiPage', 'addPushThemePage'].includes(apiPageId.value)

    // 通知管理页面
    let isNotify = route.fullPath === '/system/notificationManage'

    // 展示提示弹窗
    if (isSelfConfig || (isNotify && noticeChange.value)) {
        useModalStore.changeExitTipModalVisible()
        useApiManageStore.setGoPath(tab)
        useMainStore.switchNoticeChange(false)
        return
    }

    changeActiveMenu(tab)
    router.push(tab.path)

    if(tab.path === '/system/apiManage') {
       useApiManageStore.setApiPageId(tab.pageId || 'apiManagePage')
    } else if(tab.path === '/system/pushManage') {
       useApiManageStore.setApiPageId(tab.pageId || 'pushManagePage')
    } else if(tab.path === '/system/dataStandard') {
        useApiManageStore.setApiPageId('dataStandardManagePage')
    }
}

// 删除tab页
const closeTab = (tab) => {
    if (showApiTabList.value.length > 1) {
        const tabIndex = showApiTabList.value.findIndex(i => i.id === tab.id)
        useApiManageStore.removeTab(tab)
        let lastTab = showApiTabList.value[tabIndex] ? showApiTabList.value[tabIndex] : showApiTabList.value[showApiTabList.value.length - 1]
        router.push(lastTab.path)
        changeActiveMenu(lastTab)

        useApiConfigStore.setPhyCodeFlag('normal')

        // const removePtahs = [
        //     tab.path.indexOf('/system/pushTopic') > -1,
        //     tab.path === '/system/apiManage',
        //     lastTab.path === '/system/apiManage',
        //     lastTab.path.indexOf('/system/pushTopic') > -1,
        // ]

        if(lastTab.path.indexOf('/system/pushManage') > -1) {
            useApiManageStore.setApiPageId(lastTab.pageId || 'pushManagePage')
        }

        if (lastTab.path.indexOf("/system/apiManage") > -1) {
            useApiManageStore.setApiPageId(lastTab.pageId || 'apiManagePage')
            // useApiConfigStore.goBack()
        }

        if (lastTab.path.indexOf('/system/apiDetail') > -1) {
            useApiManageStore.initApiDetail({
                id: lastTab.id
            })
        } else if (lastTab.path.indexOf('/system/pushTopic') > -1) {
            pushTopicPageNumber.value = 1
            useApiManageStore.initPushTopicList({
                collectionId: lastTab.id
            })
        } else if (lastTab.path.indexOf('/system/pushRecord') > -1) {
            pushRecordPageNumber.value = 1
            useApiManageStore.initPushRecordList({
                topicId: lastTab.id
            })
        }
    }
}
</script>

<style lang="less" scoped>
.tabContainer {
    width: 100%;
    height: 36px;
    padding-right: 15px;
    display: flex;
    // overflow-x: scroll;
    overflow-y: hidden;
    .tabItem {
        width: 160px;
        height: 100%;
        background: #f5f7fc;
        box-shadow: 2px 0px 8px rgba(0, 0, 0, 0.06);
        border-radius: 8px 8px 0px 0px;
        padding: 8px 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        cursor: pointer;
        .tabName {
            font-size: 14px;
            line-height: 20px;
            color: rgba(0, 0, 0, 0.8);
            max-width: 112px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
        }
        img {
            width: 12px;
            height: 12px;
        }
    }
    .tabItemActive {
        background-color: #fff;
    }
}
.tabContainer::-webkit-scrollbar {
    height: 5px;
    background-color: #fff;
}
</style>
