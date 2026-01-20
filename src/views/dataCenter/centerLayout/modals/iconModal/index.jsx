import { defineComponent, reactive, ref, onMounted } from 'vue'
import { mainStore } from '@/Stores/mainStore';
import { dataStandardStore } from '@/Stores/dataStandardStore';
import { modalStore } from '@/Stores/modalStore';
import { storeToRefs } from 'pinia'
import closeImg from '@/assets/icons/close.png'
import myButton from '../../../../../components/buttons/myButton'
import { useI18n } from 'vue-i18n';
import { uploadFile } from '@/apis/cloud'
import './index.less'
import img1 from '@/assets/Iconlibrary/tubiaoku(1).png'
import img2 from '@/assets/Iconlibrary/tubiaoku(2).png'
import img3 from '@/assets/Iconlibrary/tubiaoku(3).png'
import img4 from '@/assets/Iconlibrary/tubiaoku(4).png'
import img5 from '@/assets/Iconlibrary/tubiaoku(5).png'
import img6 from '@/assets/Iconlibrary/tubiaoku(6).png'
import img7 from '@/assets/Iconlibrary/tubiaoku(7).png'
import img8 from '@/assets/Iconlibrary/tubiaoku(8).png'
import img9 from '@/assets/Iconlibrary/tubiaoku(9).png'
import img10 from '@/assets/Iconlibrary/tubiaoku(10).png'
import img11 from '@/assets/Iconlibrary/tubiaoku(11).png'
import img12 from '@/assets/Iconlibrary/tubiaoku(12).png'
import img13 from '@/assets/Iconlibrary/tubiaoku(13).png'
import img14 from '@/assets/Iconlibrary/tubiaoku(14).png'
import img15 from '@/assets/Iconlibrary/tubiaoku(15).png'
import img16 from '@/assets/Iconlibrary/tubiaoku(16).png'
import img17 from '@/assets/Iconlibrary/tubiaoku(17).png'
import img18 from '@/assets/Iconlibrary/tubiaoku(18).png'
import img19 from '@/assets/Iconlibrary/tubiaoku(19).png'
import img20 from '@/assets/Iconlibrary/tubiaoku(20).png'
import img21 from '@/assets/Iconlibrary/tubiaoku(21).png'
import img22 from '@/assets/Iconlibrary/tubiaoku(22).png'
import img23 from '@/assets/Iconlibrary/tubiaoku(23).png'
import img24 from '@/assets/Iconlibrary/tubiaoku(24).png'

export default defineComponent({
    name: 'iconModal',
    components: {
        myButton
    },
    props: {
        // 默认为0：数据中心图标库 1：数据标准图标库
        type: {
            type: Number,
            default: 0
        },
    },
    setup(props) {
        const imgList = reactive([
            { mid: '18', src: img18 },
            { mid: '5', src: img5 },
            { mid: '13', src: img13 },
            { mid: '23', src: img23 },
            { mid: '9', src: img9 },
            { mid: '19', src: img19 },
            { mid: '20', src: img20 },
            { mid: '16', src: img16 },
            { mid: '15', src: img15 },
            { mid: '4', src: img4 },
            { mid: '22', src: img22 },
            { mid: '17', src: img17 },
            { mid: '2', src: img2 },
            { mid: '1', src: img1 },
            { mid: '10', src: img10 },
            { mid: '12', src: img12 },
            { mid: '11', src: img11 },
            { mid: '21', src: img21 },
            { mid: '8', src: img8 },
            { mid: '24', src: img24 },
            { mid: '3', src: img3 },
            { mid: '7', src: img7 },
            { mid: '6', src: img6 },
            { mid: '14', src: img14 }
        ])
        const useModalStore = modalStore()
        const useMainStore = mainStore()
        const useDataStandardStore = dataStandardStore()
        const { iconModalVisible } = storeToRefs(useModalStore)
        const { uploadInfo } = storeToRefs(useMainStore)
        const { t } = useI18n()
        const selectKey = ref('')
        const selectSrc = ref('')
        const fileData = ref()
        const cancel = () => {
            useModalStore.changeIconModalVisible()
        }
        const base64ToFile = (urlData, fileName) => {
            let arr = urlData.split(',');
            let mime = arr[0].match(/:(.*?);/)[1];
            let bytes = atob(arr[1]); // 解码base64
            let n = bytes.length
            let ia = new Uint8Array(n);
            while (n--) {
                ia[n] = bytes.charCodeAt(n);
            }
            return new File([ia], fileName, { type: mime });
        }
        const selectImg = async (e, item) => {
            selectSrc.value = item.src
            selectKey.value = item.mid
        }

        const onOK = () => {
            if (!selectSrc.value) return
            fileData.value = base64ToFile(selectSrc.value, `${Date.now}.png`)
            const formData = new FormData()
            const jsonData = {
                puid: uploadInfo.value.puid,
                _token: uploadInfo.value.token,
            }
            for (let key in jsonData) {
                formData.append(key, jsonData[key])
            }
            formData.append('file', fileData.value)
            uploadFile(formData)
            .then((res) => {
                if (res.data && res.data.result) {
                    useMainStore.setIconPreviewUrl(res.data.data.previewUrl)
                    useModalStore.changeIconModalVisible()
                }
            })
            .catch((e) => {
                console.log(e)
            })
        }
        return {
            cancel,
            selectImg,
            onOK,
            t,
            iconModalVisible,
            imgList,
            selectKey,
            props
        }
    },
    render() {
        const { cancel, selectImg, onOK, t, iconModalVisible, imgList, selectKey } = this
        return (
            iconModalVisible ?
                <div className='iconModal'>
                    <div class="popDiv wid480">
                        <div class="popHead">
                            <span class="popClose fr" onClick={cancel}><img style={{ width: '16px' }} src={closeImg} /></span>
                            <p class="fl colorDeep">{ t('group.iconLib') }</p>
                        </div>

                        <div className='modalBody'>
                            {
                                imgList.map(item => (
                                    <div className={item.mid == selectKey ? 'imgbox selected' : 'imgbox'}><img onClick={(e) => selectImg(e, item)} src={item.src} alt="" /></div>
                                ))
                            }
                        </div>

                        <div class="popBottom shadowBox">
                            <myButton onClick={onOK} class="fr mr25" type="primary">{ t('common.confirm') }</myButton>
                            <myButton class="fr mr25" onClick={cancel}>{ t('common.cancel') }</myButton>
                        </div>
                    </div>
                </div>
                : null
        )
    }
})