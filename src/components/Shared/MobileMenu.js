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


const useStyles = makeStyles(theme => ({
    drawerPaper: {
        width: 200
    },
}));

export default function MobileMenu(props) {
    const classes = useStyles();
    const [mobileOpen, setMobileOpen] = React.useState(true);

    function handleDrawerToggle() {
        setMobileOpen(!mobileOpen);
    }

    return (
        <Drawer
            variant="temporary"
            anchor="right"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            classes={{
                paper: classes.drawerPaper
            }}
            ModalProps={{
                keepMounted: true // Better open performance on mobile.
            }}
        >
            <List>
                <ListItem button key="NewList">
                    <ListItemIcon>
                        <NoteAddOutlined/>
                    </ListItemIcon>
                    <ListItemText primary="New List" />
                </ListItem>
                <ListItem button key="Export">
                    <ListItemIcon>
                        <SaveAltOutlined/>
                    </ListItemIcon>
                    <ListItemText primary="Export" />
                </ListItem>
                <ListItem button key="Import">
                    <ListItemIcon>
                        <OpenInBrowserOutlined/>
                    </ListItemIcon>
                    <ListItemText primary="Import" />
                </ListItem>
            </List>
        </Drawer>
    );
}
