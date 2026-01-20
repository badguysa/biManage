## 快速使用configStore
```js
import { toRefs } from 'vue'
import { configStore } from '@/Stores/configStore'
import { storeToRefs } from 'pinia'
const useConfigStore = configStore()
const { configUniqueData } = storeToRefs(useConfigStore)
const configData = computed(() => {
    return configUniqueData.value.find(i => i.uniqueId === activeTabKey.value)
})
const {  } = toRefs(configData.value)
```