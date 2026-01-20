<script setup>
import zhLoginLogo from '@/assets/images/login-logo.png'
import loLoginLogo from '@/assets/images/lo-login-logo.png'
import LoginLogo from '@/assets/images/loginLogo.png'

const useMainStore = mainStore()
const { userInfo } = storeToRefs(useMainStore)
const customTitle = computed(()=>{
  if(userInfo.value && userInfo.value.fid === '29596'){
      return '数字基座'
  } else {
      return '数据中台'
  }
})
const { locale } = useI18n()
const props = defineProps(['loginStep', 'unitInfo'])
</script>

<template>
  <div class="logo-wrap">
    <!-- <img class="logo" :src="locale === 'lo' ? loLoginLogo : zhLoginLogo" alt="" /> -->
    <div class="logo">
      <img class="img" :src="LoginLogo" >
      <div class="title">{{ customTitle }}</div>
    </div>
    <span v-if="props.loginStep !== 1">{{ props.unitInfo.name }}</span>
  </div>
</template>

<style lang="less" scoped>
.logo-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  .logo {
    display: flex;
    align-items: center;
    justify-content: center;
    .img{
      width: 68px;
      height: 68px;
    }
    .title{
      font-weight: 600;
      font-size: 34px;
      color: #2B67FF;
      margin-left: 10px;
    }
  }
  span {
    font-size: 22px;
    font-weight: 600;
    color: #0a2040;
    text-align: center;
  }
}
</style>
