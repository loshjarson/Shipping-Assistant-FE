const { BrowserWindow, app, ipcMain } = require("electron");
const XLSX = require("xlsx")

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

ipcMain.handle('edit-excel', async (event, arg) => {
    //store month of shipment to grab correct sheet 
    const month = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    

    const workbook = XLSX.readFile("C:/Users/Josh/Downloads/2023 Shipments.xlsx");

    
    const worksheet = workbook.Sheets["February"]
    const range = XLSX.utils.decode_range(worksheet["!ref"])
    console.log(range)
})