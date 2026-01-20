<template>
  <div class="paginationWrapper" v-if="totalPage !== 1">
    <input v-model="current" class="pageInput" type="text" @change="jumpChange" />
    <span class="separator">/</span>
    <span class="totalNum">{{ totalPage }}</span>
    <div
      :class="{ pageChange: true, prve: true, prveBan: !canPrve }"
      @click="pageChangeHandle('minus')"
    ></div>
    <div
      :class="{ pageChange: true, next: true, nextBan: !canNext }"
      @click="pageChangeHandle('add')"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps(['current', 'total', 'displaySize'])
const emits = defineEmits(['pageChange'])

const current = ref(props.current)
// const totalPage = ref(Math.ceil(props.displaySize / 100))
const totalPage = computed(() => {
  return Math.ceil(props.displaySize / 100)
})

const pageChangeHandle = type => {
  if (type === 'minus' && current.value > 1) {
    current.value = current.value - 1
    emits('pageChange', current.value)
  } else if (type === 'add' && current.value < totalPage.value) {
    current.value = current.value + 1
    emits('pageChange', current.value)
  }
}

const canPrve = computed(() => {
  return current.value === 1 ? false : true
})

const canNext = computed(() => {
  return current.value < totalPage.value ? true : false
})

const jumpChange = () => {
  current.value = current.value > totalPage.value ? totalPage.value : current.value
  emits('pageChange', current.value)
}
</script>

<style lang="less" scoped>
.paginationWrapper {
  height: 24px;
  display: flex;
  align-items: center;
  .pageInput {
    width: 48px;
    height: 24px;
    font-size: 12px;
  }
  .separator {
    margin: 0 4px;
  }
  .pageChange {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    border: 1px solid #e9e9e9;
    margin-left: 8px;
    cursor: pointer;
  }
  .prve {
    background-image: url(@/assets/icons/page-up.png);
    background-size: 16px;
    background-position: center;
  }

  .next {
    background-image: url(@/assets/icons/page-down.png);
    background-size: 16px;
    background-position: center;
  }
  .pageChange:hover {
    background-color: #f7f8fa;
  }

  .prveBan {
    background-image: url(@/assets/icons/ban-page-up.png);
    cursor: not-allowed;
  }

  .nextBan {
    background-image: url(@/assets/icons/ban-page-down.png);
    cursor: not-allowed;
  }
}
</style>
