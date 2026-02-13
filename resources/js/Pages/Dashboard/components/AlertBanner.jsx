import React from "react";

export default function AlertBanner() {
    return (
        <div className="mc-alert">
            <div style={{ fontSize: 16 }}>⚠️</div>
            <div>
                <h4>Low Stock Alert</h4>
                <p>Losartan 50mg and Aspirin 80mg are running low. Consider restocking soon.</p>
            </div>
        </div>
    );
}
