import './App.css';
import { useState } from 'react';
import { TextField, Select, MenuItem, Checkbox, FormControlLabel, Button, Box, InputLabel, FormControl} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { PDFDocument } from 'pdf-lib';
import requestPDF from './Assets/Frozen_Shipment_Request_Form_2023.pdf';
import CompAttnPdf from './Assets/Company_And_Recipient_Label.pdf';
import CompPdf from './Assets/Company_Or_Recipient_Label.pdf';


//ipc renderer allows to send requests to electron main file
const ipcRenderer = window.require("electron").ipcRenderer;

//initial for form inputs minus shipping address
const initialFormState = {
  Shipment_Number: "",
  Mare_Owner: "",
  Mare_Phone: "",
  Mare_Email: "",
  Mare_Name: "",
  Birth_Year: "",
  Breed: "",
  Registration: "",
  Current_Status: "",
  Stallion:"",
  Stallion_Owner:"",
  Doses:"",
  Shipping_Date: null,
  Card_Type: "",
  Card_Name: "",
  Card_Number: "",
  Security_Code: "",
  Expiration_Date: "",
  Billing_Address_1: "",
  Billing_Address_2: "",
  Billing_Address_3: "",
  Service_Type: "",
  Recipient_Email:"",
  Recipient_Phone:""
}

//initial state for shipping address
const addressInitialState = {
  Recipient:"",
  Attn: "",
  Recipient_Address: "",
  Street_Address: "",
  City: "",
  State: "",
  Zip_Code: "",
}

//initial state for forms the user wants to create
const ToCreateInitialState = {
  Shipment_Request: true,
  PTouch_Label: true,
  Shipping_Label: true,
  Excel:true, 
}


function App() {
  const [formState, setFormState] = useState(initialFormState);
  const [addressState, setAddress] = useState(addressInitialState);
  const [toCreateState, setToCreateState] = useState(ToCreateInitialState);
  let bearer = null;
  let authTime = null;

  //variable to hold shipment number
  let shipmentNumber = null;

  //form variables that will be served
  let requestPDFBytes = null;
  let pTouchPDFBytes = null;
  let fedExPDFBytes = null;

  //handles changes made to normal form inputs
  const handleFormChange = (event) => {
    console.log(event)
    if(event.$L) {
      let updatedForm = {...formState};
      updatedForm.Shipping_Date = event;
      setFormState({...updatedForm})
    } else {
      let updatedForm = {...formState};
      updatedForm[event.target.id] = event.target.value;
      setFormState({...updatedForm});
    }
  };

  //handles changes made to address form inputs
  const handleAddressChange = (event) => {
    let updatedAddress = {...addressState};
    updatedAddress[event.target.id] = event.target.value;
    setAddress({...updatedAddress});
  }

  //handles changes made to choices of files to create
  const handleCreateChange = (event) => {
    let update = {...toCreateState};
    update[event.target.id] = !toCreateState[event.target.id];
    setToCreateState({...update});
  }


  //handles submission events. pdf form filling, and shipment label request
  const onSubmit = async (event) => {
    console.log("submitting")
     //if request chosen, fill request pdf
     if(toCreateState.Shipment_Request) {
        //selects request file and converts to array buffer for pdf-lib
        const arrayBuffer = await fetch(requestPDF).then(res => res.arrayBuffer())
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const form = pdfDoc.getForm();
        //sets text field to be value of form inputs
        Object.keys(formState).forEach(input => {
          if (input === "Service_Type"){
            const checkbox = form.getCheckBox(formState[input])
            checkbox.check()
          } else if (input === "Card_Type") {
            if(formState[input]){
              const checkbox = form.getCheckBox(formState[input])
              checkbox.check()
            }
            
          } else{
          const field = form.getTextField(input);
          if(input === "Shipping_Date") {
            field.setText(formState[input].format('MM/DD/YYYY'))
          } else {
           field.setText(formState[input]) 
          }
        }
          
        })

        //grab address fields in pdf
        const recipient = form.getTextField('Recipient');
        const address1 = form.getTextField('Recipient_Address_1');
        const address2 = form.getTextField('Recipient_Address_2');
        
        //formats address inputs and adds to form
        if(addressState.Attn){
          recipient.setText(addressState.Recipient + " Attn: " + addressState.Attn);
          address1.setText(addressState.Street_Address);
          address2.setText(addressState.City + ", " + addressState.State + " " + addressState.Zip_Code);
        } else {
          recipient.setText(addressState.Recipient);
          address1.setText(addressState.Street_Address);
          address2.setText(addressState.City + ", " + addressState.State + " " + addressState.Zip_Code);
        }

        requestPDFBytes = await pdfDoc.save()
     } 
     //if ptouch chosen, check if there is attn. and fill pdf
     if(toCreateState.PTouch_Label){
      if(addressState.Attn){
        const arrayBuffer = await fetch(CompAttnPdf).then(res => res.arrayBuffer());
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const form = pdfDoc.getForm();
        
        //select all fields
        const companyName = form.getTextField("Company_Name");
        const recipientName = form.getTextField("Recipient_Name");
        const addressLine1 = form.getTextField("Address_Line_1");
        const addressLine2 = form.getTextField("Address_Line_2");
        const phoneNumber = form.getTextField("Phone_Number");

        //fill all fields
        companyName.setText(addressState.Recipient);
        recipientName.setText(addressState.Attn);
        addressLine1.setText(addressState.Street_Address);
        addressLine2.setText(addressState.City + ", " + addressState.State + " " + addressState.Zip_Code);
        phoneNumber.setText(addressState.Recipient_Phone);

        pTouchPDFBytes = await pdfDoc.save()

      } else {
        const arrayBuffer = await fetch(CompPdf).then(res => res.arrayBuffer())
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const form = pdfDoc.getForm()
        const fields = form.getFields()
        fields.forEach(field => {
          const name = field.getName()
          console.log('Field name:', name)
        })
        
        //select all fields
        const recipientName = form.getTextField("Recipient_Name");
        const addressLine1 = form.getTextField("Address_Line_1");
        const addressLine2 = form.getTextField("Address_Line_2");
        const phoneNumber = form.getTextField("Phone_Number");

        //fill all fields
        recipientName.setText(addressState.Recipient);
        addressLine1.setText(addressState.Street_Address);
        addressLine2.setText(addressState.City + ", " + addressState.State + " " + addressState.Zip_Code);
        phoneNumber.setText(addressState.Recipient_Phone);
      
      }
     }
     if(toCreateState.Shipping_Label){

        const now = Date.now()
        if(!bearer || (now-authTime)/1000 > 3599){
          console.log(now,authTime)
          console.log(now-authTime)
          const authInfo = await ipcRenderer.invoke('get-fedex-auth')
          authTime = Date.now()
          bearer = authInfo.bearer;
        }
        const labels = await ipcRenderer.invoke('get-fedex-labels', bearer, formState, addressState)
        console.log(labels)
        
        


      //if shipping label chosen, send request and store response
     }
     
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Shipment Assistant</h1>
      </header>
      <Box
        component="form"
        sx={{
          '& .MuiTextField-root': { m: 1, width: '25ch' },
        }}
        noValidate
        autoComplete="off"
      >
        <div>
          <FormControlLabel
            label="Shipment Request"
            control={<Checkbox
              id='Shipment_Request'
              checked={toCreateState.Shipment_Request}
              onChange={handleCreateChange}
              />}
          />
          <FormControlLabel
            label="PTouch Label"
            control={<Checkbox
              id='PTouch_Label'
              checked={toCreateState.PTouch_Label}
              onChange={handleCreateChange}
              />}
          />
          <FormControlLabel
            label="Shipping Label"
            control={<Checkbox
              id='Shipping_Label'
              checked={toCreateState.Shipping_Label}
              onChange={handleCreateChange}
              />}
          />
        </div>
        <div id="form">
          <div className='mare-owner'>
            <h3>Mare Owner Information</h3>
              <div className='info'>
                <TextField
                  id="Mare_Owner"
                  label="Mare Owner Name"
                  value={formState.Mare_Owner}
                  onInput={handleFormChange}
                />
                <TextField
                  id="Mare_Phone"
                  label="Mare Owner Phone"
                  value={formState.Mare_Phone}
                  onInput={handleFormChange}
                />
                <TextField
                  id="Mare_Email"
                  label="Mare Owner Email"
                  value={formState.Mare_Email}
                  onInput={handleFormChange}
                />
              </div>
          </div>
          <div className='mare'>
            <h3>Mare Information</h3>
              <div className='info'>
                <TextField
                  id="Mare_Name"
                  label="Name"
                  value={formState.Mare_Name}
                  onInput={handleFormChange}
                />
                <TextField
                  id="Birth_Year"
                  label="Birth Year"
                  value={formState.Birth_Year}
                  onInput={handleFormChange}
                />
                <TextField
                  id="Breed"
                  label="Breed"
                  value={formState.Breed}
                  onInput={handleFormChange}
                />
                <TextField
                  id="Registration"
                  label="Registration #"
                  value={formState.Registration}
                  onInput={handleFormChange}
                />
                <FormControl sx={{ m: 1, minWidth: 120 }}>
                <InputLabel id="Current_Status_label">Current Status</InputLabel>
                <Select
                  id="Current_Status"
                  value={formState.Current_Status}
                  labelId="Current_Status_label"
                  label="Current Status"
                  onChange={(e) => {
                    handleFormChange({target:{value:e.target.value,id:"Current_Status"}})
                  }}
                >
                  <MenuItem value={'Maiden'}>Maiden</MenuItem>
                  <MenuItem value={'Foaled'}>Foaled</MenuItem>
                  <MenuItem value={'Barren'}>Barren</MenuItem>
                  <MenuItem value={'Not Bred'}>Not Bred</MenuItem>
                </Select>
                </FormControl>
              </div>
          </div>
          <div className='stallion'>
            <h3>Stallion Information</h3>
              <div className='info'>
                <TextField
                  id="Stallion"
                  label="Stallion"
                  value={formState.Stallion}
                  onInput={handleFormChange}
                />
                <TextField
                  id="Stallion_Owner"
                  label="Stallion Owner"
                  value={formState.Stallion_Owner}
                  onInput={handleFormChange}
                />
                <TextField
                  id="Doses"
                  label="Doses"
                  value={formState.Doses}
                  onInput={handleFormChange}
                />
              </div>
          </div>
          <div className='recipient'>
            <h3>Recipient Information</h3>
              <div className='info'>
                <TextField
                  id="Recipient"
                  label="Recipient/Company"
                  value={formState.Recipient}
                  onInput={handleAddressChange}
                />
                <TextField
                  id="Attn"
                  label="Attention"
                  value={formState.Attn}
                  onInput={handleAddressChange}
                />
                <br/>
                <TextField
                  id="Recipient_Address"
                  label="Recipient Address"
                  value={formState.Recipient_Address}
                  onInput={handleAddressChange}
                />
                <br/>
                <TextField
                  id="Street_Address"
                  label="Street Address"
                  value={formState.Street_Address}
                  onInput={handleAddressChange}
                />
                <TextField
                  id="City"
                  label="City"
                  value={formState.City}
                  onInput={handleAddressChange}
                />
                <TextField
                  id="State"
                  label="State"
                  value={formState.State}
                  onInput={handleAddressChange}
                />
                <TextField
                  id="Zip_Code"
                  label="Zip Code"
                  value={formState.Zip_Code}
                  onInput={handleAddressChange}
                />
                <TextField
                  id="Recipient_Phone"
                  label="Recipient Phone"
                  value={formState.Recipient_Phone}
                  onInput={handleFormChange}
                />
                <TextField
                  id="Recipient_Email"
                  label="Recipient Email"
                  value={formState.Recipient_Email}
                  onInput={handleFormChange}
                />
                
                <br/>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Shipping Date"
                    value={formState.Shipping_Date}
                    onChange={handleFormChange}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </LocalizationProvider>
                <FormControl sx={{ m: 1, minWidth: 120 }}>
                <InputLabel id="Service_Type_label">Service Type</InputLabel>
                <Select
                  id="Service_Type"
                  value={formState.Service_Type}
                  labelId="Service_Type_label"
                  label="Service Type"
                  onChange={(e) => {
                    handleFormChange({target:{value:e.target.value,id:"Service_Type"}})
                  }}
                >
                  <MenuItem value={'FEDEX_2_DAY'}>2 Day</MenuItem>
                  <MenuItem value={'PRIORITY_OVERNIGHT'}>Priority Overnight</MenuItem>
                </Select>
                </FormControl>
                <TextField
                  id="Shipment_Number"
                  label="Shipment Number"
                  value={formState.Shipment_Number}
                  onInput={handleFormChange}
                />
              </div>
          </div>
          <div className='cc'>
            <h3>Payment Information</h3>
              <div className='info'>
              <FormControl sx={{ m: 1, minWidth: 120 }}>
                <InputLabel id="Card_Type_label">Card Type</InputLabel>
                <Select
                  id="Card_Type"
                  value={formState.Card_Type}
                  labelId="Card_Type_label"
                  label="Card Type"
                  onChange={(e) => {
                    handleFormChange({target:{value:e.target.value,id:"Card_Type"}})
                  }}
                >
                  <MenuItem value={'Visa'}>Visa</MenuItem>
                  <MenuItem value={'MC'}>MasterCard</MenuItem>
                </Select>
                </FormControl>
                <br/>
                <TextField
                  id="Card_Name"
                  label="Card Name"
                  value={formState.Card_Name}
                  onInput={handleFormChange}  
                />
                <TextField
                  id="Card_Number"
                  label="Card Number"
                  value={formState.Card_Number}
                  onInput={handleFormChange}
                />
                <TextField
                  id="Security_Code"
                  label="Security Code"
                  value={formState.Security_Code}
                  onInput={handleFormChange}
                />
                <TextField
                  id="Expiration_Date"
                  label="Expiration Date"
                  value={formState.Expiration_Date}
                  onInput={handleFormChange}
                />
                <br/>
                <TextField
                  id="Billing_Address_1"
                  label="Billing Address 1"
                  value={formState.Billing_Address_1}
                  onInput={handleFormChange}
                />
                <TextField
                  id="Billing_Address_2"
                  label="Billing Address 2"
                  value={formState.Billing_Address_2}
                  onInput={handleFormChange}
                />
                <TextField
                  id="Billing_Address_3"
                  label="Billing Address 3"
                  value={formState.Billing_Address_3}
                  onInput={handleFormChange}
                />
              </div>
          </div>
          <Button variant="contained" onClick={onSubmit}>Submit</Button>
        </div>
      </Box>
    </div>
  );
}

export default App;