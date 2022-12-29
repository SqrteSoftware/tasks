import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { persistenceCheck } from '../../utils/persistence';


export default function WelcomeDialog(props) {

    const onClose = () => {
      props.onClose();
      persistenceCheck();
    };

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

            <h4>Important Instructions to Prevent Data Loss</h4>

            <Typography gutterBottom>
                Your data is stored locally within your browser. If you
                clear your browser's cookies or cache, <i>you will lose your data
                unless you save a copy</i> of it first by clilcking the save button.
            </Typography>

            <Typography gutterBottom>
                Persistent Storage is required to prevent your browser
                from deleting your local data. Depending on your browser
                you will be prompted to grant permission to use Notifications
                or Persistent Storage to allow this.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
                variant="contained"
                color="primary"
                onClick={onClose}
            >
            I Understand
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
