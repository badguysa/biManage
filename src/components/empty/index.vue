<template>
    <div class="empty-com">
        <img src="@/assets/images/img_null.png" alt="icon" />
        <div class="text" v-if="!isSlot">{{ t('common.noData') }}</div>
        <slot v-else />
    </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
const props = defineProps(['isSlot'])
const { t } = useI18n()
</script>

<style lang="less" scoped>
.empty-com {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    img {
        width: 180px;
        height: 130px;
    }
    .text {
        color: rgba(0, 0, 0, 0.40);
        font-family: PingFang SC;
        font-size: 14px;
        font-style: normal;
        font-weight: 400;
        line-height: normal;
    }
}
</style>