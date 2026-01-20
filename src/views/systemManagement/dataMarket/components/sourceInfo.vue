<script setup>
import { formatTime } from '@/utils/utils'
import { nextTick, onMounted, onUnmounted, reactive, shallowRef } from 'vue'

const props = defineProps(['source'])

let fieldWrapRef = shallowRef(null)

let foldState = reactive({
  showFold: false,
  needExpand: false
})

const foldFn = () => {
  foldState.needExpand = !foldState.needExpand
}

onMounted(() => {
  updateFoldState()
})


watch(
  () => props.source,
  () => {
    foldState.showFold = false
    foldState.needExpand = false
    // 更新折叠状态
    updateFoldState()
  }
)

const updateFoldState = async () => {
  await nextTick()
  foldState.showFold = fieldWrapRef.value?.clientHeight > 60
  foldState.needExpand = foldState.showFold
}
</script>

<template>
  <div class="source-info">
    <div class="des">
      <label>数据资源描述：</label>
      <span :title="source.description">{{ source.description }}</span>
    </div>
    <div class="fields" ref="fieldWrapRef">
      <label>字段：</label>
      <div :class="{ 'field-wrap': true, 'need-expand': foldState.needExpand }">
        <span v-for="f in source.columns">{{ f.columnAlias || f.columnName }}</span>
        <div class="fold-wrap" @click.stop="foldFn" v-if="foldState.showFold">
          <span v-if="foldState.needExpand">
            <span>展开</span>
            <BiIcon name="downArrow" color="#2b67ff" />
          </span>
          <span v-else>
            <span>收起</span>
            <BiIcon name="upArrow" color="#2b67ff" />
          </span>
        </div>
      </div>
    </div>
    <div class="apply">
      <label>可申请：</label>
      <div class="apply-wrap">
        <span v-if="source.visible.includes('1')">下载</span>
        <span v-if="source.visible.includes('2')">API接口</span>
      </div>
    </div>
    <div class="other-info">
      <div clas="creator">
        <label>数据资源创建人：</label>
        <span>{{ source.userName }}</span>
      </div>
      <div clas="update-time">
        <label>更新时间：</label>
        <span>{{ source.updateTime ? formatTime(source.updateTime) : '-' }}</span>
      </div>
      <div class="right-wrap">
          <div>
            <BiIcon name="eye" />
            <span>{{ source.views }}次浏览</span>
          </div>
          <div>
            <BiIcon color="#1B1F26" name="add" />
            <span>{{ source.applications }}次申请</span>
          </div> 
      </div>

    </div>
  </div>
</template>

<style lang="less" scoped>
.source-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  label {
    font-size: 14px;
    color: #00000066;
    & + span {
      font-size: 14px;
      color: #00000099;
    }
  }
  .apply,
  .fields {
    display: flex;
    align-items: center;
    position: relative;
    & > label {
      white-space: nowrap;
    }
    .apply-wrap,
    .field-wrap {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      & > span {
        color: #00000099;
        padding: 2px 6px;
        border-radius: 2px;
        background-color: #f2f2f2;
        font-size: 13px;
      }
    }
    .apply-wrap > span {
      color: #ff8900;
      background-color: #ffecd6;
    }
    .field-wrap {
      padding-right: 50px;
      &.need-expand {
        overflow: hidden;
        height: 60px;
      }
    }
    .fold-wrap {
      position: absolute;
      top: 0;
      right: 0;
      cursor: pointer;
      & > span {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        color: #2b67ff;
        font-size: 12px;
        svg {
          width: 12px;
          height: 12px;
        }
      }
    }
  }

  .fields {
    align-items: flex-start;
    & > label {
      margin-top: 2px;
    }
  }

  .other-info {
    display: flex;
    gap: 20px;
    .right-wrap {
      margin-left: auto;
      font-size: 14px;
      color: #00000066;
      display: flex;
      align-items: center;
      gap: 12px;
      &>div{
        display: flex;
        align-items: center;
        gap: 4px;
      svg{
        width: 14px;
        height: 14px;
      }
      }
    }
  }
}
</style>
