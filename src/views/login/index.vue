<script setup>
import Logo from './components/logo.vue'
import Back from './components/back.vue'
import selectUnit from './components/selectUnit.vue'
import phoneVerify from './components/phoneVerify.vue'
import userNameLogin from './components/userNameLogin.vue'

const router = useRouter()
const useMainStore = mainStore()
const { mirrorInfo } = storeToRefs(useMainStore)

onMounted(() => {
  if(localStorage.getItem('hasToken')){
    router.push('/')
  }
})

// 登录步骤
const loginStep = ref(1)

// 选中单位信息
const unitInfo = ref({})

// const smsToken = ref('')

const unitList = ref([])

// 用于第三步账号默认展示手机号
const phoneNumber = ref('')

// 镜像单位直接展示第三步 用户名登录
watch(mirrorInfo, () => {
  loginStep.value = mirrorInfo.value.mirror ? 3 : 1
}, {
  immediate: true
})

// 只有一个单位 
const singleUnit = computed(() => unitList.value.length === 1)

const nextStep = (info) => {
  if(!info) return

  // smsToken.value = info.token
  unitList.value = info.units

  if(singleUnit.value) {
    loginStep.value = 3
    unitInfo.value = info.units[0]
  } else {
    loginStep.value = 2
  }
}

const preStep = () => {
  if(loginStep.value === 2) {
    loginStep.value = 1
  } 
  if(loginStep.value === 3) {
    loginStep.value = singleUnit.value ? 1 : 2
  }
}

const selectUnitFn = item => {
  loginStep.value++
  unitInfo.value = item
}

const loginErrorHandle = () => {
  loginStep.value = 1
}

const changeNumberFn = (val) => {
  phoneNumber.value = val
}

</script>

<script>
// 缓存组件时 排除登录页
export default {
  name: 'loginView'
}
</script>

<template>
  <div class="space-login">
    <div :class="{ 'login-layout': true, 'min-layout': loginStep !== 1 }">
      <Back v-show="!mirrorInfo.mirror && loginStep !== 1" @click="preStep" />
      <Logo v-show="loginStep !== 2" :loginStep="loginStep" :unitInfo="unitInfo" />
      <!-- 手机号验证 -->
      <phoneVerify v-show="loginStep === 1" @nextFn="nextStep" @changePhoneNumber="changeNumberFn"/>
      <!-- 选择单位 -->
      <selectUnit v-show="loginStep === 2" :unitList="unitList" @selectFn="selectUnitFn" />
      <!-- 用户名登录 -->
      <userNameLogin 
        v-show="loginStep === 3"
        :unitInfo="unitInfo"
        :phoneNumber="phoneNumber"
        @loginError="loginErrorHandle"
      />
        <!-- :smsToken="smsToken" -->
    </div>
  </div>
</template>

<style lang="less" scoped>
.space-login {
  height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  background-image: url(@/assets/images/login-bgi.png);
  .login-layout {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 50px;
    width: 460px;
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid #ffffff;
    box-shadow: 0px 4px 24px rgba(0, 0, 0, 0.04);
    border-radius: 12px;
    gap: 40px;
    &.min-layout {
      padding: 40px 50px;
      gap: 25px;
    }
  }
}
</style>
