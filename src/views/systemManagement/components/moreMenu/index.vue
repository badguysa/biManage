<script setup>
const props = defineProps({
  menuList: {
    required: true,
    type: Array
  },
  target: {
    required: false,
    type: Object
  },
  offset: {
    required: false,
    type: Array,
    default: [-50, 20]
  }
})

let state = reactive({
  show: false,
  timer: null
})

const handleMousemove = type => {
  switch (type) {
    case 'enterIcon':
      clearTimeout(state.timer)
      state.show = true
      break
    case 'leaveIcon':
      state.timer = setTimeout(() => {
        state.show = false
      }, 200)
      break
    case 'enterMenu':
      clearTimeout(state.timer)
      break
    case 'leaveMenu':
      state.show = false
      break
  }
}
</script>
<template>
  <BiIcon
    v-bind="$attrs"
    name="more"
    :color="state.show ?  '#2B67FF' : '#00000066'"
    @mouseenter="handleMousemove('enterIcon')"
    @mouseleave="handleMousemove('leaveIcon')"
  />
  <div
    class="more-menu"
    v-if="state.show"
    @mouseenter="handleMousemove('enterMenu')"
    @mouseleave="handleMousemove('leaveMenu')"
  >
    <span v-for="menu in menuList" @click.stop="menu.handle(target)">{{ menu.title }}</span>
  </div>
</template>

<style lang="less" scoped>
svg {
  display: none;
  width: 12px;
  height: 12px;
  cursor: pointer;
  position: absolute;
  right: 0;
}
.more-menu {
  position: absolute;
  width: 68px;
  padding: 4px 0;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  background-color: #fff;
  z-index: 1;
  right: v-bind('props.offset[0] + "px"');
  top: v-bind('props.offset[1] + "px"');
  & > span {
    display: inline-block;
    width: 100%;
    padding: 10px 12px;
    font-size: 14px;
    color: #000000cc;
    cursor: pointer;
    &:hover {
      font-weight: 500;
      color: #0a2040;
      background-color: #f7faff;
    }
  }
}
</style>
