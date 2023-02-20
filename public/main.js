const { BrowserWindow, app, ipcMain } = require("electron");
const XLSX = require("xlsx")
const Dayjs = require("dayjs")

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
    const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    const date = arg[0].Shipping_Date.format("MM/DD/YYYY")
    const monthNum = arg[0].Shipping_Date.get("month")
    const month = months[monthNum]
    const year = arg[0].Shipping_Date.format("YY")
    const dueDate = arg[0].Shipping_Date.add(7, "day")

    //grab excel file
    const workbook = XLSX.readFile("C:/Users/Josh/Downloads/2023 Shipments.xlsx");

    //find range of sheet
    const worksheet = workbook.Sheets[month]
    const range = XLSX.utils.decode_range(worksheet["!ref"])
    const row = range.e.r + 1

    //grab previous shipment number to find current shipment number
    if(row > 1){
        const prevShip = worksheet[XLSX.utils.encode_cell({ r: (row - 1), c: 0})].v 
        worksheet[XLSX.utils.encode_cell({ r: row, c: 0})].v = prevShip + 1
    } else {
        if (monthNum > 0){
            const newMonth = months[monthNum - 1]
            const newWorksheet = workbook.Sheets[newMonth]
            const newRange = XLSX.utils.decode_range(newWorksheet["!ref"])
            const newRow = newRange.e.r
            const prevShip = newWorksheet[XLSX.utils.encode_cell({ r: (newRow - 1), c: 0})].v 
            worksheet[XLSX.utils.encode_cell({ r: row, c: 0})].v =  prevShip + 1
        } else {
            worksheet[XLSX.utils.encode_cell({r:1, c:0})].v = year + "001"
        }
    }
    worksheet[XLSX.utils.encode_cell({ r: row, c: 1})].v = arg[0].Stallion
    worksheet[XLSX.utils.encode_cell({ r: row, c: 2})].v = arg[0].Stallion_Owner
    worksheet[XLSX.utils.encode_cell({ r: row, c: 3})].v = arg[0].Mare_Name
    worksheet[XLSX.utils.encode_cell({ r: row, c: 4})].v = arg[0].Mare_Owner
    worksheet[XLSX.utils.encode_cell({ r: row, c: 5})].v = date
    worksheet[XLSX.utils.encode_cell({ r: row, c: 6})].v = arg[0].Doses
    worksheet[XLSX.utils.encode_cell({ r: row, c: 7})].v = "1"
    worksheet[XLSX.utils.encode_cell({ r: row, c: 8})].v = "1"
    worksheet[XLSX.utils.encode_cell({ r: row, c: 10})].v = dueDate.format("MM/DD/YYYY")
    worksheet[XLSX.utils.encode_cell({ r: row, c: 13})].v = arg[1].Recipient
    worksheet[XLSX.utils.encode_cell({ r: row, c: 14})].v = "N"
    
    console.log(range)
})