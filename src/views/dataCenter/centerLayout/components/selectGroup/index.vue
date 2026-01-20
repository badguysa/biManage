<script setup>
import { Dropdown } from 'ant-design-vue'

const attrs = useAttrs()
const emits = defineEmits(['update:modelValue'])
const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '请选择',
  },
})

const useMainStore = mainStore()
const { leftMenuList, groupObject } = storeToRefs(useMainStore)

let visible = ref(false)
let groupList = ref([])
let groupName = ref('')

onMounted(() => {
  // 回显分组名
  if(groupObject.value?.innerItem) {
    groupName.value = groupObject.value.innerItem.name
  } else if(groupObject.value?.outItem) {
    groupName.value = groupObject.value.outItem.name
  }

  // 分组数据获取
  groupList.value = leftMenuList.value.concat()
})

const clickMenu = (item, type) => {
  groupName.value = item.name
  emits('update:modelValue', item.id)
  if (type === 'child') {
    visible.value = false
    return
  }
  item.expand = !item.expand
}

</script>

<template>
  <Dropdown 
    trigger="click" 
    v-model:visible="visible" 
    :overlayStyle="{ minWidth: 'unset' }"
  >
    <div class="selectInput">
      <input 
        ref="inputRef"
        readonly 
        v-model="groupName" 
        type="text" 
        :placeholder="props.placeholder" 
      />
    </div>
    <template #overlay>
      <div class="dropDownWrap" :style="{ ...attrs.style }">
        <ul class="listContainer">
          <template v-for="group in groupList">
            <li
              :class="{ fold: !!group.expand, active: props.modelValue === group.id }"
              :title="group.name"
              @click="clickMenu(group)"
            >
              <i 
                @click.stop="group.expand = !group.expand" 
                v-show="group.subList.length">
              </i> 
              <span>{{ group.name }}</span>
            </li>
            <ul v-if="group.subList.length && group.expand">
              <li
                v-for="item in group.subList"
                :class="{ active: props.modelValue === item.id }"
                :title="item.name"
                @click="clickMenu(item, 'child')"
              >
                <span>{{ item.name }}</span>
              </li>
            </ul>
          </template>
        </ul>
      </div>
    </template>
  </Dropdown>
</template>

<style lang="less" scoped>
.selectInput {
  position: relative;
  &:hover {
    img {
      display: block;
    }
  }
  input {
    width: 100%;
    padding-right: 26px;
  }
}
.dropDownWrap {
  height: 420px;
  padding: 4px 0px;
  border-radius: 4px;
  border: 1px solid #f0f0f0;
  background-color: #fff;
  box-shadow: 0px 6px 24px 0px rgba(31, 35, 41, 0.1);
  overflow: hidden auto;
  .listContainer {
    margin: 0;
    li {
      height: 40px;
      padding: 10px 12px;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
      &:hover {
        background-color: #e8f2ff;
      }
      i {
        width: 12px;
        height: 12px;
        display: inline-block;
        background: url(@/assets/icons/openright.png) center/cover;
      }
      &.fold {
        i {
          background-image: url(@/assets/icons/downone.png);
        }
      }
      &.active {
        font-weight: 500;
        color: #2b67ff;
      }
    }
  }
}
</style>
