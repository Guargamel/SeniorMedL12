import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiFetch } from '../utils/api';

export default function ViewProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    useEffect(() => {
        loadProfile();
    }, [id]);

    const loadProfile = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await apiFetch(`/api/users/${id}/profile`);
            setUser(data.user);
        } catch (err) {
            console.error('Failed to load profile:', err);
            setError('Failed to load profile. ' + (err?.message || ''));
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Image size must be less than 5MB');
            return;
        }

        setUploadingAvatar(true);
        try {
            const formData = new FormData();
            formData.append('avatar', file);

            await apiFetch(`/api/users/${id}/profile/avatar`, {
                method: 'POST',
                body: formData,
            });

            // Reload profile to get new avatar
            await loadProfile();
            alert('Avatar updated successfully!');
        } catch (err) {
            console.error('Failed to upload avatar:', err);
            alert('Failed to upload avatar. ' + (err?.message || ''));
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleDeleteAvatar = async () => {
        if (!confirm('Delete profile picture?')) return;

        try {
            await apiFetch(`/api/users/${id}/profile/avatar`, {
                method: 'DELETE',
            });

            await loadProfile();
            alert('Avatar deleted successfully!');
        } catch (err) {
            console.error('Failed to delete avatar:', err);
            alert('Failed to delete avatar.');
        }
    };

    if (loading) {
        return (
            <div className="mc-card">
                <div className="mc-card-body" style={{ padding: 40, textAlign: 'center' }}>
                    Loading profile...
                </div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="mc-card">
                <div className="mc-card-body">
                    <div className="alert alert-danger">{error || 'User not found'}</div>
                    <button className="btn btn-secondary" onClick={() => navigate('/users')}>
                        Back to Staff List
                    </button>
                </div>
            </div>
        );
    }

    const profile = user.profile || {};
    const roleName = user.roles?.[0]?.name || 'user';
    const roleDisplay = roleName.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 className="mc-card-title">User Profile</h2>
                <div style={{ display: 'flex', gap: 10 }}>
                    <Link to={`/users/${id}/edit`} className="btn btn-primary">
                        Edit Account
                    </Link>
                    <button className="btn btn-outline-secondary" onClick={() => navigate('/users')}>
                        Back to List
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20 }}>
                {/* Left Column - Avatar & Basic Info */}
                <div>
                    <div className="mc-card" style={{ marginBottom: 20 }}>
                        <div className="mc-card-body" style={{ textAlign: 'center' }}>
                            {/* Avatar */}
                            <div style={{ 
                                width: 200, 
                                height: 200, 
                                margin: '0 auto 20px',
                                borderRadius: 12,
                                overflow: 'hidden',
                                border: '4px solid var(--mc-primary)',
                                background: '#f0f0f0'
                            }}>
                                <img 
                                    src={user.avatar_url} 
                                    alt={user.name}
                                    style={{ 
                                        width: '100%', 
                                        height: '100%', 
                                        objectFit: 'cover' 
                                    }}
                                    onError={(e) => {
                                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&size=200&background=0B6E4F&color=fff`;
                                    }}
                                />
                            </div>

                            {/* Name & Role */}
                            <h3 style={{ marginBottom: 4, fontSize: 20 }}>{user.name}</h3>
                            <div style={{ 
                                display: 'inline-block',
                                padding: '4px 12px',
                                background: 'var(--mc-primary)',
                                color: 'white',
                                borderRadius: 20,
                                fontSize: 12,
                                fontWeight: 700,
                                marginBottom: 16
                            }}>
                                {roleDisplay}
                            </div>

                            {/* Avatar Actions */}
                            <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--mc-border)' }}>
                                <label 
                                    className="btn btn-sm btn-outline-primary" 
                                    style={{ cursor: 'pointer', marginBottom: 8, width: '100%' }}
                                >
                                    {uploadingAvatar ? 'Uploading...' : 'Upload New Photo'}
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={handleAvatarUpload}
                                        disabled={uploadingAvatar}
                                        style={{ display: 'none' }}
                                    />
                                </label>
                                {profile.avatar && (
                                    <button 
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={handleDeleteAvatar}
                                        style={{ width: '100%' }}
                                    >
                                        Remove Photo
                                    </button>
                                )}
                                <div style={{ fontSize: 11, color: 'var(--mc-muted)', marginTop: 8 }}>
                                    JPG, PNG or GIF (max 5MB)
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Info Card */}
                    <div className="mc-card">
                        <div className="mc-card-header">
                            <h4 className="mc-card-title" style={{ fontSize: 14 }}>Quick Info</h4>
                        </div>
                        <div className="mc-card-body">
                            <InfoItem label="Member Since" value={new Date(user.created_at).toLocaleDateString()} />
                            <InfoItem label="Email" value={user.email} />
                            <InfoItem label="Phone" value={profile.phone || 'Not provided'} />
                            <InfoItem label="Department" value={profile.department || 'Not assigned'} />
                        </div>
                    </div>
                </div>

                {/* Right Column - Detailed Info */}
                <div>
                    {/* Personal Information */}
                    <div className="mc-card" style={{ marginBottom: 20 }}>
                        <div className="mc-card-header">
                            <h3 className="mc-card-title" style={{ fontSize: 16 }}>Personal Information</h3>
                        </div>
                        <div className="mc-card-body">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                <InfoItem label="Full Name" value={user.name} />
                                <InfoItem label="Email Address" value={user.email} />
                                <InfoItem label="Phone Number" value={profile.phone || 'Not provided'} />
                                <InfoItem label="Date of Birth" value={profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : 'Not provided'} />
                                <InfoItem label="Address" value={profile.address || 'Not provided'} />
                                <InfoItem label="City" value={profile.city || 'Not provided'} />
                                <InfoItem label="State/Province" value={profile.state || 'Not provided'} />
                                <InfoItem label="ZIP/Postal Code" value={profile.zip_code || 'Not provided'} />
                                <InfoItem label="Country" value={profile.country || 'Not provided'} />
                            </div>

                            {profile.bio && (
                                <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--mc-border)' }}>
                                    <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 6, color: 'var(--mc-muted)' }}>
                                        BIO
                                    </div>
                                    <div style={{ fontSize: 14, lineHeight: 1.6 }}>
                                        {profile.bio}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Work Information */}
                    <div className="mc-card" style={{ marginBottom: 20 }}>
                        <div className="mc-card-header">
                            <h3 className="mc-card-title" style={{ fontSize: 16 }}>Work Information</h3>
                        </div>
                        <div className="mc-card-body">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                <InfoItem label="Position" value={profile.position || 'Not assigned'} />
                                <InfoItem label="Department" value={profile.department || 'Not assigned'} />
                                <InfoItem label="Hire Date" value={profile.hire_date ? new Date(profile.hire_date).toLocaleDateString() : 'Not provided'} />
                                <InfoItem label="Role" value={roleDisplay} />
                            </div>
                        </div>
                    </div>

                    {/* Emergency Contact */}
                    <div className="mc-card">
                        <div className="mc-card-header">
                            <h3 className="mc-card-title" style={{ fontSize: 16 }}>Emergency Contact</h3>
                        </div>
                        <div className="mc-card-body">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                <InfoItem label="Contact Name" value={profile.emergency_contact_name || 'Not provided'} />
                                <InfoItem label="Contact Phone" value={profile.emergency_contact_phone || 'Not provided'} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InfoItem({ label, value }) {
    return (
        <div>
            <div style={{ 
                fontSize: 11, 
                fontWeight: 800, 
                marginBottom: 4, 
                color: 'var(--mc-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
            }}>
                {label}
            </div>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--mc-text)' }}>
                {value || 'Not provided'}
            </div>
        </div>
    );
}
