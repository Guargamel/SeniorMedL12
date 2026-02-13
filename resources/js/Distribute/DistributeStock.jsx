import React, { useState, useEffect } from "react";
import { apiFetch } from "../utils/api";  // Ensure this path is correct
import Select from "react-select"; // Import react-select

export default function DistributeStock() {
    const [email, setEmail] = useState('');
    const [userId, setUserId] = useState(null);
    const [medicineId, setMedicineId] = useState('');
    const [quantity, setQuantity] = useState('');
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [emailSuggestions, setEmailSuggestions] = useState([]);

    // Fetch email suggestions based on user input
    useEffect(() => {
        if (email.length >= 3) { // Trigger search after 3 characters typed
            apiFetch(`/api/users/autocomplete-email?email=${email}`)
                .then((data) => {
                    setEmailSuggestions(data.map(user => ({
                        label: user.email,  // Display email
                        value: user.id,     // Use user ID to link back
                        name: user.name     // Store the user's name for display
                    })));
                })
                .catch((err) => {
                    setError('Failed to fetch user suggestions');
                });
        } else {
            setEmailSuggestions([]);
        }
    }, [email]);

    const handleEmailChange = (selectedOption) => {
        setEmail(selectedOption ? selectedOption.label : '');
        setUserId(selectedOption ? selectedOption.value : null);
    };

    const handleDistribution = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        try {
            const response = await apiFetch('/api/distributions', {
                method: 'POST',
                body: JSON.stringify({ email, user_id: userId, medicine_id: medicineId, quantity }),
            });

            setSuccessMessage('Stock distributed successfully!');
            setEmail('');
            setUserId(null);
            setMedicineId('');
            setQuantity('');
        } catch (err) {
            setError('Failed to distribute stock');
        }
    };

    return (
        <div className="container mt-4">
            <h2>Distribute Stock</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            {successMessage && <div className="alert alert-success">{successMessage}</div>}

            <form onSubmit={handleDistribution}>
                <div className="mb-3">
                    <label className="form-label">User Email</label>
                    <Select
                        value={emailSuggestions.find(option => option.value === userId)}
                        onChange={handleEmailChange}
                        options={emailSuggestions}
                        getOptionLabel={(e) => `${e.name} (${e.label})`} // Format option display
                        placeholder="Search by email"
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Medicine</label>
                    <input
                        type="number"
                        className="form-control"
                        value={medicineId}
                        onChange={(e) => setMedicineId(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Quantity</label>
                    <input
                        type="number"
                        className="form-control"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary">Distribute</button>
            </form>
        </div>
    );
}
