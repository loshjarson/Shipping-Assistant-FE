const { BrowserWindow, app, ipcMain } = require("electron");


require('@electron/remote/main').initialize()

function createWindow() {
    //create browser window
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false
        }
    })
    win.loadURL('http://localhost:3000')
}

app.on('ready', createWindow)

//Quit when windows are closed (for mac)
//removes common occurence of app staying open until Cmd+Q
app.on('windows-all-closed', function () {
    if(process.platform !== 'darwin'){
        app.quit()
    }
})

app.on('activate', function () {
    //only creates window if there is no window already
    if( BrowserWindow.getAllWindows().length === 0) createWindow()
})
