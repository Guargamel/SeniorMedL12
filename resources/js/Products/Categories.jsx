// resources/js/Products/Categories.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../utils/api";
import Modal from "../components/Modal";

export default function Categories() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const [name, setName] = useState("");
  const [edit, setEdit] = useState({ id: null, name: "" });

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await apiFetch("/api/categories");
      const list = Array.isArray(res) ? res : (res.data || res.categories || []);
      setItems(list);
    } catch (e) {
      setErr(e.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((c) => (c.name || "").toLowerCase().includes(s));
  }, [items, q]);

  const pageHeader = (
    <div className="row align-items-center">
      <div className="col-sm-7 col-auto">
        <h3 className="page-title">Categories</h3>
        <ul className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/dashboard">Dashboard</Link></li>
          <li className="breadcrumb-item active">Categories</li>
        </ul>
      </div>
      <div className="col-sm-5 col">
        <button type="button" className="btn btn-success float-right mt-2" onClick={() => { setName(""); setAddOpen(true); }}>
          Add Category
        </button>
      </div>
    </div>
  );

  const create = async () => {
    setErr("");
    try {
      await apiFetch("/api/categories", { method: "POST", body: JSON.stringify({ name }) });
      setAddOpen(false);
      await load();
    } catch (e) {
      setErr(e.message || "Create failed");
    }
  };

  const update = async () => {
    setErr("");
    try {
      await apiFetch(`/api/categories/${edit.id}`, { method: "PUT", body: JSON.stringify({ name: edit.name }) });
      setEditOpen(false);
      await load();
    } catch (e) {
      setErr(e.message || "Update failed");
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this category?")) return;
    setErr("");
    try {
      await apiFetch(`/api/categories/${id}`, { method: "DELETE" });
      await load();
    } catch (e) {
      setErr(e.message || "Delete failed");
    }
  };

  return (
    <div>
      <div className="page-header">{pageHeader}</div>

      {err && <div className="alert alert-danger">{err}</div>}

      <div className="row">
        <div className="col-sm-12">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <input
                  className="form-control"
                  style={{ maxWidth: 360 }}
                  placeholder="Search..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
                <Link className="btn btn-outline-secondary" to="/products">Back</Link>
              </div>

              {loading ? (
                <div>Loading...</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped table-bordered table-hover table-center mb-0">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Created date</th>
                        <th className="text-center action-btn">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length === 0 ? (
                        <tr><td colSpan={3} className="text-center text-muted">No categories</td></tr>
                      ) : filtered.map((c) => (
                        <tr key={c.id}>
                          <td>{c.name}</td>
                          <td>{c.created_at || "-"}</td>
                          <td className="text-center">
                            <button
                              type="button"
                              className="btn btn-sm bg-success-light mr-2"
                              onClick={() => { setEdit({ id: c.id, name: c.name }); setEditOpen(true); }}
                            >
                              <i className="fe fe-pencil" /> Edit
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm bg-danger-light"
                              onClick={() => remove(c.id)}
                            >
                              <i className="fe fe-trash" /> Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      <Modal
        open={addOpen}
        title="Add Category"
        onClose={() => setAddOpen(false)}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setAddOpen(false)}>Cancel</button>
            <button className="btn btn-success" onClick={create} disabled={!name.trim()}>Save Changes</button>
          </>
        }
      >
        <div className="form-group">
          <label>Category</label>
          <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
      </Modal>

      <Modal
        open={editOpen}
        title="Edit Category"
        onClose={() => setEditOpen(false)}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setEditOpen(false)}>Cancel</button>
            <button className="btn btn-success" onClick={update} disabled={!edit.name.trim()}>Save Changes</button>
          </>
        }
      >
        <div className="form-group">
          <label>Category</label>
          <input className="form-control" value={edit.name} onChange={(e) => setEdit((p) => ({ ...p, name: e.target.value }))} />
        </div>
      </Modal>
    </div>
  );
}
