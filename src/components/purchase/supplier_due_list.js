import React,{useState,useEffect, useRef} from 'react';
import {connect} from 'react-redux';
import {currentRouteSet} from '../../actions/actions';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid'; 
import {BrowserRouter as Router,Route,Link} from 'react-router-dom'
import {pathSpliter,dateTimeFormat,currentDateTime,getDateTimeFromISODT} from '../../lib/functions'
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
import PrintIcon from '@material-ui/icons/Print';
import Select from 'react-select';
import '../commons/commons.css'


import {
  MuiPickersUtilsProvider,
  KeyboardDateTimePicker
} from '@material-ui/pickers';
import swal from 'sweetalert';
import  InstitutionProfile from '../commons/institution_profile'
import ReactToPrint from "react-to-print";
import commaNumber from 'comma-number';
let format = commaNumber.bindWith(',', '.')
const SupplierDueHistory = ({location,currentRoute,currentRouteSet,authInfo})=>{
  const classes = useStyles();
  useEffect(()=>{
      currentRouteSet(pathSpliter(location.pathname,1));
  },[]);

  let [suppliers,suppliersSet] = useState([]);
  let [selectedSupplier,selectedSupplierSet] = useState(null);
  let [report,reportSet] = useState([]);
  let [print,printSet] = useState(false);
  let [reportLoading,reportLoadingSet] = useState(false);

  let [byDateTime,byDateTimeSet] = useState({
        fromDate: currentDateTime,
        toDate:currentDateTime
  })

  let customerRef = useRef(null);
  let fromDateRef = useRef(null);
  let reportRef = useRef(null);


  let [types,typesSet] = useState([{label:'All Supplier',value:null},
  {label:'Supplier Wise',value:'supplier'}]);
  let [selectedType,selectedTypeSet] = useState({label:'All Supplier Due',value:null});

  useEffect(()=>{ 
    getSuppliers();
  },[]);

  let getSuppliers = async ()=>{
    await axios.post(`${API_URL}/api/get-suppliers`,{'select-type':'active'},{headers:{'auth-token':authInfo.token}}).then(res=>{
          suppliersSet(res.data.message)
    })
  }


 
 

  let getSearchResult = async ()=>{


      let payload = {
          supplierId:   selectedType.value=='supplier' && selectedSupplier != null ? selectedSupplier.supplier_id:null,
      }
      reportLoadingSet(true)
      await axios.post(`${API_URL}/api/get-supplier-due`,{...payload},{headers:{'auth-token':authInfo.token}}).then(res=>{
        reportSet(res.data)
        printSet(true)
        reportLoadingSet(false)
  })

  }


  let ReportDom = React.forwardRef((props,ref)=>{
      return(<div ref={ref}>
        <InstitutionProfile />
               {
     report.length>0?(
      <Paper className={classes.paper} style={{marginTop:'8px',marginBottom:'5px'}} >
  
  <p className="print-source" style={{width:'100%',textAlign:'center',fontWeight:'bold',color:'#222'}}>Supplier Due Report </p>

      <TableContainer >
        <Table className={classes.table} size="small" aria-label="a dense table" className="report-dom">
          <TableHead>
            <TableRow> 
              <TableCell align="left" style={{width:'1%'}}>SL</TableCell>
              <TableCell align="left" style={{width:'10%'}}>Supplier Code</TableCell>
              <TableCell align="left" style={{width:'15%'}}>Supplier Name</TableCell>
              <TableCell align="left" style={{width:'15%'}}>Institution</TableCell>
              <TableCell align="left" style={{width:'15%'}}>Address</TableCell>
              <TableCell align="right" style={{width:'19%'}}>Mobile No</TableCell>
              <TableCell align="right" style={{width:'15%'}}>Due Amount</TableCell> 
             
            </TableRow>
          </TableHead>
          <TableBody> 
              {
                report.map((row,sl)=>(
                    <TableRow  key=""> 
                    <TableCell>{sl+parseFloat(1)}.</TableCell>
                
                  <TableCell  align="left">{row.supplier_code}</TableCell>
                  <TableCell  align="left">{row.supplier_name}</TableCell>
                  <TableCell  align="left">{row.supplier_institution_name}</TableCell>
                  <TableCell  align="left">{row.supplier_address}</TableCell>
                  <TableCell  align="right">{row.supplier_mobile_no}</TableCell>
                  <TableCell  align="right">{format(parseFloat(row.dueAmount).toFixed(2))}</TableCell>
                   </TableRow>
                ))
                   
        
              }
         

            <TableRow  key=""> 
            <TableCell colSpan={6}  align="right">Total Due : </TableCell>
            <TableCell  align="right">{format(_.sumBy(report,curr => Number(curr.dueAmount)).toFixed(2))}</TableCell>
            </TableRow>
 
                  
            
    
       
         
    
    
          </TableBody>
        </Table>
      </TableContainer>
          </Paper>
     ):''
  }
      </div>)
  })

    return(
        <div className={classes.root}> 
<Paper className={classes.paper} style={{marginTop:'-25px',marginBottom:'5px'}}>
<h4 style={{textAlign:'left',margin:0,padding:0,marginTop: '-10px',
  marginBottom: '2px'}}>Supplier Due Report</h4> 
  
  

<Grid container spacing={3} > 
        <Grid item  xs={12}   sm={2} > 
                <Select
                value={selectedType}
                onChange={(type)=>{
                    if(type == null){
                        return false;
                    }
                    selectedTypeSet(type);
                }}
                options={types}

            />
        </Grid>
        {
          selectedType != null && selectedType.value =='supplier' ? (
            <Grid item  xs={12}   sm={3} > 
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
                inputRef={customerRef}
    
                onKeyDown={event => {
                    if (event.key === "Enter") {
                        fromDateRef.current.focus()
                    }
                  }}
    
                renderInput={(params) => <TextField 
                   
                  {...params} 
                  label="Supplier " 
                  variant="outlined"
                  />} 
            />
            </Grid>
          ):''
        }
        
     

        
        
       
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
export default connect(mapStateToPops,{currentRouteSet})(SupplierDueHistory);