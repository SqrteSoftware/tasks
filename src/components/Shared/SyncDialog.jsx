import React, { useState } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';
import LoadingButton from './LoadingButton';
import Button from '@material-ui/core/Button';
import { TextField } from '@material-ui/core';

import {onClick} from '../../utils/stripe';
import {handleExistingLicense} from '../../utils/license';
import { deleteLocalKeys } from '../../utils/crypto';



const styles = (theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
});

const DialogTitle = withStyles(styles)((props) => {
  const { children, classes, onClose, ...other } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
});

const DialogContent = withStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}))(MuiDialogContent);

const DialogActions = withStyles((theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(1),
  },
}))(MuiDialogActions);

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
      <DialogTitle id="customized-dialog-title" onClose={props.onClose}>
        Sync Your Data
      </DialogTitle>
      <DialogContent dividers>
        <Typography gutterBottom>
          Subscribe to sync your data across devices.
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
      <DialogTitle id="customized-dialog-title" onClose={props.onClose}>
        Sync Your Data
      </DialogTitle>
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
      <DialogTitle id="customized-dialog-title" onClose={props.onClose}>
        Your Subscription
      </DialogTitle>
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