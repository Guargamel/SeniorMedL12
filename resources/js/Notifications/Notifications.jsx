// resources/js/Pages/Notifications.jsx

import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api'; // Assuming you have an API utility like this
import "../../css/style.css"; // Assuming you have a CSS file for additional styling

const Notifications = () => {
    const [notifications, setNotifications] = useState({
        expiring_medicines: [],
        low_stock_medicines: [],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch notifications data from the API
        async function fetchNotifications() {
            try {
                const response = await apiFetch('/api/notifications');
                setNotifications(response.data);
            } catch (error) {
                console.error('Error fetching notifications:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchNotifications();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-10">
                <span className="text-gray-500 text-lg">Loading notifications...</span>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h2 className="text-3xl font-semibold mb-6">Notifications</h2>

            {/* Expiring Medicines Notification */}
            <div className="notification-section mb-6">
                <h3 className="text-2xl font-semibold mb-2 text-yellow-600">Expiring Medicines</h3>
                {notifications.expiring_medicines.length > 0 ? (
                    <div className="space-y-4">
                        {notifications.expiring_medicines.map((medicine) => (
                            <div
                                key={medicine.id}
                                className="flex items-center bg-yellow-100 text-yellow-800 p-4 rounded-lg shadow-lg"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    className="w-6 h-6 mr-4"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M19 11l-7 7-7-7"
                                    />
                                </svg>
                                <div>
                                    <p className="font-medium">{medicine.generic_name}</p>
                                    <p className="text-sm">Expiry Date: {medicine.expiry_date}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">No medicines are expiring soon.</p>
                )}
            </div>

            {/* Low Stock Medicines Notification */}
            <div className="notification-section">
                <h3 className="text-2xl font-semibold mb-2 text-red-600">Low Stock Medicines</h3>
                {notifications.low_stock_medicines.length > 0 ? (
                    <div className="space-y-4">
                        {notifications.low_stock_medicines.map((medicine) => (
                            <div
                                key={medicine.id}
                                className="flex items-center bg-red-100 text-red-800 p-4 rounded-lg shadow-lg"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    className="w-6 h-6 mr-4"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M12 4v16m8-8H4"
                                    />
                                </svg>
                                <div>
                                    <p className="font-medium">{medicine.generic_name}</p>
                                    <p className="text-sm">Stock: {medicine.quantity}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">No medicines are low on stock.</p>
                )}
            </div>
        </div>
    );
};

export default Notifications;
