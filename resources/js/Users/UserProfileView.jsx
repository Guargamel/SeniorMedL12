import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';

export default function UserProfileView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [activity, setActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        loadProfile();
        loadActivity();
    }, [id]);

    const loadProfile = async () => {
        setLoading(true);
        try {
            const data = await apiFetch(`/api/users/${id}/profile`);
            setProfile(data);
        } catch (err) {
            console.error('Failed to load profile:', err);
            alert('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const loadActivity = async () => {
        try {
            const data = await apiFetch(`/api/users/${id}/activity`);
            setActivity(data.activities || []);
        } catch (err) {
            console.error('Failed to load activity:', err);
        }
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB');
            return;
        }

        setUploadingAvatar(true);

        try {
            const formData = new FormData();
            formData.append('avatar', file);

            await apiFetch(`/api/users/${id}/avatar`, {
                method: 'POST',
                body: formData
            });

            loadProfile();
            alert('Avatar updated successfully!');
        } catch (err) {
            console.error('Failed to upload avatar:', err);
            alert('Failed to upload avatar');
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleDeleteAvatar = async () => {
        if (!confirm('Delete avatar?')) return;

        try {
            await apiFetch(`/api/users/${id}/avatar`, { method: 'DELETE' });
            loadProfile();
            alert('Avatar deleted successfully!');
        } catch (err) {
            console.error('Failed to delete avatar:', err);
            alert('Failed to delete avatar');
        }
    };

    if (loading) {
        return (
            <div className="mc-card">
                <div className="mc-card-body" style={{ padding: 60, textAlign: 'center' }}>
                    Loading profile...
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="mc-card">
                <div className="mc-card-body" style={{ padding: 60, textAlign: 'center' }}>
                    Profile not found
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="mc-card" style={{ marginBottom: 20 }}>
                <div className="mc-card-body">
                    <div style={{ display: 'flex', gap: 30, alignItems: 'start' }}>
                        {/* Avatar Section */}
                        <div style={{ flex: '0 0 auto' }}>
                            {profile.avatar_url ? (
                                <div style={{ position: 'relative' }}>
                                    <img
                                        src={profile.avatar_url}
                                        alt={profile.name}
                                        style={{
                                            width: 150,
                                            height: 150,
                                            borderRadius: 20,
                                            objectFit: 'cover',
                                            border: '4px solid var(--mc-border)'
                                        }}
                                    />
                                    <button
                                        onClick={handleDeleteAvatar}
                                        style={{
                                            position: 'absolute',
                                            top: -10,
                                            right: -10,
                                            width: 32,
                                            height: 32,
                                            borderRadius: '50%',
                                            background: '#e74c3c',
                                            color: 'white',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontSize: 16
                                        }}
                                        title="Delete avatar"
                                    >
                                        ×
                                    </button>
                                </div>
                            ) : (
                                <div
                                    style={{
                                        width: 150,
                                        height: 150,
                                        borderRadius: 20,
                                        background: 'linear-gradient(135deg, #0B6E4F 0%, #1e6f4f 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: 48,
                                        fontWeight: 800,
                                        color: 'white',
                                        border: '4px solid var(--mc-border)'
                                    }}
                                >
                                    {profile.initials}
                                </div>
                            )}
                            
                            {/* Upload Avatar Button */}
                            <label
                                style={{
                                    display: 'block',
                                    marginTop: 12,
                                    padding: '8px 16px',
                                    background: 'var(--mc-primary)',
                                    color: 'white',
                                    borderRadius: 8,
                                    textAlign: 'center',
                                    cursor: uploadingAvatar ? 'wait' : 'pointer',
                                    fontSize: 13,
                                    fontWeight: 600
                                }}
                            >
                                {uploadingAvatar ? 'Uploading...' : 'Change Avatar'}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarUpload}
                                    style={{ display: 'none' }}
                                    disabled={uploadingAvatar}
                                />
                            </label>
                        </div>

                        {/* Profile Info */}
                        <div style={{ flex: 1 }}>
                            <div style={{ marginBottom: 8 }}>
                                <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700 }}>
                                    {profile.name}
                                </h1>
                            </div>
                            
                            <div style={{ marginBottom: 16 }}>
                                <span
                                    style={{
                                        display: 'inline-block',
                                        padding: '4px 12px',
                                        background: 'var(--mc-primary)',
                                        color: 'white',
                                        borderRadius: 6,
                                        fontSize: 13,
                                        fontWeight: 600
                                    }}
                                >
                                    {profile.role_display}
                                </span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16 }}>
                                <InfoItem icon="📧" label="Email" value={profile.email} />
                                {profile.phone && <InfoItem icon="📱" label="Phone" value={profile.phone} />}
                                {profile.address && <InfoItem icon="📍" label="Address" value={profile.address} />}
                                <InfoItem icon="📅" label="Member Since" value={profile.statistics?.member_since || 'N/A'} />
                            </div>

                            {profile.bio && (
                                <div style={{ marginTop: 16, padding: 16, background: 'var(--mc-bg)', borderRadius: 10 }}>
                                    <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 4, color: 'var(--mc-muted)' }}>
                                        BIO
                                    </div>
                                    <div style={{ fontSize: 14, lineHeight: 1.6 }}>
                                        {profile.bio}
                                    </div>
                                </div>
                            )}

                            <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => navigate(`/users/${id}/edit`)}
                                >
                                    Edit Profile
                                </button>
                                <button
                                    className="btn btn-outline-secondary"
                                    onClick={() => navigate('/users')}
                                >
                                    Back to Staff List
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="mc-card" style={{ marginBottom: 20 }}>
                <div className="mc-card-body" style={{ padding: 0 }}>
                    <div style={{ display: 'flex', borderBottom: '2px solid var(--mc-border)' }}>
                        <TabButton
                            label="Overview"
                            active={activeTab === 'overview'}
                            onClick={() => setActiveTab('overview')}
                        />
                        <TabButton
                            label="Activity"
                            active={activeTab === 'activity'}
                            onClick={() => setActiveTab('activity')}
                        />
                        <TabButton
                            label="Statistics"
                            active={activeTab === 'statistics'}
                            onClick={() => setActiveTab('statistics')}
                        />
                        {profile.senior_profile && (
                            <TabButton
                                label="Senior Details"
                                active={activeTab === 'senior'}
                                onClick={() => setActiveTab('senior')}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <div className="mc-card">
                    <div className="mc-card-header">
                        <h3 className="mc-card-title">Account Information</h3>
                    </div>
                    <div className="mc-card-body">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                            <DetailRow label="Full Name" value={profile.name} />
                            <DetailRow label="Email Address" value={profile.email} />
                            <DetailRow label="Phone Number" value={profile.phone || 'Not provided'} />
                            <DetailRow label="Address" value={profile.address || 'Not provided'} />
                            <DetailRow label="Role" value={profile.role_display} />
                            <DetailRow label="Account Created" value={new Date(profile.created_at).toLocaleDateString()} />
                            <DetailRow label="Last Updated" value={new Date(profile.updated_at).toLocaleDateString()} />
                            <DetailRow 
                                label="Email Verified" 
                                value={profile.email_verified_at ? '✅ Verified' : '❌ Not verified'} 
                            />
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'activity' && (
                <div className="mc-card">
                    <div className="mc-card-header">
                        <h3 className="mc-card-title">Recent Activity</h3>
                    </div>
                    <div className="mc-card-body">
                        {activity.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: 40, color: 'var(--mc-muted)' }}>
                                No recent activity
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {activity.map((item, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            padding: 16,
                                            border: '1px solid var(--mc-border)',
                                            borderRadius: 8,
                                            borderLeft: '4px solid var(--mc-primary)'
                                        }}
                                    >
                                        <div style={{ fontSize: 14, marginBottom: 4 }}>
                                            {item.description}
                                        </div>
                                        <div style={{ fontSize: 12, color: 'var(--mc-muted)' }}>
                                            {new Date(item.date).toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'statistics' && (
                <div className="mc-card">
                    <div className="mc-card-header">
                        <h3 className="mc-card-title">Statistics</h3>
                    </div>
                    <div className="mc-card-body">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 }}>
                            <StatCard
                                title="Distributions Received"
                                value={profile.statistics?.distributions_received || 0}
                                icon="📦"
                            />
                            <StatCard
                                title="Distributions Given"
                                value={profile.statistics?.distributions_given || 0}
                                icon="🎁"
                            />
                            <StatCard
                                title="Last Distribution"
                                value={profile.statistics?.last_distribution ? new Date(profile.statistics.last_distribution).toLocaleDateString() : 'Never'}
                                icon="📅"
                            />
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'senior' && profile.senior_profile && (
                <div className="mc-card">
                    <div className="mc-card-header">
                        <h3 className="mc-card-title">Senior Citizen Details</h3>
                    </div>
                    <div className="mc-card-body">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                            <DetailRow label="Birthdate" value={profile.senior_profile.birthdate || 'Not provided'} />
                            <DetailRow label="Sex" value={profile.senior_profile.sex || 'Not provided'} />
                            <DetailRow label="Contact Number" value={profile.senior_profile.contact_no || 'Not provided'} />
                            <DetailRow label="Barangay" value={profile.senior_profile.barangay || 'Not provided'} />
                            <DetailRow label="Address" value={profile.senior_profile.address || 'Not provided'} />
                        </div>
                        {profile.senior_profile.notes && (
                            <div style={{ marginTop: 20, padding: 16, background: 'var(--mc-bg)', borderRadius: 8 }}>
                                <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 8, color: 'var(--mc-muted)' }}>
                                    NOTES
                                </div>
                                <div style={{ fontSize: 14, lineHeight: 1.6 }}>
                                    {profile.senior_profile.notes}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function InfoItem({ icon, label, value }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontSize: 24 }}>{icon}</div>
            <div>
                <div style={{ fontSize: 11, color: 'var(--mc-muted)', marginBottom: 2 }}>
                    {label}
                </div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>
                    {value}
                </div>
            </div>
        </div>
    );
}

function DetailRow({ label, value }) {
    return (
        <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--mc-muted)', marginBottom: 4 }}>
                {label}
            </div>
            <div style={{ fontSize: 14 }}>
                {value}
            </div>
        </div>
    );
}

function TabButton({ label, active, onClick }) {
    return (
        <button
            onClick={onClick}
            style={{
                flex: 1,
                padding: '16px 24px',
                background: 'transparent',
                border: 'none',
                borderBottom: active ? '2px solid var(--mc-primary)' : '2px solid transparent',
                color: active ? 'var(--mc-primary)' : 'var(--mc-muted)',
                fontWeight: active ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s'
            }}
        >
            {label}
        </button>
    );
}

function StatCard({ title, value, icon }) {
    return (
        <div
            style={{
                padding: 20,
                border: '1px solid var(--mc-border)',
                borderRadius: 12,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}
        >
            <div>
                <div style={{ fontSize: 12, color: 'var(--mc-muted)', marginBottom: 4 }}>
                    {title}
                </div>
                <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--mc-primary)' }}>
                    {value}
                </div>
            </div>
            <div style={{ fontSize: 40 }}>{icon}</div>
        </div>
    );
}
