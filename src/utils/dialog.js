import Dialog from '@/components/globalTipsModal'

const createDialog = (option = {}) => {
  return new Promise((resolve, reject) => {
    const mountNode = document.createElement('div')
    const Instance = createApp(Dialog, {
      show: true,
      ...option,
      confirm: () => {
        resolve('confirm')
        Instance.unmount(mountNode)
        document.body.removeChild(mountNode)
      },
      cancel: () => {
        reject('cancel')
        Instance.unmount(mountNode)
        document.body.removeChild(mountNode)
      },
      close: () => {
        reject('close')
        Instance.unmount(mountNode)
        document.body.removeChild(mountNode)
      },
    })
    document.body.appendChild(mountNode)
    Instance.mount(mountNode)
  })
}

export default createDialog
