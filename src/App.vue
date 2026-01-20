<template>
  <div style="overflow: hidden;">
    <headerMenuVue />
    <router-view v-slot="{ Component }" v-if="renderPage">
      <keep-alive exclude="loginView">
        <component :is="Component" />
      </keep-alive>
    </router-view>
    <!-- 全局弹窗 -->
    <globalModal />
  </div>
</template>

<script setup>
import headerMenuVue from './components/topMenu.vue';
import { getToken } from '@/apis/common';
import { mainStore } from '@/Stores/mainStore';
import { storeToRefs } from 'pinia';
import { getUrlParam, getHashParam } from '@/utils/utils';
import useMirrorInfo from '@/hooks/systemConfig/useMirrorInfo'
import useSystemConfig from '@/hooks/systemConfig/useSystemConfig'
import useLanguageInit from '@/hooks/systemConfig/useLanguageInit'
import globalModal from './components/globalModal'
import { message } from 'ant-design-vue';

const router = useRouter()
const useMainStore = mainStore()
const { mirrorInfo } = storeToRefs(useMainStore)

const renderPage = ref(false)

useLanguageInit()

onMounted(async() => {
  await useMirrorInfo()
  initMenuList()
})

const initMenuList = async () => {
  if (getUrlParam('userInfo') || getHashParam('userInfo')) {  //是否是统一认证登录成功后返回的
    localStorage.removeItem('TWO_FACTOR_LOGIN')
    localStorage.removeItem('hasToken')
    const userInfo = getUrlParam('userInfo') || getHashParam('userInfo')
    // 统一认证登录进页面逻辑
    getSystemToken({ userInfo })
  } else {
    if (mirrorInfo.value.mirror) { // 镜像
      if(!localStorage.getItem('hasToken')) {
        getSystemToken()
      } else {
        await useSystemConfig()
        renderPage.value = true
      }
    } else {
      // 公网进页面逻辑
      getSystemToken()
    }
  }
}

const getSystemToken = async (params) => {
  // 双因素校验登录 不重新获取token
  if(localStorage.getItem('TWO_FACTOR_LOGIN')) {
    await useSystemConfig()
    renderPage.value = true
    return
  }

  // 微服务登录 切换单位 每次刷新页面需重新获取token 
  getToken(params).then(async (res) => {
    if (res.code == 1) {
      localStorage.setItem('hasToken', true)
      await useSystemConfig()
      renderPage.value = true
    } else if (res.code == 402) {
      // 统一认证未登录 跳转到统一认证登录地址
      if (res.data.openUnifCertif && res.data.mirror) {
        location.href = res.data.unifCertifAddr
      }
    } else{
      if(res.code == 0){
        message.error(res.message)
      }
      renderPage.value = true
      localStorage.removeItem('hasToken')
      router.push('/login')
    }
  })
}

</script>

<style lang="less">
* {
  margin: 0;
  padding: 0;

  ul {
    list-style: none;
  }

  a {
    text-decoration: none;
  }
}
</style>
