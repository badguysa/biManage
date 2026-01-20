import { defineStore } from "pinia";

export const kafkaStore = defineStore('kafkaStore', {
  state: () => ({
    kafkaData: [],
    sourceInfo: '', // kafka数据源信息
    kafkaSourceParams: {}, // kakfa数据源参数
  }),
  actions: {
    setKafkaData(data) {
      this.kafkaData = data
    },
    setSourceInfo(info) {
      this.sourceInfo = info
    },
    setKafkaSourceParams(params) {
      this.kafkaSourceParams = params
    }
  }
})