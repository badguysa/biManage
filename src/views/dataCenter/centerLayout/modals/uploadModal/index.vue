<template>
    <div class="mask">
        <div class="upload-container">
            <div class="container-top">
                <div class="title">{{ t('excel.localUpdate') }}</div>
                <img src="@/assets/icons/close.png" alt="close" @click="cancel" />
            </div>
            <div v-if="!uploadMiddlePageModalVisible" class="container-main">
                <span class="tips">{{ t('excel.tip') }}</span>
                <div class="file-container" @drop="dropHandle">
                    <input
                        v-if="isFolderUpload"
                        ref="inputRef"
                        type="file"
                        accept=".xls,.xlsx"
                        id="fileInput"
                        multiple="multiple"
                        @change="changHandle"
                        webkitdirectory
                    />
                    <input v-else type="file" multiple="multiple" accept=".xls,.xlsx" ref="inputRef" id="fileInput" @change="changHandle" />
                    <span>{{ t('excel.drapTip') }}</span>
                    <span class="either">-{{ t('excel.or') }}-</span>
                    <div class="upload-file" @click="uploadFile('file')">{{ t('excel.uploadFile') }}</div>
                    <span class="select-folder" @click="uploadFile('folder')">{{ t('excel.selectFloder') }}</span>
                </div>
            </div>
            <!-- 中间页组件 -->
            <UploadMiddle ref="modalRef" />
        </div>
    </div>
</template>

<script setup>
import { nextTick, onMounted, ref } from 'vue'
import { modalStore } from '@/Stores/modalStore'
import { storeToRefs } from 'pinia'
import UploadMiddle from './components/uploadMiddle.vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const useModalStore = modalStore()
const { uploadMiddlePageModalVisible } = storeToRefs(useModalStore)

const inputRef = ref()

const modalRef = ref()


onMounted(() => {
    disableDefaultEvents()
})

// 是否为文件夹上传
const isFolderUpload = ref(true)

const uploadFile = async (type) => {
    if (type === 'file') {
        isFolderUpload.value = false
    } else if (type === 'folder') {
        isFolderUpload.value = true
    }
    // 等待dom渲染完后 执行点击事件
    await nextTick()
    inputRef.value.click()
}

const changHandle = (e, type) => {
    let files = []

    // 如果为拖拽上传
    if(type === 'drop'){
        files =  e.dataTransfer.files
    } else {
        files =  e.target.files
    }
    
    if(!modalRef.value.fileSizeValidate(files))
        return

    // 添加上传百分比
    files.forEach((item) => {
        modalRef.value.fileUploadConfig.push({percent: 0})
    })

    // 设置下载中间页文件列表数据
    modalRef.value.fileList = []
    files.forEach(item => { // files原型为FileList 无法使用原生数组的api
        modalRef.value.fileList.push(item)
    })

    // 展示下载中间页
    useModalStore.changeUploadMiddlePageModalVisible()
}

const cancel = () => {
    if(uploadMiddlePageModalVisible.value) {
        useModalStore.changeUploadMiddlePageModalVisible()
    }
    useModalStore.changeUploadModalVisible()
}

const dropHandle = (e) => {
    // 获取拖拽文件
    let files = e.dataTransfer.files

    // 校验拖拽文件是否为excel格式
    for(let i = 0; i < files.length; i++){
        if(!verifyFileisExcel(files[i].name)){
            return
        }
    }

    changHandle(e, 'drop')
} 

// 校验文件是否为excel格式
const verifyFileisExcel = (fileName) => {
    if(fileName){
        return ['xls', 'xlsx'].includes(fileName.substring(fileName.lastIndexOf('.')+1))
    } else {
        return false
    }
}

// 禁用浏览器默认拖拽事件
const disableDefaultEvents = () => {
    const doc = document.documentElement
    doc.addEventListener('dragleave', (e) => e.preventDefault()) //拖离
    doc.addEventListener('drop', (e) => e.preventDefault()) //拖后放
    doc.addEventListener('dragenter', (e) => e.preventDefault()) //拖进
    doc.addEventListener('dragover', (e) => e.preventDefault()) //拖来拖去
}

</script>

<style lang="less" scoped>
.mask {
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.3);
    position: fixed;
    top: 0;
    left: 0;
    z-index: 10;
    .upload-container {
        width: 840px;
        height: 600px;
        box-shadow: 0 6px 16px -8px rgba(0, 0, 0, 0.08), 0px 8px 20px rgba(0, 0, 0, 0.12);
        background-color: #fff;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        border-radius: 8px;

        .container-top {
            height: 53px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 24px;
            border-bottom: 1px solid rgba(0, 0, 0, 0.07);

            .title {
                font-weight: 600;
                font-size: 16px;
                color: rgba(0, 0, 0, 0.8);
            }

            img {
                width: 16px;
                height: 16px;
                cursor: pointer;
            }
        }

        .container-main {
            padding: 24px;
            text-align: center;

            .tips {
                font-size: 14px;
                color: rgba(0, 0, 0, 0.4);
            }

            .file-container {
                width: 792px;
                height: 463px;
                border: 1px dashed #cad5e6;
                border-radius: 4px;
                margin-top: 16px;
                font-size: 14px;
                line-height: 20px;
                color: rgba(0, 0, 0, 0.4);
                display: flex;
                justify-content: center;
                flex-direction: column;
                align-items: center;

                input {
                    display: none;
                }

                .either {
                    margin-top: 12px;
                    margin-bottom: 30px;
                }

                .upload-file {
                    width: 168px;
                    height: 44px;
                    background: #3d82f2;
                    border-radius: 4px;
                    cursor: pointer;
                    color: #fff;
                    text-align: center;
                    line-height: 44px;
                    margin-bottom: 20px;
                }

                .select-folder {
                    color: #3d82f2;
                    cursor: pointer;
                }
            }
        }
    }
}
</style>
