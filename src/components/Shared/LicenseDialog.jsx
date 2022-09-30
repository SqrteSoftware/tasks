import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';


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

export default function LicenseDialog(props) {
  return (
    <div>
      <Dialog onClose={props.onClose} aria-labelledby="customized-dialog-title" open={props.open}>
        <CustDialogTitle id="customized-dialog-title" onClose={props.onClose}>
          Your License Key
        </CustDialogTitle>
        <DialogContent dividers>
          <Typography gutterBottom>
            Save your license key and a bunch of other stuff you should know about.
            Keep it secret, keep it safe:
          </Typography>
          <Typography style={{"display": "flex", "justifyContent": "center"}}>
            <code style={{"backgroundColor":"lightgrey", "padding": "10px", "borderRadius": "5px"}}>
              {props.licenseKey ? props.licenseKey : "Generating License..."}
            </code>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="primary"
            onClick={props.onClose}
          >
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}