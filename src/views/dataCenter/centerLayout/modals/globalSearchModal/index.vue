<template>
<Teleport to="body">
    <div class="MyModal">
        <div class="maskLayer" @click="closeModal"></div>
        <div class="popDiv" style="top: 15%; transform: translate(-50%, -15%);">
            <div class="modal-header">
                <input v-model.trim="searchValue" ref="inputRef" type="text" class="global-input" @keyup.enter="handleClick" :placeholder="t('common.search')">
                <img @click="handleClick" class="search" src="@/assets/icons/search.png" alt="">
                <img v-if="showClear" class="clear" src="@/assets/icons/clear.png" alt="" @click="searchValue = ''">
                <!-- <img @click="closeModal" class="close" style="width: 16px" src="@/assets/icons/close.png" /> -->
            </div>
            <a-spin :spinning="isLoading">
                <div class="globalSearchModal">
                    <!-- 展示列表 -->
                    <template v-if="showType === 1">
                        <div :style="{height: listHeight + 'px', position: 'absolute'}"></div>
                        <div class="global-tree">
                            <template v-for="item in showTreeList" :key="item.id">
                                <div class="out-title">
                                    {{ item.name }}
                                </div>
                                <template v-if="item.chlidren.length">
                                    <div class="out-list">
                                        <template v-for="outItem in item.chlidren" :key="item.id">
                                            <div class="out-list-item" @click.stop="outJumpToMenu(item, outItem,router)">
                                                <div class="out-line"></div>
                                                <div class="out-box">
                                                    <img :src="outItem.imgSrc" >
                                                    <div class="out-text">
                                                        <span v-html="outItem.tableAlias"></span>
                                                    </div>
                                                </div>
                                            </div>
                                        </template>
                                    </div>
                                </template>
                                <template v-if="item.newSubList.length">
                                    <template v-for="subItem in item.newSubList">
                                        <div class="inner-title">
                                            <div class="inner-title-line"></div>
                                            <div class="inner-title-text">
                                                {{ subItem.name }}
                                            </div>
                                        </div>
                                        <template v-if="subItem.chlidren.length">
                                            <div class="inner-list">
                                                <template v-for="innerItem in subItem.chlidren" :key="innerItem.id">
                                                    <div class="inner-list-item" @click.stop="innerJumpToMenu(item, subItem, innerItem,router)">
                                                        <div class="inner-line"></div>
                                                        <div class="inner-box">
                                                            <img :src="innerItem.imgSrc" >
                                                            <div class="inner-text">
                                                                <span v-html="innerItem.tableAlias"></span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </template>
                                            </div>
                                        </template>
                                    </template>
                                </template>
                            </template>
                        </div>
                    </template>
                    <!-- 暂无搜索结果 -->
                    <template v-if="showType === 2">
                        <div class="empty">
                            {{ t('indexPage.noData') }}
                        </div>
                    </template>
                    <!-- 展示历史搜索记录 -->
                    <template v-if="showType === 3">
                        <div class="sub-title">
                            {{ t('indexPage.recentSearch') }}
                        </div>
                        <div class="history-list">
                            <div class="list-item" v-for="item in historyList" :key="item" @click="toHistory(item)">
                                <img class="wid16" src="@/assets/icons/global-time.png" alt="">
                                <div class="item-text">{{ item }}</div>
                                <img @click.stop="deleteHistory(item)" class="wid16 delete" src="@/assets/icons/global-delete.png" alt="">
                            </div>
                        </div>
                    </template>
                    <!-- 暂无最近搜索 -->
                    <template v-if="showType === 4">
                        <div class="empty">
                            {{ t('indexPage.noHistory') }}
                        </div>
                    </template>
                </div>
            </a-spin>
        </div>
    </div>
</Teleport>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
// 引入js文件时需要使用worker-loader!@，并且路径是从src目录下开始数层级的，并非你执行的vue文件开始。
import Worker1 from 'worker-loader!@/workers/worker'
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router'
import { getTableImg } from '@/utils/utils'
import { mainStore } from '@/Stores/mainStore';
import { modalStore } from '@/Stores/modalStore'
import { globalSearchList, getGroupListApi } from '@/apis/group'
import { message } from 'ant-design-vue';
import { innerJumpToMenu, outJumpToMenu } from '@/hooks/dataCenter/useGoMenuItem'

const useMainStore = mainStore()
const useModalStore = modalStore()
const { historyList } = storeToRefs(useMainStore)
const searchValue = ref('') // 搜索字段
const treeList = ref([]) // 树列表
const serachList = ref([]) // 搜索结果列表
const showTreeList = ref([]) // 展示的树列表
const listHeight = ref(0)
const isLoading = ref(false)
const showClear = ref(false)
const { t } = useI18n()
const router = useRouter()
const inputRef = shallowRef()

watch(() => searchValue.value, () => {
    if (searchValue.value) {
        onSearch()
        showClear.value = true
    } else {
        showTreeList.value = []
        showClear.value = false
    }
})

const showType = computed(() => {
    if (searchValue.value) {
        if (showTreeList.value.length || isLoading.value) { // 展示列表
            return 1
        } else { // 暂无搜索结果
            return 2
        }
    } else {
        if (historyList.value.length) { // 展示历史搜索记录
            return 3
        } else { // 暂无最近搜索
            return 4
        }
    }
})

onMounted(() => {
    loadTreeData()
    nextTick(() => {
        inputRef.value?.focus()
    })
})

const closeModal = () => {
    useModalStore.changeGlobalSearchModalVisible()
}

const handleClick = () => {
    useMainStore.changeHistoryList(searchValue.value, 'add')
    onSearch()
}

const toHistory = (data) => {
    searchValue.value = data
}

const deleteHistory = (data) => {
    useMainStore.changeHistoryList(data, 'del')
}

const onSearch = () => {
    const jsonData = {
        keyword: searchValue.value,
    }
    isLoading.value = true
    globalSearchList(jsonData).then(res => {
        if (res.code === 1) {
            res.data.records.forEach(item => {
                item.imgSrc = getTableImg(item.tableType)
            })
            serachList.value = res.data.records
            const worker = new Worker1()
            // 发消息给worker
            worker.postMessage([JSON.stringify(serachList.value), JSON.stringify(treeList.value), searchValue.value])
            // // 接受消息
            worker.onmessage = (e) => {
                showTreeList.value = e.data.list
                listHeight.value = e.data.height
                isLoading.value = false
                // 结束worker进程
                worker.terminate()
            }
        } else {
            isLoading.value = false
            message.error(res.message)
        }
    })
}

const loadTreeData = () => {
    getGroupListApi().then(res => {
        if (res.code == 1) {
            res.data.length && res.data.forEach(async item => {
                item.title = item.name
                item.key = item.id
                item.isLeaf = false
                item.pageNum = 1
                if (item.subList.length) {
                    item.subList.forEach(citem => {
                        citem.title = citem.name
                        citem.key = citem.id
                        citem.isLeaf = citem.counts ? false : true
                        citem.pageNum = 1
                        citem.chlidren = []
                    })
                }
                item.chlidren = []
            })
            treeList.value = res.data
        }
    })
}
</script>

<style lang="less" scoped>
.modal-header {
    position: relative;
    display: flex;
    padding: 24px 24px 14px 24px;
    height: 40px;
    align-items: center;
    box-sizing: content-box;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 10px;
    border-bottom: 1px solid rgba(0,0,0,.04);
    .global-input {
        flex-grow: 1;
        padding-right: 60px;
    }
    .search {
        width: 16px;
        right: 40px;
        position: absolute;
        cursor: pointer;
    }
    .close {
        cursor: pointer;
    }
    .clear {
        width: 16px;
        right: 62px;
        position: absolute;
        cursor: pointer;
    }
}
.globalSearchModal {
    width: 480px;
    height: 435px;
    overflow-y: auto;
    position: relative;
    .empty {
        height: 100%;
        width: 100%;
        text-align: center;
        padding-top: 120px;
        color: rgba(0, 0, 0, 0.40);
        font-size: 14px;
        font-weight: 400;
    }
    .history-list {
        width: 100%;
        height: calc(100% - 25px);
        overflow-y: auto;
        .list-item {
            padding: 10px 24px;
            color: rgba(0, 0, 0, 0.80);
            font-size: 14px;
            font-weight: 400;
            position: relative;
            display: flex;
            align-items: center;
            .item-text {
                width: calc(100% - 50px);
                display: -webkit-box;
                -webkit-box-orient: vertical;
                -webkit-line-clamp: 2;
                overflow: hidden;
            }
            .wid16 {
                width: 16px;
                height: 16px;
                margin-right: 6px;
            }
            .delete {
                position: absolute;
                right: 18px;
                display: none;
                cursor: pointer;
            }
        }
        .list-item:hover {
            background-color: #F2F3F5;
            cursor: pointer;
            .delete {
                display: block;
            }
        }
    }
    .sub-title {
        width: 100%;
        height: 20px;
        padding: 0 24px;
        margin-bottom: 5px;
        color: rgba(0, 0, 0, 0.40);
        font-size: 14px;
        font-weight: 400;
    }
    .out-title,.inner-title {
        font-size: 14px;
        font-weight: 600;
        color: rgba(0, 0, 0, 0.80);
    }
    .out-title {
        padding: 10px 24px;
        max-height: 60px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
    .out-list {
        .out-list-item {
            padding: 0px 24px;
            position: relative;
            .out-line {
                width: 15px;
                height: 1px;
                position: absolute;
                top: 50%;
                border-bottom: 1px dashed #C9CDD4;
                transform: translateY(-50%);
            }
            .out-box {
                border-left: 1px dashed #C9CDD4;
                padding: 10px 0;
                padding-left: 15px;
                display: flex;
                align-items: center;
                .out-text {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                img {
                    width: 18px;
                    height: 18px;
                    margin-right: 4px;
                }
            }
        }
        .out-list-item:hover {
            background-color: #F2F3F5;
            cursor: pointer;
        }
    }
    .inner-title {
        padding: 0 24px;
        position: relative;
    }
    .inner-title-text {
        border-left: 1px dashed #C9CDD4;
        padding: 10px 0;
        padding-left: 15px;
        max-height: 60px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
    .inner-title-line {
        width: 15px;
        height: 1px;
        position: absolute;
        top: 50%;
        border-bottom: 1px dashed #C9CDD4;
        transform: translateY(-50%);
    }
    .inner-list {
        .inner-list-item {
            padding: 0px 24px;
            position: relative;
            .inner-box {
                border-left: 1px dashed #C9CDD4;
                padding: 10px 0;
                display: flex;
                align-items: center;
                padding-left: 30px;
                img {
                    width: 18px;
                    height: 18px;
                    margin-right: 4px;
                }
                .inner-text {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            }
            .inner-line {
                width: 30px;
                height: 1px;
                position: absolute;
                top: 50%;
                border-bottom: 1px dashed #C9CDD4;
                transform: translateY(-50%);
            }
        }
        .inner-list-item:hover {
            background-color: #F2F3F5;
            cursor: pointer;
        }
    }
}
</style>