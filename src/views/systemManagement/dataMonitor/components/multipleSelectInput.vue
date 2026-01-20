<script setup>
import tag from '@/components/tag'

const props = defineProps({
  title: {
    type: String,
    default: '数据表'
  },
  placeholder: {
    type: String,
    default: '添加数据'
  },
  selectData: {
    type: Array,
    default: []
  },
  dataIndex: {
    type: String,
    required: true
  }
})

const emits = defineEmits(['add', 'delete'])

const cancelFn = (item) => {
  // 删除表分组
  if(props.dataIndex === 'tables' && !item.isTable) {
    emits('delete', 'groups', item)
    return
  }
  emits('delete', props.dataIndex, item)
}

</script>

<template>
  <div class="input-wrap">
    <div class="title">{{ title }}</div>
    <div class="input-box">
      <span v-if="!selectData.length" class="tips">{{ placeholder }}</span>
      <template v-else>
        <tag
          v-for="item in selectData"
          :title="item.name"
          @cancel="cancelFn(item)"
        />
      </template>
      <span class="add-icon" @click="$emit('add', dataIndex)"></span>
    </div>
  </div>
</template>

<style lang="less" scoped>
.input-wrap {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 6px 0;
  .title {
    font-weight: 500;
    color: #000000cc;
  }
  .input-box {
    background-color: #ffffff;
    border: 1px solid #e9e9e9;
    border-radius: 4px;
    padding: 5px 28px 5px 12px;
    line-height: 22px;
    position: relative;
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    .tips {
      color: #00000033;
    }
    .add-icon {
      display: inline-block;
      width: 16px;
      height: 16px;
      background: url(../../../../assets/icons/add_relation.png) center/cover;
      cursor: pointer;
      position: absolute;
      right: 12px;
      top: 8px;
    }
  }
}
</style>
