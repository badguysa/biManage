<template>
    <div className="delModal" v-if="modalVisible">
        <div class="maskLayer"></div>
        <div class="popDiv wid400">
            <div class="popHead">
                <a class="popClose fr">
                    <img style="width: 16px" src="@/assets/icons/close.png" @click="cancel"/>
                </a>
                <p class="fl colorDeep">{{ t('common.tip') }}</p>
            </div>

            <div className="modalBody">
                <span>{{ t('common.confirmDelete') }}</span>
            </div>

            <div class="popBottom shadowBox">
                <myButton class="fr mr25" type="primary" @click="remove">{{ t('common.delete') }}</myButton>
                <myButton class="fr mr25" @click="cancel">{{ t('common.cancel') }}</myButton>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import myButton from '@/components/buttons/myButton.vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
let modalVisible = ref(false)
const props = defineProps({
    flag: {
        type: String,
        defalut: ''
    }
})

const emit = defineEmits(['confirmRemoveHandle', 'changeDelVisible'])

const remove = () => {
    emit('confirmRemoveHandle')
    modalVisible.value = false
}
const cancel = () => {
    modalVisible.value = false
    if (props.flag === 'authInter') {
        emit('changeDelVisible')
    }
}

defineExpose({
    modalVisible,
})
</script>

<style lang="less" scoped>
.delModal {
    .modalBody {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        padding: 30px 24px;
        padding-left: 30px;
        gap: 16px;
        width: 400px;
        height: 82px;
        font-family: 'PingFang SC';
        font-style: normal;
        font-weight: 400;
        font-size: 16px;
        line-height: 22px;
        text-align: justify;
        color: rgba(0, 0, 0, 0.8);
        .text {
            font-weight: 600;
            margin: 0px 5px;
            color: #3d82f2;
        }
    }
}
</style>
