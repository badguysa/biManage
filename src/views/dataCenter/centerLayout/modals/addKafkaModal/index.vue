<script setup>
import { getTopicNames, getTopicPartitions, previewKafkaSource } from '@/apis/kafka'
import { getSourceInfo } from '@/apis/dataSourceManage'
import selectDataSource from '@/views/dataCenter/centerLayout/components/selectDataSource'
import { message } from 'ant-design-vue'
import { debounce } from 'loadsh'
import { storeToRefs } from 'pinia'

const useModalStore = modalStore()
const useMainStore = mainStore()
const useKafkaStroe = kafkaStore()

// kafka数据源信息
const { sourceInfo } = storeToRefs(useKafkaStroe)

const formState = reactive({
  sourceName: '',
  topic: undefined,
  startOffset: '',
})

const topicList = ref([])

const partitionList = ref([])

// 选择数据源
const selectFn = id => {
  // 数据重置
  partitionList.value = []
  topicList.value = []
  formState.topic = ''

  getSourceInfo({ id }).then(res => {
    if (res.code === 1) {
      sourceInfo.value = res.data
    }
  })
}

// 全部选中
const checkAll = computed({
  get() {
    let isCheckAll = partitionList.value.every(it => it.checked)
    return isCheckAll
  },
  set(val) {
    partitionList.value.forEach(it => (it.checked = val))
  },
})

// 部分选中
const checkSome = computed(() => {
  let checkedLen = partitionList.value.filter(it => it.checked).length
  return checkedLen > 0 && checkedLen < partitionList.value.length
})

const checkedPartitionList = computed(() => 
  partitionList.value.filter(it => it.checked)
)

const connectFn = debounce(
  () => {
    if (!sourceInfo.value) {
      return message.warning('请选择数据源')
    }

    const hide = message.loading('正在测试连接，请稍候...', 0)
    let { servers, securityProtocol, configuration } = sourceInfo.value
    getTopicNames({
      servers: servers,
      securityProtocol: securityProtocol,
      // 不为无鉴权 传递configuration
      configuration: securityProtocol !== 'NONE' ? configuration : undefined
    }).then(res => {
      hide()
      if (res.code === 1 && Array.isArray(res.data)) {
        topicList.value = res.data.map(it => ({
          value: it,
        }))
        message.success('测试连接成功')
      } else {
        message.error('测试连接失败')
      }
    })
  },
  200,
  {
    leading: true,
    trailing: false,
  }
)

const selectTopic = () => {
  if (!formState.topic) return

  let { servers, securityProtocol, configuration } = sourceInfo.value

  getTopicPartitions({
    servers: servers,
    securityProtocol: securityProtocol,
    topicName: formState.topic,
    // 不为无鉴权 传递configuration
    configuration: securityProtocol !== 'NONE' ? configuration : undefined
  }).then(res => {
    if (res.code === 1 && Array.isArray(res.data)) {
      partitionList.value = res.data.map(it => ({
        part: it.part,
        beginOff: it.beginOff,
        endOff: it.endOff,
        startOff: '',
        checked: true,
      }))
    }
  })
}

const filterOption = (input, option) => {
  return option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0
}

const cancelFn = () => {
  useModalStore.changeKafkaModalVisible()
}

const confirmFn = async () => {
  if (!formState.sourceName) {
    return message.warning('请选择数据源')
  } else if (!formState.topic) {
    return message.warning('请选择Topic')
  } else if(!checkedPartitionList.value.length) {
    return message.warning('至少选择一个分区')
  }

  // {
  //   "sourceId": 1734899335019110402, // kafka数据源ID
  //   "topicName": "test-source-1", // topic名
  //   "offsetScan": "specific-offsets", //用户为每个分区指定偏移
  //   "partitions": [0,1], // 0、1分区
  //   "offsets": [6,6] // 0分区起始偏移6、1分区起始偏移6
  // }

  let previewParams = {
    sourceId: sourceInfo.value.id, // kafka数据源ID
    topicName: formState.topic, // topic名
    partitions: checkedPartitionList.value.map(it => it.part), // 0、1分区
  }

  // 偏移值发生过修改
  if(partitionList.value.some(it => it.startOff)) {
    previewParams.offsetScan = 'specific-offsets'
  } else {
    previewParams.offsetScan = 'earliest-offset'
  }
  
  previewParams.offsets = checkedPartitionList.value.map(it => it.startOff)

  useKafkaStroe.setKafkaSourceParams(previewParams)

  let res = await previewKafkaSource(previewParams)
  if(res.code === 0) {
    return message.error(res.message)
  }

  useKafkaStroe.setKafkaData(res.data)
  useMainStore.setPageId('kafkaPage')
  cancelFn()
}

const changeStartOff = (inputVal, index, type) => {
  inputVal = Number(inputVal)

  partitionList.value = partitionList.value.map((it, i) => {
    if(index === i) {
      // 是否手动更改过startOff
      it.hasChange = type === 'manualChange'
      it.startOff = Math.max(inputVal, Number(it.beginOff))
      it.startOff = Math.min(it.startOff, Number(it.endOff))
    }
    return it
  })
}

watch(() => formState.startOffset, (nv) => {
  partitionList.value.forEach((it, index) => {
    // 未手动修改过分起始偏移 随总起始偏移变化
    if(!it.hasChange){
      changeStartOff(nv, index, 'autoChange')
    }
  })
})
</script>

<template>
  <BiModal title="Kafka" @cancel="cancelFn" @close="cancelFn" @ok="confirmFn" okText="下一步" width="480px" >
      <div class="modalContainer">
        <div class="formWrap">
          <div class="formItem">
            <label>数据源名称</label>
            <div class="itemContent">
              <selectDataSource
                ref="dataSourceRef"
                style="width: 344px"
                v-model="formState.sourceName"
                dataSourceType="Kafka"
                placeholder="请输入数据源名称"
                @select="selectFn"
              />
            </div>
          </div>
          <div class="formItem">
            <label>Topic</label>
            <div class="rightWrap">
              <span><i @click="connectFn">点击连接Kafka</i> 以读取Topic</span>
              <a-select
                placeholder="请选择"
                v-model:value="formState.topic"
                show-search
                :filter-option="filterOption"
                :options="topicList"
                @select="selectTopic"
              ></a-select>
            </div>
          </div>
        </div>
        <div class="partitionWrap" v-show="formState.topic">
          <div class="topArea">
            <label>分区列表</label>
            <span>起始偏移(总)</span>
            <input type="number" v-model="formState.startOffset" />
          </div>
          <div class="mainArea">
            <table>
              <colgroup>
                <col width="40"/>
                <col width="106"/>
                <col width="106"/>
                <col width="106"/>
              </colgroup>
              <thead>
                <tr>
                  <td>
                    <input :class="{ notAll: checkSome }" type="checkbox" v-model="checkAll" />
                  </td>
                  <td>分区</td>
                  <td>偏移值</td>
                  <td>起始偏移值(分)</td>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in partitionList">
                  <td><input type="checkbox" v-model="item.checked" /></td>
                  <td>{{ item.part }}</td>
                  <td>{{ item.beginOff + '~' + item.endOff }}</td>
                  <td><input type="number" :value="item.startOff"  @change="changeStartOff($event.target.value, index, 'manualChange')"/></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
  </BiModal>
</template>

<style lang="less" scoped>
.modalContainer {
  font-size: 13px;
  color: #000000cc;
  .formWrap {
    .formItem {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      .rightWrap {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        i {
          cursor: pointer;
          color: #2b67ff;
          margin-right: 2px;
          font-style: normal;
        }
      }
      label {
        flex-basis: 76px;
      }
      &:last-of-type {
        margin-top: 10px;
        label {
          margin-top: 12px;
        }
        input {
          flex-grow: 1;
        }
      }
    }
  }
  .partitionWrap {
    margin-top: 30px;
    .topArea {
      display: flex;
      align-items: center;
      label {
        font-size: 14px;
        font-weight: 500;
      }
      span {
        margin: 0 12px 0 30px;
      }
      input {
        flex-grow: 1;
      }
    }
    .mainArea {
      margin-top: 10px;
      max-height: 300px;
      overflow-y: auto;
      table {
        width: 100%;
        thead {
          background-color: #ecf3ff;
          color: #00000099;
          font-weight: 600;
          position: sticky;
          top: -1px;
        }
        tbody {
          &:nth-child(2) {
            background-color: #f7faff;
          }
        }
        td {
          border: 1px solid #e0ebff;
          padding: 10px 12px;
          &:first-of-type {
            width: 40px;
          }
          input[type='checkbox'] {
            cursor: pointer;
            appearance: none;
            width: 16px;
            height: 16px;
            background-image: url(@/assets/icons/not_select.png);
            background-position: center;
            background-size: cover;
            &:checked {
              background-image: url(@/assets/icons/is_select.png);
            }
            &.notAll {
              background-image: url(@/assets/icons/doing_select.png);
            }
          }
          input[type='number'] {
            width: 115px;
          }
        }
      }
    }
  }
}
</style>
