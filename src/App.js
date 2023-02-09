import './App.css';
import { useState } from 'react';
import { TextField } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

const initialState = {
  Mare_Owner: "",
  Mare_Phone: "",
  Mare_Email: "",
  Mare_Name: "",
  Birth_Year: "",
  Breed: "",
  Registration: "",
  Status: "",
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
                defaultValue={''}
              />
              <TextField
                required
                id="Mare_Phone"
                label="Mare Owner Phone"
                defaultValue={''}
              />
              <TextField
                required
                id="Mare_Email"
                label="Mare Owner Email"
                defaultValue={''}
              />
            </div>
        </div>
        <div className='mare-owner'>
          <h3>Mare Owner Information</h3>
            <div className='info'>
              <TextField
                required
                id="Mare_Name"
                label="Name"
                defaultValue={''}
              />
              <TextField
                required
                id="Birth_Year"
                label="Birth Year"
                defaultValue={''}
              />
              <TextField
                required
                id="Breed"
                label="Breed"
                defaultValue={''}
              />
              <TextField
                required
                id="Registration"
                label="Registration #"
                defaultValue={''}
              />
              <InputLabel id="status-label">Status</InputLabel>
              <Select
                labelId="status-label"
                id="Status"
                value={""}
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
      </form>
    </div>
  );
}

export default App;