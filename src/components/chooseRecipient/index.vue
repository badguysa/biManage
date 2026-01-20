<template>
  <div class="mask">
    <div class="popupContainer">
      <div class="popupHeader">
        <div class="title">{{ popupTitle }}</div>
        <img v-if="showClose" class="close" @click="cancel" src="@/assets/icons/close.png" alt="" />
      </div>
      <div class="popupMain">
        <div class="leftList">
          <div class="search" v-if="showSearch">
            <input type="text" v-model.trim="searchValue" :placeholder="t('common.search')" />
            <img class="sear" src="@/assets/icons/search.png" alt="" />
          </div>
          <ul class="dataListWrap">
            <template v-if="filterDataList.length || (searchValue && !filterDataList.length)">
              <li
                v-for="item in filterDataList"
                :key="item.id"
                :class="{ itemLi: true, isActive: item.isSelect }"
                @click="changeSelect(item.id)"
              >
                <div class="itemLeft">
                  <img class="avatar" :src="item.img ? item.img : avatar" />
                  <div class="name">{{ item.name }}</div>
                </div>
                <div class="itemRight">
                  <img
                    class="check-input"
                    v-if="item.isSelect"
                    src="@/assets/icons/is_select.png"
                    alt=""
                  />
                  <img class="check-input" v-else src="@/assets/icons/not_select.png" alt="" />
                </div>
              </li>
            </template>
            <template v-else>
              <li
                v-for="item in dataList"
                :key="item.id"
                :class="{ itemLi: true, isActive: item.isSelect }"
                @click="changeSelect(item.id)"
              >
                <div class="itemLeft">
                  <img class="avatar" :src="item.img ? item.img : avatar" />
                  <div class="name">{{ item.name }}</div>
                </div>
                <div class="itemRight">
                  <img
                    class="check-input"
                    v-if="item.isSelect"
                    src="@/assets/icons/is_select.png"
                    alt=""
                  />
                  <img class="check-input" v-else src="@/assets/icons/not_select.png" alt="" />
                </div>
              </li>
            </template>
          </ul>
        </div>
        <div class="rightList">
          <div class="selectedNum">
            已选 <span class="num">{{ selectedList.length }}</span> 人
          </div>
          <ul class="selectedListWrap">
            <li v-for="item in selectedList" :key="item.id" class="itemLi">
              <div class="itemLeft">
                <img class="avatar" :src="item.img ? item.img : avatar" />
                <div class="name">{{ item.name }}</div>
              </div>
              <div class="itemRight" @click="changeSelect(item.id)">
                <img class="close" src="@/assets/icons/close.png" alt="close" />
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div class="popupFooter" v-if="showFooter">
        <button @click="cancel">{{ t('common.cancel') }}</button>
        <button @click="confirmHandle">{{ t('common.confirm') }}</button>
      </div>
    </div>
  </div>
</template>
<script setup>
import avatar from '@/assets/icons/avator_light.png'
import { getCurrentUnitUsers } from '@/apis/dataStandard'

const { t } = useI18n()
const searchValue = ref()
const emits = defineEmits(['modalConfirm', 'modalCancel', 'echoUserList', 'update:puidStr'])
const props = defineProps({
  popupTitle: {
    type: String,
    default: '选择收件人'
  },
  puidStr: {
    type: String,
    default: ''
  },
  showClose: {
    type: Boolean,
    default: true
  },
  showFooter: {
    type: Boolean,
    default: true
  },
  showSearch: {
    type: Boolean,
    default: true
  }
})
const filterDataList = ref([])

const loadList = ref(false)

const dataList = ref([])

const getUserList = () => {
  // 只加载一次数据
  if (loadList.value) return
  loadList.value = true
  return new Promise((resolve, reject) => {
    getCurrentUnitUsers()
      .then(res => {
        if (res.code === 1) {
          dataList.value = res.data.map(item => {
            return {
              id: item.id,
              puid: item.puid,
              name: item.name,
              avatar: item.avatar || '', // 目前暂无头像
              isSelect: false
            }
          })
        }
        resolve()
      })
      .catch(e => {
        reject(e)
      })
  })
}

const selectedList = computed(() => {
  return dataList.value.filter(it => it.isSelect)
})

watch(
  () => props.puidStr,
  async () => {
    await getUserList()
    updateDataList()
    let list = puidArr.value.map(puid => {
      let target = dataList.value.find(it => it.puid === puid)
      return target ?? {}
    })
    emits('echoUserList', list)
  }, {
    immediate: true
  }
)

watch(
  () => searchValue.value,
  val => {
    if (val) {
      filterDataList.value = dataList.value.filter(it => it.name.includes(val))
    } else {
      filterDataList.value = []
    }
  }
)

const changeSelect = id => {
  const item = dataList.value.find(item => item.id === id)
  if (item) {
    item.isSelect = !item.isSelect
  }
}

const cancel = () => {
  updateDataList()
  emits('modalCancel')
}

const updateDataList = () => {
  dataList.value.forEach(it => it.isSelect = false)
  puidArr.value.forEach(puid => {
    let target = dataList.value.find(it => it.puid === puid)
    if(target) {
      target.isSelect = true
    }
  })
}

const confirmHandle = () => {
  emits('update:puidStr', selectPersons.value.map(it => it.puid).join(','))
  emits('modalConfirm', selectPersons.value)
}

const selectPersons = computed(() => {
  return dataList.value.filter(it => it.isSelect)
})

const puidArr = computed(() => {
  if(!props.puidStr) return []
  return props.puidStr.split(',')
})


</script>
<style lang="less" scoped>
.mask {
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.3);
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 6;
  .popupContainer {
    width: 640px;
    height: 600px;
    border-radius: 8px;
    background-color: #ffffff;
    .popupHeader {
      padding: 14px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #e9e9e9;
      .title {
        font-size: 16px;
        font-weight: 600;
      }
      .close {
        width: 16px;
        height: 16px;
        cursor: pointer;
      }
    }
    .popupMain {
      height: 482px;
      display: flex;

      .leftList {
        padding: 8px 12px;
        width: 320px;
        border-right: 1px solid #e9e9e9;
        .search {
          width: 296px;
          height: 32px;
          position: relative;
          margin-bottom: 8px;

          input {
            width: 100%;
            height: 30px;
          }

          .sear {
            width: 16px;
            position: absolute;
            top: 50%;
            right: 10px;
            cursor: pointer;
            transform: translateY(-50%);
          }

          .clear {
            position: absolute;
            top: 15.5px;
            right: 46.6px;
            width: 16px;
            cursor: pointer;
          }
        }
        .dataListWrap {
          height: 428px;
          overflow-y: auto;
          margin-bottom: 0;
          .itemLi {
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 40px;
            padding: 8px 12px;
            border-radius: 6px;
            margin-bottom: 2px;
            &:hover {
              cursor: pointer;
              background-color: #e8f2ff;
            }
            .itemLeft {
              display: flex;
              .avatar {
                width: 24px;
                height: 24px;
                margin-right: 6px;
              }
              .name {
                color: rgba(0, 0, 0, 0.8);
                font-weight: 400;
                font-size: 14px;
              }
            }
            .itemRight {
              .check-input {
                width: 16px;
                height: 16px;
                cursor: pointer;
              }
            }
          }
          .isActive {
            background-color: #e8f2ff;
            .itemLeft {
              .name {
                color: #2b67ff;
                font-weight: 500;
                font-size: 14px;
              }
            }
          }
        }
      }
      .rightList {
        padding: 8px 12px;
        width: 320px;
        .selectedNum {
          line-height: 18px;
          height: 18px;
          font-size: 13px;
          font-weight: 400;
          margin-bottom: 8px;
          color: #828c99;
          .num {
            color: #2b67ff;
            font-size: 13px;
          }
        }
        .selectedListWrap {
          height: 442px;
          overflow-y: auto;
          margin-bottom: 0;
          .itemLi {
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 40px;
            padding: 8px 12px;
            border-radius: 6px;
            margin-bottom: 2px;
            .itemLeft {
              display: flex;
              .avatar {
                width: 24px;
                height: 24px;
                margin-right: 6px;
              }
              .name {
                color: rgba(0, 0, 0, 0.8);
                font-weight: 400;
                font-size: 14px;
              }
            }
            .itemRight {
              display: none;
              .close {
                width: 14px;
                height: 14px;
                cursor: pointer;
              }
            }
            &:hover {
              background-color: #e8f2ff;
              .itemRight {
                display: block;
              }
            }
          }
        }
      }
    }
    .popupFooter {
      padding: 16px;
      display: flex;
      justify-content: right;
      border-top: 1px solid #e9e9e9;
      button {
        padding: 6px 26px;
        border-radius: 4px;
        border: none;
        background-color: #fff;
        border: 1px solid #3d82f2;
        color: #3d82f2;
        font-weight: 400;
        font-size: 14px;
        line-height: 20px;
        cursor: pointer;
        &:nth-of-type(2) {
          color: #fff;
          background-color: #3d82f2;
          margin-left: 24px;
        }
      }
    }
  }
}
</style>
