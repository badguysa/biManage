<script setup>
import myButton from '@/components/buttons/myButton.vue'
import { getToken } from '@/apis/common';
import { getImgVerifyCode } from '@/apis/auth';
import { message } from 'ant-design-vue';
import useSystemConfig from '@/hooks/systemConfig/useSystemConfig'

const { t } = useI18n()

const router = useRouter()

const useMainStore = mainStore()

const { mirrorInfo } = storeToRefs(useMainStore)

const STATE_TIPS_MAP = {
  username: '用户名/手机号',
  password: '密码',
  verifyCode: '验证码'
}

const props = defineProps(['unitInfo', 'phoneNumber'])

const emits = defineEmits(['loginError'])

const loginState = reactive({
  username: '',
  password: '',
  verifyCode: ''
})

const tipsState = reactive({
  username: '',
  password: '',
  verifyCode: ''
})

const showPassword = ref(false)
const passwordType = ref('password')
const verifyCodeUrl = ref('')

const toggleShowFn = () => {
  showPassword.value = !showPassword.value
  if (showPassword.value) {
    passwordType.value = 'text'
  } else {
    passwordType.value = 'password'
  }
}

// 登录校验
const loginValidate = () => {
  let validatePass = true

  tipsState.username = ''
  tipsState.password = ''
  tipsState.verifyCode = ''

  for(let key in loginState) {
    // 非镜像环境无需校验验证码
    if(!mirrorInfo.value.mirror && key === 'verifyCode') {
    // if(key === 'verifyCode') {
      continue
    }
    if(!loginState[key].trim()) {
      tipsState[key] = `请输入${STATE_TIPS_MAP[key]}`
      validatePass = false
    }
  }

  return validatePass
}

const getLoginParams = () => {
  let loginParams = {
    phone: loginState.username,
    password: loginState.password
  }

  // 镜像登录图形验证码
  if(mirrorInfo.value.mirror) {
    loginParams.fid = mirrorInfo.value.fid
    loginParams.checkCode = loginState.verifyCode
  } else {
    loginParams.fid = props.unitInfo.fid
  }

  return loginParams
}

const loginResHandle = (loginRes) => {
  // 登录成功
  if(loginRes.code === 1) {
    initData(loginRes)
    return
  }
  // 登录失败
  switch(loginRes.code) {
    case 1:
      initData(loginRes)
      break
    case 410:
      message.error(loginRes.message)
      // 未完成短信验证码校验
      emits('loginError')
      break
    case 413:
      tipsState.username = '账号错误'
      break
    case 414:
      tipsState.password  = '密码错误'
      break
    default:
      message.error(loginRes.message)
      break
  }
}

const loginFn = async () => {
  if (!loginValidate()) return

  // 公网环境携带验证码token登录
  let loginRes = await getToken(
    getLoginParams(),
    // mirrorInfo.value.mirror ? undefined : {smsToken: props.smsToken}
  )

  loginResHandle(loginRes)
}

const resetLoginState = () => {
  loginState.username = ''
  loginState.password = ''
  loginState.verifyCode = ''
}

const initData = async (res) => {
  if (res.code == 1) {
    message.success(t('common.loginSuccess'))
    // 非镜像 设置双因素校验登录标识
    if(!mirrorInfo.value.mirror) {
      window.localStorage.setItem('TWO_FACTOR_LOGIN', 1)
    }
    window.localStorage.setItem('hasToken', true)
    await useSystemConfig()
    resetLoginState()
    // router.push(`/`)
    window.location.reload()
  } else {
      window.localStorage.removeItem('hasToken')
      message.error(res.message)
  }
}

// 刷新图形验证码
const changeCodeImg = async () => {
  if(!mirrorInfo.value.mirror) return
  let imgRes = await getImgVerifyCode()
  let blob = new Blob([imgRes], {type: 'image/jpg'})
  verifyCodeUrl.value = window.URL.createObjectURL(blob)
}

watch(mirrorInfo, changeCodeImg, { immediate: true })

// 用户名默认与手机号保持一致
watch(() => props.phoneNumber, (nv) => {
  loginState.username = nv
})
</script>

<template>
  <div class="login-wrap">
    <div class="input-container">
      <div class="input-wrap">
        <span class="prefix-icon user-icon"></span>
        <input :class="{errorInput: tipsState.username}" type="text" v-model="loginState.username" placeholder="用户名/手机号" />
        <span class="input-tips" v-if="tipsState.username">{{ tipsState.username }}</span>
      </div>
      <div class="input-wrap">
        <span class="prefix-icon password-icon"></span>
        <input :class="{'pwd-input': true, errorInput: tipsState.password}" :type="passwordType" v-model="loginState.password" placeholder="密码" @keyup.enter="loginFn"/>
        <span :class="['suffix-icon', showPassword ? 'open-icon' : 'close-icon']" @click="toggleShowFn"> </span>
        <span class="input-tips" v-if="tipsState.password">{{ tipsState.password }}</span>
      </div>
      <!-- 镜像环境展示验证码 -->
      <div class="input-wrap verify-input" v-if="mirrorInfo.mirror">
        <span class="prefix-icon verify-icon"></span>
        <input :class="{errorInput: tipsState.verifyCode}" type="text" v-model="loginState.verifyCode" placeholder="验证码" @keyup.enter="loginFn"/>
        <span class="input-tips" v-if="tipsState.verifyCode">{{ tipsState.verifyCode }}</span>
        <img class="verify-img" :src="verifyCodeUrl" alt="">
        <span class="change-img" @click="changeCodeImg">换一张</span>
      </div>
    </div>
    <myButton @click="loginFn" type="primary">登录</myButton>
  </div>
</template>

<style lang="less" scoped>
.login-wrap {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 50px;
  .input-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 30px;
    .input-wrap {
      position: relative;
      .prefix-icon,
      .suffix-icon {
        display: inline-block;
        width: 18px;
        height: 18px;
        background-position: center;
        background-size: cover;
        position: absolute;
        top: 50%;
        margin-top: -9px;
      }
      .prefix-icon {
        left: 14px;
        &.user-icon {
          background-image: url(@/assets/icons/account.png);
        }
        &.password-icon {
          background-image: url(@/assets/icons/suo.png);
        }
        &.verify-icon {
          background-image: url(@/assets/icons/verify.png);
        }
      }
      .suffix-icon {
        right: 14px;
        cursor: pointer;
        &.close-icon {
          background-image: url(@/assets/icons/eyes.png);
        }
        &.open-icon {
          background-image: url(@/assets/icons/eye-show.png);
        }
      }
      input {
        width: 100%;
        border-radius: 6px;
        border: 1px solid #d4d6d9;
        background-color: #fff;
        height: 48px;
        padding-left: 42px;

        &::-webkit-input-placeholder{
          color: #828C99;
          font-size: 14px;
        }
        &.pwd-input {
          padding-right: 40px;
        }
        &:focus {
          box-shadow: none;
          border-color: #2b67ff;
        }
        &.errorInput{
          border-color: #f33131;
        }
      }
      .input-tips {
        line-height: 20px;
        font-size: 13px;
        position: absolute;
        bottom: -24px;
        left: 0;
        color: #f33131;
      }
      &.verify-input{
        display: flex;
        align-items: center;
        height: 48px;
        gap: 10px;
        .verify-img{
          width: 120px;
          flex-shrink: 0;
        }
        .change-img{
          user-select: none;
          line-height: 20px;
          flex-shrink: 0;
          flex-basis: 60px;
          color: #2B67FF;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          cursor: pointer;
          &::before{
            display: inline-block;
            content: '';
            width: 14px;
            height: 14px;
            background: url(@/assets/icons/change.png) center/cover;
          }
        }
      }
    }
  }
  button {
    height: 48px;
  }
}
</style>
