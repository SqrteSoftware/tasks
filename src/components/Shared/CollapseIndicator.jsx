import React from "react";

export function CollapseIndicator({expanded, children=[]}) {
    return (
        <div className="collapseIndicator">
            <span className="collapseIndicatorToggle">
                {expanded ? '-' : '+'}
            </span>
            <span className="collapseIndicatorText">
                {children}
            </span>
        </div>
    );
}