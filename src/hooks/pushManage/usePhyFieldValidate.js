import { message } from 'ant-design-vue'

// 校验字段设置物理字段命名是否合法
export default function () {
  const useApiConfigStore = apiConfigStore()
  const { phyFieldFlag } = storeToRefs(useApiConfigStore)

  if (phyFieldFlag.value === 'repeat') {
    message.error('物理字段名重复')
  }
  if (phyFieldFlag.value === 'blank') {
    message.error('物理字段名不能为空')
  }
  return phyFieldFlag.value !== 'normal'
}
