import router from '@/router'
import { removeIndexDot } from '@/apis/task'
import { SYSTEM_MENU_MAP } from '@/constants/systemManage'

// 跳转到任务中心
export default function () {
  const useMainStore = mainStore()
  const useApiManageStore = apiManageStore()
  const { routerPath} = storeToRefs(useMainStore)

  if (routerPath.value === '/system/taskCenter') return

  useApiManageStore.setTaskSearchType(0)
  useApiManageStore.setTaskHistoryDiff(0)
  useApiManageStore.setActiveMenuName(SYSTEM_MENU_MAP.TASK_CENTER)
  useApiManageStore.addApiTab({
      name: 'task.taskCenter',
      id: SYSTEM_MENU_MAP.TASK_CENTER,
      path: '/system/taskCenter',
  })
  useApiManageStore.initTaskList()
  useApiManageStore.setTaskSetInterval()
  useApiManageStore.setTaskListInterval('current')

  router.push('/system/taskCenter')
  removeIndexDot()
}