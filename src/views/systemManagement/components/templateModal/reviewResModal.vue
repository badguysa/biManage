<template>
  <myModal
      :modalName="t('templateManage.reviewParseRes')"
      @onCancel="onCancel"
      :showBottom="false"
      width="840px"
  >
  <template #modal-body>
    <div class="modalContainer">
      <table class="reviewTable">
        <thead>
          <th v-for="value in exampleData.columns"><span>{{ value.columnAlias }}</span></th>
        </thead>
        <tbody>
          <tr v-for="it in exampleData.data">
            <td v-for="v in it">{{ v }}</td>
          </tr>
        </tbody>
      </table>
      <a-spin :spinning="previewLoading">
        <div class="reviewJson">
          <highlightjs autodetect :code="jsonInfo" />
          <!-- <textarea :value="jsonInfo" disabled/> -->
        </div>
      </a-spin>
    </div>
  </template>
  </myModal>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue';
import myModal from '@/components/myModal';
import { getTempReviewRes } from '@/apis/templateManage';

const props = defineProps({
  record: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['hideModal'])

const { t } = useI18n()

const jsonInfo = ref('')

const previewLoading = ref(false)

onMounted(() => {
  previewLoading.value = true
  getTempReviewRes(props.record.id).then((res) => {
    if(res.code === 1 && res.message) {
      jsonInfo.value = JSON.stringify(JSON.parse(res.message), null, 4)
    } else {
      message.error(res.message)
    }
    previewLoading.value = false
  })
})

const exampleData = computed(() => 
  props.record.exampleData
)

const onCancel = () => {
  emit('hideModal')
}

</script>

<style lang='less' scoped>
.modalContainer{
  padding: 24px;
  .reviewTable{
    width: 100%;
    thead{
      text-align-last: left;
      background-color: #ECF3FF;
    }
    tr:nth-of-type(even) {
      background-color: #F7FAFF;
    }
    th,td{
      padding: 10px 12px;
      border: 1px solid #E0EBFF;
    }
    th{
      font-weight: normal;
    }
  }
  .reviewJson{
    margin-top: 20px;
    height: 400px;
    overflow-y: auto;
    border: 1px solid #E0EBFF;
    // textarea{
    //   width: 100%;
    //   height: 400px;
    // }
  }
}
</style>
