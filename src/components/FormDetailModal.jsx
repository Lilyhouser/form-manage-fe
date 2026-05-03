import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteForm, updateForm } from "../services/form.service";

const FormDetailModal = ({ form, onClose, onFormDeleted, onFormUpdated }) => {
  const overlayRef = useRef(null);
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!form) return null;

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  const handleEdit = () => {
    navigate(`/forms/${form._id}/edit`);
    onClose();
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete form "${form.title}"? This cannot be undone.`)) return;
    setDeleting(true);
    setError("");
    try {
      await deleteForm(form._id);
      onClose();
      if (onFormDeleted) onFormDeleted(form._id);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete form.");
      setDeleting(false);
    }
  };

  const handleToggleStatus = async () => {
    const newStatus = form.status === "ACTIVE" ? "DRAFT" : "ACTIVE";
    setToggling(true);
    setError("");
    try {
      await updateForm(form._id, { status: newStatus });
      onClose();
      if (onFormUpdated) onFormUpdated();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status.");
      setToggling(false);
    }
  };

  const renderField = (field) => {
    const baseInput =
      "w-full px-3 py-2 border border-[#9fc8d4] rounded focus:outline-none focus:border-[#014b62] text-[#014b62] placeholder-[#9fc8d4]";

    if (field.type === "select") {
      return (
        <div className="relative">
          <select className={`${baseInput} appearance-none bg-white pr-8`} defaultValue="">
            <option value="" disabled>
              {field.placeholder || `Choose ${field.label.toLowerCase()}`}
            </option>
            {(field.options || []).map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
            <svg className="h-4 w-4 text-[#014b62]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      );
    }

    return (
      <input
        type={field.type === "number" ? "number" : field.type === "color" ? "color" : "text"}
        placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
        className={baseInput}
      />
    );
  };

  const fieldPairs = [];
  const fields = form.fields || [];
  for (let i = 0; i < fields.length; i += 2) {
    fieldPairs.push(fields.slice(i, i + 2));
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(100, 116, 125, 0.55)" }}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="pt-8 pb-4 px-10 text-center">
          <h2 className="text-2xl font-extrabold text-[#014b62]">{form.title}</h2>
          <p className="text-gray-500 mt-1 text-sm">{form.description}</p>
        </div>

        {error && (
          <div className="mx-10 mb-2 px-4 py-2 bg-red-100 text-red-700 text-sm rounded border border-red-300">
            {error}
          </div>
        )}

        {/* Fields */}
        <div className="px-10 pb-4 space-y-4">
          {fieldPairs.map((pair, rowIdx) => (
            <div key={rowIdx} className="grid grid-cols-2 gap-4">
              {pair.map((field) => (
                <div key={field._id}>
                  <label className="block text-sm font-semibold text-[#014b62] mb-1">
                    {field.label}
                    {field.require && <span className="text-red-500 ml-0.5">*</span>}
                  </label>
                  {renderField(field)}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Submit */}
        <div className="px-10 pb-4 pt-2">
          <button className="w-full bg-[#014b62] text-white font-bold py-3 rounded-lg hover:bg-[#023a4b] transition-colors">
            Submit
          </button>
        </div>

        {/* Divider */}
        <div className="mx-10 border-t border-gray-200"></div>

        {/* Action Buttons */}
        <div className="px-10 py-5 flex gap-3 justify-center flex-wrap">
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 bg-[#014b62] text-white font-semibold text-sm py-2 px-5 rounded hover:bg-[#023a4b] transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit form
          </button>

          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 bg-[#014b62] text-white font-semibold text-sm py-2 px-5 rounded hover:bg-red-700 transition-colors disabled:opacity-60"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            {deleting ? "Deleting..." : "Delete form"}
          </button>

          <button
            onClick={handleToggleStatus}
            disabled={toggling}
            className="flex items-center gap-2 bg-[#014b62] text-white font-semibold text-sm py-2 px-5 rounded hover:bg-[#023a4b] transition-colors disabled:opacity-60"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {toggling ? "Updating..." : form.status === "ACTIVE" ? "Disable" : "Activate"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormDetailModal;
