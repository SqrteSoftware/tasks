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


export default function SyncDialog(props) {
  const [screen, setScreen] = React.useState('intro');

  if (!props.open) {
    // Don't render anything if dialog is closed.
    // This helps make sure that the Existing License screen is
    // always unmounted when closed and sensitive state is destroyed.
    return (null);
  }

  const onClose = e => {
    // Reset to intro screen when closing dialog.
    setScreen('intro');
    props.onClose(e);
  }

  let content = null;
  if (props.user.id !== null) {
    content = <ConnectedBody {...props} onClose={onClose} setScreen={setScreen} onDisconnect={props.onDeleteUserId}/>
  }
  else if (screen === 'intro') {
    content = <IntroBody {...props} onClose={onClose} setScreen={setScreen}/>;
  }
  else if (screen === 'existing') {
    content = <ExistingLicenseBody {...props} onClose={onClose} setScreen={setScreen}/>
  }

  return (
    <div>
      <Dialog onClose={onClose} aria-labelledby="customized-dialog-title" open={props.open}>
        { content }
      </Dialog>
    </div>
  );
}


function IntroBody(props) {
  return (
    <div>
      <CustDialogTitle id="customized-dialog-title" onClose={props.onClose}>
        Sync Subscription
      </CustDialogTitle>
      <DialogContent dividers>
        <Typography gutterBottom>
          Sync your tasks across multiple devices by subscribing
          to a synchronization plan for only $1/mo. The text of your
          tasks is encrypted end-to-end so your tasks remain safe and
          readable only by you. You can cancel your plan anytime by visiting
          the <a href="https://billing.stripe.com/p/login/5kA15M0IN5sV8ko7ss" target='_blank'>customer portal</a>.
        </Typography>
        <Typography gutterBottom>
          <i>Got questions? Contact us at:</i> <br/>support@sqrte.com
        </Typography>
        <Typography variant="body2" color="text.disabled" sx={{'maxWidth': '350px'}}>
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
        <Typography gutterBottom>
          <br/>
          <i>Got questions? Contact us anytime:</i> <br/>support@sqrte.com
        </Typography>
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
        Sync Subscription Status
      </CustDialogTitle>
      <DialogContent dividers>
        <Typography gutterBottom>
          You are currently connected and syncing your data.
          <br/><br/>
          You can disconnect <i>this device</i> by clicking 'Disconnect' below. You can connect
          again by entering your existing license key again. Disconnecting does NOT cancel your subscription.
          <br/><br/>
          If you wish to <i>cancel your subscription</i>, please visit the <a href="https://billing.stripe.com/p/login/5kA15M0IN5sV8ko7ss" target='_blank'>customer portal</a>.
          <br/><br/>
          If you have any questions, please contact us at:<br/>
          support@sqrte.com
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