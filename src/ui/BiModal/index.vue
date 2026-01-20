<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  visible: {
    type: Boolean,
    default: true,
  },
  cancelText: {
    type: String,
    default: '取消'
  },
  cancelType: {
    type: String,
    default: ''
  },
  okText: {
    type: String,
    default: '确定'
  },
  width: {
    type: String,
    default: '440px'
  },
  showFooter: {
    type: Boolean,
    default: true
  }
})

const emits = defineEmits(['cancel', 'ok', 'close', 'update:visible'])

const cancelHandle = () => {
  emits('cancel')
  emits('update:visible', false)
}
const okHandle = () => {
  emits('ok')
}
const closeHandle = () => {
  emits('close')
  emits('update:visible', false)
}
</script>

<template>
  <Teleport to="body" v-if="visible">
    <div class="bi-modal-wrap" v-bind="$attrs">
      <div class="modal-container" :style="{ width: props.width }">
        <div class="model-header">
          <span class="modal-title">{{ title }}</span>
          <BiIcon name="close" @click="closeHandle" />
        </div>
        <div class="content">
          <slot></slot>
        </div>
        <div class="bottom" v-if="showFooter">
          <slot name="modal-bottom">
            <BiButton @click="cancelHandle" :type="cancelType">{{ cancelText }}</BiButton>
            <BiButton @click="okHandle" type="primary">{{ okText }}</BiButton>
          </slot>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style lang="less" scoped>
.bi-modal-wrap {
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  background-color: #0000004d;
  .modal-container {
    border-radius: 8px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;
  }
  .model-header {
    height: 53px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 24px;
    color: #000000cc;
    font-weight: 600;
    border-bottom: 1px solid #e9e9e9;
    .modal-title{
      font-size: 16px;
      font-weight: 600;
    }
    svg {
      width: 16px;
      height: 16px;
      cursor: pointer;
    }
  }
  .content {
    padding: 24px;
    border-bottom: 1px solid #e9e9e9;
  }
  .bottom {
    padding: 16px 24px;
    display: flex;
    justify-content: flex-end;
    gap: 24px;
  }
}
</style>
