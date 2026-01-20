<script setup>
const props = defineProps({
  list: {
    type: Array,
    default: []
  },
  checkable: {
    type: Boolean,
    default: false
  },
  selectedKeys: {
    type: Array,
    default: []
  },
  keyName: {
    type: String,
    default: 'tableAlias'
  },
  showNoData: {
    type: Boolean,
    default: true
  }
})
const emits = defineEmits(['select'])
</script>

<template>
  <div class="table-list-wrap">
    <div
      class="table-node"
      v-for="item in list"
      @click.stop="$emit('select', item)"
    >
      <div class="icon-wrap" v-if="item.icon">
        <BiIcon :name="item.icon" :class="item.icon + 'Icon'" />
      </div>
      <span
        :class="{
          'table-title': true,
          select: selectedKeys.includes(item.id)
        }"
        :title="item[keyName]"
        >{{ item[keyName] ? item[keyName] : '-' }}</span
      >
      <input
        v-if="checkable"
        type="checkbox"
        class="node-checkbox"
        :checked="selectedKeys.includes(item.id)"
      />
    </div>
    <span class="no-data" v-if="showNoData && !list.length">暂无数据</span>
  </div>
</template>

<style lang="less" scoped>
.table-list-wrap {
  width: 100%;
  flex-grow: 1;
  overflow-y: auto;
  position: relative;

  .table-node {
    padding-right: 12px;
    display: flex;
    align-items: center;
    height: 40px;
    cursor: pointer;
    border-radius: 4px;
    padding-left: 12px;

    &:hover {
      background-color: #e8f2ff;
    }

    .icon-wrap {
      margin-right: 4px;
      display: flex;
    }

    .table-title {
      max-width: 90%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;

      &.select {
        color: #2b67ff;
      }
    }

    .node-checkbox {
      flex-shrink: 0;
      margin-left: auto;
      appearance: none;
      width: 16px;
      height: 16px;
      border: 1px solid #00000024;
      border-radius: 3px;
      cursor: pointer;

      &:checked {
        border: none;
        background: url(@/assets/icons/is_select.png) center/contain;
      }
    }
  }
  .no-data{
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}
</style>
