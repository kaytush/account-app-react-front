import React,{useState,useEffect,useRef} from 'react';
import {connect} from 'react-redux';
import {currentRouteSet} from '../../actions/actions';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid'; 
import {BrowserRouter as Router,Route,Link} from 'react-router-dom'
import {pathSpliter,dateTimeFormat,currentDateTime,getDateTimeFromISODT,currentDateStartTime,currentDateEndTime} from '../../lib/functions'
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import axios from 'axios';
import Button from '@material-ui/core/Button';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import ReceiptIcon from '@material-ui/icons/Receipt';
import DateFnsUtils from '@date-io/date-fns'; // choose your libs
import {API_URL} from '../../config.json';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import SearchIcon from '@material-ui/icons/Search';
import moment from 'moment';
import _ from 'lodash';

import ReactToPrint from "react-to-print";
import PrintIcon from '@material-ui/icons/Print';
import InstitutionProfile from '../commons/institution_profile'
import '../commons/commons.css'

import {
  MuiPickersUtilsProvider,
  KeyboardDateTimePicker
} from '@material-ui/pickers';
import swal from 'sweetalert';



const PurchaseRecord = ({location,currentRoute,currentRouteSet,authInfo})=>{
    const classes = useStyles();
    useEffect(()=>{
        currentRouteSet(pathSpliter(location.pathname,1));
    },[]);
    let [employees,employeesSet] = useState([]);
    let [users,usersSet] = useState([]);
  
    let [suppliers,suppliersSet] = useState([]);
    let [reportLoading,reportLoadingSet] = useState(false);

    let [selectedSearchType,selectedSearchTypeSet] = useState({searchType:'All'})
    let [selectedEmployee,selectedEmployeeSet] = useState(null)
    let [selectedSupplier,selectedSupplierSet] = useState(null)
    let [selectedUser,selectedUserSet] = useState(null)


    let employeeRef = React.useRef(null)
    let [searchResult,searchResultSet] = useState([]);
    let [print,printSet] = useState(false);

    
    const getSuppliers = async ()=>{
        await axios.post(`${API_URL}/api/get-suppliers`,{'select-type':'active'},{headers:{'auth-token':authInfo.token}}).then(res=>{
          suppliersSet(res.data.message);
        })
  }
   

   

    const getEmployees = async ()=>{
      await axios.post(`${API_URL}/api/get-employees`,{'select-type': "active"},{headers:{'auth-token':authInfo.token}}).then(res=>{
        employeesSet(res.data.message)
    })
    }

  
      const getUsers = async ()=>{
        await axios.post(`${API_URL}/api/get-users`,{'select-type': "active"},{headers:{'auth-token':authInfo.token}}).then(res=>{
          usersSet(res.data.message)
      })
      }


    let [byDateTime,byDateTimeSet] = useState({
          dateTimeFrom: currentDateStartTime(),
          dateTimeTo:currentDateEndTime()
    })

    let materialPurDelete = async (purchaseId)=>{
        swal({
           title:'Are you sure delete this?',
           icon:'warning',
           buttons:true
        }).then(async (confirm)=>{
          if(confirm){
            await axios.post(`${API_URL}/api/material-purchase-delete`,{purchaseId},{headers:{'auth-token':authInfo.token}}).then(res=>{
              if(!res.data.error){
               swal({
                 title:res.data.message,
                 icon:'success'
              })
              getSearchResult()
              } 
         })
          }else{
            return false
          }
          
        })
        
    }

    useEffect(()=>{ 

        

        if(selectedSearchType != null && selectedSearchType.searchType=='By Employee'){
            getEmployees();
        }

        
        if(selectedSearchType != null && selectedSearchType.searchType=='By Supplier'){
            getSuppliers();
        }

       

        if(selectedSearchType != null && selectedSearchType.searchType=='By User'){
            getUsers();
        }
        
    },[selectedSearchType]);



    let [searchTypes,searchTypesSet] = useState([{searchType:'All'},
    {searchType:'By Employee'}, {searchType:'By Supplier'},
    {searchType:'By User'}]);

    
    let getSearchResult = async ()=>{

        let url = `${API_URL}/api/get-material-purchase`;

          if(selectedSearchType == null){
            swal({
              title:'Select search Type',
              icon:'warning',
           })
           return false
          }


            
        let reqPayload = {
            employeeId: selectedEmployee != null && selectedSearchType.searchType=='By Employee' ? selectedEmployee.employee_id:null,
            supplierId: selectedSupplier != null && selectedSearchType.searchType=='By Supplier' ?selectedSupplier.supplier_id:null,
            userId: selectedUser != null && selectedSearchType.searchType=='By User' ?selectedUser.user_id:null,
            fromDate: byDateTime.dateTimeFrom,
            toDate: byDateTime.dateTimeTo,
        }

       
        reportLoadingSet(true)
        await axios.post(`${url}`,reqPayload,{headers:{'auth-token':authInfo.token}}).then(res=>{
           printSet(true)
           searchResultSet(res.data);
           reportLoadingSet(false)
            
        });
    }


    let ReportDom = React.forwardRef((props,ref)=>{
      
        return(
          <div ref={ref}>
               <InstitutionProfile />

          
  
               <div style={{clear:'both'}}></div>
<Paper style={{width:'100%',paddingLeft:'10px',paddingRight:'10px'}} className="print-source">
<p style={{width:'100%',textAlign:'center',fontWeight:'bold'}}>Material Purchase  Record </p>

  <p style={{float:'left',width:'30%',textAlign:'left',margin:0,padding:0,fontSize:'16px'}}>
    {selectedSearchType != null && selectedSearchType.searchType == 'By Employee'?`Employee : ${selectedEmployee!=null?selectedEmployee.employee_name:''}`:''}
    {selectedSearchType != null && selectedSearchType.searchType == 'By Supplier'?`Supplier : ${selectedSupplier!=null?selectedSupplier.supplier_name:''}`:''}
    {selectedSearchType != null && selectedSearchType.searchType == 'By User'?`User : ${selectedUser!=null?selectedUser.user_name:''}`:''}
    </p>

<p style={{float:'right',width:'40%',textAlign:'right',margin:0,padding:0}}> Statement From { moment(byDateTime.dateTimeFrom).format(dateTimeFormat)  } <br/> TO { moment(byDateTime.dateTimeTo).format(dateTimeFormat) }
</p>
</Paper> 




{
( searchResult.length>0)?(
  <Paper className={classes.paper} style={{marginTop:'8px',marginBottom:'5px'}} >
  
  {/* Purchase Record  without details */} 
  <TableContainer >
    <Table className={classes.table} size="small" aria-label="a dense table" className="report-dom">
      <TableHead>
        <TableRow>
          <TableCell align="left">SL</TableCell>
          <TableCell align="left">Invoice No</TableCell>
          <TableCell align="left">Date & Time</TableCell>
          <TableCell align="left">Supplier</TableCell>
          <TableCell align="left">Employee</TableCell>
          <TableCell align="left">CreatedBy</TableCell>
          <TableCell align="right">SubTotal</TableCell>
          <TableCell align="right">Vat</TableCell>
          <TableCell align="right">Transport Cost</TableCell>
          <TableCell align="right">Discount</TableCell>
          <TableCell align="right">Total</TableCell>
          <TableCell align="right">Paid</TableCell>
          <TableCell align="right">Due</TableCell>
          <TableCell align="right" className="print-no">Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
          {
            searchResult.map((ele,index)=>(
              <TableRow  key={index}> 
              <TableCell  align="left">{index+parseFloat(1)}</TableCell>
              <TableCell align="left">{ele.m_purchase_invoice}</TableCell> 
              <TableCell align="left">{moment(ele.created_isodt).format(dateTimeFormat)}</TableCell>
              <TableCell align="left">{ele.supplier_name}</TableCell>
              <TableCell align="left">{ele.employee_name}</TableCell>
              <TableCell align="left">{ele.user_full_name}</TableCell>
              <TableCell align="right">{parseFloat(ele.sub_total).toFixed(2)}</TableCell>
              <TableCell align="right">{parseFloat(ele.vat).toFixed(2)}</TableCell>
              <TableCell align="right">{parseFloat(ele.transport_cost).toFixed(2)}</TableCell>
              <TableCell align="right">{parseFloat(ele.discount).toFixed(2)}</TableCell>
              <TableCell align="right">{parseFloat(ele.total).toFixed(2)}</TableCell>
              <TableCell align="right">{parseFloat(ele.paid).toFixed(2)}</TableCell>
              <TableCell align="right">{parseFloat(ele.due).toFixed(2)}</TableCell>
               <TableCell align="right" className="print-no">

              
               <Link to={{pathname:`/production/material-purchase-invoice/${ele.m_purchase_id }`}}> <ReceiptIcon style={{cursor:'pointer',color:'black',marginLeft:'2px'}} > </ReceiptIcon></Link>
             
               {
    authInfo.role !='user'?(
    <>
         <Link to={{pathname:`/production/material-purchase-update/${ele.m_purchase_id}`}}>  <EditIcon style={{cursor:'pointer',color:'green',marginLeft:'2px'}}  > </EditIcon></Link>
              <DeleteIcon onClick={()=>{materialPurDelete(ele.m_purchase_id)}} style={{cursor:'pointer',color:'#FF0202',marginLeft:'2px'}} > </DeleteIcon>        
   </>):''
 }
             
              </TableCell>
            </TableRow>
            ))
          }
          
        

    
      <TableRow >
        <TableCell colSpan={6} style={{textAlign:'right'}}>Total :</TableCell>
        <TableCell align="right">{ searchResult.reduce((prev,curr)=>{
              return prev+parseFloat(curr.sub_total);
        },0).toFixed(2) }</TableCell>
        <TableCell align="right">{ searchResult.reduce((prev,curr)=>{
              return prev+parseFloat(curr.vat);
        },0).toFixed(2) }</TableCell>

<TableCell align="right">{ searchResult.reduce((prev,curr)=>{
              return prev+parseFloat(curr.transport_cost);
        },0).toFixed(2) }</TableCell>
        <TableCell align="right">{ searchResult.reduce((prev,curr)=>{
              return prev+parseFloat(curr.discount);
        },0).toFixed(2) }</TableCell>
        <TableCell align="right"> { searchResult.reduce((prev,curr)=>{
              return prev+parseFloat(curr.total);
        },0).toFixed(2) }</TableCell>

<TableCell align="right"> { searchResult.reduce((prev,curr)=>{
              return prev+parseFloat(curr.paid);
        },0).toFixed(2) }</TableCell>

<TableCell align="right"> { searchResult.reduce((prev,curr)=>{
              return prev+parseFloat(curr.due);
        },0).toFixed(2) }</TableCell>
       
      </TableRow>
     


      </TableBody>
    </Table>
  </TableContainer>
      </Paper>
):''
}
      





   

     
      </div>
       )
      })
const reportRef = useRef();

    
      return(
          <div className={classes.root}> 
<Paper className={classes.paper} style={{marginTop:'-25px',marginBottom:'5px'}}>
<h4 style={{textAlign:'left',margin:0,padding:0,marginTop: '-10px',
    marginBottom: '2px'}}>Material Purchase Record</h4>
<Grid container spacing={3} > 
          <Grid item  xs={12}  sm={2}> 
          <Autocomplete 
          size="small"
          autoHighlight
              openOnFocus={true}
              style={{width:'100%',height:'20px'}}
              options={searchTypes} 
              value={selectedSearchType}
              getOptionLabel={(option) => option.searchType}
              onChange={(event,selectedObj)=>{
                selectedSearchTypeSet(selectedObj) 
              }}
              renderInput={(params) => <TextField 
                inputRef={employeeRef}
               
                {...params} 
                label="Search Type" 
                variant="outlined"
                />} 
          />

          </Grid>
         
          <Grid item  xs={12}   sm={2} style={{display: selectedSearchType!=null && selectedSearchType.searchType=='By Employee'?'block':'none'}}> 
          <Autocomplete 
          size="small"

          autoHighlight
              openOnFocus={true}
              style={{width:'100%',height:'20px'}}
              options={employees}
              value={selectedEmployee}
              getOptionLabel={(option) => option.employee_name}
              onChange={(event,selectedObj)=>{
                 selectedEmployeeSet(selectedObj)
              }}
              renderInput={(params) => <TextField 
                inputRef={employeeRef}
                onKeyDown={event => {
                  if (event.key === "Enter") {
                     // purchaseDateRef.current.focus()
                  }
                }} 
                {...params} 
                label="Select Employee" 
                variant="outlined"
                />} 
                
          />
          </Grid>

        

          <br></br>
          
        
        

          <Grid item  xs={12}   sm={2} style={{display: selectedSearchType!=null && selectedSearchType.searchType=='By User'?'block':'none'}}> 
          <Autocomplete  
          size="small"
          autoHighlight
              openOnFocus={true}
              style={{width:'100%',height:'20px'}}
              options={users}
              value={selectedUser} 
              getOptionLabel={(option) => option.user_name}
              onChange={(event,selectedObj)=>{
                 selectedUserSet(selectedObj)
              }}
              renderInput={(params) => <TextField 
                {...params} 
                label="Select user" 
                variant="outlined"
                />} 
                
          />
          </Grid>

         
          <Grid item  xs={12}   sm={3} style={{display: selectedSearchType!=null && selectedSearchType.searchType=='By Supplier'?'block':'none'}}> 
          <Autocomplete  
          size="small"
          autoHighlight
              openOnFocus={true}
              style={{width:'100%',height:'20px'}}
              options={suppliers}
              value={selectedSupplier} 
              getOptionLabel={(option) => option.display_text}
              onChange={(event,selectedObj)=>{
                 selectedSupplierSet(selectedObj)
              }}
              renderInput={(params) => <TextField 
                {...params} 
                label="Select Supplier" 
                variant="outlined"
                />} 
                
          />
          </Grid>



          
              
          <Grid item  xs={12}  sm={2} style={{marginBottom: '-9px'}} > 
            <MuiPickersUtilsProvider  utils={DateFnsUtils} > 
          
            <KeyboardDateTimePicker
          //  inputRef={purchaseDateRef}
            onKeyDown={(e)=>{
              if(e.key==='Enter'){
                //supplierRef.current.focus()
              }
            }}
            style={{ width: '100%',marginTop: '' }}
            value={byDateTime.dateTimeFrom}
            onChange={(datet)=>{
              byDateTimeSet({...byDateTime,dateTimeFrom:getDateTimeFromISODT(datet)})
            }}
            label="From Date &   Time"
            format="Y/MM/d hh:mm a"
            /> 
            </MuiPickersUtilsProvider>
          </Grid>


          <Grid item  xs={12}  sm={2} style={{marginBottom: '-9px'}} > 
            <MuiPickersUtilsProvider  utils={DateFnsUtils} > 
          
            <KeyboardDateTimePicker
            //inputRef={purchaseDateRef}
            onKeyDown={(e)=>{
              if(e.key==='Enter'){
               // supplierRef.current.focus()
              }
            }}
            style={{ width: '100%',marginTop: '' }}
            value={byDateTime.dateTimeTo}
            onChange={(datet)=>{
              byDateTimeSet({...byDateTime,dateTimeTo:getDateTimeFromISODT(datet)})
            }}
            label="To Date &   Time"
            format="yyyy/MM/dd hh:mm a"
               />
            </MuiPickersUtilsProvider>
          </Grid>
          <Grid item  xs={12}   sm={1} >
        <Button style={{marginTop: '5px',marginLeft: 'auto',fontSize:'14px'}} 
                            variant="contained"
                            color="primary"
                            className={classes.button}
                            startIcon={<SearchIcon/>}
                            onClick={getSearchResult}
                            disabled={reportLoading?true:false}
                        >
                       Search 
                      </Button>
        </Grid>

        </Grid> 
        </Paper>



        {
        print?(
          <Grid container >
          <Grid item xs={12} sm={12} >
            <Paper style={{borderRadius:'0px',marginTop: '-7px'}}>
            <ReactToPrint
                        trigger={() => <PrintIcon  style={{cursor:'pointer',marginLeft: '30px',marginTop: '3px',marginBottom: '-8px'}} />}
                        content={() => reportRef.current}
                      />
            </Paper>
         
          </Grid>
      </Grid>
        ):''
      }
            <ReportDom ref={reportRef} /> 



          </div>
     )
    }


const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
    },
    inputField:{
      width:'100%',
      marginTop:'5px'
    },
    plusLinkDiv:{
      position:'relative'  
    },
    plusLink:{
      margin: 0,
      padding: 0,
      marginTop: '-21px',
      fontSize: '29px',
      height: '21px',
      textAlign: 'right',
      position: 'absolute',
      right: 0,
      color: '#3e8d54'
    },
    paper: {
      padding: theme.spacing(1),
      textAlign: 'center',
      color: theme.palette.text.secondary,
    },
  }));


const mapStateToPops = (state)=>{
      return {
        currentRoute:state.currentRouteReducer,
        authInfo:state.authInfoReducer
      }
}
export default connect(mapStateToPops,{currentRouteSet})(PurchaseRecord); 