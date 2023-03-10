import './App.css';
import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import requestPDF from './Assets/Frozen_Shipment_Request_Form_2023.pdf';
import CompAttnPdf from './Assets/Company_And_Recipient_Label.pdf';
import { Input, Checkbox, Form, Col, Row, Select, Button, DatePicker, Alert } from 'antd'
import { useForm } from 'antd/es/form/Form';

//ipc renderer allows to send requests to electron main file
const ipcRenderer = window.require("electron").ipcRenderer;

//initial for form inputs minus shipping address
const initialFormState = {
  Shipment_Number: null,
  Mare_Owner: null,
  Mare_Phone: null,
  Mare_Email: null,
  Mare_Name: null,
  Birth_Year: null,
  Breed: null,
  Registration: null,
  Current_Status: null,
  Stallion:null,
  Stallion_Owner:null,
  Doses:null,
  Shipping_Date: null,
  Card_Type: null,
  Card_Name: null,
  Card_Number: null,
  Security_Code: null,
  Expiration_Date: null,
  Billing_Address_1: null,
  Billing_Address_2: null,
  Billing_Address_3: null,
  Service_Type: null,
  Recipient_Email:null,
  Recipient_Phone:null,
  Out_Cust_Ref:null,
  Ret_Cust_Ref:null,
}

//initial state for shipping address
const addressInitialState = {
  Recipient:null,
  Attn: null,
  Street_Address: null,
  City: null,
  State: null,
  Zip_Code: null,
}

//initial state for forms the user wants to create
const ToCreateInitialState = {
  Shipment_Request: true,
  PTouch_Label: true,
  Shipping_Label: true, 
}


function App() {
  const [formState, setFormState] = useState(initialFormState);
  const [addressState, setAddress] = useState(addressInitialState);
  const [toCreateState, setToCreateState] = useState(ToCreateInitialState);
  let bearer = null;
  let authTime = null;
  const [antForm] = useForm();
  const [labelError, setLabelError] = useState(null);

  const [requestPrint, setRequestPrint] = useState(null);
  const [pTouchPrint, setPTouchPrint] = useState(null);
  const [outPDFPrint, setOutPDFPrint] = useState(null);
  const [returnPDFPrint, setReturnPDFPrint] = useState(null);

  //handles changes made to normal form inputs
  const handleFormChange = (event) => {
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

  const resetForm = () => {
    setFormState({...initialFormState});
    setAddress({...addressInitialState});
    setToCreateState({...ToCreateInitialState});
    setRequestPrint(null);
    setPTouchPrint(null);
    setOutPDFPrint(null);
    setReturnPDFPrint(null);
    antForm.resetFields();
  }

  const validateAddress = async () => {
    const now = Date.now()
    if(!bearer || (now-authTime)/1000 > 3599){
      const authInfo = await ipcRenderer.invoke('get-fedex-auth')
      authTime = Date.now()
      bearer = authInfo.bearer;
    }
    const toValidate = {
      State: addressState.State,
      Street_Address: addressState.Street_Address,
      Zip_Code: addressState.Zip_Code,
      City: addressState.City
    }
    const res = await ipcRenderer.invoke("validate-address", bearer, toValidate)
    const validatedAddress = {
      Street_Address: res.output.resolvedAddresses[0].streetLinesToken[0],
      City: res.output.resolvedAddresses[0].city,
      State: res.output.resolvedAddresses[0].stateOrProvinceCode,
      Zip_Code: res.output.resolvedAddresses[0].parsedPostalCode.addOn ? res.output.resolvedAdresses[0].parsedPostalCode.base + "-" + res.output.resolvedAdresses[0].parsedPostalCode.addOn : res.output.resolvedAdresses[0].parsedPostalCode.base,
    }
    setAddress(...addressState, ...validatedAddress)
  }

  //handles submission events. pdf form filling, and shipment label request
  const onSubmit = async (event) => {
    setLabelError(null)
     //if request chosen, fill request pdf
     if(toCreateState.Shipment_Request) {
        //selects request file and converts to array buffer for pdf-lib
        const arrayBuffer = await fetch(requestPDF).then(res => res.arrayBuffer())
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const form = pdfDoc.getForm();
        //sets text field to be value of form inputs
        Object.keys(formState).forEach(input => {
          if (formState[input]){
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
              if(input === "Shipping_Date" && formState[input]) {
                field.setText(formState[input].format('MM/DD/YYYY'))
              } else {
              field.setText(formState[input]) 
              }
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
          address1.setText(addressState.Street_Address ? addressState.Street_Address : "");
          address2.setText( addressState.City && addressState.State && addressState.Zip_Code ? addressState.City + ", " + addressState.State + " " + addressState.Zip_Code : "");
        } else {
          recipient.setText(addressState.Recipient ? addressState.Recipient : "");
          address1.setText(addressState.Street_Address ? addressState.Street_Address : "");
          address2.setText( addressState.City && addressState.State && addressState.Zip_Code ? addressState.City + ", " + addressState.State + " " + addressState.Zip_Code : "");
        }

        const requestPDFBytes = await pdfDoc.saveAsBase64({ dataUri: true })
        setRequestPrint(requestPDFBytes)

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
        addressState.Recipient ? companyName.setText(addressState.Recipient) : console.log("");
        addressState.Attn ? recipientName.setText(addressState.Attn) : console.log("");
        addressState.Street_Address ? addressLine1.setText(addressState.Street_Address) : console.log("");
        addressState.City && addressState.State && addressState.Zip_Code ? addressLine2.setText(addressState.City + ", " + addressState.State + " " + addressState.Zip_Code) : console.log("");
        formState.Recipient_Phone ? phoneNumber.setText(formState.Recipient_Phone) : console.log("");

        const pTouchPDFBytes = await pdfDoc.saveAsBase64({ dataUri: true })
        setPTouchPrint(pTouchPDFBytes)
      } else {
        const arrayBuffer = await fetch(CompAttnPdf).then(res => res.arrayBuffer())
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const form = pdfDoc.getForm();
        
        //select all fields
        const recipientName = form.getTextField("Company_Name");
        const addressLine1 = form.getTextField("Recipient_Name");
        const addressLine2 = form.getTextField("Address_Line_1");
        const phoneNumber = form.getTextField("Address_Line_2");

        //fill all fields
        recipientName.setText(addressState.Recipient ? addressState.Recipient: "");
        addressLine1.setText(addressState.Street_Address ? addressState.Street_Address : "");
        addressLine2.setText((addressState.City&&addressState.State&&addressState.Zip_Code) ? addressState.City + ", " + addressState.State + " " + addressState.Zip_Code : "");
        phoneNumber.setText(formState.Recipient_Phone ? formState.Recipient_Phone : "");
        const pTouchPDFBytes = await pdfDoc.saveAsBase64({ dataUri: true })
        setPTouchPrint(pTouchPDFBytes)
      
      }
     }
     //if shipping label chosen, send request and store response
     if(toCreateState.Shipping_Label){
        //check if bearer token is current
        const now = Date.now()
        if(!bearer || (now-authTime)/1000 > 3599){
          const authInfo = await ipcRenderer.invoke('get-fedex-auth')
          authTime = Date.now()
          bearer = authInfo.bearer;
        }
        const labels = await ipcRenderer.invoke('get-fedex-labels', bearer, formState, addressState)
          if(labels[0].error) {
            setLabelError(labels[0].error)
          }

          const outLabel = labels[0]
          const retLabel = labels[1]
          const outpdfDoc = await PDFDocument.load(outLabel);
          const retpdfDoc = await PDFDocument.load(retLabel);
          const outPDFBytes = await outpdfDoc.saveAsBase64({ dataUri: true })
          const retPDFBytes = await retpdfDoc.saveAsBase64({ dataUri: true }) 
          setOutPDFPrint(outPDFBytes)
          setReturnPDFPrint(retPDFBytes)
     }
  }

  const printPreview = async (url) => {
    ipcRenderer.invoke("print-preview", url)
  }
  return (
    <div className="App">
      <header className="App-header">
        <h1>Shipment Assistant</h1>
      </header>
        <div>
            <Checkbox
              id='Shipment_Request'
              checked={toCreateState.Shipment_Request}
              onChange={handleCreateChange}
              >Shipment Request</Checkbox>
            <Checkbox
              id='PTouch_Label'
              checked={toCreateState.PTouch_Label}
              onChange={handleCreateChange}
              >PTouch Label</Checkbox>
            <Checkbox
              id='Shipping_Label'
              checked={toCreateState.Shipping_Label}
              onChange={handleCreateChange}
              >Shipping Labels</Checkbox>
        </div>
        <Form layout="vertical" style={{maxWidth:"50rem",margin:"auto"}} onFinish={onSubmit} form={antForm}>
          <div className='mare-owner'>
            <h3>Mare Owner Information</h3>
              <div className='info' id="mare-owner-info">
                <Row justify={'center'} gutter={[10]}>
                  <Col span={7}>
                    <Form.Item label="Mare Owner Name:">
                      <Input
                        id="Mare_Owner"
                        value={formState.Mare_Owner}
                        onInput={handleFormChange}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={7}>
                    <Form.Item label="Mare Owner Phone:">
                      <Input
                        id="Mare_Phone"
                        value={formState.Mare_Phone}
                        onInput={handleFormChange}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={7}>
                    <Form.Item label="Mare Owner Email:">
                      <Input
                        id="Mare_Email"
                        value={formState.Mare_Email}
                        onInput={handleFormChange}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </div>
          </div>
          <div className='mare'>
            <h3>Mare Information</h3>
              <div className='info' id="mare-info">
                <Row gutter={[10]}>
                  <Col span={8}>
                    <Form.Item label="Name:">
                      <Input
                        id="Mare_Name"
                        value={formState.Mare_Name}
                        onInput={handleFormChange}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="Birth Year:">
                      <Input
                        id="Birth_Year"
                        value={formState.Birth_Year}
                        onInput={handleFormChange}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="Breed:">
                      <Input
                        id="Breed"
                        value={formState.Breed}
                        onInput={handleFormChange}
                      />
                    </Form.Item>
                  </Col>
                  </Row>
                  <Row justify={"center"} gutter={[10]}>
                    <Col span={8}>
                      <Form.Item label="Registration #:">
                        <Input
                          id="Registration"
                          value={formState.Registration}
                          onInput={handleFormChange}
                        />
                      </Form.Item>
                    </Col>
                  <Col span={8}>
                    <Form.Item label="Current Status:">
                      <Select
                        value={formState.Current_Status}
                        id="Current_Status"
                        onChange={(v) => {
                            handleFormChange({target:{value:v,id:"Current_Status"}})
                          }}
                        options={[
                          {value: undefined, label: ''},
                          {value: 'Maiden', label: "Maiden"},
                          {value: 'Foaled', label: "Foaled"},
                          {value: 'Barren', label: "Barren"},
                          {value: 'Not Bred', label: "Not Bred"}
                        ]}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </div>
          </div>
          <div className='stallion'>
            <h3>Stallion Information</h3>
              <div className='info' id="stallion-info">
                <Row gutter={[10]}>
                  <Col span={8}>
                    <Form.Item label="Stallion:">
                      <Input
                        id="Stallion"
                        
                        value={formState.Stallion}
                        onInput={handleFormChange}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="Stallion Owner:">
                      <Input
                        id="Stallion_Owner"
                        
                        value={formState.Stallion_Owner}
                        onInput={handleFormChange}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="Doses:">
                      <Input
                        id="Doses"
                        value={formState.Doses}
                        onInput={handleFormChange}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </div>
          </div>
          <div className='shipment'>
            <h3>Shipment Information</h3>
              <div className='info' id="shipment-info">
                <Row justify={"center"} gutter={[10]}>
                  <Col span={8}>
                    <Form.Item 
                      label="Recipient/Company:"
                      name="Recipient"
                      rules={[{
                      required: toCreateState.Shipping_Label,
                      message: 'Recipient name is required (Attn. is not)'
                      }]}>
                      <Input
                        id="Recipient"
                        value={formState.Recipient}
                        onInput={handleAddressChange}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="Attention:">
                      <Input
                        id="Attn"
                        value={formState.Attn}
                        onInput={handleAddressChange}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row justify={"center"} gutter={[10]}>
                  <Col span={7}>
                    <Form.Item 
                      label="Street Address:"
                      name="Street Address"
                      rules={[{
                      required: toCreateState.Shipping_Label,
                      message: "Recipient address is required"
                    }]}>
                      <Input
                        id="Street_Address"
                        value={formState.Street_Address}
                        onInput={handleAddressChange}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={7}>
                    <Form.Item 
                      label="City:"
                      name="City"
                      rules={[{
                      required: toCreateState.Shipping_Label,
                      message: "City is required"
                    }]}>
                      <Input
                        id="City"
                        value={formState.City}
                        onInput={handleAddressChange}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={2}>
                    <Form.Item 
                      label="State:"
                      name="State"
                      rules={[{
                      required: toCreateState.Shipping_Label,
                      message: "State is required"
                    }]}>
                      <Input
                        id="State"
                        value={formState.State}
                        onInput={handleAddressChange}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item 
                      label="Zip Code:"
                      name="Zip Code"
                      rules={[{
                      required: toCreateState.Shipping_Label,
                      message: "Zip code is required"
                    }]}>
                      <Input
                        id="Zip_Code"
                        value={formState.Zip_Code}
                        onInput={handleAddressChange}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row justify={"center"} gutter={[10]}>
                  <Col span={8}>
                    <Form.Item 
                      label="Recipient Phone:"
                      name="Recipient Phone"
                      rules={[{
                      required: toCreateState.Shipping_Label,
                      message: "Zip code is required"
                    }]}>
                      <Input
                        id="Recipient_Phone"
                        value={formState.Recipient_Phone}
                        onInput={handleFormChange}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label="Recipient Email:"
                      name="Recipient Email"
                    >
                      <Input
                        id="Recipient_Email"
                        value={formState.Recipient_Email}
                        onInput={handleFormChange}
                      />
                    </Form.Item>
                  </Col> 
                </Row>
                {/* <Row justify={"center"}>
                  <Form.Item>
                    <Button type="default" onClick={validateAddress}>
                      Validate
                    </Button>
                  </Form.Item>
                </Row> */}
                <Row gutter={[10]} justify={"center"}>
                  <Col span={5}>
                    <Form.Item 
                      label="Shipping Date" 
                      name="Shipping Date"
                      rules={[{
                        required: toCreateState.Shipping_Label,
                        message: "Shipping Date is required"
                    }]}>
                        <DatePicker
                          value={formState.Shipping_Date}
                          onChange={e => handleFormChange({target:{value:e,id:"Shipping_Date"}})}
                        />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item 
                      label="Service Type:" 
                      name="Service Type"
                      rules={[{
                        required: toCreateState.Shipping_Label,
                        message: "Service Type is required"
                    }]}>
                    <Select
                        value={formState.Service_Type}
                        id="Service_Type"
                        onChange={(v) => {
                            handleFormChange({target:{value:v,id:"Service_Type"}})
                          }}
                        options={[
                          {value: undefined, label: ''},
                          {value: 'FEDEX_2_DAY', label: "2 Day"},
                          {value: 'PRIORITY_OVERNIGHT', label: "Priority Overnight"}
                        ]}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item 
                      label="Shipment Number"
                      name="Shipment Number"
                      rules={[{
                        required: toCreateState.Shipping_Label,
                        message: "Shipment Number is required"
                    }]}>
                      <Input
                        id="Shipment_Number"
                        value={formState.Shipment_Number}
                        onInput={handleFormChange}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={[10]} justify={"center"}>
                  <Col>
                    <Form.Item 
                          label="Outbound Customer Reference"
                          name="Outbound Customer Reference"
                          rules={[{
                            required: toCreateState.Shipping_Label,
                            message: "Outbound customer reference is required"
                        }]}>
                          <Input
                            id="Out_Cust_Ref"
                            value={formState.Out_Cust_Ref}
                            onInput={handleFormChange}
                          />
                    </Form.Item>
                  </Col>
                  <Col>
                    <Form.Item 
                      label="Return Customer Reference"
                      name="Return Customer Reference"
                      rules={[{
                        required: toCreateState.Shipping_Label,
                        message: "Return customer reference is required"
                    }]}>
                      <Input
                        id="Ret_Cust_Ref"
                        value={formState.Ret_Cust_Ref}
                        onInput={handleFormChange}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </div>
          </div>
          <div className='cc'>
            <h3>Payment Information</h3>
              <div className='info' id="card-info">
                <Row justify={"center"}>
                  <Col>
                    <Form.Item label="Card Name:">
                      <Input
                        id="Card_Name"
                        value={formState.Card_Name}
                        onInput={handleFormChange}  
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row justify={"center"} gutter={[10]}>
                  <Col span={4}>
                    <Form.Item label="Card Type">
                      <Select
                        value={formState.Card_Type}
                        id="Card_Type"
                        onChange={(v) => {
                            handleFormChange({target:{value:v,id:"Card_Type"}})
                          }}
                        options={[
                          {value: undefined, label: ''},
                          {value: 'Visa', label: "Visa"},
                          {value: 'MC', label: "MasterCard"}
                        ]}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="Card Number:">
                      <Input
                        id="Card_Number"
                        value={formState.Card_Number}
                        onInput={handleFormChange}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={3}>
                    <Form.Item label="CVV:">
                      <Input
                        id="Security_Code"
                        value={formState.Security_Code}
                        onInput={handleFormChange}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={3}>
                    <Form.Item label="Expir. Date:">
                      <Input
                        id="Expiration_Date"
                        value={formState.Expiration_Date}
                        onInput={handleFormChange}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={[10]}>
                  <Col span={8}>
                    <Form.Item label="Billing Address 1:">
                      <Input
                        id="Billing_Address_1"
                        value={formState.Billing_Address_1}
                        onInput={handleFormChange}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="Billing Address 2:">
                      <Input
                        id="Billing_Address_2"
                        value={formState.Billing_Address_2}
                        onInput={handleFormChange}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="Billing Address 3:">
                      <Input
                        id="Billing_Address_3"
                        value={formState.Billing_Address_3}
                        onInput={handleFormChange}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </div>
          </div>
          {labelError ?  
            <Alert
              message="Address Error"
              description={labelError}
              type="error"
              showIcon
            /> :
            null}
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
          <Form.Item>
            <Button type="default" onClick={resetForm}>
              Reset
            </Button>
          </Form.Item>
        </Form>
        <div style={{display:"flex", flexDirection:"column",justifyContent:"space-around", margin:"5rem", paddingBottom:"1rem", border: "3px dashed #3383FF", borderRadius:"10px"}}>
          <h3>Files</h3>
          <div style={{display:"flex", justifyContent: "space-around"}}>
            {requestPrint ? <Button onClick={() => printPreview(requestPrint)}> Print Request </Button> : null}
            {pTouchPrint ? <Button onClick={() => printPreview(pTouchPrint)}> Print P-Touch Label </Button> : null}
            {outPDFPrint ? <Button onClick={() => printPreview(outPDFPrint)}> Print Outbound Label </Button> : null}
            {returnPDFPrint ? <Button onClick={() => printPreview(returnPDFPrint)}> Print Return Label </Button> : null}
          </div>
        </div>
    </div>
  );
}

export default App;
