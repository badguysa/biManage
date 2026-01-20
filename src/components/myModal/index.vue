<template>
    <Teleport to="body">
        <div class="MyModal" v-show="showModal">
            <div class="maskLayer"></div>
            <div class="popDiv" :style="{width: width}">
                <div class="popuHead">
                    <span class="popClose fr" @click="Cancel">
                        <img style="width: 16px" src="@/assets/icons/close.png" />
                    </span>
                    <p class="colorDeep" v-if="modalName&&modalName.length>0" :title="modalName">{{ modalName }}</p>
                    <slot name="modal-name" v-else />
                </div>
                <slot name="modal-body" />
                <div v-if="showBottom" class="shadowBox popuBottom" style="height: 63px;">
                    <myButton class="fr mr25" @click="Ok" type="primary">{{ okText }}</myButton>
                    <myButton v-if="showCancel" class="fr mr25" @click="Cancel">{{ cancelText }}</myButton>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup>
import myButton from '@/components/buttons/myButton.vue'
const emits = defineEmits(["onConfirm", "onCancel"])
const props = defineProps({
    modalName: {},
    okText: {
        default: "确定"
    },
    cancelText: {
        default: "取消"
    },
    width: {
        default: 'auto',
        type: String
    },
    showModal: {
        default: true,
        type: Boolean
    },
    showBottom: {
        default: true
    },
    showCancel:{
        type: Boolean,
        default: true,
    }
})
const Ok = () => {
    emits("onConfirm")
}
const Cancel = () => {
    emits("onCancel")
}
</script>

<style lang="less" scoped>
.MyModal {
    z-index: 999;
}
</style>