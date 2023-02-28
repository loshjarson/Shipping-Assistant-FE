const { BrowserWindow, app, ipcMain, session } = require("electron");
const axios = require("axios");
const moment = require("moment");
require('dotenv').config();
const fs = require('fs')
const request = require("request")


require('@electron/remote/main').initialize()

function createWindow() {
    //create browser window
    const win = new BrowserWindow({
        width: 900,
        height: 650,
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
    let addressError = null;
    const shippingUrl = 'https://apis-sandbox.fedex.com/ship/v1/shipments';
    console.log(args)
    const fedexOutBody = {
        'mergeLabelDocOption': "LABELS_ONLY",
        'requestedShipment': {
          'shipDatestamp': moment(args[1].Shipping_Date).format("YYYY-MM-DD"),
          'totalDeclaredValue': {
            'amount': 400,
            'currency': "USD"
          },
          'shipper': {
            'address': {
              'streetLines': [
                "961 Cayots Canyon Rd"
              ],
              'city': "Chesapeake City",
              'stateOrProvinceCode': "MD",
              'postalCode': "21915",
              'countryCode': "US",
            },
            'contact': {
              'emailAddress': "distribution@selectbreeders.com",
              'phoneNumber': "4108853877",
              'companyName': "Select Breeders Services"
            },
          },
          'recipients': [
            {
              'address': {
                'streetLines': [
                  args[2].Street_Address
                ],
                'city': args[2].City,
                'stateOrProvinceCode': args[2].State,
                'postalCode': args[2].Zip_Code,
                'countryCode': "US",
              },
              'contact': {
                'personName': args[2].Attn,
                'emailAddress': args[1].Recipient_Email,
                'phoneNumber': args[1].Recipient_Phone,
                'companyName': args[2].Recipient
              }
            }
          ],
          'pickupType': "USE_SCHEDULED_PICKUP",
          'serviceType': args[1].Service_Type,
          'packagingType': "YOUR_PACKAGING",
          'totalWeight': 20,
          'shippingChargesPayment': {
            'paymentType': "SENDER",
          },
          'labelSpecification': {
            'labelFormatType': "COMMON2D",
            'labelOrder': "SHIPPING_LABEL_FIRST",
            "customerSpecifiedDetail": {
              "docTabContent": {
                "docTabContentType": "STANDARD"
              }
            },
            'labelStockType': "STOCK_4X675_TRAILING_DOC_TAB",
            'imageType': "ZPLII",
            'labelPrintingOrientation': "BOTTOM_EDGE_OF_TEXT_FIRST",
          },
          'requestedPackageLineItems': [
            {
              'customerReferences': [
                {
                  'customerReferenceType': "CUSTOMER_REFERENCE",
                  'value': "640/"+ args[1].Shipment_Number + "/" + args[1].Stallion
                }
              ],
              'declaredValue': {
                'amount': 400,
                'currency': "USD"
              },
              'weight': {
                'units': "LB",
                'value': 20
              },
            }
          ]
        },
        'labelResponseOptions': "LABEL",
        'accountNumber': {
          'value': process.env.SHIPPING_ACCOUNT
        },
        'shipAction': "CONFIRM",
      }
    const fedexRetBody = {
        'mergeLabelDocOption': "LABELS_ONLY",
        'requestedShipment': {
          'shipDatestamp': moment(args[1].Shipping_Date).format("YYYY-MM-DD"),
          'totalDeclaredValue': {
            'amount': 0,
            'currency': "USD"
          },
          'shipper': {
            'address': {
                'streetLines': [
                  args[2].Street_Address
                ],
                'city': args[2].City,
                'stateOrProvinceCode': args[2].State,
                'postalCode': args[2].Zip_Code,
                'countryCode': "US",
              },
              'contact': {
                'personName': args[2].Attn,
                'emailAddress': args[1].Recipient_Email,
                'phoneNumber': args[1].Recipient_Phone,
                'companyName': args[2].Recipient
              }
          },
          'recipients': [
            {
                'address': {
                    'streetLines': [
                        "961 Cayots Canyon Rd"
                    ],
                    'city': "Chesapeake City",
                    'stateOrProvinceCode': "MD",
                    'postalCode': "21915",
                    'countryCode': "US",
                    },
                    'contact': {
                    'emailAddress': "distribution@selectbreeders.com",
                    'phoneNumber': "4108853877",
                    'companyName': "Select Breeders Services"
                    },
            }
          ],
          'pickupType': "USE_SCHEDULED_PICKUP",
          'serviceType': args[1].Service_Type,
          'packagingType': "YOUR_PACKAGING",
          'totalWeight': 20,
          'shippingChargesPayment': {
            'paymentType': "SENDER",
          },
          'shipmentSpecialServices': {
            'specialServiceTypes': [
              "RETURN_SHIPMENT"
            ],
            'returnShipmentDetail': {
              'returnAssociationDetail': {
                'shipDatestamp': moment(args[1].Shipping_Date).format("YYYY-MM-DD"),
              },
              'returnType': "PRINT_RETURN_LABEL"
            },
          },
          'labelSpecification': {
            'labelFormatType': "COMMON2D",
            'labelOrder': "SHIPPING_LABEL_FIRST",
            "customerSpecifiedDetail": {
              "docTabContent": {
                "docTabContentType": "STANDARD"
              }
            },
            'labelStockType': "STOCK_4X675_TRAILING_DOC_TAB",
            'imageType': "ZPLII",
            'labelPrintingOrientation': "BOTTOM_EDGE_OF_TEXT_FIRST",
          },
          'requestedPackageLineItems': [
            {
              'customerReferences': [
                {
                  'customerReferenceType': "CUSTOMER_REFERENCE",
                  'value': "RET/640/"+ args[1].Shipment_Number + "/" + args[1].Stallion
                }
              ],
              'weight': {
                'units': "LB",
                'value': 20
              },
            }
          ]
        },
        'labelResponseOptions': "LABEL",
        'accountNumber': {
          'value': process.env.SHIPPING_ACCOUNT
        },
        'shipAction': "CONFIRM",
      }
    const outboundLabelRes = await axios.post(shippingUrl,fedexOutBody,{headers: {'authorization':'bearer ' + args[0]}})
      .catch(err => {
        addressError = err.request.data.errors[0].message
      })
    const returnLabelRes = await axios.post(shippingUrl,fedexRetBody,{headers: {'authorization':'bearer ' + args[0]}})
      .catch(err => {
        addressError = err.request.data.errors[0].message
      })
    if(addressError){
      return {error:addressError}
    }
    const codedOutLabel = Buffer.from(outboundLabelRes.data.output.transactionShipments[0].pieceResponses[0].packageDocuments[0].encodedLabel, "base64");
    const codedReturnLabel = Buffer.from(returnLabelRes.data.output.transactionShipments[0].pieceResponses[0].packageDocuments[0].encodedLabel, "base64");
    const decodedOutLabel = codedOutLabel.toString("utf8");
    const decodedReturnLabel = codedReturnLabel.toString("utf8");
    const outLabelForm = new FormData()
    const retLabelForm = new FormData()
    outLabelForm.append("file",decodedOutLabel);
    retLabelForm.append("file",decodedReturnLabel);
    console.log(app.getAppPath("sessionData"))

    var outOptions = {
      encoding: null,
      formData: { file: decodedOutLabel },
      // omit this line to get PNG images back
      headers: { 'Accept': 'application/pdf' },
      // adjust print density (8dpmm), label width (4 inches), label height (6 inches), and label index (0) as necessary
      url: 'http://api.labelary.com/v1/printers/8dpmm/labels/4x6.75/0/'
    };
    
    request.post(outOptions, function(err, resp, body) {
        if (err) {
            return console.log(err);
        }
        fs.writeFile('./src/Assets/outLabel.pdf', body, function(err) {
            if (err) {
                console.log(err);
            }
        });
    });
    var retOptions = {
      encoding: null,
      formData: { file: decodedReturnLabel },
      // omit this line to get PNG images back
      headers: { 'Accept': 'application/pdf' },
      // adjust print density (8dpmm), label width (4 inches), label height (6 inches), and label index (0) as necessary
      url: 'http://api.labelary.com/v1/printers/8dpmm/labels/4x6.75/0/'
    };
    
    request.post(retOptions, function(err, resp, body) {
        if (err) {
            return console.log(err);
        }
        fs.writeFile('./public/Assets/retLabel.pdf', body, function(err) {
            if (err) {
                console.log(err);
            }
        });
    });
})

ipcMain.handle('save-pdf', async (event, ...args) => {
  fs.writeFile('./public/Assets/'+ args[0], args[1])
})