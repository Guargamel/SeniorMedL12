// resources/js/Pages/Notifications.jsx

import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';
import AlertBanner from '../Components/AlertBanner';
import "../../css/style.css";

const Notifications = () => {
    const [notifications, setNotifications] = useState({
        expiring_medicines: [],
        low_stock_medicines: [],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchNotifications() {
            try {
                // Use the same endpoint as Dashboard alerts
                const response = await apiFetch('/api/dashboard/alerts');
                setNotifications({
                    expiring_medicines: response.expiring_medicines || [],
                    low_stock_medicines: response.low_stock_medicines || []
                });
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
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-gray-300 border-t-blue-600 mb-3"></div>
                    <p className="text-gray-600 font-medium">Loading notifications...</p>
                </div>
            </div>
        );
    }

    const totalNotifications = notifications.expiring_medicines.length + notifications.low_stock_medicines.length;
    const getDaysUntilExpiry = (expiryDate) => {
        const today = new Date();
        const expiry = new Date(expiryDate);
        const diffTime = expiry - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Alert Banner */}
                <AlertBanner />

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
                    <p className="text-gray-600">
                        {totalNotifications > 0
                            ? `You have ${totalNotifications} active notification${totalNotifications > 1 ? 's' : ''}`
                            : 'No active notifications'}
                    </p>
                </div>

                {totalNotifications === 0 ? (
                    <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                        <p className="text-gray-500 text-lg">No notifications at this time.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {/* Expiring Medicines */}
                        {notifications.expiring_medicines.map((medicine) => {
                            const daysLeft = getDaysUntilExpiry(medicine.expiry_date);
                            return (
                                <div
                                    key={`expiring-${medicine.id}`}
                                    className="bg-white border-l-4 border-amber-500 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                                >
                                    <div className="p-5 flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex-shrink-0">
                                                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {medicine.generic_name}
                                                </h3>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Expires on {new Date(medicine.expiry_date).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                    {daysLeft > 0 && (
                                                        <span className="ml-2 text-amber-600 font-medium">
                                                            ({daysLeft} day{daysLeft !== 1 ? 's' : ''} left)
                                                        </span>
                                                    )}
                                                    {daysLeft <= 0 && (
                                                        <span className="ml-2 text-red-600 font-medium">
                                                            (Expired)
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex-shrink-0">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
                                                Expiring Soon
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Low Stock Medicines */}
                        {notifications.low_stock_medicines.map((medicine) => (
                            <div
                                key={`low-stock-${medicine.id}`}
                                className="bg-white border-l-4 border-red-500 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                            >
                                <div className="p-5 flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex-shrink-0">
                                            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {medicine.generic_name}
                                            </h3>
                                            <p className="text-sm text-gray-600 mt-1">
                                                Only <span className="font-semibold text-red-600">{medicine.quantity} units</span> remaining in stock
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                                            Low Stock
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
