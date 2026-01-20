<template>
    <div class="leftmenu" ref="menuRef">
        <a-spin :spinning="menuLoading">
            <Draggable 
                tag="ul" 
                class="outUl" 
                :list="leftMenuList" 
                item-key="id"
                :group="groupA"
                id="outList"
                drag-class="chosenClass"
                :move="onOutMove"
                @end="dragOutEnd"
            >
                <template #item="{ element }">
                    <div>
                        <li 
                            :class="[element.subList.length ? (element.id == activeTabKey ? 'outLi opacity1 outSelect' : 'outLi') : (element.id == activeTabKey ? 'outLi opacity1 outSelect' : 'outLi noChild')]"
                            @click="onExpand(element, $event)" 
                            @mouseenter="onOutLiMouseenter(element)"
                            @mouseleave="onOutLiMouseleave(element)" 
                        >
                        <img class="left-icon" :src="element.icon || fileImg">
                        <span class="title">{{ element.name }}</span>
                        <div
                            v-if="!(accessConfig.addGroupAuth && accessConfig.addGroupAuth.read == 0)"
                            :class="[element.isHoverImg ? 'hotimg hotimgHover' : 'hotimg']"
                            @mouseenter="event => onOutImgMouseenter(event, element)" 
                            @mouseleave="onOutImgMouseleave(element)">
                            <img 
                                v-show="element.isHover || element.isHoverImg" 
                                src="../../../assets/icons/hot.png"
                                alt="hot"
                            >
                        </div>
                        <img 
                            class="arrow" 
                            @mouseenter="onarrowImgMouseenter(element)" 
                            @click="e => onImgExpand(e, element)"
                            v-show="element.subList.length && !element.isExpanded"
                            src="../../../assets/images/downArrow.png" 
                        />
                        <img 
                            class="arrow" 
                            @mouseenter="onarrowImgMouseenter(element)" 
                            @click="e => onImgExpand(e, element)"
                            v-show="element.subList.length && element.isExpanded"
                            src="../../../assets/images/topArrow.png" 
                        />
                        <ul 
                            id="outConfig" 
                            class="configUl opacity1" 
                            :style="{top: element.top}"
                            v-show="element.isHoverImg"
                            @mouseenter="onOutConfigMouseenter(element)" 
                            @mouseleave="onOutConfigMouseleave(element)"
                        >
                            <li 
                                :style="{ lineHeight: locale === 'lo' ? 1 : '1.6' }"
                                v-for="configItem in outImgHoverList" 
                                :key="configItem.mid"
                                @click.prevent="e => handleOutConfig(e, configItem, element)"
                            >
                                {{ t(configItem.text) }}
                            </li>
                        </ul>
                    </li>

                    <div 
                        class="childmenu-style" 
                        v-if="element.subList.length && element.isExpanded"
                    >
                        <Draggable 
                            id="innerList"
                            tag="ul" 
                            :list="element.subList" 
                            item-key="id"
                            group="itxst"
                            drag-class="chosenClass"
                            :outId="element.id"
                            :move="onInnerMove"
                            @start="onInnerStart"
                            @end="dragInnerEnd"
                        >
                            <template #item="cProps">
                                <li 
                                    :id="cProps.element.pid"
                                    :class="[cProps.element.id == activeTabKey ? 'innerLi opacity1 innerSelect' : 'innerLi']"
                                    class="innerLi" @click="onDebounceSelect(element, cProps.element)"
                                    @mouseenter="onInnerLiMouseenter(cProps.element)"
                                    @mouseleave="onInnerLiMouseleave(cProps.element)"
                                >
                                    <p class="innerTitle">
                                        {{ cProps.element.name }}
                                    </p>
                                    <div 
                                        v-if="!(accessConfig.addGroupAuth && accessConfig.addGroupAuth.read == 0)"
                                        :class="[cProps.element.isHoverImg ? 'innerhotimg innerhotimgHover' : 'innerhotimg']"
                                        @mouseenter="onInnerImgMouseenter(cProps.element)"
                                        @mouseleave="onInnerImgMouseleave(cProps.element)"
                                    >
                                        <img 
                                            v-show="cProps.element.isHover || cProps.element.isHoverImg"
                                            src="../../../assets/icons/hot.png" 
                                            alt="" 
                                        />
                                    </div>
                                    <ul 
                                        id="innerConfig" 
                                        class="configUl opacity1" 
                                        v-show="cProps.element.isHoverImg"
                                        @mouseenter="onInnerConfigMouseenter(cProps.element)"
                                        @mouseleave="onInnerConfigMouseleave(cProps.element)"
                                    >
                                        <li 
                                            v-for="configItem in innerImgHoverList" 
                                            :key="configItem.mid"
                                            @click.prevent="e => handleInnerConfig(e, configItem, element, cProps.element)"
                                        >
                                            {{ t(configItem.text) }}
                                        </li>
                                    </ul>
                                </li>
                            </template>
                        </Draggable>
                    </div>
                </div>
                </template>
            </Draggable>
            <div style="width: 200px; height: 56px;"></div>
        </a-spin>
        <div @click="binHandle" class="bin"><img src="@/assets/icons/bin_del_active.png" />{{ t('group.rubbish') }}</div>
    </div>
</template>

<script setup>
import Draggable from 'vuedraggable'
import { reactive, computed, nextTick } from 'vue';
import * as _ from 'loadsh'
import { menu_out_ImgHoverList as out_ImgHoverList ,menu_inner_ImgHoverList as inner_ImgHoverList } from '@/constants/dataCenterMenu'
import { updateGroupApi, updateMenuSort } from '@/apis/group'
import fileImg from '@/assets/Iconlibrary/tubiaoku(18).png'
import { storeToRefs } from 'pinia'
import { modalStore } from '@/Stores/modalStore';
import { mainStore } from '@/Stores/mainStore';
import { configStore } from '@/Stores/configStore';
import { message } from 'ant-design-vue';
import { useI18n } from 'vue-i18n'
const { t, locale } = useI18n()

// -- modalStore start
const useModalStore = modalStore()
// -- modalStore end

// -- mainStore start
const useMainStore = mainStore()
// -- mainStore end

const useConfigStore = configStore()

const { leftMenuList, activeTabKey, tabsList, menuLoading, recycleData, indexTableActiveId, accessConfig, leftTableList } = storeToRefs(useMainStore)

let outImgHoverList = reactive(out_ImgHoverList)
let innerImgHoverList = reactive(inner_ImgHoverList)

let menuRef = ref(null)

// 操作菜单信息
let operateMenuInfo = reactive({
    id: -1,
    elm: null
})

let menuSelected = reactive({
    outActiveKey: '',
    innerActiveKey: ''
})
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

const groupA = {
    name: "itxst",
    put: true, //允许拖入
    pull: true
}


// 订阅 modalStore action => 新建子分组后 需展开父级分组 并选中子分组
useModalStore.$onAction(
    ({name, store, args, after}) => {
        // 监听分组弹窗action触发
        if(name !== 'changeGroupModalVisible') return

        // action执行完后触发
        after(()=> {
            // 添加子级分组
            if(args?.includes('ADD_CHILD_CB')) {
                let menuItem = leftMenuList.value.find(it => it.id === operateMenuInfo.id)
                if(!menuItem) return

                // 未展开 需展开
                if(!menuItem.isExpanded) {
                    onExpand(menuItem, operateMenuInfo.event, false)
                } else {
                    // 已展开 定位菜单
                    locateSubMenu(menuItem, operateMenuInfo.event)
                }

                // 选中新增子分组
                let newChildMenu = menuItem.subList[menuItem.subList.length-1]
                newChildMenu && onSelect(menuItem, newChildMenu)
            }
        })
    }
)

// 首次进入数据中心 默认展示首个分组下首张表
onMounted(async () => {
    if(!activeTabKey.value) {
        expandFn(leftMenuList.value[0])
    }
})

const onImgExpand = async (e, item) => {
    e.stopPropagation()
    e.preventDefault()

    if(!item.subList.length) return

    item.isExpanded = !item.isExpanded

    locateSubMenu(item, e)
}

const expandFn = (item, e, showTable = true) => {
    if(!item?.id) return

    if (item.subList.length) {
      item.isExpanded = !item.isExpanded
    }

    // if(menuSelected.outActiveKey == item.id) return
    menuSelected.outActiveKey = item.id
    menuSelected.innerActiveKey = ''
    locateSubMenu(item, e)

    // 新增子分组 只需展开一级分组 无需展示分组下的表
    showTable && selectMenuFn(item)
}

// 一级分组点击
const onExpand = _.debounce(expandFn, 300, {
    leading: true,
    trailing: false
})

// 二级分组点击
const onSelect = (item, childItem) => {
    // if(menuSelected.innerActiveKey === item.id) return
    selectMenuFn(item, childItem)
    menuSelected.outActiveKey = item.id
    menuSelected.innerActiveKey = childItem.id
}

// 点击一级分组 定位子分组
const locateSubMenu = async (item, e) => {
    if(!item.isExpanded || !e) return

    await nextTick()

    let liElm = e.target.closest('.outLi')

    if(!liElm) return

    let subListElm = liElm.nextElementSibling
    let {bottom} = subListElm.getBoundingClientRect()
    let offsetY = document.documentElement.clientHeight - bottom - 50

    if(offsetY <= 0) {
        menuRef.value.scrollTop = menuRef.value.scrollTop - offsetY
    }
}

const selectMenuFn = async (item, childItem) => {
    // 点击子级分组
    if(childItem) {
        [item, childItem] = [childItem, item]
    }

    useMainStore.updateActiveTabKey(item.id)
    // useConfigStore.updateConfigUniqueData(item.id, 'push', item.name)
    const tab = {
        id: item.id,
        name: item.name
    }
    useMainStore.changeTabsList(tab, 'add')

    if(childItem) {
        useMainStore.selectLeftMenu({
            outItem: childItem,
            innerItem: item
        }) 
    } else {
        useMainStore.selectLeftMenu({
            outItem: item
        })
    }

    const tempData = tabsList.value.find(i => i.id === item.id)
    if (tempData.type === 'pageConfig') {
        useMainStore.setPageId(tempData.type)
    } else {
        useMainStore.setPageId('pageTable')
        await useMainStore.selectTabs(tab)
        useConfigStore.goBack(activeTabKey.value)
        // 如果该分组下有被选中的表，切换到的时候对表格进行初始化
        if (activeTableId.value) {
            useMainStore.getIndexTable({
                id: activeTableId.value
            })
        } else {    // 没有选中的表 默认选中第一张表
            let record = leftTableList.value[0]
            if(!record) return
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
        }
    }
}

// 外层划入事件
const onOutLiMouseenter = item => {
    item.isHover = true
}
const onOutLiMouseleave = () => {
    leftMenuList.value.forEach(item => {
        item.isHover = false
        item.isHoverImg = false
    })
}
const onOutImgMouseenter = (e, item) => {
    if (document.documentElement.clientHeight - e.pageY < 200) {
        item.top = '-140px'
    } else {
        item.top = '37px'
    }
    item.isHoverImg = true
    item.isHover = true
}
const onarrowImgMouseenter = item => {
    item.isHover = false
    item.isHoverImg = false
}
const onOutImgMouseleave = item => {
    if (item.isHoverImg) return
    item.isHover = false
}
const onOutConfigMouseenter = item => {
    item.isHoverImg = true
    item.isHover = true
}
const onOutConfigMouseleave = (item) => {
    item.isHoverImg = false
}
const handleOutConfig = (e, congfigItem, outItem) => {
    e.stopPropagation()
    if (accessConfig.value.addGroupAuth) {
        if (accessConfig.value.addGroupAuth.use == 0) {
            return message.error(t('common.noAuth'))
        }
    }
    useModalStore.changeGroupModalVisible(congfigItem.mid)
    useMainStore.selectLeftMenu({
        outItem
    })

    operateMenuInfo.id = outItem.id
    operateMenuInfo.event = e
}

// 内层划入事件
const onInnerLiMouseenter = item => {
    item.isHover = true
}
const onInnerLiMouseleave = item => {
    let data = leftMenuList.value.find(temp => temp.id === item.pid)
    if (data.subList.length) {
        data.subList.forEach(i => {
            i.isHover = false
            i.isHoverImg = false
        })
    }

}
const onInnerImgMouseenter = item => {
    item.isHoverImg = true
    item.isHover = true
}
const onInnerImgMouseleave = item => {
    if (item.isHoverImg) return
    item.isHover = false
}
const onInnerConfigMouseenter = item => {
    item.isHoverImg = true
    item.isHover = true
}
const onInnerConfigMouseleave = (item) => {
    item.isHoverImg = false
}

const handleInnerConfig = (e, congfigItem, outItem, innerItem) => {
    e.stopPropagation()
    if (accessConfig.value.addGroupAuth) {
        if (accessConfig.value.addGroupAuth.use == 0) {
            return message.error(t('common.noAuth'))
        }
    }
    useModalStore.changeGroupModalVisible(congfigItem.mid)
    useMainStore.selectLeftMenu({
        outItem,
        innerItem
    })
}

const binHandle = () => {
    if (accessConfig.value.recycleAuth) {
        if (accessConfig.value.recycleAuth.read == 0) {
            return message.error(t('common.noAuth'))
        }
    }
    if (recycleData.value.id) {
        useMainStore.setPageId('pageBin')
        useMainStore.updateActiveTabKey(recycleData.value.id)
        const tab = {
            id: recycleData.value.id,
            name: recycleData.value.name,
            type: 'pageBin'
        }
        useMainStore.changeTabsList(tab, 'add')
        useMainStore.selectTabs(tab)
    } else {
        message.warn(t('group.noRubbishData'))
    }
}

const onOutMove = res => {
    if (res.to.id === 'innerList') return false
}

const onInnerMove = res => {
    if (res.to.id === 'outList') return false
}

const onInnerStart = res => {
}

const dragInnerEnd = (res) => {
    let tempId = ''
    let groupId = ''
    let objA = {
        id: '',
        num: 0
    }
    let objB = {
        id: '',
        num: 0
    }
    res.to.childNodes.forEach((item, index) => {
        if (index === 0) {
            tempId = item.id
            objA.id = item.id
        }
        if (tempId === item.id) {
            objA.num++
        } else {
            objB.id = item.id
            objB.num++
        }
    })
    if (objA.num > objB.num) {
        groupId = objA.id
    } else {
        groupId = objB.id
    }
    const sortArray = leftMenuList.value.find(item => item.id === groupId)
    // 优化用二分取值排序
    let tableList = sortArray.subList
    let newIndex = res.newIndex
    let moveItem =  tableList[newIndex]
    let { sort: sortValue, id: id} =  moveItem
    if(!id) return

    // sortValue越小越靠前
    if(newIndex === 0) {
        // 首项-1
        if(tableList.length===1){
            sortValue = tableList[0].sort - 1
        } else {
            sortValue = tableList[1].sort - 1
        }
    } else if(newIndex === tableList.length - 1) {
        // 尾项+1
        sortValue = tableList[tableList.length-2].sort + 1
    } else {
        // 取上下两项平均值作为 sortValue
        sortValue = (tableList[newIndex-1].sort + tableList[newIndex+1].sort) / 2
    }

    tableList[newIndex].sort = sortValue
    updateMenuSort({
        id, sortValue, targetId: groupId
    }).then((res) => {
        if(res.code !== 1) {
            message.error(res.message)
        }
    })
}

const dragOutEnd = (elm) => {
    // 优化 用二分取值排序
    let tableList = leftMenuList.value
    let newIndex = elm.newIndex
    let moveItem =  tableList[newIndex]
    let { sort: sortValue, id: id} =  moveItem
    if(!id) return
    // sortValue越小越靠前
    if(newIndex === 0) {
        // 首项-1
        if(tableList.length===1){
            sortValue = tableList[0].sort - 1
        } else {
            sortValue = tableList[1].sort - 1
        }
    } else if(newIndex === tableList.length - 1) {
        // 尾项+1
        sortValue = tableList[tableList.length-2].sort + 1
    } else {
        // 取上下两项平均值作为 sortValue
        sortValue = (tableList[newIndex-1].sort + tableList[newIndex+1].sort) / 2
    }

    tableList[newIndex].sort = sortValue
    updateMenuSort({
        id, sortValue
    }).then((res) => {
        if(res.code !== 1) {
            message.error(res.message)
        }
    })
}

/**
 * 左侧菜单点击子目录防抖优化
 */

const onDebounceSelect = _.debounce(onSelect, 100)

</script>

<style lang="less" scoped>
.leftmenu {
    margin-top: 10px;
    width: 200px;
    height: calc(100% - 38px);
    overflow: scroll;
    position: relative;
    -ms-overflow-style: none;
    overflow: -moz-scrollbars-none;
    scrollbar-width: none;
    user-select: none;
    .chosenClass {
        border-bottom: 2px solid #3D82F2;;
    }

    :deep(.ant-spin-container::after) {
        background: none;
    }

    .opacity1 {
        opacity: 1 !important;
    }

    .outSelect {
        position: relative;
        width: 200px;
        min-height: 40px;
        background: linear-gradient(90deg, rgba(24, 120, 255, 0.6) 0.53%, rgba(24, 120, 255, 0.25) 99.75%);
        opacity: 1 !important;
    }

    .outSelect::after {
        content: '';
        display: inline-block;
        width: 4px;
        height: 100%;
        background-color: #3d82f2;
        position: absolute;
        top: 0;
        left: 0
    }

    .hotimg {
        position: absolute;
        display: flex;
        align-items: center;
        width: 22px;
        height: 22px;
        right: 32px;

        img {
            width: 22px;
        }
    }

    .hotimgHover {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
    }

    .innerhotimgHover {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
    }

    .hotimg:hover {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
    }

    .innerhotimg {
        position: absolute;
        display: flex;
        align-items: center;
        width: 22px;
        height: 22px;
        right: 18px;

        img {
            width: 22px;
        }
    }

    .innerhotimg:hover {
        background: rgba(255, 255, 255, 0.15);
        border-radius: 4px;
    }

    .noChild:hover {
        background: linear-gradient(90deg, rgba(24, 120, 255, 0.18) 0.53%, rgba(24, 120, 255, 0.075) 99.75%);
    }

    .outUl {
        position: relative;
    }

    .outUl .outLi {
        position: relative;
        display: flex;
        align-items: center;
        line-height: 1.4;
        font-size: 14px;
        font-weight: 400;
        min-height: 40px;
        color: #fff;
        width: 200px;
        padding: 10px;
        cursor: pointer;
        opacity: 0.6;
        .title {
            line-height: 1.4;
            width: 122px;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }

        .configUl {
            position: absolute;
            z-index: 3;
            padding: 2px 0px;
            top: 37px;
            width: 100px;
            height: 140px;
            background: #334B81;
            box-shadow: 0px 6px 16px -8px rgb(0 0 0 / 8%), 0px 8px 20px rgb(0 0 0 / 12%);
            border-radius: 6px;
            right: 32px;
            opacity: 1 !important;
            font-weight: 400;
            font-size: 12px;
            color: #FFFFFF;

            li {
                height: 34px;
                width: 100px;
                padding: 8px 14px;
                opacity: 1 !important;
                
            }

            li:hover {
                background: #3F598C;
            }
            li:nth-child(1):hover {
                background: #3F598C;
                border-top-left-radius: 6px;
                border-top-right-radius: 6px;
            }
            li:nth-child(4):hover {
                background: #3F598C;
                border-bottom-left-radius: 6px;
                border-bottom-right-radius: 6px;
            }
        }
    }

    .outUl .outLi:hover {
        opacity: 1;
    }

    .left-icon {
        width: 16px;
        height: 16px;
        margin-right: 8px;
    }

    .arrow {
        position: absolute;
        width: 10px;
        right: 18px;
    }

    .childmenu-style {
        background: rgba(0, 21, 64, 0.15);

        ul {
            position: relative;
        }

        .innerLi {
            position: relative;
            display: flex;
            align-items: center;
            width: 200px;
            min-height: 40px;
            padding: 10px 18px 10px 42px;
            font-weight: 400;
            font-size: 14px;
            color: #fff;
            opacity: 0.6;
            line-height: 1.4;
            cursor: pointer;

            .innerTitle {
                line-height: 1.4;
                width: 120px;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
            }

            p {
                margin: 0;
            }

            .configUl {
                position: absolute;
                z-index: 5;
                top: 37px;
                padding: 2px 0px;
                width: 76px;
                height: 70px;
                background: #334B81;
                box-shadow: 0px 6px 16px -8px rgb(0 0 0 / 8%), 0px 8px 20px rgb(0 0 0 / 12%);
                border-radius: 4px;
                right: 20px;
                font-weight: 400;
                font-size: 12px;
                color: #FFFFFF;
                li {
                    z-index: 5;
                    height: 33px;
                    line-height: 33px;
                    padding-left: 14px;
                    width: 76px;
                }

                li:nth-child(1):hover {
                    background: #3F598C;
                    border-top-left-radius: 4px;
                    border-top-right-radius: 4px;
                }
                li:nth-child(2):hover {
                    background: #3F598C;
                    border-bottom-left-radius: 4px;
                    border-bottom-right-radius: 4px;
                }
            }
        }

        .innerLi:hover {
            opacity: 1;
            background: linear-gradient(90deg, rgba(24, 120, 255, 0.18) 0.53%, rgba(24, 120, 255, 0.075) 99.75%);

            .innerTitle {
                opacity: 0.6;
            }
        }

        .innerSelect {
            position: relative;
            background: linear-gradient(90deg, rgba(24, 120, 255, 0.6) 0.53%, rgba(24, 120, 255, 0.25) 99.75%) !important;

            .innerTitle {
                opacity: 1 !important;
            }
        }

        .innerSelect::after {
            content: '';
            display: inline-block;
            width: 4px;
            height: 100%;
            background-color: #3d82f2;
            position: absolute;
            top: 0;
            left: 0
        }
    }
    .outUl > div:last-child .innerLi:last-child .configUl{
        top:-70px;
    }
    .outUl > div:first-child .innerLi:first-child .configUl{
        top: 37px;
    }
}

.bin {
    position: fixed;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 200px;
    height: 38px;
    line-height: 38px;
    font-size: 13px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.6);
    z-index: 5;
    background: #1C3A65;
    // line-height: 14px;
    cursor: pointer;
    img {
        width: 14px;
        margin-right: 6px;
        opacity: 0.6;
        margin-bottom: 1px;
    }
}

.bin:hover {
    color: rgba(255, 255, 255);
    img {
        opacity: 1;
    }
}

.leftmenu::-webkit-scrollbar {
    width: 0 !important;
}
</style>