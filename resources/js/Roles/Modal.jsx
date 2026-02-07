import React from "react";

/**
 * Lightweight Bootstrap-like modal without jQuery.
 * Uses Bootstrap modal classes so your existing CSS styles apply.
 */
export default function Modal({ open, title, onClose, children, footer = null, size = "" }) {
  if (!open) return null;

  return (
    <>
      <div className={`modal fade show d-block`} tabIndex="-1" role="dialog" aria-modal="true">
        <div className={`modal-dialog modal-dialog-centered ${size}`} role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button type="button" className="close" aria-label="Close" onClick={onClose}>
                <span aria-hidden="true">&times;</span>
              </button>
            </div>

            <div className="modal-body">{children}</div>

            {footer && <div className="modal-footer">{footer}</div>}
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" onClick={onClose} />
    </>
  );
}
