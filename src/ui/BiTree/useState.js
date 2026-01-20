import { ref } from 'vue'

const _expandedKeys = ref([])
const _selectedKeys = ref([])

export function getTreeState() {
  return {
    _expandedKeys,
    _selectedKeys
  }
}

export function setTreeState(props) {
  _expandedKeys.value = props.expandedKeys
  _selectedKeys.value = props.selectedKeys

  watch(
    () => props.selectedKeys,
    nv => {
      _selectedKeys.value = nv
    }
  )
  watch(
    () => props.expandedKeys,
    nv => {
      _expandedKeys.value = nv
    }
  )
}
