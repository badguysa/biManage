<template>
    <div class="menuWrapper">
        <div v-for="item in menus" :key="item.key">
            <template v-if="!item.childrens">
                <div v-if="showLang(item)" :class="[item.systemMenuId === activeMenuName ? 'menuItem menuItem-active' : 'menuItem']" @click="goPages(item)">
                    <img :src="item.imgSrc" alt="" />
                    <span>{{ t(item.name) }}</span>
                </div>
            </template>
            <template v-else>
                <div v-if="showLang(item)" class="menuItem">
                    <div class="flex-between" @click="changeExpanded(item)">
                        <div>
                            <img :src="item.imgSrc" alt="" />
                            <span>{{ t(item.name) }}</span>
                        </div>
                        <img 
                            class="arrow" 
                            v-show="!item.isExpanded"
                            src="@/assets/images/downArrow.png" 
                        />
                        <img 
                            class="arrow"
                            v-show="item.isExpanded"
                            src="@/assets/images/topArrow.png" 
                        />
                    </div>
                </div>
                <div v-show="item.isExpanded">
                    <div class="childmenu" v-for="childItem in item.childrens" :key="childItem.key">
                        <div v-if="showLogModule(childItem)" :class="[childItem.systemMenuId === activeMenuName ? 'menuItem childItem menuItem-active' : 'menuItem childItem']" @click="goPages(childItem)">
                            <span>{{ t(childItem.name) }}</span>
                        </div>
                    </div>
                </div>
            </template>
        </div>
    </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { apiManageStore } from '@/Stores/apiManageStore';
import { modalStore } from '@/Stores/modalStore';
import { mainStore } from '@/Stores/mainStore'
import { systemManageStore } from '@/Stores/systemManageStore';
import { dataStandardStore } from '@/Stores/dataStandardStore';
import { removeIndexDot } from '@/apis/task';
import { storeToRefs } from 'pinia';
import { getCookie } from '@/utils/utils';
import { useI18n } from 'vue-i18n';
import { isCustomizedMenuFid } from '@/utils/utils'
import { showLangManageFids, SYSTEM_MENU_MAP, systemMenus } from '@/constants/systemManage'
import createDialog from '@/utils/dialog'

const { t } = useI18n()
const useApiManageStore = apiManageStore()
const useModalStore = modalStore()
const useMainStore = mainStore()
const useSystemManageStore = systemManageStore()
const useDataStandardStore = dataStandardStore()
const router = useRouter()
const route = useRoute()
const { activeMenuName, apiPageId } = storeToRefs(useApiManageStore)
const { routerPath, noticeChange, systemConfig } = storeToRefs(useMainStore)
const { isEditingField } = storeToRefs(useDataStandardStore)

const allMenus = ref(systemMenus)

const menus = computed(() => {
    // 非超级管理员 不显示集市管理
    if(!useMainStore.isSuperManager) {
        allMenus.value = allMenus.value.filter(it => it.systemMenuId !== SYSTEM_MENU_MAP.MARAKET_MANAGE)
    }
    if (!isCustomizedMenuFid()) return allMenus.value

    // 定制单位 系统管理菜单分成 数据服务+系统管理 两个菜单展示
    const customMenusMap = {
        [SYSTEM_MENU_MAP.TEMPLATE_MANAGE]: '/templateManage',
        [SYSTEM_MENU_MAP.AUTH_MANAGE]: '/authorityManage',
        [SYSTEM_MENU_MAP.TASK_CENTER]: '/langManage',
        [SYSTEM_MENU_MAP.LANG_SETTING]: '/taskCenter'
    }

    let includeTargetPath = Object.values(customMenusMap).some(i => routerPath.value.includes(i))

    return includeTargetPath
        ? allMenus.value.filter(menu => Object.keys(customMenusMap).includes(menu.systemMenuId))
        : allMenus.value.filter(menu => !Object.keys(customMenusMap).includes(menu.systemMenuId))
})

// 设置数据标准跳转自动展开
watch(()=> activeMenuName.value ,async (newVal)=>{
    if([SYSTEM_MENU_MAP.STANDARD_MANAGE, SYSTEM_MENU_MAP.STANDARD_CHECK_CONFIG].includes(newVal)){
        await nextTick()
        const expendItem = allMenus.value.find((item)=> item.systemMenuId === SYSTEM_MENU_MAP.DATA_STANDARD)
        if(expendItem){
            expendItem.isExpanded = true
        }
    }
})

const showLang = menu => {
    if(menu.systemMenuId === SYSTEM_MENU_MAP.LANG_SETTING) {
        return showLangManageFids.includes(getCookie('fid'))  
    }
    return true
}

const showLogModule = record =>{
    if (record.systemMenuId === SYSTEM_MENU_MAP.RESOURCE_MONITOR){
        return systemConfig.value.useResourceLog || false
    } else if (record.systemMenuId === SYSTEM_MENU_MAP.OPERATE_LOG){
        return systemConfig.value.useInfraLog || false
    } else if(record.systemMenuId === SYSTEM_MENU_MAP.STANDARD_CHECK_CONFIG){
        // return systemConfig.value.useStandardConfig || false
        return true
    }
    return true
}

const goPages = async(record) => {
    // 在api管理或者主题管理页面进行自助配置
    let isSelfConfig = (route.fullPath === '/system/apiManage' || route.fullPath.indexOf('/system/pushManage')> -1) && ['addApiPage', 'addPushThemePage'].includes(apiPageId.value)

    // 通知管理页面
    let isNotify = route.fullPath === '/system/notificationManage'

    let isDataStandard = route.fullPath === '/system/dataStandard'

    // 正在编辑模板字段库 切换增加提示 
    // TODO: 离开弹窗改为统一使用createDialog
    if(isDataStandard && isEditingField.value) {
        try {
            await createDialog({
                title: '提示',
                content: '离开当前页面后页面内容不会保留，确认离开？'
            })
        } catch(e) {
            return
        }
    }

    // 展示提示弹窗
    if (isSelfConfig || (isNotify && noticeChange.value)) {
        useModalStore.changeExitTipModalVisible()
        useApiManageStore.setGoPath(record)
        useMainStore.switchNoticeChange(false)
        return
    }

    useApiManageStore.setActiveMenuName(record.systemMenuId)
    router.push(record.path)
    useApiManageStore.addApiTab({
        name: record.name,
        id: record.systemMenuId,
        path: record.path,
    })
    const events = {
        "/system/apiManage": () => {
            useApiManageStore.initApiList()
            useApiManageStore.setApiPageId('apiManagePage')
        },
        "/system/pushManage": () => {
            useApiManageStore.setApiPageId('pushManagePage')
            useApiManageStore.initCollectionList()
        },
        "/system/templateManage": () => useApiManageStore.initTemplateList(),
        "/system/auditLogs": () => {
            useSystemManageStore.initSystemAccessList()
        },
        "/system/dataStandard": ()=>{
            useApiManageStore.setApiPageId('dataStandardManagePage')
            useDataStandardStore.getLeftDataListFn()
        },
        "/system/authorityManage": () => useApiManageStore.initAuthorityList(),
        "/system/taskCenter": () => {
            useApiManageStore.initTaskList(0)
            removeIndexDot().then(res => {})
        }
    }
    if (Object.keys(events).includes(record.path)) {
        events[record.path]()
    }
}

const changeExpanded = (item)=>{
    item.isExpanded = !item.isExpanded
}
</script>

<style lang="less" scoped>
.menuWrapper {
    width: 200px;
    height: 100%;
    background-image: url('@/assets/images/leftback.png');
    background-size: cover;
    padding-top: 10px;
    overflow-y: auto;
    scrollbar-width: none;
    .menuItem {
        height: 50px;
        padding: 15px 18px;
        cursor: pointer;
        opacity: 0.6;
        img {
            width: 16px;
            height: 16px;
            margin-right: 8px;
            margin-bottom: 3px;
        }
        span {
            color: #ffffff;
            font-size: 14px;
        }
    }
    .childItem {
        padding: 15px 18px 15px 42px;
    }
    .menuItem:hover {
        opacity: 1 !important;
        background: linear-gradient(90deg, rgba(24, 120, 255, 0.18) 0.53%, rgba(24, 120, 255, 0.075) 99.75%);
    }
    .menuItem-active {
        background: linear-gradient(90deg, rgba(24, 120, 255, 0.6) 0.53%, rgba(24, 120, 255, 0.25) 99.75%) !important;
        position: relative;
        opacity: 1 !important;
        &::after {
            content: '';
            display: inline-block;
            width: 4px;
            height: 100%;
            background-color: #3d82f2;
            position: absolute;
            top: 0;
            left: 0;
        }
    }
    .flex-between{
        display: flex;
        align-items: center;
        justify-content: space-between;
        .arrow {
            width: 10px;
            height: 10px;
        }
    }
}
</style>
