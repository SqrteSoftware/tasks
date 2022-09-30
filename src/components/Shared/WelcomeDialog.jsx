import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';


export default function WelcomeDialog(props) {
    return (
      <div>
        <Dialog onClose={props.onClose} aria-labelledby="customized-dialog-title" open={props.open}>
          <DialogTitle id="customized-dialog-title" onClose={props.onClose}>
            Welcome to Sqrte Tasks!
          </DialogTitle>
          <DialogContent dividers>
            <Typography gutterBottom>
                We hope you enjoy this fresh take on how to keep your tasks organized.
            </Typography>

            <h4>IMPORTANT: Prevent Data Loss</h4>

            <Typography gutterBottom>
                Sqrte Tasks stores your data locally within your browser. If you
                ever need to reset/clear your browser's cookies or cache, <b>you may
                lose your data if you do not save it first! </b>
                Please save your data periodically by clicking the save button.
            </Typography>

            <Typography gutterBottom>
                Sqrte Tasks will also request that your browser use
                protected 'persistent storage' to help prevent accidental deletion
                of your data. If prompted, please accept.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
                variant="contained"
                color="primary"
                onClick={props.onClose}
            >
            I Understand
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
