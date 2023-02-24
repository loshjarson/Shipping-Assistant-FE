const { BrowserWindow, app, ipcMain } = require("electron");
const axios = require("axios")

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
        },
        icon:"./sbs logo.png"
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

ipcMain.handle('get-fedex-auth', async (event, ...args) => {
    let userInfo = null;
    const authUrl = 'https://apis-sandbox.fedex.com/oauth/token';
    var details = {
        'grant_type': 'client_credentials',
        'client_id': 'l7dc5aba5c17a64d4fbebd160ca85c3ecf',
        'client_secret': '878a7def4a894a78967759beb54ee6aa'
        };
    userInfo = await axios.post(authUrl,details,{headers: {'content-type': 'application/x-www-form-urlencoded'}})
        .catch(err => {
            console.log(err)
        })
    console.log(userInfo.data)
    return {bearer:userInfo.data.access_token, timeStamp:timeStamp}
})