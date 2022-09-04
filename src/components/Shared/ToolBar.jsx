import React from "react";

import logo from "../../braindump90.png";
import IconButton from "@mui/material/IconButton";
import NoteAddOutlined from "@mui/icons-material/NoteAddOutlined";
import SaveAltOutlined from "@mui/icons-material/SaveAltOutlined";
import OpenInBrowserOutlined from "@mui/icons-material/OpenInBrowserOutlined";
import Sync from "@mui/icons-material/Sync";


export default function ToolBar(props) {
    return (
        <div className="sidebar">
            <img className="logo" alt="logo" src={logo}/>

            <div className="add iconButton" title="New List" onClick={props.onAddList}>
                <IconButton>
                    <NoteAddOutlined fontSize="inherit"/>
                </IconButton>
            </div>

            <div className="export iconButton" title="Export Data" onClick={props.onExportData}>
                <IconButton>
                    <SaveAltOutlined fontSize="inherit"/>
                </IconButton>
            </div>

            <div className="import iconButton" title="Import Data" onClick={props.onImportData}>
                <input id="fileUploadInput" className="importInput" type="file" onChange={props.onImportData}/>
                <label htmlFor="fileUploadInput" className="importLabel">
                    <IconButton component="span">
                        <OpenInBrowserOutlined fontSize="inherit"/>
                    </IconButton>
                </label>
            </div>

            { localStorage.getItem('syncEnabled') === 'true' &&
            <div className="sync iconButton" title="Sync Data" onClick={props.onSyncData}>
                <IconButton>
                    <Sync fontSize="inherit"/>
                </IconButton>
            </div>
            }
            <div className="menu iconButton" title="Menu">
                <IconButton onClick={props.onMenuClick} edge="start">
                    <MenuIcon/>
                </IconButton>
            </div>
        </div>
    );
}
