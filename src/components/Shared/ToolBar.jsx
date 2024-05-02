import React from "react";

import logo from "../../images/braindump90.png";
import IconButton from "@mui/material/IconButton";
import NoteAddOutlined from "@mui/icons-material/NoteAddOutlined";
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import MenuIcon from "@mui/icons-material/Menu";
import Sync from "@mui/icons-material/Sync";
import RefreshIcon from '@mui/icons-material/Refresh';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import { refresh } from "../../utils/refresh";


export default function ToolBar(props) {
    return (
        <div className="sidebar">
            <a href="https://tasks.sqrte.com/info/" target="_blank" rel="noreferrer">
                <img className="logo" alt="logo" src={logo}/>
            </a>

            { props.isSyncing &&
            <Sync className={"mobileSync spin"} fontSize="inherit"/>
            }

            <div className="add iconButton" title="New List" onClick={props.onAddList}>
                <IconButton>
                    <NoteAddOutlined fontSize="inherit"/>
                </IconButton>
            </div>

            <div className="export iconButton" title="Save" onClick={props.onExportData}>
                <IconButton>
                    <SaveOutlinedIcon fontSize="inherit"/>
                </IconButton>
            </div>

            <div className="import iconButton" title="Open" onClick={props.onImportData}>
                <input id="fileUploadInput" className="importInput" type="file" onChange={props.onImportData}/>
                <label htmlFor="fileUploadInput" className="importLabel">
                    <IconButton component="span">
                        <FolderOpenOutlinedIcon fontSize="inherit"/>
                    </IconButton>
                </label>
            </div>

            <div className="collapseAll iconButton" title="Collapse All" onClick={e => props.onCollapseAll()}>
                <IconButton>
                    <UnfoldLessIcon fontSize="inherit"/>
                </IconButton>
            </div>

            <div className="expandAll iconButton" title="Expand All" onClick={e => props.onExpandAll()}>
                <IconButton>
                    <UnfoldMoreIcon fontSize="inherit"/>
                </IconButton>
            </div>

            <div className="sync iconButton" title="Sync Data" onClick={props.onSyncData}>
                <IconButton>
                    <Sync className={props.isSyncing ? "spin" : ""} fontSize="inherit"/>
                </IconButton>
            </div>

            { navigator.standalone &&
            <div className="refresh iconButton" title="Refresh" onClick={refresh}>
                <IconButton>
                    <RefreshIcon fontSize="inherit"/>
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
