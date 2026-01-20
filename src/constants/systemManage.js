import api_img from '@/assets/icons/manage.png'
import template_img from '@/assets/icons/template.png'
import notice_img from '@/assets/icons/notice.png'
import log_img from '@/assets/icons/log.png'
import earth_img from '@/assets/icons/earth.png'
import perr_img from '@/assets/icons/perr-icon.png'
import push_img from '@/assets/icons/push-icon.png'
import task_img from '@/assets/icons/task-icon.png'
import dataSourceImg from '@/assets/icons/data-source.png'
import dataStandardImg from '@/assets/icons/data-standard.png'
import dataMonitorImg from '@/assets/icons/data-monitor.png'
import dataMarketImg from '@/assets/icons/data-market.png'

// 系统管理菜单key
export const SYSTEM_MENU_MAP = {
  // api管理
  API_MANAGE: 'apiManage',
  // 推送管理
  PUSH_MANAGE: 'pushManage',
  // 数据源管理
  DATASOURCE_MANAGE: 'datasourceManage',
  // 数据监控
  DATA_MONITOR: 'dataMonitor',

  // 数据标准
  DATA_STANDARD: 'dataStandard',
  // 标准管理
  STANDARD_MANAGE: 'standardManage',
  // 质量报告
  QUALITY_REPORT: 'qualityReport',
  // 校验配置
  STANDARD_CHECK_CONFIG: 'standardCheckConfig',

  // 模板管理
  TEMPLATE_MANAGE: 'templateManage',
  // 权限管理
  AUTH_MANAGE: 'authManage',
  // 任务中心
  TASK_CENTER: 'taskCenter',

  // 日志管理
  LOG_MANAGE: 'logManage',
  // 资源监控
  RESOURCE_MONITOR: 'resourceMonitor',
  // 审计日志
  AUTI_LOG: 'auitLog',
  // 运维日志
  OPERATE_LOG: 'operateLog',

  // 通知管理
  NOTICE_MANAGE: 'noticeManage',
  // 语言设置
  LANG_SETTING: 'langSetting',
  // 集市管理 
  MARAKET_MANAGE: 'marketManage',
  // 我的数据资源
  MY_DATA_SOURCE: 'myDataSourse',
}

// 系统管理菜单列表数据
export const systemMenus = [
  {
    systemMenuId: SYSTEM_MENU_MAP.API_MANAGE,
    imgSrc: api_img,
    name: 'apiManage.apiManage',
    path: '/system/apiManage'
  },
  {
    systemMenuId: SYSTEM_MENU_MAP.PUSH_MANAGE,
    imgSrc: push_img,
    name: 'pushManage.pushManage',
    path: '/system/pushManage'
  },
  {
    systemMenuId: SYSTEM_MENU_MAP.DATASOURCE_MANAGE,
    imgSrc: dataSourceImg,
    name: 'dataSource.dataSourceManage',
    path: '/system/dataSourceManage'
  },
  {
    systemMenuId: SYSTEM_MENU_MAP.DATA_MONITOR,
    imgSrc: dataMonitorImg,
    name: 'dataMonitor.dataMonitorLabel',
    path: '/system/dataMonitor'
  },
  {
    systemMenuId: SYSTEM_MENU_MAP.DATA_STANDARD,
    imgSrc: dataStandardImg,
    name: 'dataStandard.dataStandard',
    isExpanded: false, // 存在children 添加 isExpanded属性
    childrens: [
      {
        systemMenuId: SYSTEM_MENU_MAP.STANDARD_MANAGE,
        name: 'dataStandard.standardManage',
        path: '/system/dataStandard'
      },
      {
        systemMenuId: SYSTEM_MENU_MAP.QUALITY_REPORT,
        name: 'dataStandard.qualityReport',
        path: '/system/qualityReport'
      },
      {
        systemMenuId: SYSTEM_MENU_MAP.STANDARD_CHECK_CONFIG,
        name: 'dataStandard.standardCheckConfig',
        path: '/system/standardCheckConfig'
      }
    ]
  },
  {
    systemMenuId: SYSTEM_MENU_MAP.TEMPLATE_MANAGE,
    imgSrc: template_img,
    name: 'templateManage.templateManage',
    path: '/system/templateManage'
  },
  {
    systemMenuId: SYSTEM_MENU_MAP.AUTH_MANAGE,
    imgSrc: perr_img,
    name: 'authManage.authManage',
    path: '/system/authorityManage'
  },
  {
    systemMenuId: SYSTEM_MENU_MAP.TASK_CENTER,
    imgSrc: task_img,
    name: 'task.taskCenter',
    path: '/system/taskCenter'
  },
  {
    systemMenuId: SYSTEM_MENU_MAP.LOG_MANAGE,
    imgSrc: log_img,
    name: 'logManage.logManage',
    isExpanded: false, // 存在children 添加 isExpanded属性
    childrens: [
      {
        systemMenuId: SYSTEM_MENU_MAP.RESOURCE_MONITOR,
        name: 'logManage.resourceMonitor',
        path: '/system/resourceMonitor'
      },
      {
        systemMenuId: SYSTEM_MENU_MAP.AUTI_LOG,
        name: 'logManage.auditLogs',
        path: '/system/auditLogs'
      },
      {
        systemMenuId: SYSTEM_MENU_MAP.OPERATE_LOG,
        name: 'logManage.operationLogs',
        path: '/system/operationLogs'
      }
    ]
  },
  {
    systemMenuId: SYSTEM_MENU_MAP.NOTICE_MANAGE,
    imgSrc: notice_img,
    name: 'notice.noticeMange',
    path: '/system/notificationManage'
  },
  {
    systemMenuId: SYSTEM_MENU_MAP.LANG_SETTING,
    imgSrc: earth_img,
    name: 'langManage.langManage',
    path: '/system/langManage'
  },
  {
    systemMenuId: SYSTEM_MENU_MAP.MARAKET_MANAGE,
    imgSrc: dataMarketImg,
    name: 'dataMarket.marketManage',
    path: '/system/marketManage'
  },
  // 我的数据资源--数据集市访客使用
  // {
  //   systemMenuId: SYSTEM_MENU_MAP.MY_DATA_SOURCE,
  //   imgSrc: dataMarketImg,
  //   name: 'dataMarket.myDataSource',
  //   path: '/system/myDataSource'
  // }
]

// 定制需求 定制单位显示数据服务菜单的fid
export const customizedMenuFids = [
  // 北师大二附中
  '208799'
]

// 定制需求 系统菜单显示的子菜单
export const customSystemMenus = [
  SYSTEM_MENU_MAP.TEMPLATE_MANAGE,
  SYSTEM_MENU_MAP.AUTH_MANAGE,
  SYSTEM_MENU_MAP.LANG_SETTING,
  SYSTEM_MENU_MAP.TASK_CENTER
]

// 显示语言设置菜单 fid
export const showLangManageFids = ['210519', '29596']
