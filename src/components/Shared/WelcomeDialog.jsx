import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useDispatch, useSelector } from 'react-redux';
import { closeDialog } from '../../slices/dialogsSlice';
import shareIcon from '../../images/shareicon.png'
import {
    enablePersistence,
    getRequiredPersistenceAction,
    INSTALL_TO_HOME,
    INSTALL_TO_DOCK,
    ENABLE_NOTIFICATIONS,
    ENABLE_PERSISTENCE,
    UNKNOWN
} from '../../utils/persistence';


export default function WelcomeDialog(props) {
    const dialogOpen = useSelector((state) => state.dialogs.activeDialog === 'welcome')

    return (
        <div>
            <Dialog aria-labelledby="customized-dialog-title" open={dialogOpen}>
                <DialogTitle id="customized-dialog-title">
                    Welcome to Sqrte Tasks!
                </DialogTitle>
                <DialogContent dividers>
                    <Typography gutterBottom>
                        We hope you enjoy this fresh take on how to keep your tasks organized.
                    </Typography>

                    <h4>Important Instructions:</h4>

                    <ul className='listPad'>
                        <Li>
                            Don't clear your browser's cookies or cache without saving your
                            tasks first or <i>you will lose your data!</i>
                        </Li>
                        {PersistenceInstructions()}
                    </ul>

                </DialogContent>

                <ActionButton />

            </Dialog>
        </div>
    );
}


function PersistenceInstructions(props) {
    let action = getRequiredPersistenceAction()

    let imgStyle = {width: '35px', height: '35px', position: 'relative', top: "10px"}
    let nestedOlStyle = {position: 'relative', top: '-15px'}
    let parentLiStyle = {listStyle: 'none', padding: '0px'}

    if (action === INSTALL_TO_HOME) {
        return (
            <>
                <Li>For iOS, you must install the web app. Follow these steps:</Li>
                <Li style={parentLiStyle}>
                    <ol style={nestedOlStyle}>
                        <Li>
                            Click the share button: <img src={shareIcon} style={imgStyle} alt={"Share Button"}/>

                        </Li>
                        <Li>Click "Add to Home Screen"</Li>
                        <Li>Open the app from your Home Screen</Li>
                    </ol>
                </Li>
            </>
        )
    }
    else if (action === INSTALL_TO_DOCK) {
        return (
            <>
                <Li>For Safari, you must install the web app. Follow these steps:</Li>
                <Li style={parentLiStyle}>
                    <ol style={nestedOlStyle}>
                        <Li>
                            Click the share button: <img src={shareIcon} style={imgStyle} alt={"Share Button"}/>
                        </Li>
                        <Li>Click "Add to Dock"</Li>
                        <Li>Open the app from the dock</Li>
                    </ol>
                </Li>
            </>
        )
    }
    else if (action === ENABLE_NOTIFICATIONS) {
        return (
            <Li>
                You must enable notifications for this app to function properly.
                To enable, click the button below and accept the browser's prompt.
            </Li>
        )
    }
    else if (action === ENABLE_PERSISTENCE) {
        return (
            <Li>
                You must enable persistence for this app to function properly.
                Please click the button below and accept the browser's prompt.
            </Li>
        )
    }
    else if (action === UNKNOWN) {
        return (
            <Li>
                You must enable persistence for this app to function properly.
                Please click the button below and accept any prompts from the browser.
            </Li>
        )
    }

}


function ActionButton(props) {
    let dispatch = useDispatch()

    async function handleEnablePersistence() {
        let persistenceEnabled = await enablePersistence()
        if (persistenceEnabled) {
            dispatch(closeDialog())
        }
    }

    let action = getRequiredPersistenceAction()

    let msg = null
    if (action === ENABLE_NOTIFICATIONS) {
        msg = "Enable Notifications"
    }
    else if (action === ENABLE_PERSISTENCE) {
        msg = "Enable Persistence"
    }
    else if (action === UNKNOWN) {
        msg = "Enable Persistence"
    }
    else {
        return null
    }

    return (
        <DialogActions>
            <Button variant="contained" color="primary" onClick={handleEnablePersistence}>
                {msg}
            </Button>
        </DialogActions>
    )
}


function Li(props) {
    let style = {
        padding: '5px',
        ...props.style
    }
    return <li style={style}>{props.children}</li>
}