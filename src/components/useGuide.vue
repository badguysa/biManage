<template>
  <div ref="useGuideMenuRef">
    <!-- <div class="useGuide" @click="openMenu">
      <img src="@/assets/icons/guide_arrow.png" alt="">
    </div> -->
    <div class="useGuide_btn" @mouseenter="mouseEnterHander(1)" @mouseleave="mouseLeaveHander(1)"
      @click="showUseGuideMenu = !showUseGuideMenu"  @mousedown.stop.prevent="startDrag"
    :style="`right:${elRight}px;bottom:${elBottom}px`">
      <img v-show="!showUseGuideMenu" src="@/assets/icons/guide.png" alt="" draggable="false">
      <img v-show="showUseGuideMenu" src="@/assets/icons/close_white.png" alt="" draggable="false">
    </div>
    <div v-if="showUseGuideMenu" class="useGuide_menu" @mouseenter="mouseEnterHander(0)"
      @mouseleave="mouseLeaveHander(0)" :style="`right:${elRight}px;bottom:${elBottom+40}px`">
      <div class="useGuide_title" @click="openGuide">
        <img src="@/assets/icons/guide_title.png" alt="">
        {{ t('common.useGuide') }}
      </div>
    </div>
  </div>
</template>
<script setup>
import { useI18n } from 'vue-i18n';
import { onMounted, ref, onUnmounted } from 'vue'
const { t } = useI18n()
const showUseGuideMenu = ref(false)
const useGuideMenuRef = ref()
let startMouseX = 0; // 记录开始的横坐标位置
let startMouseY = 0; // 记录开始的纵坐标位置
const elRight = ref(21); //定位-初始位置
const elBottom = ref(20); //定位-初始位置
// 鼠标按下事件
const startDrag = (e) => {
  startMouseX = e.clientX;
  startMouseY = e.clientY;

  document.addEventListener("mousemove", drag);
  document.addEventListener("mouseup", stopDrag);
};

// 鼠标移动事件
const drag = (e) => {
  e.preventDefault()
  const offsetX = e.clientX - startMouseX;
  const offsetY = e.clientY - startMouseY;

  let newRight = elRight.value - offsetX;
  let newBottom = elBottom.value - offsetY;

  const maxX = window.innerWidth - 104 ; // 可视区域宽度减去悬浮球宽度
  const maxY = window.innerHeight -40- 42; // 可视区域高度减去悬浮球高度

  // 边界检查
  if (newRight < 0) {
    newRight = 0;
  } else if (newRight > maxX) {
    newRight = maxX;
  }

  if (newBottom < 0) {
    newBottom = 0;
  } else if (newBottom > maxY) {
    newBottom = maxY;
  }

  elRight.value = newRight;
  elBottom.value = newBottom;

  startMouseX = e.clientX;
  startMouseY = e.clientY;
};

// 鼠标松开事件
const stopDrag = () => {
  document.removeEventListener("mousemove", drag);
  document.removeEventListener("mouseup", stopDrag);
};
const openMenu = () => {
  showUseGuideMenu.value = true
}
onMounted(() => {
  // document.addEventListener('click', globalClick)
})
const globalClick = (event) => {
  if (useGuideMenuRef.value && showUseGuideMenu.value && !useGuideMenuRef.value.contains(event.target)) {
    showUseGuideMenu.value = false
  }
}
const openGuide = () => {
  showUseGuideMenu.value = false
  window.open("https://sharewh2.xuexi365.com/share/0fabde9c-c6b9-420b-954e-dedca5ca221a?t=3")
}
let timeId = null
const useGuideFa = ref(true)
const useGuideSon = ref(true)
const mouseEnterHander = (type) => {
  if (type == 1) {
    useGuideFa.value = false
  } else {
    useGuideSon.value = false
  }
  timeId && clearTimeout(timeId)
  showUseGuideMenu.value = true
}
const mouseLeaveHander = (type) => {
  if (type == 1) {
    useGuideFa.value = true
  } else {
    useGuideSon.value = true
  }
  if (useGuideFa.value && useGuideSon.value) {
    timeId = setTimeout(() => {
      showUseGuideMenu.value = false
      clearTimeout(timeId)
    }, 500)
  }
}
onUnmounted(() => {
  // document.removeEventListener('click', globalClick)
})
</script>
<style lang="less" scoped>
.useGuide_menu {
  position: fixed;
  right: 21px;
  bottom: 60px;
  height: 42px;
  box-sizing: border-box;
  z-index: 1;
  border-radius: 4px;
  border: 1px solid #F0F0F0;
  background: #FFF;
  box-shadow: 0px 6px 24px 0px rgba(31, 35, 41, 0.10);
  padding: 4px 0;

  img {
    width: 14px;
    height: 14px;
    margin-right: 6px;
  }

  .useGuide_title {
    height: 100%;
    padding: 0 12px;
    display: flex;
    align-items: center;
    cursor: pointer;

    &:hover {
      background-color: #F2F3F5;
    }
  }
}

.useGuide_btn {
  position: fixed;
  right: 21px;
  bottom: 20px;
  width: 32px;
  height: 32px;
  background-color: #2B67FF;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;

  img {
    width: 16px;
    height: 16px;
  }
}

.useGuide {
  position: fixed;
  right: -16px;
  bottom: 20px;
  width: 32px;
  height: 32px;
  background-color: #5188FF;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding-left: 4px;
  z-index: 1;

  &:hover {
    background-color: #2B67FF;
  }

  &:active {
    background-color: #2B67FF;
  }

  img {
    width: 12px;
    height: 12px;
  }
}
</style>