const { BrowserWindow, app, ipcMain } = require("electron");
const axios = require("axios")
require('dotenv').config();


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
        'client_id': process.env.API_KEY,
        'client_secret': process.env.SECRET_KEY
        };
    userInfo = await axios.post(authUrl,details,{headers: {'content-type': 'application/x-www-form-urlencoded'}})
        .catch(err => {
            console.log(err)
        })
    console.log(userInfo.data)
    return {bearer:userInfo.data.access_token}
})

ipcMain.handle('get-fedex-labels', async (event, ...args) => {
    const shippingUrl = 'https://apis-sandbox.fedex.com/';
    console.log(args)
    const fedexOutBody = {
        mergeLabelDocOption: "LABELS_ONLY",
        requestedShipment: {
          shipDatestamp: args[1].Shipping_Date.format("YYYY-MM-DD"),
          totalDeclaredValue: {
            amount: 400,
            currency: "USD"
          },
          shipper: {
            address: {
              streetLines: [
                "961 Cayots Canyon Rd"
              ],
              city: "Chesapeake City",
              stateOrProvinceCode: "MD",
              postalCode: "21915",
              countryCode: "US",
            },
            contact: {
              emailAddress: "distribution@selectbreeders.com",
              phoneNumber: "4108853877",
              companyName: "Select Breeders Services"
            },
          },
          recipients: [
            {
              address: {
                streetLines: [
                  args[2].Street_Address
                ],
                city: args[2].City,
                stateOrProvinceCode: args[2].State,
                postalCode: args[2].Zip_Code,
                countryCode: "US",
              },
              contact: {
                personName: args[2].Attn,
                emailAddress: args[2].Recipient_Email,
                phoneNumber: args[2].Recipient_Phone,
                companyName: args[2].Recipient
              }
            }
          ],
          pickupType: "USE_SCHEDULED_PICKUP",
          serviceType: args[1].Service_Type,
          packagingType: "YOUR_PACKAGING",
          totalWeight: 20,
          shippingChargesPayment: {
            paymentType: "SENDER",
          },
          shipmentSpecialServices: {
            specialServiceTypes: [
              "RETURN_SHIPMENT"
            ],
            returnShipmentDetail: {
              returnAssociationDetail: {
                shipDatestamp: args[1].Shipping_Date.format("YYYY-MM-DD"),
              },
              returnType: "PRINT_RETURN_LABEL"
            },
          },
          labelSpecification: {
            labelFormatType: "COMMON2D",
            labelOrder: "SHIPPING_LABEL_FIRST",
            labelStockType: "STOCK_4X675_LEADING_DOC_TAB",
            imageType: "ZPLII",
            labelPrintingOrientation: "BOTTOM_EDGE_OF_TEXT_FIRST",
          },
          requestedPackageLineItems: [
            {
              customerReferences: [
                {
                  customerReferenceType: "CUSTOMER_REFERENCE",
                  value: "640/"+ args[1].Shipment_Number + "/" + args[1].Stallion
                }
              ],
              declaredValue: {
                amount: 400,
                currency: "USD"
              },
              weight: {
                units: "LB",
                value: 20
              },
            }
          ]
        },
        labelResponseOptions: "LABEL",
        accountNumber: {
          value: process.env("SHIPPING_ACCOUNT")
        },
        shipAction: "CONFIRM",
      }
    const fedexRetBody = {
        mergeLabelDocOption: "LABELS_ONLY",
        requestedShipment: {
          shipDatestamp: args[1].Shipping_Date.format("YYYY-MM-DD"),
          totalDeclaredValue: {
            amount: 0,
            currency: "USD"
          },
          shipper: {
            address: {
                streetLines: [
                  args[2].Street_Address
                ],
                city: args[2].City,
                stateOrProvinceCode: args[2].State,
                postalCode: args[2].Zip_Code,
                countryCode: "US",
              },
              contact: {
                personName: args[2].Attn,
                emailAddress: args[1].Recipient_Email,
                phoneNumber: args[1].Recipient_Phone,
                companyName: args[2].Recipient
              }
          },
          recipients: [
            {
                address: {
                    streetLines: [
                        "961 Cayots Canyon Rd"
                    ],
                    city: "Chesapeake City",
                    stateOrProvinceCode: "MD",
                    postalCode: "21915",
                    countryCode: "US",
                    },
                    contact: {
                    emailAddress: "distribution@selectbreeders.com",
                    phoneNumber: "4108853877",
                    companyName: "Select Breeders Services"
                    },
            }
          ],
          pickupType: "USE_SCHEDULED_PICKUP",
          serviceType: args[1].Service_Type,
          packagingType: "YOUR_PACKAGING",
          totalWeight: 20,
          shippingChargesPayment: {
            paymentType: "SENDER",
          },
          shipmentSpecialServices: {
            specialServiceTypes: [
              "RETURN_SHIPMENT"
            ],
            returnShipmentDetail: {
              returnAssociationDetail: {
                shipDatestamp: args[1].Shipping_Date.format("YYYY-MM-DD"),
              },
              returnType: "PRINT_RETURN_LABEL"
            },
          },
          labelSpecification: {
            labelFormatType: "COMMON2D",
            labelOrder: "SHIPPING_LABEL_FIRST",
            labelStockType: "STOCK_4X675_LEADING_DOC_TAB",
            imageType: "ZPLII",
            labelPrintingOrientation: "BOTTOM_EDGE_OF_TEXT_FIRST",
          },
          requestedPackageLineItems: [
            {
              customerReferences: [
                {
                  customerReferenceType: "CUSTOMER_REFERENCE",
                  value: "RET/640/"+ args[1].Shipment_Number + "/" + args[1].Stallion
                }
              ],
              weight: {
                units: "LB",
                value: 20
              },
            }
          ]
        },
        labelResponseOptions: "LABEL",
        accountNumber: {
          value: process.env("SHIPPING_ACCOUNT")
        },
        shipAction: "CONFIRM",
      }
    const outboundLabel = await axios.post(shippingUrl,fedexOutBody,{headers: {'content-type': 'application/json'}})
    const returnLabel = await axios.post(shippingUrl,fedexRetBody,{headers: {'content-type': 'application/json'}})
        .catch(err => {
            console.log(err)
        })
    console.log({outboundLabel, returnLabel})
    return {outboundLabel, returnLabel}
})