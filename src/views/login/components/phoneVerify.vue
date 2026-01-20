<script setup>
import { getSmsCode, checkSmsCode } from '@/apis/auth';
import myButton from '@/components/buttons/myButton.vue'
import { message } from 'ant-design-vue';

const tipsUrl = {
  privacyPolicy: 'https://homewh.chaoxing.com/agree/privacyPolicy?appId=900001',
  userAgreement: 'https://homewh.chaoxing.com/agree/userAgreement?appId=900001',
}

const COUNT_NUMBER = 60

const verifyState = reactive({
  phoneNumber: '',
  verifyCode: '',
})

const tipsState = reactive({
  phoneNumber: '',
  verifyCode: '',
  verifyCodeLegal: true   // 验证码合法
})

const sendMsgState = reactive({
  sending: false,
  countNum: COUNT_NUMBER,
})

const emits = defineEmits(['nextFn', 'changePhoneNumber'])

const clickFn = type => {
  window.open(tipsUrl[type])
}

// 验证码异常
const verifyCodeError = computed(() => 
  tipsState.verifyCode.trim() && !tipsState.verifyCodeLegal
)

const getVerifyCode = async () => {
  // 手机号校验
  if (!phoneNumberValidate()) return

  // 发送中
  if (sendMsgState.sending) return

  verifyState.verifyCode = ''

  let smsRes = await getSmsCode({phone: verifyState.phoneNumber})

  if(smsRes.code !== 1) {
     return message.error(smsRes.message)
  }

  sendMsgState.sending = true
  tipsState.verifyCodeLegal = true
  tipsState.verifyCode = '短信验证码已发送，可能有延后，请耐心等待'

  let timer = setInterval(() => {
    if (sendMsgState.countNum <= 1) {
      clearInterval(timer)
      sendMsgState.countNum = COUNT_NUMBER
      sendMsgState.sending = false
    }
    sendMsgState.countNum--
  }, 1000)
}

// 手机号校验
const phoneNumberValidate = () => {
  let validatePass = true
  tipsState.phoneNumber = ''
  let phoneNumber = String(verifyState.phoneNumber)

  if (phoneNumber.length !== 11 || !phoneNumber.startsWith(1)) {
    tipsState.phoneNumber = '手机号格式不正确，请重新输入'
    validatePass = false
  } 

  if (!phoneNumber) {
    tipsState.phoneNumber = '请输入手机号'
    validatePass = false
  }
  return validatePass
}

// 验证码校验
const verifyCodeValidate = () => {
  let validatePass = true
  tipsState.verifyCode = ''

  let verifyCode = verifyState.verifyCode

  if (!verifyCode) {
    tipsState.verifyCode = '请输入验证码'
    tipsState.verifyCodeLegal = false
    validatePass = false
  }
  return validatePass
}

// 清除手机号 清空错误提示
const numberInputFn = (e) => {
  let value = e.target.value
  if(value === '') {
    verifyState.phoneNumber = ''
    tipsState.phoneNumber = ''
    return
  }
  if(!/^\d+$/g.test(value)) {
    e.target.value = verifyState.phoneNumber
    return
  }
  verifyState.phoneNumber = value
  emits('changePhoneNumber', value)
}

// 清除验证码 清空验证码提示
const codeInputFn = () => {
  if(!verifyState.verifyCode) {
    tipsState.verifyCode = ''
    tipsState.verifyCodeLegal = true
  }
}

const nextStep = async () => {
  if (!phoneNumberValidate() || !verifyCodeValidate()) return

  let checkRes = await checkSmsCode({phone: verifyState.phoneNumber, code: verifyState.verifyCode})
  if(checkRes.code !== 1) {
    if(checkRes.code === 412) {
      tipsState.verifyCodeLegal = false
      tipsState.verifyCode = '验证码错误'
      return
    }
     return message.error(checkRes.message)
  }
  emits('nextFn', checkRes.data)
}
</script>

<template>
  <div class="verify-wrap">
    <div class="input-container">
      <div class="input-wrap">
        <div class="number-wrap">
          <span class="number-preffix">+86</span>
          <input 
            :class="{errorInput: tipsState.phoneNumber}" 
            type="number" 
            :value="verifyState.phoneNumber" 
            placeholder="手机号" 
            @input="numberInputFn"
          />
        </div>
        <span v-show="tipsState.phoneNumber" :class="{ 'input-tips': true, error: tipsState.phoneNumber }">
          {{ tipsState.phoneNumber }}
        </span>
      </div>
      <div class="input-wrap">
        <div class="code-wrap">
          <span class="verify-icon"></span>
          <input 
            :class="{errorInput: verifyCodeError}" 
            type="number" 
            v-model="verifyState.verifyCode" 
            placeholder="验证码" 
            @input="codeInputFn"
          />
          <span v-if="!sendMsgState.sending" class="get-code" @click="getVerifyCode">获取验证码</span>
          <span v-else class="get-code sending">{{ sendMsgState.countNum }}s 后重新获取</span>
        </div>
        <span 
          v-show="tipsState.verifyCode" 
          :class="{ 
            'input-tips': true,
            error: verifyCodeError
            }"
          >
          {{tipsState.verifyCode}}
        </span>
      </div>
    </div>
    <div class="bottom-container">
      <myButton type="primary" @click="nextStep">下一步</myButton>
      <div class="tips">
        登录即表示同意平台 <i @click="clickFn('privacyPolicy')">《隐私政策》</i>和
        <i @click="clickFn('userAgreement')">《用户协议》</i>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.verify-wrap {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 50px;
  .input-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 30px;
    .code-wrap {
      width: 100%;
      position: relative;
      .verify-icon {
        display: inline-block;
        width: 18px;
        height: 18px;
        background: url(@/assets/icons/verify.png) center/cover;
        position: absolute;
        top: 50%;
        margin-top: -9px;
        left: 14px;
      }
      input {
        padding-left: 42px;
        padding-right: 94px;
      }
      .get-code {
        position: absolute;
        top: 12px;
        right: 14px;
        color: #2b67ff;
        cursor: pointer;
        line-height: 20px;
        &.sending {
          color: #9cc2ff;
          cursor: default;
        }
      }
      + .input-tips {
        display: flex;
        align-items: center;
        &:not(.error) {
          &::before {
            content: '';
            display: inline-block;
            width: 16px;
            height: 16px;
            background: url('@/assets/icons/transfer_success.png') center/cover;
            margin-right: 4px;
          }
        }
      }
    }
    .number-wrap{
      width: 100%;
      position: relative;
      .number-preffix{
        position: absolute;
        position: absolute;
        height: 20px;
        top: 50%;
        margin-top: -11px;
        left: 10px;
      }
      input{
        padding-left: 42px;
      }
    }
    .input-wrap {
      position: relative;
      input {
        width: 100%;
        border-radius: 6px;
        border: 1px solid #d4d6d9;
        background-color: #fff;
        height: 48px;
        &::-webkit-input-placeholder{
          color: #828C99;
          font-size: 14px;
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
        &.error {
          color: #f33131;
        }
      }
    }
  }
  .bottom-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
    text-align: center;
    button {
      height: 48px;
    }
    .tips {
      font-size: 13px;
      height: 18px;
      i {
        font-style: normal;
        color: #2b67ff;
        cursor: pointer;
      }
    }
  }
}
</style>
