import React from "react";

import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";

import NoteAddOutlined from "@mui/icons-material/NoteAddOutlined";
import SaveAltOutlined from "@mui/icons-material/SaveAltOutlined";
import OpenInBrowserOutlined from "@mui/icons-material/OpenInBrowserOutlined";

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
                            <SaveAltOutlined/>
                        </ListItemIcon>
                        <ListItemText primary="Export" />
                    </ListItem>

                    <input id="fileUploadInput" type="file" style={{display: 'none'}} onChange={props.onImportData}/>
                    <label htmlFor="fileUploadInput">
                    <ListItem button key="Import" onClick={handleImportClick}>
                        <ListItemIcon component="span">
                            <OpenInBrowserOutlined/>
                        </ListItemIcon>
                        <ListItemText primary="Import" />
                    </ListItem>
                    </label>
                </List>
            </Box>
        </Drawer>

    );
}
