<template>
    <div class="leftmenu" ref="menuRef">
        <div 
            :class="{
                'template-field': true,
                select: activeStandardKey === 'TEMPLATE_FIELD'
            }" 
            @click="selectTemplateField"
        >
            <BiIcon name="templateField"/>
            <span>模板字段库</span>
        </div>
        <a-spin :spinning="leftDataLoading">
            <Draggable 
                tag="ul" 
                class="outUl" 
                :list="leftDataList" 
                item-key="id"
                :group="groupA"
                id="standardOutList"
                drag-class="chosenClass"
                :move="onOutMove"
                @end="dragOutEnd"
            >
                <template #item="{ element }">
                    <div>
                        <li 
                            :class="[element.subList.length ? (element.id == activeStandardKey ? 'outLi outSelect' : 'outLi') : (element.id == activeStandardKey ? 'outLi outSelect' : 'outLi noChild')]"
                            @click="onExpand(element, $event)" 
                            @mouseenter="onOutLiMouseenter(element)"
                            @mouseleave="onOutLiMouseleave(element)" 
                        >
                        
                        <img class="left-icon" :src="dataStandardBlueImg">
                        <span class="title" :title="element.name">{{ element.name }}</span>
                        <div
                            :class="[element.isHoverImg ? 'hotimg hotimgHover' : 'hotimg']"
                            @mouseenter="event => onOutImgMouseenter(event, element)" 
                            @mouseleave="onOutImgMouseleave(element)"
                        >
                            <img 
                                @mouseenter="imgMouseenter(element)" 
                                @mouseleave="imgMouseleave(element)" 
                                v-show="element.isHover && props.showHover"
                                class="hotimg" 
                                src="@/assets/icons/grayhot.png" alt=""
                            >
                            <img 
                                @mouseenter="imgMouseenter(element)" 
                                @mouseleave="imgMouseleave(element)"
                                v-show="element.isImgHover && props.showHover" 
                                class="hotimg" 
                                src="@/assets/icons/bluehot.png" alt=""
                            >
                        </div>
                        <img 
                            class="arrow" 
                            @click="e => onImgExpand(e, element)"
                            v-show="element.subList.length && !element.isExpanded"
                            src="@/assets/icons/down-arraw-icon.png" 
                            @mouseenter="onarrowImgMouseenter(element)" 
                        />
                        <img 
                            class="arrow" 
                            @click="e => onImgExpand(e, element)"
                            v-show="element.subList.length && element.isExpanded"
                            src="@/assets/icons/top-arraw-icon.png" 
                            @mouseenter="onarrowImgMouseenter(element)" 
                        />
                        
                        <ul 
                            id="outConfig" 
                            class="configUl" 
                            :style="{top: element.top}"
                            v-show="element.isHoverImg && props.showHover"
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
                        v-show="element.subList.length && element.isExpanded"
                    >
                        <Draggable 
                            id="standardInnerList"
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
                                <div>
                                    <li 
                                        :id="cProps.element.pid"
                                        :class="[cProps.element.id == activeStandardKey ? 'innerLi innerSelect' : 'innerLi']"
                                        class="innerLi" @click="onDebounceSelect(element, cProps.element)"
                                        @mouseenter="onInnerLiMouseenter(cProps.element)"
                                        @mouseleave="onInnerLiMouseleave(cProps.element)"
                                    >
                                        <img class="left-icon" :src="dataStandardBlueImg">
                                        <p class="innerTitle">
                                            {{ cProps.element.name }}
                                        </p>
                                        <div 
                                            :class="[cProps.element.isHoverImg ? 'innerhotimg innerhotimgHover' : 'innerhotimg']"
                                            @mouseenter="onInnerImgMouseenter(cProps.element)"
                                            @mouseleave="onInnerImgMouseleave(cProps.element)"
                                        >
                                            <img 
                                                @mouseenter="imgMouseenter(cProps.element)" 
                                                @mouseleave="imgMouseleave(cProps.element)" 
                                                v-show="cProps.element.isHover && props.showHover"
                                                class="hotimg" 
                                                src="@/assets/icons/grayhot.png" alt=""
                                            >
                                            <img 
                                                @mouseenter="imgMouseenter(cProps.element)" 
                                                @mouseleave="imgMouseleave(cProps.element)"
                                                v-show="cProps.element.isImgHover && props.showHover" 
                                                class="hotimg" 
                                                src="@/assets/icons/bluehot.png" alt=""
                                            >
                                        </div>
                                        <ul 
                                            id="innerConfig" 
                                            class="configUl"
                                            v-show="cProps.element.isHoverImg && props.showHover"
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
                                        <img 
                                            class="arrow" 
                                            @click="e => onImgExpand(e, cProps.element)"
                                            v-show="cProps.element.subList.length && !cProps.element.isExpanded"
                                            src="@/assets/icons/down-arraw-icon.png" 
                                            @mouseenter="onarrowImgMouseenter(cProps.element)" 
                                        />
                                        <img 
                                            class="arrow" 
                                            @click="e => onImgExpand(e, cProps.element)"
                                            v-show="cProps.element.subList.length && cProps.element.isExpanded"
                                            src="@/assets/icons/top-arraw-icon.png" 
                                            @mouseenter="onarrowImgMouseenter(cProps.element)" 
                                        />
                                    </li>
                                    <div 
                                        class="groundsonMenu-style" 
                                        v-show="cProps.element.subList.length && cProps.element.isExpanded"
                                    >
                                        <Draggable 
                                            id="standardInnerInnerList"
                                            tag="ul" 
                                            :list="cProps.element.subList" 
                                            item-key="id"
                                            :group="groupA"
                                            drag-class="chosenClass"
                                            :outId="cProps.element.id"
                                        >
                                            <template #item="gProps">
                                                <div>
                                                    <li 
                                                        :id="gProps.element.pid"
                                                        :class="[gProps.element.id == activeStandardKey ? 'innerInnerLi innerSelect' : 'innerInnerLi']"
                                                        class="innerInnerLi" @click="onDebounceSelect(element, gProps.element)"
                                                        @mouseenter="onInnerInnerLiMouseenter(gProps.element)"
                                                        @mouseleave="onInnerInnerLiMouseleave(gProps.element)"
                                                    >
                                                        <img class="left-icon" :src="dataStandardBlueImg">
                                                        <p class="innerTitle">
                                                            {{ gProps.element.name }}
                                                        </p>
                                                        <div 
                                                            :class="[gProps.element.isHoverImg ? 'innerhotimg innerhotimgHover' : 'innerhotimg']"
                                                            @mouseenter="onInnerImgMouseenter(gProps.element)"
                                                            @mouseleave="onInnerImgMouseleave(gProps.element)"
                                                        >
                                                            <img 
                                                                @mouseenter="imgMouseenter(gProps.element)" 
                                                                @mouseleave="imgMouseleave(gProps.element)" 
                                                                v-show="gProps.element.isHover && props.showHover"
                                                                class="hotimg" 
                                                                src="@/assets/icons/grayhot.png" alt=""
                                                            >
                                                            <img 
                                                                @mouseenter="imgMouseenter(gProps.element)" 
                                                                @mouseleave="imgMouseleave(gProps.element)"
                                                                v-show="gProps.element.isImgHover && props.showHover" 
                                                                class="hotimg" 
                                                                src="@/assets/icons/bluehot.png" alt=""
                                                            >
                                                        </div>
                                                        <ul 
                                                            id="innerInnerConfig" 
                                                            class="configUl"
                                                            v-show="gProps.element.isHoverImg && props.showHover"
                                                            @mouseenter="onInnerConfigMouseenter(gProps.element)"
                                                            @mouseleave="onInnerConfigMouseleave(gProps.element)"
                                                        >
                                                            <li 
                                                                v-for="configItem in innerInnerImgHoverList" 
                                                                :key="configItem.mid"
                                                                @click.prevent="e => handleInnerInnerConfig(e, configItem, element,cProps.element, gProps.element)"
                                                            >
                                                                {{ t(configItem.text) }}
                                                            </li>
                                                        </ul>
                                                    </li>                                                    
                                                </div>                                
                                            </template>
                                        </Draggable>
                                    </div>
                                </div>                                
                            </template>
                        </Draggable>
                    </div>
                </div>
                </template>
            </Draggable>
            <div style="width: 200px; height: 56px;"></div>
        </a-spin>
        <div class="area-blank" v-if="!leftDataList.length">
            <div class='box'>
                <img src='@/assets/images/img_null1.png' alt="" />
                <div class='blank-text'>{{ t('common.noDataTable') }}</div>
            </div>
        </div>
    </div>
    
</template>

<script setup>
import Draggable from 'vuedraggable'
import { reactive, nextTick } from 'vue';
import * as _ from 'loadsh'
import { out_ImgHoverList, inner_ImgHoverList, inner_inner_ImgHoverList } from '@/constants/dataCenterMenu'
import dataStandardBlueImg from '@/assets/icons/data-standard-blue.png'
import { storeToRefs } from 'pinia'
import { modalStore } from '@/Stores/modalStore';
import { mainStore } from '@/Stores/mainStore';
import { dataStandardStore } from '@/Stores/dataStandardStore';
import { message } from 'ant-design-vue';
import { useI18n } from 'vue-i18n'
import { standardExport } from '@/utils/utils'
import createDialog from '@/utils/dialog'

const { t, locale } = useI18n()

const useModalStore = modalStore()
const useMainStore = mainStore()
const useDataStandardStore = dataStandardStore()

const { leftDataList, leftDataLoading, activeStandardKey, groupObject, standardExpendIndex, isInitMount, isEditingField } = storeToRefs(useDataStandardStore)

let outImgHoverList = reactive(out_ImgHoverList)
let innerImgHoverList = reactive(inner_ImgHoverList)
let innerInnerImgHoverList = reactive(inner_inner_ImgHoverList)

let menuRef = ref(null)

// 操作菜单信息
let operateMenuInfo = reactive({
    id: -1,
    elm: null
})

const groupA = {
    name: "itxst",
    put: false, //允许拖入
    pull: false
}

const props = defineProps({
    showHover:{
        type:Boolean,
        default: true
    }
})

// 订阅 modalStore action => 新建子分组后 需展开父级分组 并选中子分组
useDataStandardStore.$onAction(
    ({name, store, args, after}) => {
        // 监听分组弹窗action触发
        if(name !== 'changeGroupModalStatus') return

        // action执行完后触发
        after(()=> {
            // 添加子级分组
            if(args?.includes('ADD_CHILD_CB')) {
                let menuItem = leftDataList.value.find(it => it.id === operateMenuInfo.id)
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


const initMountFn = ()=>{
    if(!activeStandardKey.value) {
        expandFn(leftDataList.value[0]);
    } else {
        if(standardExpendIndex.value > -1){
            let item = leftDataList.value.find(it => it.id === groupObject.value?.outItem?.id)
            if(groupObject.value.innerInnerItem){
                let innerItem = item?.subList.find(it => it.id === groupObject.value.innerItem.id)
                let innerInnerItem = innerItem?.subList.find(it => it.id === groupObject.value.innerInnerItem.id)
                expandFn(item,null, false, true);
                onSelect(item, innerItem)
                onSelect(innerItem, innerInnerItem)
            }else if(groupObject.value.innerItem){
                let innerItem = item?.subList.find(it => it.id === groupObject.value.innerItem.id)
                expandFn(item,null, false, true);
                onSelect(item, innerItem)
            } else {
                expandFn(item,null, true, true);
            }
        }
    }
    useDataStandardStore.setIsInitMount(false)
}

watch(()=> isInitMount.value, async(newVal)=>{
    if(newVal){
        await nextTick()
        initMountFn()
    }
},{
    immediate: true
})

const onImgExpand = async (e, item) => {
    e.stopPropagation()
    e.preventDefault()

    if(!item.subList.length) return

    item.isExpanded = !item.isExpanded

    locateSubMenu(item, e)
}

const expandFn = (item, e, showTable = true, mustExpend = false) => {
    if(!item?.id) return
    if (item.subList.length){
        if(!mustExpend){
            item.isExpanded = !item.isExpanded
        } else {
            item.isExpanded = true
        }
    }
    locateSubMenu(item, e)

    // 新增子分组 只需展开一级分组 无需展示分组下的表
    showTable && selectMenuFn(item)
}

// 一级分组点击
const onExpand = _.debounce(expandFn, 300, {
    leading: true,
    trailing: false
})

// 二级分组三级分组点击
const onSelect = (item, childItem) => {
    if (childItem.subList&&childItem.subList.length){
        childItem.isExpanded = !childItem.isExpanded
    }
    selectMenuFn(item, childItem)
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

    // 正在编辑模板字段库 切换增加提示
    if(isEditingField.value) {
        try {
            await createDialog({
                title: '提示',
                content: '离开当前页面后页面内容不会保留，确认离开？'
            })
        } catch(e) {
            return
        }
    }
    if(item?.groupType == 'STD_BRAIN'){
        useDataStandardStore.updateActiveStandardType(1)
    }else{
        useDataStandardStore.updateActiveStandardType(0)
    }
    useDataStandardStore.updateActiveStandardKey(item.id)
    useDataStandardStore.getStandardTableListFn()
}

// 外层划入事件
const onOutLiMouseenter = item => {
    item.isHover = true
}
const onOutLiMouseleave = () => {
    leftDataList.value.forEach(item => {
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

// 热区icon鼠标事件 begin
const imgMouseenter = (record) => {
    record.isHover = false
    record.isImgHover = true
}
const imgMouseleave = (record) => {
    record.isHover = true
    record.isImgHover = false
}
// 热区icon鼠标事件 end


const handleOutConfig = async (e, congfigItem, outItem) => {
    e.stopPropagation()
    if(congfigItem.mid == 'fexport'){
        message.warning(t('common.standardExporting'))
        await standardExport(outItem.name,outItem.id)
    }else{
        useDataStandardStore.changeGroupModalStatus(congfigItem.mid)
        useModalStore.changeAddStandardLibModalVisible()
        useDataStandardStore.selectLeftList({
            outItem
        })
        operateMenuInfo.id = outItem.id
        operateMenuInfo.event = e
    }
}
    

// 内层划入事件
const onInnerLiMouseenter = item => {
    item.isHover = true
}
const onInnerLiMouseleave = item => {
    let data = leftDataList.value.find(temp => temp.id === item.pid)
    if (data.subList.length) {
        data.subList.forEach(i => {
            i.isHover = false
            i.isHoverImg = false
        })
    }
}

// 内内层划入事件
const onInnerInnerLiMouseenter = item => {
    item.isHover = true
}
const onInnerInnerLiMouseleave = (item) => {
    item.isHover = false
    item.isHoverImg = false
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
    useDataStandardStore.changeGroupModalStatus(congfigItem.mid)
    useModalStore.changeAddStandardLibModalVisible()
    useDataStandardStore.selectLeftList({
        outItem,
        innerItem
    })
}

const handleInnerInnerConfig = (e, congfigItem, outItem, innerItem,innerInnerItem) => {
    e.stopPropagation()
    // console.log(e, congfigItem, outItem, innerItem,innerInnerItem);
    
    useDataStandardStore.changeGroupModalStatus(congfigItem.mid)
    useModalStore.changeAddStandardLibModalVisible()
    useDataStandardStore.selectLeftList({
        outItem,
        innerItem,
        innerInnerItem
    })
}

const onOutMove = res => {
    return false
    // if (res.to.id === 'innerList') return false
}

const onInnerMove = res => {
    return false
    // if (res.to.id === 'outList') return false
}

const onInnerStart = res => {
}

const dragInnerEnd = (res) => {
//     let tempId = ''
//     let groupId = ''
//     let objA = {
//         id: '',
//         num: 0
//     }
//     let objB = {
//         id: '',
//         num: 0
//     }
//     res.to.childNodes.forEach((item, index) => {
//         if (index === 0) {
//             tempId = item.id
//             objA.id = item.id
//         }
//         if (tempId === item.id) {
//             objA.num++
//         } else {
//             objB.id = item.id
//             objB.num++
//         }
//     })
//     if (objA.num > objB.num) {
//         groupId = objA.id
//     } else {
//         groupId = objB.id
//     }
//     const sortArray = leftMenuList.value.find(item => item.id === groupId)
//     // 优化用二分取值排序
//     let tableList = sortArray.subList
//     let newIndex = res.newIndex
//     let moveItem =  tableList[newIndex]
//     let { sort: sortValue, id: id} =  moveItem
//     if(!id) return

//     // sortValue越小越靠前
//     if(newIndex === 0) {
//         // 首项-1
//         if(tableList.length===1){
//             sortValue = tableList[0].sort - 1
//         } else {
//             sortValue = tableList[1].sort - 1
//         }
//     } else if(newIndex === tableList.length - 1) {
//         // 尾项+1
//         sortValue = tableList[tableList.length-2].sort + 1
//     } else {
//         // 取上下两项平均值作为 sortValue
//         sortValue = (tableList[newIndex-1].sort + tableList[newIndex+1].sort) / 2
//     }

//     tableList[newIndex].sort = sortValue
//     updateMenuSort({
//         id, sortValue, targetId: groupId
//     }).then((res) => {
//         if(res.code !== 1) {
//             message.error(res.message)
//         }
//     })
}

const dragOutEnd = (elm) => {
//     // 优化 用二分取值排序
//     let tableList = leftMenuList.value
//     let newIndex = elm.newIndex
//     let moveItem =  tableList[newIndex]
//     let { sort: sortValue, id: id} =  moveItem
//     if(!id) return
//     // sortValue越小越靠前
//     if(newIndex === 0) {
//         // 首项-1
//         if(tableList.length===1){
//             sortValue = tableList[0].sort - 1
//         } else {
//             sortValue = tableList[1].sort - 1
//         }
//     } else if(newIndex === tableList.length - 1) {
//         // 尾项+1
//         sortValue = tableList[tableList.length-2].sort + 1
//     } else {
//         // 取上下两项平均值作为 sortValue
//         sortValue = (tableList[newIndex-1].sort + tableList[newIndex+1].sort) / 2
//     }

//     tableList[newIndex].sort = sortValue
//     updateMenuSort({
//         id, sortValue
//     }).then((res) => {
//         if(res.code !== 1) {
//             message.error(res.message)
//         }
//     })
}

/**
 * 左侧菜单点击子目录防抖优化
 */

const onDebounceSelect = _.debounce(onSelect, 100)

// 选择模板字段库
const selectTemplateField = () => {
    useDataStandardStore.updateActiveStandardKey('TEMPLATE_FIELD')
}
</script>

<style lang="less" scoped>
.leftmenu {
    width: 100%;
    height: calc(100% - 64px);
    overflow: scroll;
    position: relative;
    -ms-overflow-style: none;
    overflow: -moz-scrollbars-none;
    scrollbar-width: none;

    .chosenClass {
        border-bottom: 2px solid #3D82F2;;
    }

    :deep(.ant-spin-container::after) {
        background: none;
    }

    .outSelect {
        color: #3D82F2;
        position: relative;
        width: 200px;
        min-height: 40px;
        background: rgba(61, 130, 242, 0.1);
    }
    .hotimg {
        position: absolute;
        display: flex;
        align-items: center;
        width: 18px;
        height: 18px;
        right: 11px;
        img {
            width: 18px;
            height: 18px;
        }
    }

    .hotimgHover {
        // background: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
    }

    .innerhotimgHover {
        // background: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
    }

    .hotimg:hover {
        // background: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
    }

    .innerhotimg {
        position: absolute;
        display: flex;
        align-items: center;
        width: 22px;
        height: 22px;
        right: 11px;

        img {
            width: 18px;
            height: 18px;
        }
    }

    .innerhotimg:hover {
        // background: rgba(255, 255, 255, 0.15);
        border-radius: 4px;
    }

    .noChild:hover {
        // background: rgba(61, 130, 242, 0.1);
    }

    .outUl {
        position: relative;
        color: rgba(0, 0, 0, 0.8);
        font-size: 14px;
        background-color: #fff;
    }
    
    .template-field{
        display: flex;
        align-items: center;
        gap: 7px;
        line-height: 1.4;
        min-height: 40px;
        width: 100%;
        padding: 10px 12px;
        cursor: pointer; 
        &:hover, &.select{
            background: rgba(61, 130, 242, 0.1);
            color: #3D82F2;
        }
    }

    .outUl .outLi {
        position: relative;
        display: flex;
        align-items: center;
        line-height: 1.4;
        min-height: 40px;
        width: 100%;
        padding: 10px 12px;
        cursor: pointer;
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
            height: 174px;
            background: #fff;
            box-shadow: 0px 6px 16px -8px rgb(0 0 0 / 8%), 0px 8px 20px rgb(0 0 0 / 12%);
            border-radius: 6px;
            right: 32px;
            font-size: 12px;
            color: rgba(0, 0, 0, 0.8);

            li {
                height: 34px;
                width: 100px;
                padding: 8px 14px;
            }

            li:hover {
                background: rgba(61, 130, 242, 0.1);
            }
            li:nth-child(1):hover {
                background: rgba(61, 130, 242, 0.1);
                border-top-left-radius: 6px;
                border-top-right-radius: 6px;
            }
            li:nth-child(5):hover {
                background: rgba(61, 130, 242, 0.1);
                border-bottom-left-radius: 6px;
                border-bottom-right-radius: 6px;
            }
        }
    }

    .outUl .outLi:hover {
        background: rgba(61, 130, 242, 0.1);
        color: #3D82F2;
    }

    .left-icon {
        width: 16px;
        height: 16px;
        margin-right: 7px;
    }

    .arrow {
        position: absolute;
        width: 10px;
        right: 10px;
    }

    .childmenu-style {
        ul {
            position: relative;
            color: rgba(0, 0, 0, 0.8);
            font-size: 14px;
            background-color: #fff;
            &#standardInnerList::before{
                position: absolute;
                content: '';
                width: 1px;
                height: calc(100% - 20px);
                left: 18px;
                border:1px dashed #D4D6D9;
                z-index: 1;
            }

            &#standardInnerList .innerLi::before{
                position: absolute;
                content: '';
                width: 16px;
                height: 1px;
                left: 18px;
                border:1px dashed #D4D6D9;
            }
        }

        .arrow {
            z-index: 1;
        }

        .innerLi {
            position: relative;
            display: flex;
            align-items: center;
            width: 100%;
            min-height: 40px;
            padding: 10px 18px 10px 36px;
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
                width: 100px;
                height: 140px;
                background: #fff;
                box-shadow: 0px 6px 16px -8px rgb(0 0 0 / 8%), 0px 8px 20px rgb(0 0 0 / 12%);
                border-radius: 4px;
                right: 20px;
                font-size: 12px;
                color: rgba(0, 0, 0, 0.8);
                // color: #3D82F2;
                li {
                    z-index: 5;
                    height: 34px;
                    line-height: 34px;
                    padding-left: 14px;
                    width: 100px;
                }

                li:hover {
                    background: rgba(61, 130, 242, 0.1);
                }

                li:nth-child(1):hover {
                    background: rgba(61, 130, 242, 0.1);
                    border-top-left-radius: 4px;
                    border-top-right-radius: 4px;
                }
                li:nth-child(4):hover {
                    background: rgba(61, 130, 242, 0.1);
                    border-bottom-left-radius: 4px;
                    border-bottom-right-radius: 4px;
                }
            }
        }

        .innerLi:hover {
            background: rgba(61, 130, 242, 0.1);

            .innerTitle {
                color: #3D82F2;
            }
        }

        .innerSelect {
            position: relative;
            background: rgba(61, 130, 242, 0.1);

            .innerTitle {
                color: #3D82F2;
            }
        }
    }
    .groundsonMenu-style {
        ul {
            position: relative;
            color: rgba(0, 0, 0, 0.8);
            font-size: 14px;
            background-color: #fff;
            &#standardInnerInnerList::before{
                position: absolute;
                content: '';
                width: 1px;
                height: calc(100% - 20px);
                left: 40px;
                border:1px dashed #D4D6D9;
                z-index: 1;
            }

            &#standardInnerInnerList .innerInnerLi::before{
                position: absolute;
                content: '';
                width: 16px;
                height: 1px;
                left: 40px;
                border:1px dashed #D4D6D9;
            }
        }

        .innerInnerLi {
            position: relative;
            display: flex;
            align-items: center;
            width: 100%;
            min-height: 40px;
            padding: 10px 18px 10px 56px;
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
                width: 68px;
                height: 88px;
                background: #fff;
                box-shadow: 0px 6px 16px -8px rgb(0 0 0 / 8%), 0px 8px 20px rgb(0 0 0 / 12%);
                border-radius: 4px;
                right: 20px;
                font-size: 12px;
                color: rgba(0, 0, 0, 0.8);
                li {
                    z-index: 5;
                    height: 42px;
                    line-height: 42px;
                    padding-left: 14px;
                    width: 68px;
                }

                li:nth-child(1):hover {
                    background: rgba(61, 130, 242, 0.1);
                    border-top-left-radius: 4px;
                    border-top-right-radius: 4px;
                }
                li:nth-child(2):hover {
                    background: rgba(61, 130, 242, 0.1);
                    border-bottom-left-radius: 4px;
                    border-bottom-right-radius: 4px;
                }
            }
        }

        .innerInnerLi:hover {
            background: rgba(61, 130, 242, 0.1);

            .innerTitle {
                color: #3D82F2;
            }
        }

        .innerSelect {
            position: relative;
            background: rgba(61, 130, 242, 0.1);

            .innerTitle {
                color: #3D82F2;
            }
        }
    }
    .outUl > div:last-child .innerLi:last-child .configUl{
        top:-70px;
    }
    .outUl > div:first-child .innerLi:first-child .configUl{
        top: 37px;
    }
}

.leftmenu::-webkit-scrollbar {
    width: 0 !important;
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
</style>