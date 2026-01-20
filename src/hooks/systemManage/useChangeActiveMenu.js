
import { apiManageStore } from '@/Stores/apiManageStore'
import { SYSTEM_MENU_MAP } from '@/constants/systemManage'

const useApiManageStore = apiManageStore()

export default function(tab) {
    const systemPaths = ['/system/apiDetail', '/system/historyRecord', '/system/apiManage']
    const pushChildren = [
        tab.path.indexOf('/system/pushManage') > -1, 
        tab.path.indexOf('/system/pushTopic') > -1, 
        tab.path.indexOf('/system/pushRecord') > -1
    ]
    if (systemPaths.includes(tab.path) || tab.path.indexOf('/system/apiDetail') > -1) {
        useApiManageStore.setActiveMenuName(SYSTEM_MENU_MAP.API_MANAGE)
    } else if (tab.path === '/system/templateManage') {
        useApiManageStore.setActiveMenuName(SYSTEM_MENU_MAP.TEMPLATE_MANAGE)
    } else if (tab.path === '/system/authorityManage') {
        useApiManageStore.setActiveMenuName(SYSTEM_MENU_MAP.AUTH_MANAGE)
    } else if (tab.path === '/system/langManage') {
        useApiManageStore.setActiveMenuName(SYSTEM_MENU_MAP.LANG_SETTING)
    } else if (pushChildren.includes(true)) {
        useApiManageStore.setActiveMenuName(SYSTEM_MENU_MAP.PUSH_MANAGE)
    } else if (tab.path === '/system/taskCenter') {
        useApiManageStore.setActiveMenuName(SYSTEM_MENU_MAP.TASK_CENTER)
    } else if (tab.path === '/system/dataSourceManage') {
        useApiManageStore.setActiveMenuName(SYSTEM_MENU_MAP.DATASOURCE_MANAGE)
    } else if (tab.path === '/system/notificationManage') {
        useApiManageStore.setActiveMenuName(SYSTEM_MENU_MAP.NOTICE_MANAGE)
    } else if (tab.path === '/system/dataStandard') {
        useApiManageStore.setActiveMenuName(SYSTEM_MENU_MAP.STANDARD_MANAGE)
    } else if (tab.path === '/system/standardCheckConfig') {
        useApiManageStore.setActiveMenuName(SYSTEM_MENU_MAP.STANDARD_CHECK_CONFIG)
    } else if (tab.path === '/system/resourceMonitor') {
        useApiManageStore.setActiveMenuName(SYSTEM_MENU_MAP.RESOURCE_MONITOR)
    } else if (tab.path === '/system/auditLogs') {
        useApiManageStore.setActiveMenuName(SYSTEM_MENU_MAP.AUTI_LOG)
    } else if (tab.path === '/system/operationLogs') {
        useApiManageStore.setActiveMenuName(SYSTEM_MENU_MAP.OPERATE_LOG)
    }  else if (tab.path === '/system/dataMonitor') {
        useApiManageStore.setActiveMenuName(SYSTEM_MENU_MAP.DATA_MONITOR)
    } else if (tab.path === '/system/marketManage') {
        useApiManageStore.setActiveMenuName(SYSTEM_MENU_MAP.MARAKET_MANAGE)
    }  else if (tab.path === '/system/myDataSource') {
        useApiManageStore.setActiveMenuName(SYSTEM_MENU_MAP.MY_DATA_SOURCE)
    }
}