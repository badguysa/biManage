<script setup>
import chooseRecipient from './index.vue'
import tag from '@/components/tag'

const visible = ref(false)
const notifyUser = ref([])

// 接收puid字符串
const props = defineProps(['puidStr'])
const emits = defineEmits(['update:puidStr'])

const echoUserFn = list => {
  notifyUser.value = list
}

const confirm = personList => {
  notifyUser.value = personList
  visible.value = false
}

const cancelFn = target => {
  notifyUser.value = notifyUser.value.filter(it => it.puid !== target.puid)
  emits('update:puidStr', notifyUser.value.map(it => it.puid).join(','))
}

const cleanFn = () => {
  notifyUser.value = []
  emits('update:puidStr', '')
}
</script>

<template>
  <div class="recipient-wrap">
    <div class="btn-wrap">
      <BiButton @click="visible = true" style="margin-right: 8px">
        <template #icon>
          <img src="@/assets/icons/plus.png" style="width: 16px" alt="add" />
        </template>
        添加收件人
      </BiButton>
      <BiButton v-if="notifyUser.length" @click="cleanFn">
        <template #icon>
          <img src="@/assets/icons/broom.png" style="width: 16px" alt="clear" />
        </template>
        一键清除
      </BiButton>
    </div>
    <div class="recipient-list">
      <tag v-for="(item, index) in notifyUser" :title="item.name" @cancel="cancelFn(item)" />
    </div>
  </div>
  <chooseRecipient
    v-show="visible"
    :puidStr="puidStr"
    @update:puidStr="str => $emit('update:puidStr', str)"
    @modalCancel="visible = false"
    @modalConfirm="confirm"
    @echoUserList="echoUserFn"
  ></chooseRecipient>
</template>

<style lang="less" scoped>
.recipient-wrap {
  display: flex;
  flex-direction: column;
  gap: 10px;
  .recipient-list {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
}
</style>
