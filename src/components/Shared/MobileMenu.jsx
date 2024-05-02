import React from "react";

import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";

import NoteAddOutlined from "@mui/icons-material/NoteAddOutlined";
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import Sync from "@mui/icons-material/Sync";
import RefreshIcon from '@mui/icons-material/Refresh';

import { Box } from "@mui/system";
import { refresh } from "../../utils/refresh";


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

    function handleCollapseAllClick(e) {
        props.onCollapseAll();
        props.onClose(e);
    }

    function handleExpandAllClick(e) {
        props.onExpandAll();
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

                    <ListItem button key="CollapseAll" onClick={handleCollapseAllClick}>
                        <ListItemIcon>
                            <UnfoldLessIcon/>
                        </ListItemIcon>
                        <ListItemText primary="Collapse All" />
                    </ListItem>

                    <ListItem button key="ExpandAll" onClick={handleExpandAllClick}>
                        <ListItemIcon>
                            <UnfoldMoreIcon/>
                        </ListItemIcon>
                        <ListItemText primary="Expand All" />
                    </ListItem>

                    { navigator.standalone &&
                    <ListItem button key="Refresh" onClick={refresh}>
                        <ListItemIcon>
                            <RefreshIcon fontSize="inherit"/>
                        </ListItemIcon>
                        <ListItemText primary="Refresh" />
                    </ListItem>
                    }

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
