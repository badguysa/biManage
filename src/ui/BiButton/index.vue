<script setup>
const props = defineProps({
  type: {
    type: String,
    default: '',
    validator(value) {
      // console.log('value', value)
      return ['primary', 'danger','', 'text', 'link'].includes(value)
    },
  },
  size: {
    type: String,
    default: '',
    validator(value) {
      // console.log('value', value)
      return ['small', '', 'large'].includes(value)
    },
  },
  disabled: {
    type: Boolean,
    default: false
  },
  // danger: {
  //   type: Boolean,
  //   default: false,
  // },
})

const _buttonRef = ref()

const buttonClassName = computed(() => {
  let { type, size } = props
  if(!type && !size) return 'bi-button'
  return [
    type ? `bi-button_${props.type}` : 'bi-button', 
    size ? `bi-button_${props.size}` : 'bi-button',
  ]
})

defineExpose({
  scrollIntoView(){
    _buttonRef.value && _buttonRef.value.scrollIntoView()
  }
})

</script>

<template>
  <button ref="_buttonRef" :class="buttonClassName" :disabled="props.disabled">
    <slot name="icon"></slot>
    <span>
      <slot></slot>
    </span>
  </button>
</template>

<style lang="less" scoped>
@theme-color: #2b67ff;
button {
  height: 32px;
  border-radius: 4px;
  padding: 7px 12px;
  background-color: #fff;
  cursor: pointer;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 2px;
  &.bi-button {
    color: #2b67ff;
    border: 1px solid #2b67ff;
    &:hover{
      background-color: #E8F2FF;
    }
    &[disabled]{
      cursor: not-allowed;
      color: #9CC2FF;
      border-color: #9CC2FF;
    }
    &_primary {
      color: #fff;
      background-color: #2b67ff;
      border: none;
      &:hover {
        background-color: #5188ff;
      }
      &[disabled]{
        color: #fff;
        cursor: not-allowed;
        background-color: #9CC2FF;
      }
      
    }
    &_danger {
      color: #F33131;
      background-color: #fff;
      border-color: #F39292;
      &:hover { 
        background: #F331311A;
      }
      &[disabled]{
        color: #F331314D;
        border-color:  #F331314D;
        cursor: not-allowed;
      }
      
    }
    &_large {
      height: 36px;
    }
    &_small {
      height: 28px;
    }
  }

  // :deep(.svgIcon){
  //   width: 14px;
  //   height: 14px;
  // }
 
}
</style>
