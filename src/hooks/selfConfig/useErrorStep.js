import { toRefs, computed } from "vue";
import { storeToRefs } from 'pinia'
import { mainStore } from '@/Stores/mainStore';
import { configStore } from '@/Stores/configStore'

// 判断当前自助配置步骤是否异常
export function useErrorStep() {

  const useConfigStore = configStore()

  const useMainStore = mainStore()

  const { activeTabKey } = storeToRefs(useMainStore)

  const { configUniqueData } = storeToRefs(useConfigStore)

  const configData = computed(() => {
    return configUniqueData.value.find(i => i.uniqueId === activeTabKey.value)
  })

  const { 
    operActiveId,
    operationList,
    selfconfigErrorSteps,
    bloodErrorSteps
  } = toRefs(configData.value)


  // 判断步骤索引是否在 异常自助配置步骤 与 血缘异常步骤 之后
  const stepError = computed(() => {
    let stepIndex = operationList.value.findIndex(it => it.uuid === operActiveId.value)

    let selfconfigErrorStep = selfconfigErrorSteps.value[0]

    let bloodErrorStep = bloodErrorSteps.value[0]

    if(selfconfigErrorStep && bloodErrorStep) { 
        return stepIndex >= Math.min(selfconfigErrorStep, bloodErrorStep)
    }

    if(selfconfigErrorStep) {
        return stepIndex >= selfconfigErrorStep
    }

    if(bloodErrorStep) {
        return stepIndex >= bloodErrorStep
    }

    return false
  })

  return {
    stepError
  }

}