<script setup>
const props = defineProps({
  tabList: {
    type: Array,
    default: () => []
    //  {key: '0', name: '正在使用'},
    //  {key: '1', name: '历史使用'}
  },
  activeKey: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:activeKey'])
let { tabList, activeKey } = toRefs(props)
const tabsChange = (key) => {
  emit('update:activeKey', key)
}
</script>

<template>
  <div class="basic-tabs">
    <div v-for="item in tabList" :key="item.key" :class="[activeKey === item.key ? 'tab-is-active' : '']"
      @click="tabsChange(item.key)">
      {{ item.name }}
    </div>
  </div>
</template>

<style lang="less" scoped>
.basic-tabs {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 3px;
  width: 198px;
  height: 36px;
  background: #F3F3F3;
  border-radius: 8px;
  margin-bottom: 10px;

  &>div {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 0px 12px;
    isolation: isolate;
    height: 30px;
    border-radius: 6px;
    flex: none;
    order: 1;
    flex-grow: 1;
    cursor: pointer;
    color: rgba(0, 0, 0, 0.4);
    transition: background 0.6s cubic-bezier(0.075, .82, .165, 1);
  }

  .circle {
    min-width: 16px;
    height: 16px;
    text-align: center;
    border-radius: 10px;
    padding: 0 6px;
    background: #F53F3F;
    line-height: 16px;
    font-size: 12px;
    color: #FFF;
    margin-left: 6px;
    white-space: nowrap;
  }

  .tab-is-active {
    background: #FFFFFF;
    box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.1);
    border-radius: 6px;
    color: rgba(0, 0, 0, 0.8);
    font-weight: 600;
  }
}
</style>
