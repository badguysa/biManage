import { getMirrorInfo } from '@/apis/common'
import { message } from 'ant-design-vue'

// 获取当前环境 镜像/非镜像
export default async function () {
  const useMainStore = mainStore()
  let mirrorRes = await getMirrorInfo()
  if (mirrorRes.code === 1) {
    useMainStore.setMirrorInfo(mirrorRes.data)
  } else {
    message.error(mirrorRes.message)
  }
}
