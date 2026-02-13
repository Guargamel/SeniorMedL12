// resources/js/Pages/Users/Create.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const UsersCreate = () => {
    const navigate = useNavigate();
    const [roles, setRoles] = useState([]);
    const [form, setForm] = useState({
        name: "",
        email: "",
        role: "",
        avatar: null,
        password: "",
        password_confirmation: "",
    });
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState("");

    useEffect(() => {
        (async () => {
            try {
                // expected: { roles: [{name:...}] } OR [{name:...}]
                const data = await apiFetch("/api/roles");
                const list = normalizeList(res, ["roles"]);
            setRoles(list);
                if (list[0]?.name) setForm((f) => ({ ...f, role: f.role || list[0].name }));
            } catch {
                // roles optional; keep empty
            }
        })();
    }, []);

    const pageHeader = useMemo(() => (
        <div className="col-sm-12">
            <h3 className="page-title">Create User</h3>
            <ul className="breadcrumb">
                <li className="breadcrumb-item active">Dashboard</li>
            </ul>
        </div>
    ), []);

    const onChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "avatar") {
            setForm((f) => ({ ...f, avatar: files?.[0] || null }));
        } else {
            setForm((f) => ({ ...f, [name]: value }));
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setErr("");

        const fd = new FormData();
        fd.append("name", form.name);
        fd.append("email", form.email);
        fd.append("role", form.role);
        if (form.avatar) fd.append("avatar", form.avatar);
        fd.append("password", form.password);
        fd.append("password_confirmation", form.password_confirmation);

        try {
            setSaving(true);
            await apiFetch("/api/users", { method: "POST", body: fd });
            navigate("/users");
        } catch (e2) {
            setErr(e2.message || "Save failed");
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <div className="row">
                <div className="col-md-12 col-lg-12">
                    <div className="card card-table">
                        <div className="card-header">
                            <h4 className="card-title">Add User</h4>
                        </div>
                        <div className="card-body">
                            <div className="p-5">
                                {err && <div className="alert alert-danger">{err}</div>}

                                <form onSubmit={onSubmit} encType="multipart/form-data">
                                    <div className="row form-row">
                                        <div className="col-12">
                                            <div className="form-group">
                                                <label>Full Name</label>
                                                <input name="name" type="text" className="form-control" placeholder="John Doe" value={form.name} onChange={onChange} required />
                                            </div>
                                        </div>

                                        <div className="col-12">
                                            <div className="form-group">
                                                <label>Email</label>
                                                <input name="email" type="email" className="form-control" placeholder="example@gmail.com" value={form.email} onChange={onChange} required />
                                            </div>
                                        </div>

                                        <div className="col-12">
                                            <div className="form-group">
                                                <label>Role</label>
                                                <select name="role" className="form-control" value={form.role} onChange={onChange}>
                                                    {safeArray(roles).length === 0 ? (
                                                        <option value="">(No roles loaded)</option>
                                                    ) : safeArray(roles).map((r) => (
                                                        <option key={r.id || r.name} value={r.name}>{r.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="col-12">
                                            <div className="form-group">
                                                <label>Picture</label>
                                                <input name="avatar" type="file" className="form-control" onChange={onChange} accept="image/*" />
                                            </div>
                                        </div>

                                        <div className="col-12">
                                            <div className="row">
                                                <div className="col-6">
                                                    <div className="form-group">
                                                        <label>Password</label>
                                                        <input name="password" type="password" className="form-control" value={form.password} onChange={onChange} required />
                                                    </div>
                                                </div>
                                                <div className="col-6">
                                                    <div className="form-group">
                                                        <label>Confirm Password</label>
                                                        <input name="password_confirmation" type="password" className="form-control" value={form.password_confirmation} onChange={onChange} required />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <button disabled={saving} type="submit" className="btn btn-success btn-block">
                                        {saving ? "Saving..." : "Save Changes"}
                                    </button>

                                    <div className="mt-3">
                                        <Link to="/users" className="btn btn-link">Back to Users</Link>
                                    </div>
                                </form>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default UsersCreate;