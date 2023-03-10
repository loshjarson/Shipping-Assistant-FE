const { BrowserWindow, app, ipcMain } = require("electron");
const axios = require("axios");
const moment = require("moment");
require('dotenv').config({path: __dirname + '/.env'})
const path = require("path")
const isDev = require('electron-is-dev')
const asyncRequest = require("request-promise")


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
        icon:"./sbs logo.ico"
    })
    win.loadURL( isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`)
    
}

app.on('ready', function () {
  createWindow()
})

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
    return {bearer:userInfo.data.access_token}
})

ipcMain.handle('validate-address', async(event, ...args) => {
  const validateUrl = 'https://developer.fedex.com/api/en-us/catalog/address-validation/v1/address/v1/addresses/resolve'
  const toValidate = {
    'addressesToValidate':[
      {
        'address':{
          'streetLines':[
            args[1].Street_Address
          ],
          'city': args[1].City.toUpperCase(),
          'stateOrProvinceCode': args[1].State.toUpperCase(),
          'postalCode': args[1].Zip_Code,
          'countryCode': 'US'
        }
      }
    ]
  }
  const validationRes = await axios.post(validateUrl, toValidate, {headers: {'authorization': `bearer ${args[0]}`}}).catch(err => console.log(err))
  const error = validationRes.data.output.alerts[0]
  const resolvedAddress = validationRes.data.output.resolvedAddresses[0]
  const newAddress = {
    Street_Address: resolvedAddress.streetLinesToken[0],
    City: resolvedAddress.city,
    State: resolvedAddress.State,
    Zip_Code: resolvedAddress.parsedPostalCode.addOn ? resolvedAddress.parsedPostalCode.base + "-" + resolvedAddress.parsedPostalCode.addOn : resolvedAddress.parsedPostalCode.base,
  }
  return newAddress
})

ipcMain.handle('get-fedex-labels', async (event, ...args) => {
    let addressError = null;
    const shippingUrl = 'https://apis-sandbox.fedex.com/ship/v1/shipments';
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
                  'value': args[1].Out_Cust_Ref
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
                  'value': args[1].Ret_Cust_Ref
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
        addressError = err.response.data.errors[0].message
      })
    const returnLabelRes = await axios.post(shippingUrl,fedexRetBody,{headers: {'authorization':'bearer ' + args[0]}})
      .catch(err => {
        addressError = err.response.data.errors[0].message
      })
    if(addressError){
      return [{error:addressError}]
    }
    const codedOutLabel = Buffer.from(outboundLabelRes.data.output.transactionShipments[0].pieceResponses[0].packageDocuments[0].encodedLabel, "base64");
    const codedReturnLabel = Buffer.from(returnLabelRes.data.output.transactionShipments[0].pieceResponses[0].packageDocuments[0].encodedLabel, "base64");
    const decodedOutLabel = codedOutLabel.toString("utf8");
    const decodedReturnLabel = codedReturnLabel.toString("utf8");

    var outOptions = {
      encoding: null,
      formData: { file: decodedOutLabel },
      // omit this line to get PNG images back
      headers: { 'Accept': 'application/pdf' },
      // adjust print density (8dpmm), label width (4 inches), label height (6 inches), and label index (0) as necessary
      url: 'http://api.labelary.com/v1/printers/8dpmm/labels/4x6.75/0/'
    };
    let labels = []
    await asyncRequest.post(outOptions, function(err, resp, body) {
        if (err) {
            console.log(err);
        }
        else {
          labels.push(body)
        }
        
    });

    var retOptions = {
      encoding: null,
      formData: { file: decodedReturnLabel },
      // omit this line to get PNG images back
      headers: { 'Accept': 'application/pdf' },
      // adjust print density (8dpmm), label width (4 inches), label height (6 inches), and label index (0) as necessary
      url: 'http://api.labelary.com/v1/printers/8dpmm/labels/4x6.75/0/'
    };
    
    await asyncRequest.post(retOptions, function(err, resp, body) {
        if (err) {
            console.log(err);
        }
        else {
          labels.push(body)
        }
        
    });
    return labels
})

ipcMain.handle("print-preview", async (event, url)=> {
  const printPreview = new BrowserWindow({
    width: 900,
    height: 650,
  })
  printPreview.loadURL(url)
})