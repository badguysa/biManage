<script setup>
import { ref, onMounted, computed } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '提示',
  },
  content: {
    type: String,
    default: '',
  },
  showBottom: {
    type: Boolean,
    default: true,
  },
  okText: {
    type: String,
    default: '确定',
  },
  cancelText: {
    type: String,
    default: '取消',
  },
  close: {
    type: Function,
    default: () => {},
  },
  confirm: {
    type: Function,
    default: () => {},
  },
  cancel: {
    type: Function,
    default: () => {}
  },
  confirmDelay: { // 回调倒计时
    type: Number,
    default: 0,
  },
  cancelDelay: { // 回调倒计时
    type: Number,
    default: 0,
  }
})

const confirmDelayTime = ref(props.confirmDelay)
const cancelDelayTime = ref(props.cancelDelay)

let timer = []

onMounted(() => {
  if(confirmDelayTime.value > 0){
    timer[0] = setInterval(() => {
      if(confirmDelayTime.value > 0) {
        confirmDelayTime.value--
      } else {
        clearInterval(timer[0])
      }
    }, 1000)
  }
  if(cancelDelayTime.value > 0){
    timer[1] = setInterval(() => {
      if(cancelDelayTime.value > 0) {
        cancelDelayTime.value--
      } else {
        clearInterval(timer[1])
      }
    }, 1000)
  }
})

const closeHandle = () => {
  props.close()
}

const confirmHandle = () => {
  if(confirmDelayTime.value) return
  props.confirm()
}

const cancelHandle = () => {
  if(cancelDelayTime.value) return
  props.cancel()
}
</script>

<template>
  <Teleport to="body" v-if="show">
    <div class="modalWrap" v-bind="$attrs">
      <div class="modalContainer">
        <div class="topWrap">
          <span>{{ title }}</span>
          <img src="@/assets/icons/close.png" @click="closeHandle"/>
        </div>
        <div class="middleWrap">
          <span v-html="content"></span>
        </div>
        <div class="bottomWrap" v-if="showBottom">
          <!-- <span class="cancel" @click="cancelHandle">{{ cancelText }}</span> -->
          <span :class="{cancel: true, disabled: cancelDelayTime}" @click="cancelHandle">{{ cancelText }} <i v-if="cancelDelayTime">({{ cancelDelayTime }})s</i></span>
          <span :class="{confirm: true, disabled: confirmDelayTime}" @click="confirmHandle">{{ okText }} <i v-if="confirmDelayTime">({{ confirmDelayTime }})s</i></span>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style lang="less" scoped>
@import './index.less';
</style>
