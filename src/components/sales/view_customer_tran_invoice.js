import React,{useEffect, useState} from 'react';
import {connect} from 'react-redux';
import {currentRouteSet} from '../../actions/actions';
import {pathSpliter} from '../../lib/functions';
import SalesInvoice from './components/customer_tran_invoice_load';
import {API_URL} from '../../config.json';
import axios from 'axios';

import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Grid from '@material-ui/core/Grid';

let ViewSalesInvoice = ({location,currentRouteSet,authInfo})=>{

  let [invoices,invoicesSet] = useState([]);
  let [selectedInvoice,selectedInvoiceSet] = useState(null);
  let [saleId,saleIdSet] = useState(null);
  let [institution,institutionSet] = useState(null);

  useEffect(()=>{
    currentRouteSet(pathSpliter(location.pathname,1));
    getSalesInvoices();
    getInstitution();
},[]);

let getSalesInvoices = async ()=>{
    await axios.get(`${API_URL}/api/get-customer-transactions-invoice`,{headers:{'auth-token':authInfo.token}}).then(res=>{
        invoicesSet(res.data);
    })
}

let getInstitution = async ()=>{
    await  axios.get(`${API_URL}/api/get-institution`,{headers:{'auth-token':authInfo.token}}).then(res=>{
        institutionSet(res.data)
 })
}

  return(
          
    <>
        <Grid container>

            <Grid item xs={12} sm={12}>
                  <Grid xs={12} sm={12} style={{width:'250px',marginBottom:'20px',margin: '0px auto'}}>
                  <Autocomplete 
                    

                     openOnFocus={true}
                     autoHighlight={true}
                     style={{width:'100%',height:'20px'}}
                     options={invoices}
                     value={selectedInvoice}
                     size="small"
                     getOptionLabel={(option) => option.display_text}
                     onChange={(e,invoice)=>{

                      selectedInvoiceSet(invoice)
                        if(invoice != null){
                            saleIdSet(invoice.pay_id)
                        }

                       
                    
                     }}
                     renderInput={(params) => <TextField 
             
                 {...params} 
                 label="Customer Transaction Invoice" 
                 variant="outlined"
                 
                 />} />


    </Grid>
            </Grid>
            </Grid>
        
        {
             
              <SalesInvoice saleId={saleId} institution={institution}/>
            
        }
            
      
    </>
)
 
}


  const mapStateToPops = (state)=>{
    return {
      currentRoute:state.currentRouteReducer,
      authInfo:state.authInfoReducer
    }
}

export default connect(mapStateToPops,{currentRouteSet})(ViewSalesInvoice);