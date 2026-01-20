<script setup>
import BiTree from './index.vue'
import { getTreeState, setTreeState } from './useState'

const props = defineProps({
  treeData: {
    type: Array,
    required: true
  },
  checkable: {
    type: Boolean,
    default: false
  },
  // 展开指定的树节点
  expandedKeys: {
    type: Array,
    default: []
  },
  // 选中的树节点
  selectedKeys: {
    type: Array,
    default: []
  },
  isRoot: {
    type: Boolean,
    default: true
  },
  // 节点层级
  nodeLevel: {
    type: Number,
    default: 1
  },
  total: {
    type: Number,
    default: 0
  },
  // 正在加载数据节点ID
  loadingId: {
    type: String,
    default: ''
  },
  showSplitLine: {
    type: Boolean,
    default: false
  }
})

const emits = defineEmits([
  'update:expandedKeys',
  'update:selectedKeys',
  'check',
  'click',
  'expand',
  'loadMore',
  'loadData'
])

// 共用state
const { _expandedKeys, _selectedKeys } = getTreeState()

// 渲染根组件设置state 只能设置一次
if (props.isRoot) {
  setTreeState(props)
}

const clickNodeFn = node => {
  // 叶子节点
  if (!node.children) {
    checkNodeFn(node)
    return
  }

  // 展开/收起父级节点
  let includeKey = updateKeys(_expandedKeys.value, node.id)
  emits('update:expandedKeys', _expandedKeys.value)
  emits('expand', node, includeKey)
}

const checkNodeFn = node => {
  updateKeys(_selectedKeys.value, node.id)
  emits('update:selectedKeys', _selectedKeys.value)
  emits('check', node, _selectedKeys.value.includes(node.id))

  // 更改父节点选中状态 子节点选中状态联动更改
  // if(node.children) {
  //   let isCheck = _selectedKeys.value.includes(node.id)
  //   node.children.forEach(child => {
  //     let index = _selectedKeys.value.indexOf(child.id)
  //     // 父节点选中 选中所有子节点
  //     if(isCheck && index < 0) {
  //         _selectedKeys.value.push(child.id)
  //     }
  //     // 父节点取消选中 取消选中所有子节点
  //     if(!isCheck && index >= 0) {
  //       _selectedKeys.value.splice(index, 1)
  //     }
  //   })
  // }
}

// 更新keys 有key删除 无key添加
const updateKeys = (keys, key) => {
  let keyIndex = keys.indexOf(key)
  if (keyIndex >= 0) {
    keys.splice(keyIndex, 1)
  } else {
    keys.push(key)
  }
  return keyIndex >= 0
}

const isExpanded = nodeId => _expandedKeys.value.includes(nodeId)

// 通过节点ID 获取节点
const getNodeById = tartgetNodeId => {
  let targetNode = null
  _loop(props.treeData)

  function _loop(treeData) {
    for (let i = 0; i < treeData.length; i++) {
      let currentNode = treeData[i]
      if (currentNode.id === tartgetNodeId) {
        targetNode = currentNode
        return
      } else if (currentNode.children?.length > 0) {
        _loop(currentNode.children)
      }
    }
  }
  return targetNode
}

defineExpose({
  getNodeById
})
</script>

<template>
  <div class="bi-tree-wrap">
    <div v-if="showSplitLine && !isRoot" class="left-border"></div>
    <div class="tree-list">
      <template v-for="node in treeData">
        <div
          class="tree-node"
          :node-level="nodeLevel"
          :node-key="node.id"
          @click="clickNodeFn(node)"
        >
          <span class="split-line" v-if="showSplitLine && !isRoot"></span>
          <div class="icon-container">
            <!-- 折叠图标 -->
            <BiIcon
              class="toggle-icon"
              v-if="node.children"
              :name="isExpanded(node.id) ? 'expand' : 'fold'"
            />
            <!-- 节点前缀图标 -->
            <slot v-else name="nodeIcon" :node="node"></slot>
          </div>
          <span
            :class="{
              'node-title': true,
              select: _selectedKeys.includes(node.id)
            }"
            :title="node.name"
            >{{ node.name ? node.name : '-' }}</span
          >
          <input
            v-if="checkable"
            type="checkbox"
            class="node-checkbox"
            :checked="_selectedKeys.includes(node.id)"
            @click.stop="checkNodeFn(node)"
          />
        </div>
        <!-- 递归渲染子节点 -->
        <BiTree
          v-if="node.children && isExpanded(node.id)"
          @check="(n, isCheck) => $emit('check', n, isCheck)"
          @expand="(n, expanded) => $emit('expand', n, expanded)"
          @loadMore="n => $emit('loadMore', n)"
          :loadingId="loadingId"
          :checkable="checkable"
          :tree-data="node.children"
          :is-root="false"
          :node-level="nodeLevel + 1"
          :showSplitLine="showSplitLine"
        >
          <!-- 节点前缀图标 -->
          <template #nodeIcon="{ node }">
            <slot name="nodeIcon" :node="node"></slot>
          </template>
        </BiTree>
        <template v-if="isExpanded(node.id) && node.loadEnd === false">
          <!-- 加载中 -->
          <div v-if="loadingId === node.id" class="loading">加载中...</div>
          <!-- 加载更多 -->
          <div @click="$emit('loadMore', node)" class="load-more" v-else>
            <BiIcon name="load" />
            <span>加载更多</span>
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<style lang="less" scoped>
.bi-tree-wrap {
  font-size: 14px;
  color: #000000cc;
  position: relative;
  .bordered {
    border-left: 1px solid #000;
  }
  .left-border {
    position: absolute;
    border-left: 1px dashed #d4d6d9;
    top: 0;
    left: calc(v-bind(nodeLevel - 2) * 28px + 12px);
    height: calc(100% - 20px);
    z-index: 2;

  }
  .tree-list {
    .tree-node {
      padding-right: 12px;
      display: flex;
      align-items: center;
      height: 40px;
      cursor: pointer;
      border-radius: 4px;
      // 通过节点层级计算左侧缩进距离
      padding-left: calc(v-bind(nodeLevel - 1) * 28px + 12px);
      position: relative;
      &:hover {
        background-color: #e8f2ff;
      }
      .split-line {
        display: inline-block;
        width: 25px;
        height: 30px;
        border-bottom: 1px dashed #d4d6d9;
        position: absolute;
        top: -8px;
        &:first-of-type {
          left: calc(v-bind(nodeLevel - 2) * 28px + 12px);
        }
        &:nth-of-type(2) {
          left: calc(v-bind(nodeLevel - 3) * 28px + 12px);
        }
      }
      .icon-container {
        margin-right: 4px;
        display: flex;
        align-items: center;
        .toggle-icon {
          width: 10px;
          height: 10px;
        }
      }
      .node-title {
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
    .load-more {
      display: flex;
      align-items: center;
      height: 40px;
      padding-left: calc(v-bind(nodeLevel) * 28px + 12px);
      cursor: pointer;
      gap: 4px;
      &:hover {
        background-color: #e8f2ff;
      }
      svg {
        width: 14px;
        height: 14px;
      }
    }
    .loading {
      display: flex;
      align-items: center;
      height: 40px;
      padding-left: calc(v-bind(nodeLevel) * 28px + 12px);
    }
  }
}
</style>
