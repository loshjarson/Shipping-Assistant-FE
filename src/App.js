import './App.css';
import { useState } from 'react';
import { TextField, Select, MenuItem} from '@mui/material';



const initialState = {
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

function App() {
  const [form, setForm] = useState(initialState);

  const handleChange = (event) => {
    let updatedForm = form;
    updatedForm[event.target.id] = event.target.value
    setForm(updatedForm);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Shipment Assistant</h1>
      </header>
      <form>
        <div className='mare-owner'>
          <h3>Mare Owner Information</h3>
            <div className='info'>
              <TextField
                required
                id="Mare_Owner"
                label="Mare Owner Name"
                value={form.Mare_Owner}
                onChange={handleChange}
              />
              <TextField
                required
                id="Mare_Phone"
                label="Mare Owner Phone"
                value={form.Mare_Phone}
                onChange={handleChange}
              />
              <TextField
                required
                id="Mare_Email"
                label="Mare Owner Email"
                value={form.Mare_Email}
                onChange={handleChange}
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
                onChange={handleChange}
              />
              <TextField
                required
                id="Birth_Year"
                label="Birth Year"
                value={form.Birth_Year}
                onChange={handleChange}
              />
              <TextField
                required
                id="Breed"
                label="Breed"
                value={form.Breed}
                onChange={handleChange}
              />
              <TextField
                required
                id="Registration"
                label="Registration #"
                value={form.Registration}
                onChange={handleChange}
              />
              <Select
                id="Status"
                value={form.Status}
                label="Status"
                onChange={handleChange}
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
                onChange={handleChange}
              />
              <TextField
                required
                id="Stallion_Owner"
                label="Stallion Owner"
                value={form.Stallion_Owner}
                onChange={handleChange}
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
                onChange={handleChange}
              />
              <TextField
                required
                id="Attn"
                label="Attention"
                value={form.Attn}
                onChange={handleChange}
              />
              <TextField
                required
                id="Recipient_Address"
                label="Recipient Address"
                value={form.Recipient_Address}
                onChange={handleChange}
              />
              <TextField
                required
                id="Street_Address"
                label="Street Address"
                value={form.Street_Address}
                onChange={handleChange}
              />
              <TextField
                required
                id="City"
                label="City"
                value={form.City}
                onChange={handleChange}
              />
              <TextField
                required
                id="State"
                label="State"
                value={form.State}
                onChange={handleChange}
              />
              <TextField
                required
                id="Zip_Code"
                label="Zip Code"
                value={form.Zip_Code}
                onChange={handleChange}
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
                onChange={handleChange}
              >
                <MenuItem value={'Visa'}>Visa</MenuItem>
                <MenuItem value={'MC'}>MasterCard</MenuItem>
              </Select>
              <TextField
                required
                id="Card_Name"
                label="Recipient"
                value={form.Card_Name}
                onChange={handleChange}  
              />
              <TextField
                required
                id="Card_Number"
                label="Attention"
                value={form.Card_Number}
                onChange={handleChange}
              />
              <TextField
                required
                id="Security_Code"
                label="Recipient Address"
                value={form.Security_Code}
                onChange={handleChange}
              />
              <TextField
                required
                id="Expiration_Date"
                label="Street Address"
                value={form.Expiration_Date}
                onChange={handleChange}
              />
              <TextField
                required
                id="Billing_Address_1"
                label="Billing Address 1"
                value={form.Billing_Address_1}
                onChange={handleChange}
              />
              <TextField
                required
                id="Billing_Address_2"
                label="Billing Address 2"
                value={form.Billing_Address_2}
                onChange={handleChange}
              />
              <TextField
                required
                id="Billing_Address_3"
                label="Billing Address 3"
                value={form.Billing_Address_3}
                onChange={handleChange}
              />
            </div>
        </div>
      </form>
    </div>
  );
}

export default App;