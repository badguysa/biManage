<template>
  <svg class="svgIcon" aria-hidden="true" :fill="color">
    <use :xlink:href="`#icon-${name}`" />
  </svg>
</template>

<script setup>
const props = defineProps({
  name: {
    type: String,
    required: true
  },
  color: {
    type: String,
    default: '#333'
  }
})
</script>

<style lang="less">
.svgIcon {
  width: 18px;
  height: 18px;
  /* vertical-align: -0.15em; */
  overflow: hidden;
  &.activeStatus {
    fill: #1770ff;
  }
  &.errorStatus {
    fill: #f53f3f;
  }
}
/* 抽离svg默认颜色 通过fill属性动态设置 */
.apiIcon,
.apiTableIcon {
  fill: #802cf5;
}
.apiManageIcon {
  // apiManage.svg 显示异常
  fill: #2b67ff;
}
.DBIcon {
  fill: #ffa63f;
}
.emptyIcon {
  fill: #6b7785;
}
.excelIcon {
  fill: #14b567;
}

.formIcon {
  fill: #0047ff;
}

.pushIcon {
  fill: #2b67ff;
}
.selfConfigIcon {
  fill: #d627b0;
}
.sqlIcon {
  fill: #ff5b4c;
}

.textIcon {
  fill: #0089ff;
}
.numberIcon {
  fill: #46b673;
}
.timeIconActive {
  fill: #3d82f2;
}
.timeIcon {
  fill: #ffa63f;
}
.kafkaIcon {
  fill: #3e4959;
}
.dataSourceIcon {
  fill: #2b67ff;
}
.dropDownIcon {
  fill: #acb4bf;
}
.standardIcon {
  fill: #04d9e0;
}

.moreIcon {
  color: #00000066;
}
</style>
