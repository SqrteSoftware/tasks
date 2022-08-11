import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import LoadingButton from './LoadingButton';
import Button from '@mui/material/Button';
import { TextField } from '@mui/material';

import {onClick} from '../../utils/stripe';
import {handleExistingLicense} from '../../utils/license';
import { deleteLocalKeys } from '../../utils/app_crypto';


const CustDialogTitle = (props) => {
  const { children, onClose, ...other } = props;

  let dialogTitleStyle = { m: 0, p: 2 };

  let iconButtonStyle = {
    position: 'absolute',
    right: 8,
    top: 8,
    color: (theme) => theme.palette.grey[500],
  };

  return (
    <DialogTitle sx={dialogTitleStyle} {...other}>
      {children}
      {onClose ? (
        <IconButton aria-label="close" onClick={onClose} sx={iconButtonStyle}>
          <CloseIcon />
        </IconButton>
      ) : null}
    </DialogTitle>
  );
};

export default function SyncDialog(props) {
  const [screen, setScreen] = React.useState('intro');

  var content = <IntroBody {...props} setScreen={setScreen}/>;
  if (props.user.id !== null) {
    content = <ConnectedBody {...props} setScreen={setScreen} onDisconnect={props.onDeleteUserId}/>
  }
  else if (screen !== 'intro') {
    content = <ExistingLicenseBody {...props} setScreen={setScreen}/>
  }

  return (
    <div>
      <Dialog onClose={props.onClose} aria-labelledby="customized-dialog-title" open={props.open}>
        { content }
      </Dialog>
    </div>
  );
}


function IntroBody(props) {
  return (
    <div>
      <CustDialogTitle id="customized-dialog-title" onClose={props.onClose}>
        Sync Your Data
      </CustDialogTitle>
      <DialogContent dividers>
        <Typography gutterBottom>
          Subscribe to sync your data across devices.
        </Typography>
        <Typography variant="body2" color="text.disabled" sx={{'max-width': '350px'}}>
        This site is protected by reCAPTCHA and the Google <a href="https://policies.google.com/privacy">Privacy Policy</a> and <a href="https://policies.google.com/terms">Terms of Service</a> apply.
        </Typography>
      </DialogContent>
      <DialogActions>
        <LoadingButton onClick={onClick}>New Subscription</LoadingButton>
        <Button
          variant="contained"
          color="primary"
          onClick={e => { props.setScreen('existing') }}>
          Existing License
        </Button>
      </DialogActions>
    </div>
  )
}

function ExistingLicenseBody(props) {
  const [licenseKey, setLicenseKey] = useState('');
  return (
    <div>
      <CustDialogTitle id="customized-dialog-title" onClose={props.onClose}>
        Sync Your Data
      </CustDialogTitle>
      <DialogContent dividers>
        <Typography gutterBottom>
          Enter your existing license
        </Typography>
        <TextField value={licenseKey} onChange={e => setLicenseKey(e.target.value)}/>
      </DialogContent>
      <DialogActions>
        <Button onClick={e => {props.setScreen('intro')}} variant="contained" color="secondary">
            Cancel
        </Button>
        <LoadingButton onClick={e => handleExistingLicense(licenseKey, props.onCreateUserId, props.onDeleteUserId)}>
          Save
        </LoadingButton>
      </DialogActions>
    </div>
  )
}

function ConnectedBody(props) {

  async function disconnectDevice() {
    props.onDisconnect();
    props.setScreen('intro');
    await deleteLocalKeys();
  }

  return (
    <div>
      <CustDialogTitle id="customized-dialog-title" onClose={props.onClose}>
        Your Subscription
      </CustDialogTitle>
      <DialogContent dividers>
        <Typography gutterBottom>
          You are currently connected and syncing your data.
          <br/><br/>
          You can disconnect this device by clicking 'Disconnect' below. You can connect
          again by entering your existing license key again.
          <br/><br/>
          If you wish to cancel your subscription completely, please contact support.
        </Typography>
      </DialogContent>

      <DialogActions>
        <LoadingButton onClick={disconnectDevice}>
          Disconnect This Device
        </LoadingButton>
      </DialogActions>
    </div>
  )
}