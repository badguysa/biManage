import { storeToRefs } from 'pinia'
import { mainStore } from '@/Stores/mainStore'
import { configStore } from '@/Stores/configStore'

/**
 * 更新异常步骤
 * @param {*} updateType insert/delete
 * @param {*} targetIndex  deleteIndex
 * @returns Function
 */
export default function (updateType, targetIndex) {
  const useConfigStore = configStore()

  const useMainStore = mainStore()

  const { activeTabKey } = storeToRefs(useMainStore)

  const { configUniqueData } = storeToRefs(useConfigStore)

  const configData = computed(() => {
    return configUniqueData.value.find(i => i.uniqueId === activeTabKey.value)
  })

  const { selfconfigErrorSteps, bloodErrorSteps } = toRefs(configData.value)

  // 包含错误步骤
  const includeErrorStep = computed(() => {
    return selfconfigErrorSteps.value[0] || bloodErrorSteps.value[0]
  })

  return (updateType, targetIndex) => {
    if (!includeErrorStep.value) return
    useConfigStore.updateConfigErrorSteps(activeTabKey.value, updateType, targetIndex)
  }
}
