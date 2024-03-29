import React,{ useState,useEffect} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import {connect} from 'react-redux';
import swal from 'sweetalert';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import MUIDataTable from "mui-datatables";
import {API_URL} from '../../config.json';
import axios from 'axios';
import SaveIcon from '@material-ui/icons/Save';
import Button from '@material-ui/core/Button';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import SettingsBackupRestoreIcon from '@material-ui/icons/SettingsBackupRestore';

import Snackbar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';
import {pathSpliter,checkAuthBranchWare,dateTimeFormat} from '../../lib/functions'
import {currentRouteSet,createdMaterialNameSet,updatedMaterialNameSet,disableRestoreMaterialNameSet } from '../../actions/actions';
import moment from 'moment';

const MaterialNamesManage = ({location,currentRouteSet,authInfo,createdMaterialName,updatedMaterialName,materialNameDisableRestoreAction,
  createdMaterialNameSet,updatedMaterialNameSet,disableRestoreMaterialNameSet })=>{
    const classes = useStyles();
    let [formValues,formSetValues] = useState({material_name:'',material_name_id:0,action:'create'});
    let [loadingSave,loadingSaveSet] = useState(false)
    let [loadingList,loadingListSet] = useState(false)
    let [materialNames,materialNamesSet] = useState([])
    let [materialNameUpdateIndex,materialNameUpdateIndexSet] = useState('0')

    const [successMsg, setSuccessMsg] = useState({
      open: false,
      vertical: 'top',
      horizontal: 'center',
      msg:''
    });

    const { vertical, horizontal, open,msg } = successMsg;
    const handleClose = () => {
      setSuccessMsg({ ...successMsg, open: false });
    };
    createdMaterialNameSet(null)
    updatedMaterialNameSet(null)
    disableRestoreMaterialNameSet(null)
    useEffect(()=>{
     
      currentRouteSet(pathSpliter(location.pathname,1));
      getMaterilNames();
    },[]);

    useEffect(()=>{
      if(createdMaterialName){
        if(checkAuthBranchWare(createdMaterialName.user_branch_id)){          
          materialNamesSet(createdMaterialName.createdRow.concat(materialNames));
          setSuccessMsg({...successMsg,msg:`${createdMaterialName.msg}`,open:true });
          formSetValues({material_name:'',material_name_id:0,action:'create'})
        }
       }
    },[createdMaterialName])

    useEffect(()=>{
      if(updatedMaterialName){
        if(checkAuthBranchWare(updatedMaterialName.user_branch_id)){          
          materialNames[updatedMaterialName.index] = updatedMaterialName.updatedRow[0]
          setSuccessMsg({...successMsg,msg:`${updatedMaterialName.msg}`,open:true });
          formSetValues({material_name:'',material_name_id:0,action:'create'})
        }
       }
    },[updatedMaterialName])

    useEffect(()=>{
      if(materialNameDisableRestoreAction){
        if(checkAuthBranchWare(materialNameDisableRestoreAction.user_branch_id)){
        materialNames[materialNameDisableRestoreAction.index] = materialNameDisableRestoreAction.disableRestoreRow[0];
        setSuccessMsg({...successMsg,msg:`${materialNameDisableRestoreAction.msg}`,open:true });
        }
       }
    },[materialNameDisableRestoreAction]);

    const handleFromInput = (e)=>{
        const {name,value} = e.target;
        formSetValues({...formValues,[name]:value}) 
      }
    const saveFormAction = async ()=>{
        if(formValues.material_name.trim()==''){
            swal({
              title:'Materil  name is required',
              icon:'warning'
            })
          }else{
            formValues.materialNameUpdateIndex = materialNameUpdateIndex
            loadingSaveSet(true)
            await axios.post(`${API_URL}/api/material-name-cu`,formValues,{headers:{'auth-token':authInfo.token}}).then(res=>{
            loadingSaveSet(false)
            })
          }
    }

    const materialNameEdit = (row,index)=>{
      formValues.material_name =  materialNames[index].material_name
      formValues.action =  'update'

      formSetValues({...formValues,material_name:materialNames[index].material_name,
        material_name_id:materialNames[index].material_name_id});
        materialNameUpdateIndexSet(index)
    }
    const materialNameDisableRestore = async (materialNameId,actionCond,index)=>{
      await axios.post(`${API_URL}/api/material-name-disable-restore`,{material_name_id:materialNameId,action:actionCond,index},{headers:{'auth-token':authInfo.token}})
    }

    const getMaterilNames = async ()=>{
          loadingListSet(true)
          await axios.post(`${API_URL}/api/get-material-names`,null,{headers:{'auth-token':authInfo.token}}).then(res=>{
            loadingListSet(false)
            materialNamesSet(res.data.message)
          })
    }

    
    const ActionOptions = (props)=>{
        return(<div style={{textAlign:'right'}}>
       {
    authInfo.role !='user'?(
    <>
         {
    authInfo.role !='user'?(
    <>
          <EditIcon style={{cursor:'pointer',fontSize: '28px',color: 'rgb(15, 126, 119)'}} onClick={()=>materialNameEdit(props.rowData[0],props.rowIndex)}/>
          {props.rowData[1]=='a'?(
                <DeleteIcon style={{cursor:'pointer',color: '#ff0202',fontSize: '28px'}} onClick={()=>materialNameDisableRestore(props.rowData[0],'d',props.rowIndex)}/>
          ):(
            <SettingsBackupRestoreIcon style={{cursor:'pointer',color: 'rgb(60, 178, 194)',fontSize: '28px',}} onClick={()=>materialNameDisableRestore(props.rowData[0],'a',props.rowIndex)}/>
          )}        
   </>):''
 }
                
   </>):''
 }
        </div>)
      
      }
    
    const columns = [
        {name: "material_name_id",options: { display: 'excluded' }},
        {name: "name_status",options: { display: 'excluded' }},
        {name: "material_name",label: "Material name",options: {filter: true,sort: true}},
        {name: "name_created_isodt",label: "created date & time",
        options: 
        {filter: true,sort: true,
          customBodyRender:(value,tableMeta)=>{
            return(<p>{moment(tableMeta.rowData[3]).format(dateTimeFormat)}</p>)
          }
        }
      },

      {name: "name_updated_isodt",label: "updated date & time",
        options: 
        {filter: true,sort: true,
          customBodyRender:(value,tableMeta)=>{
            return(<p>{moment(tableMeta.rowData[4]).format(dateTimeFormat)}</p>)
          }
        }
      },
        
        
        {name:"actions",options: {filter: false,sort: false,
          customBodyRender:(value,tableMeta)=>{
            return ( <ActionOptions   value={value} rowIndex={tableMeta.rowIndex}  rowData={tableMeta.rowData} 
               /> ); 
        }
        },headerStyle: {
          textAlign:'right'
        }}
       ];
              
       const options = {
         filterType: 'checkbox',
         selectableRows: 'none',
         display: "excluded"
        }

    return (
        <div className={classes.root}>
             {/* Success message */}
              <Snackbar open={open} autoHideDuration={10000} onClose={handleClose}>
                <Alert onClose={handleClose} severity="success">
                  {successMsg.msg}
                </Alert>
              </Snackbar>  
              {/* End of message */}
            <Paper className={classes.paper} style={{marginTop:'-15px'}}>
            <h2 className={classes.pageEntryLabel}> Material Name Entry</h2>
             
            <Grid container spacing={2}>
            <Grid item xs={12} sm={3}  style={{margin:'0px auto'}}> 
            <TextField  autoComplete='off'  className={classes.fullWidth}  value={formValues.material_name} 
            label="Material name" name="material_name" variant="outlined" size="small" onChange={handleFromInput} />
            </Grid>
           </Grid>
           <Grid item xs={12}>
          <Button style={{marginTop: '25px'}}
            variant="contained"
            color="primary"
            size="small"
            className={classes.button}
            startIcon={<SaveIcon/>}
            disabled={loadingSave}
            onClick={saveFormAction}
        >
        Save
      </Button>
  </Grid>
            </Paper>
            {
      loadingList==true?(<b>Loading...</b>):(
        <Paper className={classes.paper} style={{marginTop:'20px'}}>
        <MUIDataTable
      title={"Material Name List"}
      data={materialNames}
      columns={columns}
      options={options}
      adjustForCheckbox={false} 
      displaySelectAll={false}
      />
      </Paper>
      )
      
     }
        </div>
    )
}



const useStyles = makeStyles((theme) => ({
    button: {
      margin: theme.spacing(1),
    },
  root: {},
  '& .MuiTextField-root': {
    margin: theme.spacing(1),
    width: '25ch',
   },
    paper: {
        padding: theme.spacing(2),
        textAlign: 'center',
        color: theme.palette.text.secondary,
    },
    pageEntryLabel:{
        color: '#7754cc',
        margin: '0px',
        padding: '0px',
        marginTop: '-11px',
        textAlign: 'left',
        marginLeft: '0px',
        marginBottom: '5px',
        textAlign:'center'
    },
    fullWidth:{
        width:'100%'
    },
    option: {
        fontSize: 15,
        '& > span': {
          marginRight: 10,
          fontSize: 18,
        },
      }
  }));
  
  const mapStateToPops = (state)=>{
        return {
          currentRoute:state.currentRouteReducer,
          authInfo:state.authInfoReducer,
          createdMaterialName:state.createdMaterialNameReducer,
          updatedMaterialName:state.updatedMaterialNameReducer,
          materialNameDisableRestoreAction:state.materialDisableRestoreReducer
        }
  }
  export default connect(mapStateToPops,{currentRouteSet, createdMaterialNameSet,updatedMaterialNameSet,disableRestoreMaterialNameSet })(MaterialNamesManage);