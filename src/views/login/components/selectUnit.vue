<script setup>
const kw = ref('')

const unitList = ref([])

let unitListBack = []

const props = defineProps(['unitList'])

watch(() => props.unitList, () => {
  unitList.value = props.unitList
  unitListBack = props.unitList
})

// 支持单位名/fid检索
const searchFn = () => {
  unitList.value = unitListBack.filter(it => 
    it.name.includes(kw.value) ||
    it.fid.includes(kw.value)
  )
}

// 搜索关键字高亮
const unitNameHighlight = (unitName) => {
  if(kw.value.length && unitName.includes(kw.value)) {
    return unitName.split(kw.value)
    .join(`<i class="hightlight-kw">${kw.value}</i>`)
  }
  return unitName ? unitName : '-'
}

const roleName = (roles) => 
  roles.map(it => it.name).join('、')

</script>

<template>
  <div class="select-wrap">
    <div class="select-tips">请选择登录单位</div>
    <div class="bottom-wrap">
      <div class="search-container">
        <input type="text" v-model="kw" placeholder="搜索" @input="searchFn" />
      </div>
      <div class="unit-container">
        <template v-if="unitList.length">
          <div class="unit-item" v-for="item in unitList" @click="$emit('selectFn', item)">
            <div class="info">
              <span class="unit-name" :title="item.name" v-html="unitNameHighlight(item.name)"></span>
              <span class="unit-role" :title="roleName(item.roles)">{{ roleName(item.roles) }}</span>
            </div>
            <span class="select-icon"></span>
          </div>
        </template>
        <div class="empty" v-else>暂无搜索结果</div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.select-wrap {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 25px;
  
  .select-tips {
    color: #0a2040;
    font-weight: 500;
    font-size: 20px;
    line-height: 28px;
  }
  .bottom-wrap {
    display: flex;
    flex-direction: column;
    gap: 10px;
    .search-container {
      input {
        padding: 5px 14px;
        height: 36px;
        width: 100%;
        background-color: #fff;
        border: 1px solid #d4d6d9;
        &:focus {
          box-shadow: none;
          border: 1px solid #3a8bff;
        }
      }
    }
    .unit-container {
      height: 330px;
      overflow-y: auto;
      .empty{
        font-size: 14px;
        color: #828C99;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .unit-item {
        padding: 8px 12px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        &:hover {
          background-color: #ecf3ff;
          cursor: pointer;
          .unit-name {
            color: #2b67ff;
          }
        }
        .info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          .unit-name,
          .unit-role {
            max-width: 300px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }
          .unit-name {
            font-size: 14px;
            font-weight: 500;
            line-height: 20px;
            :deep(.hightlight-kw){
              font-style: normal;
              color: #2b67ff;
            }
          }
          .unit-role {
            font-size: 12px;
            font-weight: 400;
            line-height: 17px;
            color: #828C99;
          }
        }
        .select-icon {
          display: inline-block;
          width: 16px;
          height: 16px;
          background: url(@/assets/icons/arrows-right.png) center/cover;
        }
      }
    }
  }
}
</style>
