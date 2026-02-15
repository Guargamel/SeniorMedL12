import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api'; // Assuming this utility helps with API calls
import { Link } from 'react-router-dom'; // To create links to the medicine request detail page
import "../../css/style.css";

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUnapprovedRequests() {
            try {
                // Fetching only unapproved requests from the backend
                const response = await apiFetch('/api/notifications/unapproved');
                setNotifications(response.notifications || []); // The backend response contains the unapproved requests
            } catch (error) {
                console.error('Error fetching notifications:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchUnapprovedRequests();
    }, []);

    const handleApprove = async (requestId) => {
        try {
            // Make an API request to approve the medicine request
            const response = await apiFetch(`/api/notifications/approve/${requestId}`, { method: 'POST' });
            console.log(response.message);
            // Reload notifications or update state to reflect change
            setNotifications(notifications.filter((notification) => notification.id !== requestId));
        } catch (error) {
            console.error('Error approving request:', error);
        }
    };

    const handleDecline = async (requestId) => {
        try {
            // Make an API request to decline the medicine request
            const response = await apiFetch(`/api/notifications/decline/${requestId}`, { method: 'POST' });
            console.log(response.message);
            // Reload notifications or update state to reflect change
            setNotifications(notifications.filter((notification) => notification.id !== requestId));
        } catch (error) {
            console.error('Error declining request:', error);
        }
    };

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

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Unapproved Medicine Requests</h1>
                    <p className="text-gray-600">
                        {notifications.length > 0 ? `You have ${notifications.length} unapproved request${notifications.length > 1 ? 's' : ''}` : 'No unapproved requests'}
                    </p>
                </div>

                {notifications.length === 0 ? (
                    <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                        <p className="text-gray-500 text-lg">No unapproved requests at this time.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {notifications.map((notification) => (
                            <div key={notification.id} className="bg-white border-l-4 border-blue-500 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                                <div className="p-5 flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex-shrink-0">
                                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                                {/* Medicine Request Icon */}
                                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6H6L10 4M12 14V6m3 4V6m6 12V6M12 14V6" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">{notification.medicine_name} - {notification.quantity} units</h3>
                                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                                        </div>
                                    </div>
                                    <div className="flex-shrink-0">
                                        {/* Action buttons for approval */}
                                        <button
                                            onClick={() => handleApprove(notification.id)}
                                            className="btn btn-success approve-btn"  // Apply the custom class here
                                            style={{ color: 'black' }}  // Set text color to black
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleDecline(notification.id)}
                                            className="btn btn-danger decline-btn"  // Apply the custom class here
                                            style={{ color: 'black' }}  // Set text color to black
                                        >
                                            Decline
                                        </button>
                                        <Link
                                            to={`/medicine-requests/${notification.id}`}
                                            className="text-blue-500 ml-2"
                                        >
                                            View Request
                                        </Link>
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
