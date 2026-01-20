import { getReularUpdateTips } from '@/utils/regularUpdate'
import { v4 as uuidv4 } from 'uuid'

// 定时更新
export default function (setType) {
  const useMainStore = mainStore()
  const useApiManageStore = apiManageStore()
  const { pageId, indexTableDesc } = storeToRefs(useMainStore)
  // 推送主题编辑数据
  const { themeEditData } = storeToRefs(useApiManageStore)

  const updateConfig = {
    updateUnit: 1,
    updateRate: 1,
  }
  let uuid = ref('')

  onMounted(() => {
    setUpdateParams()
    setRegularUpdateData()
  })

  // 定时组件渲染状态
  const renderStatus = computed(() => {
    // pageId: PageEditTable: 非自主配置表编辑; 
    // setType: page_config_edit/push_theme_edit: 自助配置表编辑/推送主题编辑;
    return (pageId.value === 'PageEditTable' || 
            ['page_config_edit', 'push_theme_edit'].includes(setType)) 
              ? 'edit' : 'add'
  })

  const updateParams = computed(() => 
    indexTableDesc.value.parseUpdateParams
  )

  // 推送主题cron表达式
  const pushThemeCron = computed(() => {
    return themeEditData.value.cronExpression
  })

  // 设置更新频率
  function setUpdateParams() {
    // 新增或推送主题设置定时更新
    if(renderStatus.value === 'add' || setType === 'push_theme_edit') return

    if (updateParams.value?.updateUnit !== undefined) {
      updateConfig.updateUnit = updateParams.value.updateUnit
    }
    if (updateParams.value?.updateRate !== undefined) {
      updateConfig.updateRate = updateParams.value.updateRate
    }
  }

  // 设置定时更新数据
  function setRegularUpdateData() {
    uuid.value = uuidv4()
    // 重置定时更新信息
    useMainStore.setRegularUpdateInfo({
      tips: '每隔 1 天，从 0 点 0 分 开始更新',
      cronStr: '0 0 0 0/1 * ?'
  },uuid.value)

    let timeExpression = updateParams?.value?.timeExpression, cronStr = '', tips = ''
    let { updateUnit, updateRate } = updateConfig

    if(setType === 'push_theme_edit') {
      timeExpression = pushThemeCron.value
    }

    // 无cron表达式 手动构造
    if (!timeExpression || renderStatus.value === 'add') {
      switch (updateUnit) {
        case 0: // 小时
          cronStr = `0 0 0/${updateRate} * * ? `
          tips = `每隔 ${updateRate} 小时，从 0 点 0 分 开始更新`
          break
        case 1: // 天
          cronStr = `0 0 0 1/${updateRate} * ? `
          tips = `每隔 ${updateRate} 天，从 0 点 0 分 开始更新`
          break
        case 2: // 分钟
          cronStr = `0 0/${updateRate} * * * ?`
          tips = `每 ${updateRate} 分钟 更新`
          break
      }
    } else {
      cronStr = timeExpression
      tips = getReularUpdateTips(timeExpression, 'detail')
    }

    useMainStore.setRegularUpdateInfo({ cronStr, tips },uuid.value)
  }
  return {
    uuid
  }
}
