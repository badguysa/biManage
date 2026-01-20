<template>
    <div class='doscModal'>
        <div class="maskLayer"></div>
        <div class="popDiv wid400">
            <div class="popuHead">
                <p class="fl colorDeep">{{ t('api.dataFormatDoc') }}</p>
            </div>
            <div class='modalBody'>
                <div class="download-box" @click="downLoad">
                    <img src="@/assets/images/download.png" alt="">
                    <div>{{ t('api.downloadDataFormatDoc') }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { mainStore } from '@/Stores/mainStore';
import { modalStore } from '@/Stores/modalStore';
import { storeToRefs } from 'pinia';
import { updateDoc, downloadPullNote } from '@/apis/apiImport'
import { downloadBlobUtil } from '@/utils/utils'

const { t } = useI18n()
const useMainStore = mainStore()
const useModalStore = modalStore()
const { deleteData } = storeToRefs(useMainStore)
onUnmounted(() => {
    useMainStore.setDeleteData({})
})
const downLoad = () => {
    // API定时拉取笔记下载
    if(deleteData.value.apiTableType === 'API_UPDATE_PULL') {
        downloadPullNote({id: deleteData.value.id})
            .then((res) => {
                downloadBlobUtil(res, t('api.pullDocName'))
            })
        useModalStore.changeDownloadDoscModalVisible()
        return 
    }

    const ids = deleteData.value.id.split(',')
    let times = 0
    ids.forEach(item => {
        updateDoc({
            id: item
        }).then(res => {
            times++
            downloadBlobUtil(res, t('api.pushDocName'))
            if (times === ids.length) {
                useModalStore.changeDownloadDoscModalVisible()
            }
        })
    })
}
</script>

<style lang="less" scoped>
.doscModal {
    .modalBody {
        padding: 30px;
        width: 400px;
        height: 85px;
        .download-box {
            width: 360px;
            display: flex;
            align-items: center;
            cursor: pointer;
            color: #2B67FF;
            img {
                width: 16px;
                margin-right: 7px;
                margin-top: -2px;
            }
        }
    }
}
</style>