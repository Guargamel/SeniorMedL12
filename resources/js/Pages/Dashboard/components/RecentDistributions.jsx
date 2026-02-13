import React from "react";

export default function RecentDistributions({ rows }) {
    return (
        <div className="mc-card">
            <div className="mc-card-header">
                <h2 className="mc-card-title">Recent Distributions</h2>
                <button className="btn btn-sm btn-outline-secondary">View All</button>
            </div>

            <div className="mc-card-body">
                <table className="mc-table">
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Senior Citizen</th>
                            <th>Medicine</th>
                            <th>Quantity</th>
                            <th>Status</th>
                        </tr>
                    </thead>

                    <tbody>
                        {rows.map((d) => (
                            <tr key={d.id}>
                                <td>{d.time}</td>
                                <td><strong>{d.name}</strong></td>
                                <td>{d.medicine}</td>
                                <td>{d.quantity}</td>
                                <td><span className="mc-pill">✓ Completed</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
