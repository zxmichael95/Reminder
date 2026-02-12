import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('notificationAPI', {
    dismiss: () => ipcRenderer.send('dismiss-notification')
})
