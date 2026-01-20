import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
    {
        path: '/',
        name: 'home',
        redirect: '/dataBoard',
        component: () => import('../views/homePage/index.vue'),
    },
    {
        path: '/datacenter',
        name: 'home1',
        component: () => import('../views/dataCenter/dataIndex.vue'),
    },
    {
        path: '/login',
        name: 'login',
        component: () => import('../views/login'),
    },
    {
        path: '/system',
        name: 'system',
        component: () => import('../views/systemManagement/systemIndex.vue'),
        children: [
            {
                name: '/system/apiManage',
                path: '',
                redirect: '/system/apiManage',
            },
            // api配置子路由
            {
                path: 'apiManage',
                name: 'apiManage',
                component: () => import('../views/systemManagement/apiManage/index.vue'),
            },
            // api详情页路由
            {
                path: 'apiDetail/:id',
                name: 'apiDetail',
                component: () => import('../views/systemManagement/apiDetail/index.vue'),
            },
            {
                path: 'templateManage',
                name: 'templateManage',
                component: () => import('../views/systemManagement/templateManage/index.vue'),
            },
            {
                path: 'authorityManage',
                name: 'authorityManage',
                component: () => import('../views/systemManagement/authorityManage/index.vue'),
            }, 
            {
                path: 'historyRecord',
                name: 'historyRecord',
                component: () => import('../views/systemManagement/historyRecord/index.vue')
            },
            {
                path :'langManage',
                name: 'langManage',
                component: () => import('../views/systemManagement/langManage/index.vue')
            },
            {
                path: 'pushManage',
                name: 'pushManage',
                component: () => import('../views/systemManagement/pushManage/index.vue')
            },
            {
                path: 'pushTopic/:id',
                name: 'pushTopic',
                component: () => import('../views/systemManagement/pushTopicDetail/index.vue')
            },
            {
                path: 'pushRecord/:id',
                name: 'pushRecord',
                component: () => import('../views/systemManagement/pushRecord/index.vue')
            },
            {
                path: 'resourceMonitor',
                name: 'resourceMonitor',
                component: () => import('../views/systemManagement/logManage/resourceMonitor/index.vue'),
            },
            {
                path: 'auditLogs',
                name: 'auditLogs',
                component: () => import('../views/systemManagement/logManage/auditLogs/index.vue'),
            },
            {
                path: 'operationLogs',
                name: 'operationLogs',
                component: () => import('../views/systemManagement/logManage/operationLogs/index.vue'),
            },
            {
                path: 'taskCenter',
                name: 'taskCenter',
                component: () => import('../views/systemManagement/taskCenter/index.vue')
            },
            {
                path: 'dataSourceManage',
                name: 'dataSourceManage',
                component: () => import('../views/systemManagement/dataSourceManage/index.vue')
            },
            {
                path: 'dataMonitor',
                name: 'dataMonitor',
                component: () => import('../views/systemManagement/dataMonitor/index.vue')
            },
            {
                path: 'notificationManage',
                name: 'notificationManage',
                component: () => import('../views/systemManagement/notificationManage/index.vue')
            },
            {
                path: 'dataStandard',
                name: 'dataStandard',
                component: () => import('../views/systemManagement/dataStandard/standardManage.vue')
            },
            {
                path: 'qualityReport',
                name: 'qualityReport',
                component: () => import('../views/systemManagement/dataStandard/qualityReport.vue')
            },
            {
                path: 'standardCheckConfig',
                name: 'standardCheckConfig',
                component: () => import('../views/systemManagement/dataStandard/standardCheckConfig.vue')
            },
            {
                path: 'marketManage',
                name: 'marketManage',
                component: () => import('../views/systemManagement/dataMarket/index.vue')
            },
            {
                path: 'myDataSource',
                name: 'myDataSource',
                component: () => import('../views/systemManagement/myDataSource/index.vue')
            }
        ],
    },
    {
        path: '/dataBoard',
        name: 'dataBoard',
        component: () => import('../views/homePage/index.vue'),
        children: [{
            name: '/dataBoard/dataOverview',
            path: '',
            redirect: '/dataBoard/dataOverview',
        }, {
            path: 'visual',
            name: 'visualData',
            component: () => import('../views/homePage/datavVsualization/index.vue'),
        }, {
            path: 'dataOverview',
            name: 'dataOverview',
            component: () => import('../views/homePage/dataOverview/index.vue')
        }, {
            path: 'apiMonitor',
            name: 'apiMonitor',
            component: () => import('../views/homePage/apiMonitor/index.vue')
        }, {
            path: 'cloudStorage',
            name: 'cloudStorage',
            component: () => import('../views/homePage/cloudStorage/index.vue')
        }, {
            path: 'dataMarket',
            name: 'dataMarket',
            component: () => import('../views/systemManagement/dataMarket/index.vue')
        }]
    },
    // 组件测试路由
    // {
    //     path: '/testComponent',
    //     name: 'testComponent',
    //     component: () => import('../views/testComponent/index.vue')
    // }
]

const router = createRouter({
    history: createWebHashHistory(process.env.BASE_URL),
    routes,
})

router.beforeEach((to, from) => {
    // let _token = localStorage.getItem('hasToken')
    // console.log('to', to)
    // // 非登录页无token跳转到登录页 排除统一认证跳转连接
    // if(to.name !== 'login' && !_token && !to.query.userInfo) {
    //     return {name: 'login'}
    // }

    const useMainStore = mainStore()
    // 数据集市游客只能访问数据看板下数据集市页面
    if(useMainStore.isDataMarketVisitor && to.name !== 'dataMarket') {
        return {name: 'dataMarket'}
    }
})

export default router
