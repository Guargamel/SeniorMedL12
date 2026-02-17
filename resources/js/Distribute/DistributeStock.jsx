import React, { useState, useEffect } from "react";
import { apiFetch } from "../utils/api";  // Adjust if the path is wrong
import Select from "react-select";


export default function DistributeStock() {
    const [selectedSenior, setSelectedSenior] = useState(null);
    const [selectedMedicine, setSelectedMedicine] = useState(null);
    const [quantity, setQuantity] = useState('');
    const [notes, setNotes] = useState('');
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const [seniors, setSeniors] = useState([]);
    const [medicines, setMedicines] = useState([]);
    const [loadingSeniors, setLoadingSeniors] = useState(true);
    const [loadingMedicines, setLoadingMedicines] = useState(true);
    const [distributing, setDistributing] = useState(false);

    // Load seniors and medicines on mount
    useEffect(() => {
        loadSeniors();
        loadMedicines();
    }, []);

    const loadSeniors = async () => {
        setLoadingSeniors(true);
        try {
            let data;
            try {
                data = await apiFetch('/api/seniors');
            } catch {
                data = await apiFetch('/api/users/autocomplete-email?search=');
            }

            const seniorList = Array.isArray(data) ? data : (data.data || []);
            const seniorOptions = seniorList.map(senior => ({
                value: senior.id,
                label: `${senior.name} (${senior.email})`,
                email: senior.email,
                name: senior.name
            }));
            setSeniors(seniorOptions);
        } catch (err) {
            console.error('Failed to load seniors:', err);
            setError('Failed to load senior citizens list');
        } finally {
            setLoadingSeniors(false);
        }
    };

    const loadMedicines = async () => {
        setLoadingMedicines(true);
        try {
            const data = await apiFetch('/api/medicines');
            const medicineList = Array.isArray(data) ? data : [];
            const medicineOptions = medicineList.map(med => ({
                value: med.id,
                label: `${med.generic_name}${med.brand_name ? ` (${med.brand_name})` : ''} - ${med.strength || ''}`,
                stock: med.quantity || med.batches_sum_quantity || 0,  // Adjust for stock
                name: med.generic_name,
                unit: med.unit || 'units'
            }));
            setMedicines(medicineOptions);
        } catch (err) {
            console.error('Failed to load medicines:', err);
            setError('Failed to load medicines list');
        } finally {
            setLoadingMedicines(false);
        }
    };

    const handleDistribution = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        if (!selectedSenior) {
            setError('Please select a senior citizen');
            return;
        }

        if (!selectedMedicine) {
            setError('Please select a medicine');
            return;
        }

        if (!quantity || quantity <= 0) {
            setError('Please enter a valid quantity');
            return;
        }

        if (quantity > selectedMedicine.stock) {
            setError(`Quantity exceeds available stock (${selectedMedicine.stock} ${selectedMedicine.unit})`);
            return;
        }

        setDistributing(true);

        try {
            await apiFetch("/api/distributions", {
                method: "POST",
                body: JSON.stringify({
                    user_id: selectedSenior.value,
                    email: selectedSenior.email,
                    medicine_id: selectedMedicine.value,
                    quantity: parseInt(quantity),  // Ensure quantity is an integer
                    notes: notes || null           // Optional notes
                })
            });

            console.log("Quantity being sent:", quantity);
            console.log("Medicine ID:", selectedMedicine?.value);  // Optional chaining to prevent errors if undefined
            console.log("Selected Senior Email:", selectedSenior?.email);  // Optional chaining


            setSuccessMessage(`Successfully distributed ${quantity} ${selectedMedicine.unit} of ${selectedMedicine.name} to ${selectedSenior.name}`);

            // Reset form
            setSelectedSenior(null);
            setSelectedMedicine(null);
            setQuantity('');
            setNotes('');

            // Reload medicines to update stock
            loadMedicines();
        } catch (err) {
            const errorMsg = err?.data?.message || err?.message || 'Failed to distribute stock';
            setError(errorMsg);
            console.error('Distribution error:', err);
        } finally {
            setDistributing(false);
        }
    };

    // Update the quantity input with available stock when a medicine is selected
    useEffect(() => {
        if (selectedMedicine) {
            setQuantity('');
        }
    }, [selectedMedicine]);

    return (
        <div className="mc-card">
            <div className="mc-card-header">
                <h2 className="mc-card-title">Distribute Medicine</h2>
            </div>

            <div className="mc-card-body">
                {error && (
                    <div className="alert alert-danger" style={{ marginBottom: 20 }}>
                        {error}
                    </div>
                )}

                {successMessage && (
                    <div className="alert alert-success" style={{ marginBottom: 20 }}>
                        {successMessage}
                    </div>
                )}

                <form onSubmit={handleDistribution}>
                    <div style={{ marginBottom: 20 }}>
                        <label className="form-label" style={{ fontSize: 12, fontWeight: 800, marginBottom: 6 }}>
                            Senior Citizen *
                        </label>
                        <Select
                            value={selectedSenior}
                            onChange={setSelectedSenior}
                            options={seniors}
                            isLoading={loadingSeniors}
                            placeholder={loadingSeniors ? "Loading seniors..." : "Search by name or email"}
                            isClearable
                            isSearchable
                            noOptionsMessage={() => seniors.length === 0 ? "No senior citizens found. Please register seniors first." : "No match found"}
                        />
                    </div>

                    <div style={{ marginBottom: 20 }}>
                        <label className="form-label" style={{ fontSize: 12, fontWeight: 800, marginBottom: 6 }}>
                            Medicine *
                        </label>
                        <Select
                            value={selectedMedicine}
                            onChange={setSelectedMedicine}
                            options={medicines}
                            isLoading={loadingMedicines}
                            placeholder={loadingMedicines ? "Loading medicines..." : "Search by name"}
                            isClearable
                            isSearchable
                            getOptionLabel={(option) => `${option.label} (Stock: ${option.stock} ${option.unit})`}
                            noOptionsMessage={() => medicines.length === 0 ? "No medicines found. Please add medicines first." : "No match found"}
                        />
                        {selectedMedicine && (
                            <div style={{ fontSize: 11, color: selectedMedicine.stock > 10 ? 'var(--mc-muted)' : '#c0392b', marginTop: 4 }}>
                                Available stock: {selectedMedicine.stock} {selectedMedicine.unit}
                                {selectedMedicine.stock <= 10 && ' ⚠️ Low stock!'}
                            </div>
                        )}
                    </div>

                    <div style={{ marginBottom: 20 }}>
                        <label className="form-label" style={{ fontSize: 12, fontWeight: 800, marginBottom: 6 }}>
                            Quantity *
                        </label>
                        <input
                            type="number"
                            className="form-control"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            min="1"
                            max={selectedMedicine?.stock || 999999}
                            placeholder="Enter quantity"
                            required
                        />
                    </div>

                    <div style={{ marginBottom: 20 }}>
                        <label className="form-label" style={{ fontSize: 12, fontWeight: 800, marginBottom: 6 }}>
                            Notes (Optional)
                        </label>
                        <textarea
                            className="form-control"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            placeholder="Add any notes about this distribution..."
                        />
                    </div>

                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => {
                                setSelectedSenior(null);
                                setSelectedMedicine(null);
                                setQuantity('');
                                setNotes('');
                                setError(null);
                                setSuccessMessage(null);
                            }}
                            disabled={distributing}
                        >
                            Clear Form
                        </button>
                        <button
                            type="submit"
                            className="btn btn-success"
                            disabled={!selectedSenior || !selectedMedicine || !quantity || distributing}
                        >
                            {distributing ? 'Distributing...' : 'Distribute Medicine'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
