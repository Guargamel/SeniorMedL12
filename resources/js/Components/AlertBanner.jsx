import React, { useState, useEffect } from "react";
import { apiFetch } from "../utils/api";
import "../../css/style.css";

export default function AlertBanner() {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        async function fetchAlerts() {
            try {
                const response = await apiFetch('/api/notifications');
                const notifications = response.data;
                
                // Convert notifications to alert format
                const alertList = [];

                // Add expiring medicines alerts
                notifications.expiring_medicines.forEach(medicine => {
                    const daysLeft = getDaysUntilExpiry(medicine.expiry_date);
                    alertList.push({
                        icon: "⏰",
                        title: "Expiring Medicine",
                        message: `${medicine.generic_name} will expire in ${daysLeft} day${daysLeft !== 1 ? 's' : ''} (${new Date(medicine.expiry_date).toLocaleDateString()})`,
                        type: "expiring"
                    });
                });

                // Add low stock alerts
                notifications.low_stock_medicines.forEach(medicine => {
                    alertList.push({
                        icon: "📦",
                        title: "Out of stock medicines",
                        message: `${medicine.generic_name} - Only ${medicine.quantity} unit${medicine.quantity !== 1 ? 's' : ''} remaining in stock.`,
                        type: "low_stock"
                    });
                });

                setAlerts(alertList);
            } catch (error) {
                console.error('Error fetching alerts:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchAlerts();
    }, []);

    // Auto-rotate alerts every 5 seconds
    useEffect(() => {
        if (alerts.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % alerts.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [alerts.length]);

    const getDaysUntilExpiry = (expiryDate) => {
        const today = new Date();
        const expiry = new Date(expiryDate);
        const diffTime = expiry - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    if (loading || alerts.length === 0) return null;

    const currentAlert = alerts[currentIndex];

    return (
        <div className="mc-alert" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '16px 20px',
            backgroundColor: currentAlert.type === 'expiring' ? '#FEF3C7' : '#FEE2E2',
            border: `1px solid ${currentAlert.type === 'expiring' ? '#F59E0B' : '#EF4444'}`,
            borderRadius: '8px',
            marginBottom: '20px'
        }}>
            <div style={{ fontSize: 24, flexShrink: 0 }}>
                {currentAlert.icon}
            </div>
            <div style={{ flex: 1 }}>
                <h4 style={{ 
                    margin: 0, 
                    fontSize: '16px', 
                    fontWeight: 600,
                    color: '#1F2937',
                    marginBottom: '4px'
                }}>
                    {currentAlert.title}
                </h4>
                <p style={{ 
                    margin: 0, 
                    fontSize: '14px',
                    color: '#4B5563'
                }}>
                    {currentAlert.message}
                </p>
            </div>
            {alerts.length > 1 && (
                <div style={{ 
                    fontSize: '12px', 
                    color: '#6B7280',
                    flexShrink: 0 
                }}>
                    {currentIndex + 1} / {alerts.length}
                </div>
            )}
        </div>
    );
}
