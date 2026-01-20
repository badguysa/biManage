<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  tips: {
    type: String,
    default: 'common.noData'
  }
})
</script>

<template>
  <div class="noData">
    <img src="@/assets/images/img_null.png" alt="" />
    <p>{{ t(props.tips) }}</p>
  </div>
</template>

<style lang='less' scoped>
.noData{
  text-align: center;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  img{
    width: 180px;
  }
  p{
    font-size: 14px;
    color: #00000066;
  }
}
</style>