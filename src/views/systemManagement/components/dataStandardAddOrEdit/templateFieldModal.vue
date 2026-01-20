<script setup>
import basePagination from '@/components/pagination/base.vue'
import { getStandardFieldList } from '@/apis/dataStandard'
import { getRuleTextLoop } from '@/hooks/dataStandard/useGetRuleText.js'

const { t } = useI18n()

const emits = defineEmits(['close', 'useFn'])

const spinning = ref(false)
const params = reactive({
  kw: '',
  pageNum: 1,
  pageSize: 12,
  total: 0
})

const tableColumns = [
  {
    title: '名称',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '物理字段名',
    dataIndex: 'fieldName',
    key: 'fieldName'
  },
  {
    title: '校验规则',
    dataIndex: 'rule',
    key: 'rule'
  },
  {
    title: '操作',
    dataIndex: 'operate',
    key: 'operate'
  }
]

const tableData = ref([])

onMounted(() => {
  getFieldList()
})

const getFieldList = async () => {
  spinning.value = true
  let res = await getStandardFieldList({
    sw: params.kw,
    pageNum: params.pageNum,
    pageSize: params.pageSize
  })
  if (res.code != 1) message.error(res.message)
  if (!res.data?.records) return
  tableData.value = res.data.records
  params.total = Number(res.data.total)
  spinning.value = false
}

const inputFn = () => {
  params.pageNum = 1
  getFieldList()
}

const useHandle = record => {
  emits('useFn', record)
}
</script>

<template>
  <BiModal
    title="引用字段"
    @close="emits('close')"
    :showFooter="false"
    width="840px"
  >
    <div>
      <BiInput
        style="width: 100%"
        canSearch
        placeholder="按名称/物理字段名搜索"
        @input="inputFn"
        v-model="params.kw"
      />
      <div style="margin: 16px 0; height: 400px; overflow-y: auto">
        <a-spin :spinning="spinning">
          <BiTable
            :columns="tableColumns"
            :dataSource="tableData"
            :columnWidthInfo="{ name: 15, columnName: 15, rule: 60 }"
          >
            <template #bodyCell="{ column, record }">
              <div class="ruleTextContent" v-if="column.key === 'rule'">
                <span v-for="rule in getRuleTextLoop(t, record)">
                  <span class="rule-text">{{ rule.text }}</span>
                  <span
                    class="logic-opereate"
                    v-if="rule.showLogic && !rule.isLast"
                    >{{ rule.logic }}</span
                  >
                  <span class="more-info" v-if="rule.hasMore && rule.isLast"
                    >...</span
                  >
                </span>
              </div>
              <div class="operate-wrap" v-else-if="column.key === 'operate'">
                <a @click="useHandle(record)">引用</a>
              </div>
            </template>
          </BiTable>
        </a-spin>
      </div>
      <basePagination
        style="text-align: center"
        v-if="params.total > params.pageSize"
        v-model:current="params.pageNum"
        :total="params.total"
        :pageSize="params.pageSize"
        show-less-items
        @change="getFieldList"
      />
    </div>
  </BiModal>
</template>

<style lang="less" scoped>
.ruleTextContent {
  .rule-text {
    padding: 4px 10px;
    background-color: #f3f3f3;
    border-radius: 4px;
    display: inline-block;
  }
  .logic-opereate {
    margin: 0 6px;
  }
  .more-info {
    margin-left: 4px;
  }
}
</style>
