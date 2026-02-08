// resources/js/Pages/Users/Profile.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const Profile = () => {
    const [user, setUser] = useState(null);
    const [roles, setRoles] = useState([]);
    const [activeTab, setActiveTab] = useState("about");

    const [profileForm, setProfileForm] = useState({ name: "", email: "", role: "", avatar: null });
    const [pwForm, setPwForm] = useState({ current_password: "", password: "", password_confirmation: "" });

    const [err, setErr] = useState("");
    const [msg, setMsg] = useState("");
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPw, setSavingPw] = useState(false);

    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                // expected: { user: {...} } or just user
                const me = await apiFetch("/api/me");
                const u = me.user || me;
                if (!alive) return;
                setUser(u);
                setProfileForm({
                    name: u.name || "",
                    email: u.email || "",
                    role: u.role?.name || u.role || "",
                    avatar: null,
                });
            } catch (e) {
                if (alive) setErr(e.message || "Failed to load profile");
            }
        })();
        return () => { alive = false; };
    }, []);

    useEffect(() => {
        (async () => {
            try {
                const data = await apiFetch("/api/roles");
                const list = Array.isArray(data) ? data : (data.roles || data.data || []);
                setRoles(list);
            } catch {
                // ignore
            }
        })();
    }, []);

    const pageHeader = useMemo(() => (
        <div className="col">
            <h3 className="page-title">Profile</h3>
            <ul className="breadcrumb">
                <li className="breadcrumb-item"><Link to="/dashboard">Dashboard</Link></li>
                <li className="breadcrumb-item active">Profile</li>
            </ul>
        </div>
    ), []);

    const avatarUrl = user?.avatar_url || "/assets/img/avatar_1nn.png";

    const onProfileChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "avatar") setProfileForm((f) => ({ ...f, avatar: files?.[0] || null }));
        else setProfileForm((f) => ({ ...f, [name]: value }));
    };

    const onPwChange = (e) => {
        const { name, value } = e.target;
        setPwForm((f) => ({ ...f, [name]: value }));
    };

    const saveProfile = async (e) => {
        e.preventDefault();
        setErr(""); setMsg("");
        const fd = new FormData();
        fd.append("name", profileForm.name);
        fd.append("email", profileForm.email);
        if (profileForm.role) fd.append("role", profileForm.role);
        if (profileForm.avatar) fd.append("avatar", profileForm.avatar);
        fd.append("_method", "PUT");

        try {
            setSavingProfile(true);
            const updated = await apiFetch("/api/profile", { method: "POST", body: fd });
            const u = updated.user || updated;
            setUser(u);
            setMsg("Profile updated");
        } catch (e2) {
            setErr(e2.message || "Update failed");
        } finally {
            setSavingProfile(false);
        }
    };

    const savePassword = async (e) => {
        e.preventDefault();
        setErr(""); setMsg("");
        try {
            setSavingPw(true);
            await apiFetch("/api/profile/password", {
                method: "PUT",
                body: JSON.stringify(pwForm),
            });
            setMsg("Password updated");
            setPwForm({ current_password: "", password: "", password_confirmation: "" });
        } catch (e2) {
            setErr(e2.message || "Password update failed");
        } finally {
            setSavingPw(false);
        }
    };

    return (
        <>
            {err && <div className="alert alert-danger">{err}</div>}
            {msg && <div className="alert alert-success">{msg}</div>}

            <div className="row">
                <div className="col-md-12">
                    <div className="profile-header">
                        <div className="row align-items-center">
                            <div className="col-auto profile-image">
                                <a href="#">
                                    <img className="rounded-circle" alt="User" src={avatarUrl} />
                                </a>
                            </div>
                            <div className="col ml-md-n2 profile-user-info">
                                <h4 className="user-name mb-0">{user?.name || ""}</h4>
                                <h6 className="text-muted">{user?.email || ""}</h6>
                            </div>
                        </div>
                    </div>

                    <div className="profile-menu">
                        <ul className="nav nav-tabs nav-tabs-solid">
                            <li className="nav-item">
                                <button type="button" className={"nav-link " + (activeTab === "about" ? "active" : "")} onClick={() => setActiveTab("about")}>
                                    About
                                </button>
                            </li>
                            <li className="nav-item">
                                <button type="button" className={"nav-link " + (activeTab === "password" ? "active" : "")} onClick={() => setActiveTab("password")}>
                                    Change Password
                                </button>
                            </li>
                        </ul>
                    </div>

                    <div className="tab-content profile-tab-cont">
                        {activeTab === "about" && (
                            <div className="tab-pane fade show active">
                                <div className="card">
                                    <div className="card-body">
                                        <h5 className="card-title d-flex justify-content-between">
                                            <span>Personal Details</span>
                                        </h5>

                                        <form onSubmit={saveProfile} encType="multipart/form-data">
                                            <div className="row form-row">
                                                <div className="col-12">
                                                    <div className="form-group">
                                                        <label>Full Name</label>
                                                        <input className="form-control" name="name" type="text" value={profileForm.name} onChange={onProfileChange} required />
                                                    </div>
                                                </div>

                                                <div className="col-12">
                                                    <div className="form-group">
                                                        <label>Email</label>
                                                        <input className="form-control" name="email" type="text" value={profileForm.email} onChange={onProfileChange} required />
                                                    </div>
                                                </div>

                                                <div className="col-12">
                                                    <div className="form-group">
                                                        <label>Role</label>
                                                        <select className="form-control" name="role" value={profileForm.role} onChange={onProfileChange}>
                                                            <option value="">(unchanged)</option>
                                                            {(Array.isArray(roles)?roles:[]).map((r) => (
                                                                <option key={r.id || r.name} value={r.name}>{r.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className="col-12">
                                                    <div className="form-group">
                                                        <label>User Avatar</label>
                                                        <input type="file" className="form-control" name="avatar" onChange={onProfileChange} accept="image/*" />
                                                    </div>
                                                </div>
                                            </div>

                                            <button disabled={savingProfile} className="btn btn-success" type="submit">
                                                {savingProfile ? "Saving..." : "Save Changes"}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "password" && (
                            <div className="tab-pane fade show active">
                                <div className="card">
                                    <div className="card-body">
                                        <h5 className="card-title">Change Password</h5>
                                        <form onSubmit={savePassword}>
                                            <div className="form-group">
                                                <label>Current Password</label>
                                                <input type="password" name="current_password" className="form-control" value={pwForm.current_password} onChange={onPwChange} placeholder="enter your current password" required />
                                            </div>
                                            <div className="form-group">
                                                <label>New Password</label>
                                                <input type="password" name="password" className="form-control" value={pwForm.password} onChange={onPwChange} placeholder="enter your new password" required />
                                            </div>
                                            <div className="form-group">
                                                <label>Confirm Password</label>
                                                <input type="password" name="password_confirmation" className="form-control" value={pwForm.password_confirmation} onChange={onPwChange} placeholder="repeat your new password" required />
                                            </div>
                                            <button disabled={savingPw} className="btn btn-success" type="submit">
                                                {savingPw ? "Saving..." : "Save Changes"}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </>
    );
};

export default Profile;
