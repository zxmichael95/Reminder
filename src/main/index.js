import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.ico?asset'

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1024,
        height: 768,
        show: false,
        autoHideMenuBar: true,
        icon,
        webPreferences: {
            preload: join(__dirname, '../preload/index.js'),
            sandbox: false
        }
    })

    mainWindow.on('ready-to-show', () => {
        mainWindow.show()
    })

    mainWindow.webContents.setWindowOpenHandler((details) => {
        shell.openExternal(details.url)
        return { action: 'deny' }
    })

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
        mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    }
}

function createNotificationWindow(reminderName, nextTime) {
    const notificationWindow = new BrowserWindow({
        width: 450,
        height: 280,
        frame: false,
        resizable: false,
        alwaysOnTop: true,
        show: false, // Don't show immediately
        icon,
        webPreferences: {
            preload: join(__dirname, '../preload/notification.js'),
            sandbox: false
        }
    })

    notificationWindow.once('ready-to-show', () => {
        notificationWindow.show()
    })

    const query = { name: encodeURIComponent(reminderName) }
    if (nextTime) {
        query.nextTime = encodeURIComponent(nextTime)
    }

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        notificationWindow.loadFile(join(__dirname, '../../src/renderer/notification.html'), {
            query
        })
    } else {
        notificationWindow.loadFile(join(__dirname, '../renderer/notification.html'), {
            query
        })
    }

    shell.beep()
}

app.whenReady().then(() => {
    electronApp.setAppUserModelId('com.electron')

    app.on('browser-window-created', (_, window) => {
        optimizer.watchWindowShortcuts(window)
    })

    // IPC handlers
    ipcMain.on('show-notification', (_, reminderName, nextTime) => {
        createNotificationWindow(reminderName, nextTime)
    })

    ipcMain.on('dismiss-notification', (event) => {
        const notificationWindow = BrowserWindow.fromWebContents(event.sender)
        if (notificationWindow) {
            notificationWindow.close()
        }
    })

    ipcMain.on('ping', () => console.log('pong'))

    createWindow()

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
