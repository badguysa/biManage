<template>
    <div class="main-container">
        <div class="header-title">{{ t('langManage.langManage') }}</div>
        <a-radio-group v-model:value="language" @change="langChange">
            <a-radio :style="radioStyle" value="zh-CN">简体中文</a-radio>
            <a-radio :style="radioStyle" value="lo">{{ t('langManage.loLang') }}</a-radio>
        </a-radio-group>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { getCookie } from '@/utils/utils'
const { t, locale } = useI18n()
const language = ref('followSystem')
const radioStyle = reactive({
    display: 'flex',
    height: '30px',
    lineHeight: '30px',
    marginBottom: '12px'
});
onMounted(() => {
    language.value = locale.value
})
const langChange = (val) => {
    const fid = getCookie('fid')
    const biLang = localStorage.getItem('bi_lang')
    if (val.target.value === 'followSystem') {
        locale.value = navigator.language || 'zh-CN'
        localStorage.setItem('biLocale', locale.value)
    } else {
        localStorage.setItem('biLocale', val.target.value)
        locale.value = val.target.value
    }
    const langOption = {
        fid,
        locale: locale.value
    }
    if (biLang) {
        const langArr = JSON.parse(biLang)
        const index = langArr.findIndex(i => i.fid == fid)
        if (index === -1) {
            langArr.push(langOption)
            localStorage.setItem('bi_lang', JSON.stringify(langArr))
        } else {
            langArr[index] = langOption
            localStorage.setItem('bi_lang', JSON.stringify(langArr))
        }
    } else {
        localStorage.setItem('bi_lang', JSON.stringify([langOption]))
    }
    location.reload()
}
</script>

<style scoped lang="less">
.main-container {
    width: 100%;
    height: calc(100% - 36px);
    background-color: #fff;
    padding: 20px 30px 30px;
    overflow: auto;
    display: flex;
    flex-direction: column;
    position: relative;
    .header-title {
        color: rgba(0, 0, 0, 0.8);
        font-weight: 600;
        font-size: 18px;
        line-height: 25px;
        margin-bottom: 16px;
    }
}
</style>