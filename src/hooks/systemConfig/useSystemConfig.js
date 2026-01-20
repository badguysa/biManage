import { message } from 'ant-design-vue'
import { getUserInfoApi } from '@/apis/auth'
import { getSystemConfig, getUploadTokenAPI } from '@/apis/common'

export default async function () {
  const useMainStore = mainStore()
  const useHomeStore = homeStore()
  let isMirror = false // 是否镜像

  return new Promise(async (resolve, reject) => {
    try {
      await _setUserInfo()
      await _setSystemConfig()
      if(!isMirror){
        await _setUploadConfig()
      }
      useMainStore.loadAccessConfig()
      resolve()
    } catch(e) {
      console.log('system config e', e)
      reject(e)
    } finally {
      resolve()
    }
  })

  // 设置用户信息
  async function _setUserInfo() {
    let userInfoRes = await getUserInfoApi()
    if (userInfoRes.code === 1) {
      localStorage.setItem('dfid', userInfoRes.data.fid)
      useMainStore.setUserInfo(userInfoRes.data)
      useMainStore.setTopMenu()
      useHomeStore.setHomeMenu(userInfoRes.data)
      if(userInfoRes.data.fid === '29596'){
          document.title =  '数字基座'
      }else{
          document.title =  '数据中台'
      }
    } else {
      message.error(userInfoRes.message)
    }
  }

  // 设置配置信息
  async function _setSystemConfig() {
    let systemConfigRes = await getSystemConfig()
    if (systemConfigRes.code === 1) {
      useMainStore.setSystemConfig(systemConfigRes.data)
      isMirror = systemConfigRes.data.mirror
      useHomeStore.hiddenVisual(systemConfigRes.data)
    } else {
      message.error(systemConfigRes.message)
    }
  }

  // 设置上传token
  async function _setUploadConfig() {
    let uploadTokenRes = await getUploadTokenAPI()
    if (uploadTokenRes.code === 1) {
      useMainStore.setUploadInfo(uploadTokenRes.data)
    } else {
      message.error(uploadTokenRes.message)
    }
  }
}
