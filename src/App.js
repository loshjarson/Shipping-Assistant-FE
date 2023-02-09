import './App.css';
import { useState } from 'react';
import { TextField, Select, MenuItem, Checkbox, FormControlLabel, Button} from '@mui/material';



const initialFormState = {
  Mare_Owner: "",
  Mare_Phone: "",
  Mare_Email: "",
  Mare_Name: "",
  Birth_Year: "",
  Breed: "",
  Registration: "",
  Status: "",
  Stallion:"",
  Stallion_Owner:"",
  Recipient:"",
  Attn: "",
  Recipient_Address: "",
  Street_Address: "",
  City: "",
  State: "",
  Zip_Code: "",
  Type: "",
  Card_Name: "",
  Card_Number: "",
  Security_Code: "",
  Expiration_Date: "",
  Billing_Address_1: "",
  Billing_Address_2: "",
  Billing_Address_3: "",
}

const formsToCreate = {
  Shipment_Request: true,
  PTouch_Label: true,
  Shipping_Label: true,
}


function App() {
  const [form, setForm] = useState(initialFormState);
  const [toCreate, setToCreate] = useState(formsToCreate);

  //handles changes made to normal form inputs
  const handleFormChange = (event) => {
    let updatedForm = form;
    updatedForm[event.target.id] = event.target.value
    setForm(updatedForm);
  };

  //handles changes made to choices of files to create
  const handleCreateChange = (event) => {
    let update = toCreate;
    update[event.target.id] = event.target.value;
    setToCreate(update);
  }

  //handles submission events. pdf form filling, and shipment label request
  const onSubmit = (event) => {
     //if request chosen, fill pdf
     //if ptouch chosen, check if there is attn. and fill pdf
     //if shipping label chosen, send request and store response
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Shipment Assistant</h1>
      </header>
      <div>
        <FormControlLabel
          label="Shipment Request"
          control={<Checkbox
            id='Shipment_Request'
            checked={toCreate.ShipmentRequest}
            onChange={handleCreateChange}
            />}
        />
        <FormControlLabel
          label="PTouch Label"
          control={<Checkbox
            id='PTouch_Label'
            checked={toCreate.PTouch_Label}
            onChange={handleCreateChange}
            />}
        />
        <FormControlLabel
          label="Shipping Label"
          control={<Checkbox
            id='Shipping_Label'
            checked={toCreate.Shipping_Label}
            onChange={handleCreateChange}
            />}
        />
      </div>
      <div id="form">
        <div className='mare-owner'>
          <h3>Mare Owner Information</h3>
            <div className='info'>
              <TextField
                required
                id="Mare_Owner"
                label="Mare Owner Name"
                value={form.Mare_Owner}
                onChange={handleFormChange}
              />
              <TextField
                required
                id="Mare_Phone"
                label="Mare Owner Phone"
                value={form.Mare_Phone}
                onChange={handleFormChange}
              />
              <TextField
                required
                id="Mare_Email"
                label="Mare Owner Email"
                value={form.Mare_Email}
                onChange={handleFormChange}
              />
            </div>
        </div>
        <div className='mare'>
          <h3>Mare Information</h3>
            <div className='info'>
              <TextField
                required
                id="Mare_Name"
                label="Name"
                value={form.Mare_Name}
                onChange={handleFormChange}
              />
              <TextField
                required
                id="Birth_Year"
                label="Birth Year"
                value={form.Birth_Year}
                onChange={handleFormChange}
              />
              <TextField
                required
                id="Breed"
                label="Breed"
                value={form.Breed}
                onChange={handleFormChange}
              />
              <TextField
                required
                id="Registration"
                label="Registration #"
                value={form.Registration}
                onChange={handleFormChange}
              />
              <Select
                id="Status"
                value={form.Status}
                label="Status"
                onChange={handleFormChange}
              >
                <MenuItem value={'Maiden'}>Maiden</MenuItem>
                <MenuItem value={'Foaled'}>Foaled</MenuItem>
                <MenuItem value={'Barren'}>Barren</MenuItem>
                <MenuItem value={'Not Bred'}>Not Bred</MenuItem>
              </Select>
            </div>
        </div>
        <div className='stallion'>
          <h3>Stallion Information</h3>
            <div className='info'>
              <TextField
                required
                id="Stallion"
                label="Stallion"
                value={form.Stallion}
                onChange={handleFormChange}
              />
              <TextField
                required
                id="Stallion_Owner"
                label="Stallion Owner"
                value={form.Stallion_Owner}
                onChange={handleFormChange}
              />
            </div>
        </div>
        <div className='recipient'>
          <h3>Recipient Information</h3>
            <div className='info'>
              <TextField
                required
                id="Recipient"
                label="Recipient"
                value={form.Recipient}
                onChange={handleFormChange}
              />
              <TextField
                required
                id="Attn"
                label="Attention"
                value={form.Attn}
                onChange={handleFormChange}
              />
              <TextField
                required
                id="Recipient_Address"
                label="Recipient Address"
                value={form.Recipient_Address}
                onChange={handleFormChange}
              />
              <TextField
                required
                id="Street_Address"
                label="Street Address"
                value={form.Street_Address}
                onChange={handleFormChange}
              />
              <TextField
                required
                id="City"
                label="City"
                value={form.City}
                onChange={handleFormChange}
              />
              <TextField
                required
                id="State"
                label="State"
                value={form.State}
                onChange={handleFormChange}
              />
              <TextField
                required
                id="Zip_Code"
                label="Zip Code"
                value={form.Zip_Code}
                onChange={handleFormChange}
              />
            </div>
        </div>
        <div className='cc'>
          <h3>Payment Information</h3>
            <div className='info'>
              <Select
                id="Status"
                value={form.Status}
                label="Status"
                onChange={handleFormChange}
              >
                <MenuItem value={'Visa'}>Visa</MenuItem>
                <MenuItem value={'MC'}>MasterCard</MenuItem>
              </Select>
              <TextField
                required
                id="Card_Name"
                label="Recipient"
                value={form.Card_Name}
                onChange={handleFormChange}  
              />
              <TextField
                required
                id="Card_Number"
                label="Attention"
                value={form.Card_Number}
                onChange={handleFormChange}
              />
              <TextField
                required
                id="Security_Code"
                label="Recipient Address"
                value={form.Security_Code}
                onChange={handleFormChange}
              />
              <TextField
                required
                id="Expiration_Date"
                label="Street Address"
                value={form.Expiration_Date}
                onChange={handleFormChange}
              />
              <TextField
                required
                id="Billing_Address_1"
                label="Billing Address 1"
                value={form.Billing_Address_1}
                onChange={handleFormChange}
              />
              <TextField
                required
                id="Billing_Address_2"
                label="Billing Address 2"
                value={form.Billing_Address_2}
                onChange={handleFormChange}
              />
              <TextField
                required
                id="Billing_Address_3"
                label="Billing Address 3"
                value={form.Billing_Address_3}
                onChange={handleFormChange}
              />
            </div>
        </div>
        <Button variant="contained" onClick={onSubmit}>Submit</Button>
      </div>
    </div>
  );
}

export default App;