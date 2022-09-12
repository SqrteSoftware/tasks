import React from "react";

import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";

import NoteAddOutlined from "@mui/icons-material/NoteAddOutlined";
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import Sync from "@mui/icons-material/Sync";

import { Box } from "@mui/system";


export default function MobileMenu(props) {

    function handleAddListClick(e) {
        props.onAddList(e);
        props.onClose(e);
    }

    function handleExportClick(e) {
        props.onExportData(e);
        props.onClose(e);
    }

    function handleImportClick(e) {
        props.onImportData(e);
        props.onClose(e);
    }

    function handleSyncClick(e) {
        props.onSyncData(e);
        props.onClose(e);
    }

    return (
        <Drawer
            variant="temporary"
            anchor="right"
            open={props.open}
            onClose={props.onClose}
            ModalProps={{keepMounted: true}}
        >
            <Box sx={{ width: 200 }} role="presentation">
                <List>
                    <ListItem button key="NewList" onClick={handleAddListClick}>
                        <ListItemIcon>
                            <NoteAddOutlined/>
                        </ListItemIcon>
                        <ListItemText primary="New List" />
                    </ListItem>

                    <ListItem button key="Export" onClick={handleExportClick}>
                        <ListItemIcon>
                            <SaveOutlinedIcon/>
                        </ListItemIcon>
                        <ListItemText primary="Save" />
                    </ListItem>

                    <input id="fileUploadInput" type="file" style={{display: 'none'}} onChange={props.onImportData}/>
                    <label htmlFor="fileUploadInput">
                    <ListItem button key="Import" onClick={handleImportClick}>
                        <ListItemIcon component="span">
                            <FolderOpenOutlinedIcon/>
                        </ListItemIcon>
                        <ListItemText primary="Open" />
                    </ListItem>
                    </label>

                    <ListItem button key="Sync" onClick={handleSyncClick}>
                        <ListItemIcon>
                            <Sync fontSize="inherit"/>
                        </ListItemIcon>
                        <ListItemText primary="Sync" />
                    </ListItem>
                </List>
            </Box>
        </Drawer>

    );
}
