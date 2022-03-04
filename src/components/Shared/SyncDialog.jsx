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
import {handleExistingLicense} from '../../utils/license'



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
  if (screen !== 'intro') {
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
        <LoadingButton onClick={onClick}/>
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
        <Button onClick={e => handleExistingLicense(licenseKey)} variant="contained" color="primary">
            Save
        </Button>
      </DialogActions>
    </div>
  )
}