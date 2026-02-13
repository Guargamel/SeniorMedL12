/**
 * Medicines module pages for React Router.
 * Assumes you have an apiFetch helper at: resources/js/api.js
 *   export async function apiFetch(url, options) { ... }
 * And the SPA is authenticated via Laravel Sanctum cookie/session auth.
 */

import React from "react";
import { useParams } from "react-router-dom";
import MedicineForm from "./components/MedicineForm";

export default function Edit() {
  const { id } = useParams();
  return <MedicineForm mode="edit" id={id} backTo="/medicines" />;
}
