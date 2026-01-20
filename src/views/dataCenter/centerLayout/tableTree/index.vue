<template>
    <div class="table-tree" :style="{height: height}">
        <div class="header" v-if="recycleData.id !== activeTabKey">
            <div class="addtablebtn" 
                @mouseenter="onmouseenter" 
                @mouseleave="onmouseleave"
                @click="addTableBtn"
            >
                <img src="@/assets/icons/add2.png" alt="">
                {{ t('common.addTable') }}
            </div>
            <transition name="fade">
                <ul 
                    @mouseenter="onmouseenter" 
                    @mouseleave="onmouseleave" 
                    v-show="state.menuVisible" 
                    class="selectMenu"
                >
                    <li v-for="item in option" :key="item.id" @click="onAddTable(item)">
                        <img :src="item.src" alt="">
                        {{ t(item.text) }}
                    </li>
                </ul>
            </transition>
        </div>
        <div class="search">
            <input type="text" @keyup.enter="onSearch(1)" v-model="state.searchText" :placeholder="t('common.search')">
            <img @click="onSearch(1)" class="sear" src="@/assets/icons/search.png" alt="">
        </div>
        <template v-if="leftTableList.length">
            <div class="table-total">{{ t('common.total') }} {{ tableTotal }} {{ t('common.size') }}</div>
            <div class="warpList" ref="warpListRef" @scroll="scrollListener" :style="{ height: recycleData.id !== activeTabKey ? 'calc(100% - 130px)' : 'calc(100% - 130px + 64px)' }">
                <ul class="listUl">
                    <Draggable
                        :list="leftTableList"
                        @end="dragEnd"
                        item-key="id"
                        :group="{ pull: false }"
                    >
                        <template #item="{element, index}">
                            <li 
                                :class="[element.id == activeTableId ? 'listLi active' : 'listLi']"
                                :key="element.id"
                                @mouseenter="liMouseenter(element)"
                                @mouseleave="liMouseleave(element)"
                                @click="onSelect(element)"
                            >
                                <div 
                                    class="text-box" 
                                >
                                    <BiIcon :name="element.iconName" :class="svgClass(element)" />
                                    <span class="text-long" :title="element.tableAlias">{{ element.tableAlias }}</span>
                                    <img 
                                        @mouseenter="e => imgMouseenter(e, element, 1)" 
                                        @mouseleave="imgMouseleave(element, 1)" 
                                        v-show="element.isHover"
                                        class="hotimg" 
                                        src="@/assets/icons/grayhot.png" alt=""
                                    >
                                    <img 
                                        @mouseenter="e => imgMouseenter(e, element, 2)" 
                                        @mouseleave="imgMouseleave(element, 2)"
                                        v-show="element.isImgHover" 
                                        class="hotimg" 
                                        src="@/assets/icons/bluehot.png" alt=""
                                    >
                                    <transition name="fade">
                                        <ul 
                                            @mouseenter="e => imgMouseenter(e, element, 1)" 
                                            @mouseleave="imgMouseleave(element, 2)"
                                            :style="{top: element.top}"
                                            ref="operWrapRef"
                                            class="operUl"
                                            v-if="element.isImgHover">
                                            <li v-for="o in operoption" :key="o.flag" @click="e => onMoveorDel(e, o, element, index)">
                                                {{ t(o.text) }}
                                            </li>
                                        </ul>
                                    </transition>
                                </div>
                            </li>
                        </template>
                    </Draggable>
                    <div class="loading-text" v-if="listLoading"><a-spin :indicator="indicator" />{{ t('common.scrollLoading') }}</div>
                    <li style="height: 130px;"></li>
                    <div class="loading-text" v-if="tableTotal == leftTableList.length && tableTotal > 30">{{ t('common.reachBottom') }}</div>
                </ul>
            </div>
        </template>
        <div class="area-blank" v-if="!leftTableList.length">
            <div className='box'>
                <img src='@/assets/images/img_null1.png' alt="" />
                <div class='blank-text'>{{ t('common.noDataTable') }}</div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { LoadingOutlined } from '@ant-design/icons-vue';
import { modalStore } from '@/Stores/modalStore';
import { mainStore } from '@/Stores/mainStore';
import { configStore } from '@/Stores/configStore';
import { storeToRefs } from 'pinia'
import { getTableList, updateTableSort } from '@/apis/group'
import { getBloodRelation } from '@/apis/bloodRelation'
import { getMapperList } from '@/apis/common'
import img1 from '@/assets/icons/addtable1.png'
import img2 from '@/assets/icons/addtable2.png'
import img3 from '@/assets/icons/addtable3.png'
import { getTableImg, getTableSvg } from '@/utils/utils'
import img4 from '@/assets/icons/addtable4.png'
import sqlimg from '@/assets/icons/sql.png'
import databaseimg from '@/assets/icons/database.png'
import apiIcon from '@/assets/icons/api-icon.png'
import kafkaIcon from '@/assets/icons/kafka.png'
import { message } from 'ant-design-vue';
import { useI18n } from 'vue-i18n'
import Draggable from 'vuedraggable'
import * as _ from 'lodash'
import { nextTick, watch } from 'vue';

const { t } = useI18n()
const useModalStore = modalStore()
const useMainStore = mainStore()
const useConfigStore = configStore()

const indicator = h(LoadingOutlined, {
    style: {
    fontSize: '14px',
    },
    spin: true,
});

const porps = defineProps({
    height: {
    }
})

const { leftTableList, activeTabKey, indexTableActiveId, tableTotal, indexPageNumber, recycleData, accessConfig } = storeToRefs(useMainStore)

const svgClass = (item) => {
    let isError = item.tableStatus.value === 4
    return [
        item.iconName + 'Icon',
        isError ? 'errorStatus': ''
    ]
}

const option = [{
    id: '001',
    src: img1,
    text: 'common.addBlankTable',
    pageId: 'pageTable'
}, {
    id: '002',
    src: img2,
    text: 'common.formApplication',
    pageId: 'pageForm'
}, {
    id: '003',
    src: img3,
    text: 'common.excelImport',
    pageId: 'pageExcel'
}, {
    id: '004',
    src: databaseimg,
    text: 'common.dbLibrary',
    pageId: 'pageDB'
}, {
    id: '005',
    src: sqlimg,
    text: 'common.sqlImport',
    pageId: 'pageSql'
},{
    id: '007',
    src: apiIcon,
    text: 'common.apiImport',
    pageId: 'ApiPage'
},
{
    id: '008',
    src: kafkaIcon,
    text: 'common.kafkaImport',
    pageId: 'kafkaPage'
},
 {
    id: '006',
    src: img4,
    text: 'common.selfProvision',
    pageId: 'pageConfig'
}]
const operoption = [
    {
        flag: 'move',
        text: 'indexPage.moveTo'
    }, 
    {
        flag: 'delete',
        text: 'common.delete'
    }
]
const state = reactive({
    menuVisible: false,
    showClearImg: false,
    searchText: '',
})

const listLoading = ref(false)
const warpListRef = ref()
const operWrapRef = ref()
const listTotal = ref(0)

const isScroll = ref(false)

const activeTableId = computed(() => {
    let activeData = {}
    if (indexTableActiveId.value.length) {
        activeData = indexTableActiveId.value.find(i => i.tabId === activeTabKey.value)
    }
    if (activeData) {
        return activeData.id
    } 
    return ''
})

watch(() => indexPageNumber.value, (val) => {
    if (val === 1) {
        warpListRef.value.scrollTop = 0
    }
})

watch(() => state.searchText, val => {
    if (activeTabKey.value) {
        if (!val.trim()) {
            state.showClearImg = false
        } else {
            state.showClearImg = true
        }
    }
})

const getTableListFn = async (type) => {
    const jsonData = {
        tableAlias: state.searchText,
        groupId: activeTabKey.value,
        pageSize: 30,
        pageNum: indexPageNumber.value
    }
    const res = await getTableList(jsonData)
    if (res.code == 1) {
        res.data.records.forEach(item => {
            item.isHover = false
            item.isImgHover = false
            item.iptText = item.tableAlias
            item.imgSrc = getTableImg(item.tableType)
            item.iconName = getTableSvg(item.tableType)
        })
    
        if (type === 1) { // 如果是搜索重置树
            useMainStore.setLeftTableList(res.data.records)
        } else { // 滚动的话将新数据和之前的集合
            useMainStore.setLeftTableList([...leftTableList.value, ...res.data.records])
        }
        listTotal.value = res.data.total
        listLoading.value = false
        
    } else {
        message.error(res.message)
    }
}

// 监听 leftTableList 重新加载滚动
watch(() => [leftTableList.value, activeTableId.value],async(val)=>{
    if( val[0].length > 0 && val[1] ){
        const flag = val[0].findIndex(item => item.id === val[1])
        // 手动滚动加载 不触发滚动定位
        if(isScroll.value) return
        if (flag > -1) {
            await nextTick()
            let targetElm =  document.getElementsByClassName('listLi active')[0]
            targetElm && targetElm.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            })
        } else {
            if(indexPageNumber.value === 1 || indexPageNumber.value <= Math.ceil(listTotal.value/30)){
                indexPageNumber.value ++
                await getTableListFn()
            } else if(indexPageNumber.value > Math.ceil(listTotal.value/30)){
                indexPageNumber.value = 1
            }
        }
    }
},
{
    immediate: true
})

const addTableBtn = () => {
    if (accessConfig.value.addTableAuth && accessConfig.value.addTableAuth.read == 0) {
        return message.error(t('common.noAuth'))
    }
}
// 添加表配置鼠标事件 begin
const onmouseenter = () => {
    if (accessConfig.value.addTableAuth && accessConfig.value.addTableAuth.read == 0) {
        return
    }
    state.menuVisible = true
}
const onmouseleave = () => {
    state.menuVisible = false
}
// 添加表配置鼠标事件 end

// 列表li鼠标事件 begin
const liMouseenter = (record) => {
    record.isHover = true
}
const liMouseleave = (record) => {
    record.isHover = false
    record.isImgHover = false
}
// 列表li鼠标事件 end

// 热区icon鼠标事件 begin
const imgMouseenter = (e, record, type) => {
    if (type === 1) {
        record.isHover = false
        record.isImgHover = true
    } else {
        let wrapHeight = operWrapRef.value.clientHeight
        if (document.documentElement.clientHeight - e.pageY > wrapHeight+40) {
            record.top = '36px'
        } else {
            record.top = 0 - wrapHeight + 'px'
        }
    }
}
const imgMouseleave = (record, type) => {
    if (type === 2) {
        record.isHover = true
        record.isImgHover = false
    }
}
// 热区icon鼠标事件 end

// 选中
const onSelect = _.debounce(record => {
    // state.activeKey = record.id
    useMainStore.setEditTableType(record.tableType)
    useMainStore.setIndexTableActiveId(record.id, activeTabKey.value)
    if (record.tableSource && record.tableType.value == 4) {
        useConfigStore.setTableSource(JSON.parse(record.tableSource).config, 'equal', activeTabKey.value)
    }
    useMainStore.changeTablePages({
        id: record.id,
        pageNum:  1,
        displaySize: 100
    }, 'treeClick')
    useMainStore.getIndexTable(record)
}, 200, {
    leading: true // 延迟开始前调用
})

const scrollListener = () => {
    // console.log('scroll')
    if (warpListRef.value.clientHeight + warpListRef.value.scrollTop + 50 >= warpListRef.value.scrollHeight) {
        if (listLoading.value) return
        indexPageNumber.value++
        onSearch(2)
    }
}

const onAddTable = record => {
    useMainStore.setIsEmptyImport(false)
    if (accessConfig.value.addTableAuth && accessConfig.value.addTableAuth.use == 0) {
        return message.error(t('common.noAuth'))
    }
    if (!activeTabKey.value) {
        message.warn(t('indexPage.addTableTip'))
        return
    }

    useMainStore.updateAddDataMode('add')

    if (record.pageId == "pageDB") {
        useModalStore.changeDBModalVisible()
        return
    }

    if(record.pageId === 'kafkaPage') {
        useModalStore.changeKafkaModalVisible()
        return
    }
    // 设置页面ID值
    useMainStore.setPageId(record.pageId)
    state.menuVisible = false
    // 是弹窗进行判断展示
    if (record.id === '001') {
        useModalStore.changeAddTableModalVisible()
    } else if (record.id === '003') {
        useModalStore.changeUploadModalVisible()
    } else if (record.id === '006') {
        useMainStore.changeTabsList({}, 'change', activeTabKey.value)
        useConfigStore.updateConfigUniqueData(activeTabKey.value, 'push')
        // 重置自助配置异常信息
        // useMainStore.setSelfConfigErrorInfo('', [], false)
        // useConfigStore.changeOperationType('add', activeTabKey.value)
    }
}

/**
 * 1: 点击搜索， 2: 滚动
 * @param {*} type 
 */
const onSearch = (type = 1) => {
    if (activeTabKey.value) {
        if (type === 1) { // 如果是点击搜索重置IndexPageNumber
            useMainStore.setIndexPageNumber(1)
        } else { // 如果是滚动的话，滚动到底了return出去
            if (leftTableList.value.length == tableTotal.value) {
                return
            }
            isScroll.value = true
            listLoading.value = true
        }
        getTableListFn(type)
    }
}

const onMoveorDel = async (e, oper, record, index) => {
    e.stopPropagation()
    if (oper.flag === 'move') {
        useModalStore.moveRecord(record)
        useModalStore.changeMoveTableModalVisible()
    } else if (oper.flag === 'delete') {
        if (recycleData.value.id === record.groupId) {
            useMainStore.setDeleteData({
                ...record,
                isFromBin: 'yes'
            })
            useModalStore.changeDeleteModalVisible()
        } else {
            const relationRes = await getBloodRelation(record.id, 0)
            if (relationRes.code === 1) {
                const filterData = filterBloodRelationData(relationRes.data.targetRelations)
                if(relationRes.data.targetRelations.length > 0){
                    record.hasBlood = true
                } else {
                    record.hasBlood = false
                }
                record.mapperApi = filterData.mapperApi
                record.mapperPush = filterData.mapperPush
                useMainStore.setDeleteData(record)
                useModalStore.changeDeleteModalVisible()
            }else{
                message.error(relationRes.message)
            }
        }
    }
}

// 过滤血缘数据 start
const filterBloodRelationData = (dataList) => {
    const apiList = []
    const pushList = []
    dataList.forEach((obj)=>{
        if(obj.targetType && obj.targetType.value === 1 && obj.target.apiName){
            apiList.push(obj.target.apiName)
        }else if(obj.targetType && obj.targetType.value === 2){
            if(obj.target && obj.target.name){
                pushList.push(obj.target.name)
            }
        }
    })
    const mapperApi = apiList.join(',')
    const mapperPush = pushList.join(',')
    return { mapperApi, mapperPush }
}
// 过滤血缘数据 end

const dragEnd = (elm) => {
    let tableList = leftTableList.value
    let newIndex = elm.newIndex
    let { sortValue, id} = tableList[newIndex]

    if(!sortValue || !id) return

    // sortValue越大越靠前
    if(newIndex === 0) {
        // 首项+1
        sortValue = tableList[1].sortValue + 1
    } else if(newIndex === tableList.length - 1) {
        // 尾项-1
        sortValue = tableList[tableList.length-2].sortValue - 1
    } else {
        // 取上下两项平均值作为 sortValue
        sortValue = (tableList[newIndex-1].sortValue + tableList[newIndex+1].sortValue) / 2
    }

    tableList[newIndex].sortValue = sortValue

    updateTableSort({
        id, sortValue
    }).then((res) => {
        if(res.code !== 1) {
            message.error(res.message)
        }
    })
}

</script>

<style lang="less" scoped>
.table-tree {
    border-right: 1px solid rgba(0, 0, 0, 0.07);
    height: 100%;

    .fade-enter-from,
    .fade-enter-to {
        opacity: 0;
    }

    .fade-enter-to,
    .fade-enter-from {
        opacity: 1;
    }

    .fade-enter-active,
    .fade-leave-active {
        transition: opacity .2s ease;
    }

    .header {
        width: 200px;
        height: 64px;
        border-bottom: 1px solid #E9E9E9;
        padding: 16px 12px;
        position: relative;

        .addtablebtn {
            font-family: 'PingFang SC';
            font-style: normal;
            font-weight: 400;
            font-size: 14px;
            color: #FFFFFF;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 176px;
            height: 32px;
            background: #3D82F2;
            border-radius: 4px;

            img {
                width: 16px;
                margin-right: 8px;
            }

            cursor: pointer;
        }

        .addtablebtn:hover {
            opacity: 0.8;
        }

        .selectMenu {
            position: absolute;
            left: 45px;
            top: 52px;
            z-index: 3;
            width: 125px;
            background: #FFFFFF;
            border: 1px solid #E9E9E9;
            box-shadow: 0px 6px 16px -8px rgba(0, 0, 0, 0.08), 0px 8px 20px rgba(0, 0, 0, 0.12);
            border-radius: 4px;
            font-family: 'PingFang SC';
            font-style: normal;
            font-weight: 400;
            font-size: 14px;
            color: rgba(0, 0, 0, 0.8);
            padding-top: 3px;

            img {
                width: 16px;
                margin-right: 8px;
            }

            li {
                display: flex;
                align-items: center;
                height: 40px;
                padding: 12px 8px 12px 12px;
                cursor: pointer;
                line-height: 1.1;
            }

            li:hover {
                background: rgba(61, 130, 242, 0.1);
            }
        }
    }

    .search {
        width: 200px;
        height: 46px;
        padding: 8px 12px;
        position: relative;

        input {
            width: 176px;
            height: 30px;
            padding-right: 33px;
        }

        .sear {
            width: 16px;
            position: absolute;
            top: 15.2px;
            right: 22.6px;
            cursor: pointer;
        }

        .clear {
            position: absolute;
            top: 15.5px;
            right: 46.6px;
            width: 16px;
            cursor: pointer;
        }
    }

    .area-blank {
        height: calc(100% - 180px);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-wrap: wrap;
        background-color: #fff;
        .box {
            text-align: center;
        }
        img {
            width: 180px;
            height: 130px;
        }
        .blank-text {
            font-family: 'PingFang SC';
            font-style: normal;
            font-weight: 400;
            font-size: 14px;
            line-height: 20px;
            color: rgba(0, 0, 0, 0.4);
        }
    }

    .active {
        font-weight: 500;
        font-size: 14px;
        color: #3D82F2;
        background: rgba(61, 130, 242, 0.1);
    }

    .table-total {
        height: 20px;
        padding: 2px 14px;
        color: rgba(0, 0, 0, 0.4);
        font-size: 12px;
    }

    .warpList {
        height: calc(100% - 130px); 
        position: relative; 
        overflow-y: scroll; 
        overflow-x: hidden;
        scrollbar-width: none;
    }

    .listUl {
        width: 200px;
        font-family: 'PingFang SC';
        font-style: normal;
        font-weight: 400;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.8);
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;

        .loading-text {
            color: rgba(0, 0, 0, 0.4);
            font-size: 13px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
        }

        .lefticon {
            width: 16px;
            margin-right: 4px;
        }

        .listLi {
            display: flex;
            align-items: center;
            cursor: pointer;
            min-height: 40px;
            padding: 10px;
            position: relative;
            line-height: 1.4;
            font-size: 13px;

            .operUl {
                position: absolute;
                width: 68px;
                height: 88px;
                background: #FFFFFF;
                border: 1px solid #E9E9E9;
                box-shadow: 0px 6px 16px -8px rgba(0, 0, 0, 0.08), 0px 8px 20px rgba(0, 0, 0, 0.12);
                border-radius: 4px;
                z-index: 3;
                top: 36px;
                right: 11px;
                color: rgba(0, 0, 0, 0.8) !important;

                li {
                    height: 44px;
                    text-align: center;
                    line-height: 44px;
                }

                li:hover {
                    background: rgba(141, 177, 235, 0.1);
                }
            }

            .edit {
                input {
                    width: 112px;
                }

                img {
                    width: 24px;
                    margin-left: 4px;
                }
            }

            .text-box {
                display: inline-block;
                display: flex;
                align-items: center;
            }

            .text-long {
                line-height: 1.4;
                width: 130px;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
            }
            .svgIcon{
                margin-right: 4px;
                // 异常表显示红色
                &.errorStatus + .text-long{
                    color: #f53f3f;
                    font-weight: 600;
                }
            }
        }

        .listLi:hover {
            background: rgba(61, 130, 242, 0.1);
        }

        .hotimg {
            width: 14px;
            margin-left: 8px;
        }
    }

    .warpList::-webkit-scrollbar {
        width: 0;
    }
}
.table-tree:hover {
    .warpList::-webkit-scrollbar {
        width: 5px !important;
    }
}
</style>