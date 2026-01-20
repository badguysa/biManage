<template>
    <div class="upload-middle-container" v-if="uploadMiddlePageModalVisible">
        <div class="container-main">
            <div class="main-head">
                <div class="head-item">{{ t('common.file') }}</div>
                <div class="head-item size">
                    <span>{{ t('excel.size') }}</span>
                    <img src="@/assets/icons/downArrow.png" alt="sort" />
                </div>
                <div class="head-item status">{{ t('excel.status') }}</div>
                <div class="head-item operate">{{ t('common.operation') }}</div>
            </div>
            <div class="main-body">
                <template v-for="(file, index) in fileList">
                    <div class="file-item" v-if="verifyFileisExcel(file.name)">
                        <span class="file-name">
                            <img src="@/assets/icons/addtable3.png" alt="excel" />
                            <span title="">{{ file.name }}</span>
                        </span>
                        <span class="file-size">{{ sizeFormatt(file.size) }}</span>
                        <!-- 上传中显示进度条 -->
                        <a-progress
                            v-if="fileUploadConfig[index].percent !== 100 && !fileUploadConfig[index].isCancel"
                            :percent="fileUploadConfig[index].percent"
                        />
                        <span class="upload-tips" v-else>
                            <!-- 上传进度为100时 上传成功 -->
                            <span class="success" v-if="fileUploadConfig[index].percent === 100 && !fileUploadConfig[index].isCancel">{{ t('excel.uploadSuccess') }}</span>
                            <!-- 当标记为取消上传时 上传失败 -->
                            <span class="failed" v-else-if="fileUploadConfig[index].isCancel">{{ t('excel.uploadError') }}</span>
                        </span>
                        <!-- <span :class="fileUploadConfig[index].percent === 100 ? 'operate upload-success' : 'operate'">
                            取消上传后 禁止再次取消上传
                            <span
                                :class="fileUploadConfig[index].isCancel ? 'operate upload-success' : 'operate'"
                                @click="cancelUpload(index)"
                                >{{ t('excel.cancelUpload') }}</span
                            >
                            <span @click="reUpload(index)">{{ t('excel.reUpload') }}</span>
                        </span> -->
                        <span class="operate">
                            <span @click="deleteUpload(index)">{{ t('common.delete')}}</span>
                        </span>
                    </div>
                </template>
            </div>
        </div>
        <div class="container-bottom">
            <input
                v-if="isFolderUpload"
                ref="inputRef"
                multiple
                accept=".xls,.xlsx"
                type="file"
                id="fileInput"
                @change="changHandle"
                webkitdirectory
            />
            <input multiple accept=".xls,.xlsx" v-else type="file" ref="inputRef" id="fileInput" @change="changHandle" />
            <div class="upload-btn">
                <div class="upload-file">
                    <img src="@/assets/icons/add_relation.png" alt="upload" />
                    <span @click="addFile('file')">{{ t('excel.uploadFile') }}</span>
                </div>
                <div class="upload-folder">
                    <img src="@/assets/icons/folder2.png" alt="upload" />
                    <span @click="addFile('folder')">{{ t('excel.uploadFloder') }}</span>
                </div>
            </div>
            <span>
                <!-- 若有文件objectId未获取到 禁止上传 -->
                <myButton :class="{'disabled-upload': !isAllFileUploadDone}" style="margin-right: 24px;" @click="confirmHandle">{{ t('excel.backgroundUpload') }}</myButton>
                <myButton type="primary" @click="goTaskCenter">{{ t('excel.goTaskCenter') }}</myButton>
            </span>
        </div>
    </div>
</template>

<script setup>
import { modalStore } from '@/Stores/modalStore'
import { storeToRefs } from 'pinia'
import { message } from 'ant-design-vue'
import { savetTaskStatus } from '@/apis/task' 
import { importExcelData, appendExcelData } from '@/apis/excel' 
import { computed } from '@vue/reactivity'
import { mainStore } from '@/Stores/mainStore'
import { apiManageStore } from '@/Stores/apiManageStore'
import myButton from '@/components/buttons/myButton.vue'
import { useRouter } from 'vue-router'
import { uploadFileUtil } from '@/utils/utils'
import { useI18n } from 'vue-i18n'
import { SYSTEM_MENU_MAP } from '@/constants/systemManage'
const { t } = useI18n()
const router = useRouter()
const useModalStore = modalStore()
const useMainStore = mainStore()
const useApiManageStore = apiManageStore()
const { uploadMiddlePageModalVisible } = storeToRefs(useModalStore)

const { activeTabKey, addDataMode, indexTableDesc, systemConfig, uploadInfo, isEmptyImport } = storeToRefs(useMainStore)

const { taskSetInterval } = storeToRefs(useApiManageStore)

// 是否为文件夹上传
const isFolderUpload = ref(true)
// 上传文件列表
const fileList = ref([])

const fileUploadConfig = ref([])

const inputRef = ref('')

// 监听文件列表 列表数据发生变化 进行上传
watch(
    fileList,
    () => {
        uploadFileHandle()
    },
    { deep: true }
)

// watch(
//     fileUploadConfig,
//     () => {
//         if (isAllFileUploadDone.value) {
//             message.success('文件上传成功')
//         }
//     },
//     { deep: true }
// )

// 是否所有的文件都上传完成
let isAllFileUploadDone = computed(() => {
    let flag = fileUploadConfig.value.filter(it => it.name && it.size).every((item) => {
        // 存在objectId 或者为取消上传状态
        if (item.objectId || item.isCancel) {
            return true
        } else {
            return false
        }
    })
    return flag
})

// 上传文件
const uploadFileHandle = () => {
    fileList.value.forEach((item, index) => {
        // 只上传excel类型文件
        if(!verifyFileisExcel(fileList.value[index].name)){
            return
        }
        // 没上传过的文件需要上传
        if (!fileUploadConfig.value[index].percent) {
            const controller = new AbortController()
            const isMirror = systemConfig.value.mirror
            // 保存每个请求的controller 用于取消请求
            fileUploadConfig.value[index].controller = controller
            fileUploadConfig.value[index].size = fileList.value[index].size
            fileUploadConfig.value[index].name = fileList.value[index].name

            let fd = new FormData()

            fd.append('file', fileList.value[index])
            fd.append('puid', uploadInfo.value.puid)
            fd.append('_token', uploadInfo.value.token)
            /**
             * isMirror
                如果是true 调用系统内置的上传文件接口 /file/upload 使用 id作为objectId
                如果是false 沿用之前的逻辑
            */
            uploadFileUtil({
                isMirror: isMirror,
                fileData: fd,
                uploadProgressFn(e) {
                    let uploadPercent = Math.floor((e.loaded / e.total) * 100)
                    fileUploadConfig.value[index].percent = uploadPercent
                },
                signal: controller.signal
            }).then((res) => {
                // 镜像取id 非镜像取objectId
                if(isMirror && res.code === 1) {
                   fileUploadConfig.value[index].objectId = res.data.id
                } else if (!isMirror && res.data?.result) {
                    fileUploadConfig.value[index].objectId = res.data.objectId
                } else {
                    // 上传失败 取消上传
                    fileUploadConfig.value[index].isCancel = true
                    message.error(res.data?.msg ?? res.message)
                }
            }).catch((e) => {
                console.log(e)
            })
        }
    })
}

// 校验文件是否为excel格式
const verifyFileisExcel = (fileName) => {
    if(fileName){
        return ['xls', 'xlsx'].includes(fileName.substring(fileName.lastIndexOf('.')+1))
    } else {
        return false
    }
}

// 删除上传记录
const deleteUpload = (index) => {
    fileList.value.splice(index, 1)
    fileUploadConfig.value.splice(index, 1)
}

// 取消上传
const cancelUpload = (index) => {
    // 取消请求
    fileUploadConfig.value[index].controller.abort()
    // 添加取消标记
    fileUploadConfig.value[index].isCancel = true
}

// 重新上传
const reUpload = (index) => {
    let targetConfig = fileUploadConfig.value[index]

    // 上传状态 重新上传 先终止上传
    if (!targetConfig.isCancel) {
        targetConfig.controller.abort()
    }

    // 重置上传标记
    fileUploadConfig.value[index].percent = 0
    fileUploadConfig.value[index].isCancel = false

    // 获取需要重新上传的文件数据
    let targetFile = fileList.value[index]

    // 手动删除 然后添加 触发上传方法
    fileList.value.splice(index, 1)

    fileList.value.splice(index, 0, targetFile)
}

// 添加文件
const addFile = async (type) => {
    if (type === 'file') {
        isFolderUpload.value = false
    } else if (type === 'folder') {
        isFolderUpload.value = true
    }
    // 等待dom渲染完后 执行点击事件
    await nextTick()
    inputRef.value.click()
}

const changHandle = (e) => {
    let files = e.target.files
    if(!fileSizeValidate(files)) return
    // 添加上传百分比
    files.forEach((item) => {
        fileUploadConfig.value.push({ percent: 0 })
    })

    fileList.value = [...fileList.value, ...files]
}

// 上传文件大小校验
const fileSizeValidate = (files) => {
    let sizeValidateRes = true
    files.forEach(it => {
        if(it.size > 50 * 1024 * 1024) {
            sizeValidateRes = false
            files = []
            return
        }
    })
    !sizeValidateRes && message.error('上传失败,限制导入最大50M')
    return sizeValidateRes
}

const goTaskCenter = () => {
    confirmHandle(2)
}

/**
 * 1: 后台上传 2: 前往任务中心
 * @param {*} type 
 */
const confirmHandle = (type = 1) => {
    const taskExcelVo = fileUploadConfig.value.map(i => ({
        name: i.name,
        objId: i.objectId,
        size: i.size
    }))

    // 保存导入状态
    savetTaskStatus({
        taskExcelVo,
        type: 0,
        isComingEmptyImport: isEmptyImport.value,
    }).then(res => {
        if (!res.code) {
            return message.error(res.message)
        }
    })

    // 获取所有objectId
    let objectIds = fileUploadConfig.value.map((item) => item.objectId)
    if (!objectIds.length) {
        return message.warn(t('excel.blankFlieList'))
    }
    let targetIds = []
    // 去重
    objectIds.forEach((item, index, self) => {
        if (item && !targetIds.includes(item)) {
            targetIds.push(item)
        }
    })

    // 关闭弹窗
    useModalStore.changeUploadMiddlePageModalVisible()
    useModalStore.changeUploadModalVisible()

    const requestParams = {
        objectIds: targetIds.join(','), 
        groupId: activeTabKey.value,
    }

    // 如果是替换数据或追加数据在此拦截
    if (addDataMode.value === 'addData' || addDataMode.value === 'coverData') {
        requestParams.tableId = indexTableDesc.value.id
        requestParams.objectId = requestParams.objectIds
        if (addDataMode.value === 'coverData') { // 替换数据
            requestParams.isCover = 1
        } else if (addDataMode.value === 'addData') { // 追加数据
            requestParams.isCover = 0
        }
        appendExcelData(requestParams).then((res) => {
            if (res.code == 1) {
                // 刷新页面数据
                setTimeout(() => {
                    useMainStore.selectTabs({
                        id: activeTabKey.value,
                    })
                    message.success(res.message)
                }, 300)
            } else {
                message.error(res.message)
            }
        })
        // 在此截断
        return
    }

    // excel导入数据至空表 需传递空表id 
    if (addDataMode.value === 'import') {
        requestParams.emptyTableId = indexTableDesc.value.id
    }

    // 导入excel
    importExcelData(requestParams).then((res) => {
        if (res.code == 1) {
            // 刷新页面数据
            useMainStore.setIndexTableActiveId('', activeTabKey.value, 'del')
            setTimeout(() => {
                useMainStore.selectTabs({
                    id: activeTabKey.value,
                }, 'import')
                useApiManageStore.initRedDot()
                message.success(res.message)
            }, 300)
        } else {
            message.error(res.message)
        }
    })

    if (type === 2) {
        useApiManageStore.setTaskSearchType(0)
        useApiManageStore.setTaskHistoryDiff(0)
        useApiManageStore.initTaskList()
        useApiManageStore.setActiveMenuName(SYSTEM_MENU_MAP.TASK_CENTER)
        useApiManageStore.addApiTab({
            name: 'task.taskCenter',
            id: SYSTEM_MENU_MAP.TASK_CENTER,
            path: '/system/taskCenter',
        })
        router.push('/system/taskCenter')
    } else {
        useApiManageStore.initRedDot()
    }
}

// 字节大小转MB/GB
const sizeFormatt = (size) => {
    let kb = size / 1024
    let mb = kb / 1024
    let gb = mb / 1024

    if (gb > 1) {
        return gb.toFixed(1) + 'GB'
    }

    if (mb < 1) {
        return kb.toFixed(1) + 'KB'
    }

    return mb.toFixed(1) + 'MB'
}

defineExpose({
    fileList,
    fileUploadConfig,
    fileSizeValidate
})
</script>

<style lang="less" scoped>
.upload-middle-container {
    .container-main {
        text-align: center;
        width: 100%;
        height: 482px;

        .main-head {
            font-size: 14px;
            color: rgba(0, 0, 0, 0.4);
            background: #f2f4f7;
            border-radius: 2px;
            height: 40px;
            display: flex;
            align-items: center;
            margin-bottom: 10px;
            .head-item {
                display: flex;
                align-items: center;
                height: 100%;
                &:first-of-type {
                    padding-left: 20px;
                    flex-basis: 240px;
                }
            }

            .status {
                flex-basis: 240px;
            }
            .size {
                flex-basis: 120px;
                img {
                    width: 13px;
                    height: 13px;
                    margin-left: 4px;
                }
            }
            .operate {
                flex-basis: 240px;
            }
        }

        .main-body {
            height: 434px;
            overflow-y: auto;
            .file-item {
                display: flex;
                align-items: center;
                height: 54px;
                font-weight: 400;
                font-size: 14px;
                color: rgba(0, 0, 0, 0.8);
                .file-name {
                    display: flex;
                    align-items: center;
                    padding-left: 20px;
                    flex-basis: 240px;
                    span {
                        flex-basis: 172px;
                        display: -webkit-box;
                        -webkit-box-orient: vertical;
                        -webkit-line-clamp: 2;
                        overflow: hidden;
                        text-align: left;
                    }
                    img {
                        width: 18px;
                        height: 18px;
                        margin-right: 10px;
                    }
                }
                .file-size {
                    flex-basis: 120px;
                    text-align: left;
                }
                .ant-progress {
                    flex-basis: 240px;
                    display: flex;
                    align-items: center;
                    :deep(.ant-progress-outer) {
                        margin: 0;
                        padding: 0;
                        width: 90px;
                    }
                    :deep(.ant-progress-inner) {
                        background-color: #ebf0f5;
                    }
                    :deep(.ant-progress-text) {
                        margin-left: 10px;
                    }
                    :deep(.ant-progress-bg) {
                        height: 10px !important;
                    }
                }
                .upload-tips {
                    flex-basis: 240px;
                    text-align: left;
                    .success {
                        color: #46b673;
                    }
                    .failed {
                        color: #ff4e4e;
                    }
                }
                .operate {
                    flex-basis: 240px;
                    text-align: left;
                    color: #3a8bff;
                    span {
                        cursor: pointer;
                        &:first-of-type {
                            margin-right: 24px;
                        }
                    }
                }
                .upload-success {
                    opacity: 0.3;
                    pointer-events: none;
                }
            }
        }
    }

    .container-bottom {
        width: 100%;
        height: 65px;
        border-top: 1px solid rgba(0, 0, 0, 0.07);
        padding: 0 24px;
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: space-between;

        input {
            display: none;
        }

        .upload-btn {
            display: flex;

            .upload-file {
                margin-right: 32px;
            }

            .upload-file,
            .upload-folder {
                display: flex;
                align-items: center;
                color: #3d82f2;

                img {
                    width: 15px;
                    margin-right: 6px;
                    cursor: pointer;
                }

                span {
                    cursor: pointer;
                }
            }
        }

        .disabled-upload{
            pointer-events: none;
            opacity: .5;
        }

        .confirm {
            height: 32px;
            color: #fff;
            background: #3d82f2;
            border-radius: 4px;
            padding: 6px 16px;
            cursor: pointer;
        }
    }
}
</style>
