import React from "react";

import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemIcon from "@material-ui/core/ListItemIcon";

import NoteAddOutlined from "@material-ui/icons/NoteAddOutlined";
import SaveAltOutlined from "@material-ui/icons/SaveAltOutlined";
import OpenInBrowserOutlined from "@material-ui/icons/OpenInBrowserOutlined";

import { makeStyles } from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";


const useStyles = makeStyles(theme => ({
    drawerPaper: {
        width: 200
    },
}));

export default function MobileMenu(props) {
    const classes = useStyles();

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
            classes={{paper: classes.drawerPaper}}
            ModalProps={{keepMounted: true}}
        >
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
        </Drawer>
    );
}
