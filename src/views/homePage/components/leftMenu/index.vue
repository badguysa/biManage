<template>
    <div class="dataBoard-left-menu">
        <div v-for="item in leftMenuList" :key="item.id">
            <div :class="[item.id === activeKey ? 'menuItem menuItem-active' : 'menuItem']" @click="goPages(item)">
                <img :src="item.imgSrc" alt="" />
                <span>{{ t(item.name) }}</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import homeStore from '@/Stores/homeStore.js'
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const { t } = useI18n()
const router = useRouter()
const useHomeStore = homeStore()
const { activeKey, leftMenuList } = storeToRefs(useHomeStore)
import { getCloudDiskRedirectUrl } from '@/apis/common';
// 跳转到页面
const goPages = (tab) => {
  if(tab.id == 'cloudStorage'){
    getCloudDiskRedirectUrl().then(res => {
      if (res.code == 1 && res.data){
        if(res.data?.headers?.signature){
          let url = res.data.url+"&signature="+res.data.headers.signature
          window.open(url);
        }

      }
    })
  }else{
    useHomeStore.changeTabsList(tab, 'add')
    router.push(tab.path)
  }

}
</script>

<style lang="less" scoped>
.dataBoard-left-menu {
    width: 200px;
    height: 100%;
    background-image: url('@/assets/images/leftback.png');
    background-size: cover;
    padding-top: 10px;

    .menuItem {
        height: 50px;
        padding: 15px 18px;
        cursor: pointer;
        opacity: 0.6;

        img {
            width: 16px;
            height: 16px;
            margin-right: 8px;
            margin-bottom: 3px;
        }

        span {
            color: #ffffff;
            font-size: 14px;
        }
    }

    .menuItem:hover {
        opacity: 1 !important;
        background: linear-gradient(90deg, rgba(24, 120, 255, 0.18) 0.53%, rgba(24, 120, 255, 0.075) 99.75%);
    }

    .menuItem-active {
        background: linear-gradient(90deg, rgba(24, 120, 255, 0.6) 0.53%, rgba(24, 120, 255, 0.25) 99.75%) !important;
        position: relative;
        opacity: 1 !important;

        &::after {
            content: '';
            display: inline-block;
            width: 4px;
            height: 100%;
            background-color: #3d82f2;
            position: absolute;
            top: 0;
            left: 0;
        }
    }
}</style>