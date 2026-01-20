import { useRouter } from 'vue-router'

// 数据看板下的数据集市菜单不显示操作按钮
export function useOperateAuth() {
  const router = useRouter()
  const hasAuth = ref(false)

  watch(
    () => router.currentRoute.value,
    nv => {
      hasAuth.value = nv.name !== 'dataMarket'
    },
    {
      immediate: true
    }
  )
  return hasAuth
}
