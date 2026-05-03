import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import {
  createForm,
  updateForm,
  getFormById,
  addFieldsToForm,
  updateField,
  deleteField,
} from "../services/form.service";

const FIELD_TYPES = ["Text", "Textarea", "Number", "Color", "Select", "Radio", "Date"];

let _counter = 0;
const makeField = (type, order) => ({
  _localId: `f_${Date.now()}_${++_counter}`,
  _id: null,           // null = new (not yet saved to server)
  _modified: false,
  type: type.toLowerCase(),
  label: "Field name",
  placeholder: "",
  order: String(order),
  require: false,
  options: [],
});

// --- FieldCard ---
const FieldCard = ({ field, index, onUpdate, onDelete, onDragStart, onDragOver, onDrop, isOver }) => {
  const [editLabel, setEditLabel] = useState(false);
  const [editPlaceholder, setEditPlaceholder] = useState(false);

  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => { e.preventDefault(); onDragOver(index); }}
      onDrop={(e) => { e.preventDefault(); onDrop(); }}
      className={`border rounded-lg p-3 bg-white relative min-h-[90px] transition-all ${
        isOver ? "border-[#014b62] shadow-md" : "border-[#9fc8d4]"
      }`}
    >
      {/* Drag handle */}
      <div className="absolute top-2 right-2 cursor-move select-none text-[#8ba8b4] font-bold text-sm">≡</div>

      {/* Delete field button */}
      <button
        onClick={() => onDelete(index)}
        className="absolute top-2 right-7 text-red-300 hover:text-red-500 text-xs leading-none"
        title="Remove field"
      >✕</button>

      {/* Label */}
      <div className="mb-2 mr-10">
        {editLabel ? (
          <input
            autoFocus
            type="text"
            value={field.label}
            onChange={(e) => onUpdate(index, "label", e.target.value)}
            onBlur={() => setEditLabel(false)}
            onKeyDown={(e) => e.key === "Enter" && setEditLabel(false)}
            className="text-sm font-semibold text-[#014b62] w-full outline-none border-b border-[#014b62] bg-transparent"
          />
        ) : (
          <span
            onClick={() => setEditLabel(true)}
            className="text-sm font-semibold text-[#014b62] cursor-text hover:underline decoration-dotted"
          >
            {field.label || "Field name"}
          </span>
        )}
      </div>

      {/* Placeholder preview */}
      {editPlaceholder ? (
        <input
          autoFocus
          type="text"
          value={field.placeholder}
          onChange={(e) => onUpdate(index, "placeholder", e.target.value)}
          onBlur={() => setEditPlaceholder(false)}
          onKeyDown={(e) => e.key === "Enter" && setEditPlaceholder(false)}
          className="w-full px-3 py-1.5 border border-[#014b62] rounded text-sm text-[#014b62] outline-none"
          placeholder="Enter placeholder text..."
        />
      ) : (
        <div
          onClick={() => setEditPlaceholder(true)}
          className="w-full px-3 py-1.5 border border-[#9fc8d4] rounded text-sm text-[#9fc8d4] cursor-text truncate"
        >
          {field.placeholder || `Enter ${field.label.toLowerCase()}`}
        </div>
      )}
    </div>
  );
};

// --- Stepper ---
const Stepper = ({ step }) => (
  <div className="flex items-center justify-center py-8 gap-0">
    <div className="flex flex-col items-center gap-2">
      <div className={`flex items-center justify-center w-16 h-16 rounded-xl transition-all ${step === 1 ? "bg-[#c8d9df]" : ""}`}>
        <svg className="w-8 h-8 text-[#014b62]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
        </svg>
      </div>
      <span className="text-sm font-bold text-[#014b62]">Form Information</span>
    </div>
    <div className="w-48 h-[2px] bg-[#014b62] opacity-40 mx-2 mb-6" />
    <div className="flex flex-col items-center gap-2">
      <div className={`flex items-center justify-center w-16 h-16 rounded-xl transition-all ${step === 2 ? "bg-[#c8d9df]" : ""}`}>
        <svg className="w-8 h-8 text-[#014b62]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <span className="text-sm font-bold text-[#014b62]">Field and Layout</span>
    </div>
  </div>
);

// --- Main Page ---
const CreateForm = () => {
  const navigate = useNavigate();
  const { id: editId } = useParams();           // present when editing
  const isEditMode = Boolean(editId);

  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [order, setOrder] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [formId, setFormId] = useState(editId || null);

  const [fields, setFields] = useState([]);
  const [deletedFieldIds, setDeletedFieldIds] = useState([]); // server _ids to delete

  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [overIndex, setOverIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [error, setError] = useState("");

  const dragIndex = useRef(null);

  // In edit mode — pre-fetch the form and jump straight to step 2
  useEffect(() => {
    if (!isEditMode) return;
    const fetch = async () => {
      try {
        const data = await getFormById(editId);
        setTitle(data.title || "");
        setDescription(data.description || "");
        setOrder(String(data.order || ""));
        setStatus(data.status || "DRAFT");
        // Map server fields to local format
        setFields(
          (data.fields || []).map((f) => ({
            _localId: `f_${f._id}`,
            _id: f._id,
            _modified: false,
            type: f.type,
            label: f.label,
            placeholder: f.placeholder || "",
            order: String(f.order),
            require: f.require || false,
            options: f.options || [],
          }))
        );
        setStep(1); // start at step 1 so user can review/change info first
      } catch (err) {
        setError("Failed to load form data.");
        console.error(err);
      } finally {
        setInitialLoading(false);
      }
    };
    fetch();
  }, [isEditMode, editId]);

  // Step 1: Create or update form info
  const handleStep1Submit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !order) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      if (isEditMode) {
        await updateForm(editId, { title: title.trim(), description: description.trim(), order: Number(order), status });
        setStep(2);
      } else {
        const data = await createForm({ title: title.trim(), description: description.trim(), order: Number(order) });
        setFormId(data.newForm._id);
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save form.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Field operations
  const handleAddField = (type) => {
    setFields((prev) => [...prev, makeField(type, prev.length + 1)]);
    setShowTypeMenu(false);
  };

  const handleUpdateField = useCallback((index, key, value) => {
    setFields((prev) =>
      prev.map((f, i) => i === index ? { ...f, [key]: value, _modified: true } : f)
    );
  }, []);

  const handleDeleteField = useCallback((index) => {
    setFields((prev) => {
      const field = prev[index];
      if (field._id) {
        setDeletedFieldIds((ids) => [...ids, field._id]);
      }
      return prev.filter((_, i) => i !== index).map((f, i) => ({ ...f, order: String(i + 1) }));
    });
  }, []);

  const handleDragStart = useCallback((index) => { dragIndex.current = index; }, []);
  const handleDragOver = useCallback((index) => { setOverIndex(index); }, []);
  const handleDrop = useCallback(() => {
    const from = dragIndex.current;
    const to = overIndex;
    if (from === null || to === null || from === to) { setOverIndex(null); return; }
    setFields((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next.map((f, i) => ({ ...f, order: String(i + 1), _modified: true }));
    });
    dragIndex.current = null;
    setOverIndex(null);
  }, [overIndex]);

  const handleSaveFields = async () => {
    const targetId = formId || editId;
    if (!targetId) return;
    setLoading(true);
    setError("");
    try {
      // Delete removed fields
      await Promise.all(deletedFieldIds.map((fid) => deleteField(targetId, fid)));

      // New fields (no _id)
      const newFields = fields.filter((f) => !f._id);
      if (newFields.length > 0) {
        await addFieldsToForm(targetId, newFields.map((f, i) => ({
          type: f.type,
          label: f.label,
          placeholder: f.placeholder || `Enter ${f.label.toLowerCase()}`,
          order: f.order,
          require: f.require,
          ...(f.options?.length ? { options: f.options } : {}),
        })));
      }

      // Existing modified fields
      const modifiedFields = fields.filter((f) => f._id && f._modified);
      await Promise.all(modifiedFields.map((f) =>
        updateField(targetId, f._id, {
          type: f.type,
          label: f.label,
          placeholder: f.placeholder || `Enter ${f.label.toLowerCase()}`,
          order: f.order,
          require: f.require,
          ...(f.options?.length ? { options: f.options } : {}),
        })
      ));

      navigate("/forms");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save fields.");
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex flex-1 font-sans">
        <Sidebar active="forms" />
        <div className="flex-1 flex items-center justify-center text-[#014b62] font-semibold">
          Loading form...
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-1 font-sans">
        <Sidebar active={isEditMode ? "forms" : "new"} />

        <div className="flex-1 bg-white flex flex-col">
          {/* Header */}
          <div className="flex justify-end px-10 pt-6 pb-2">
            <h1 className="text-3xl font-extrabold text-[#014b62]">Form Management</h1>
          </div>

          <Stepper step={step} />

          {error && (
            <div className="mx-10 mb-4 px-4 py-2 bg-red-100 text-red-700 text-sm rounded border border-red-300">
              {error}
            </div>
          )}

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <div className="flex flex-col items-center flex-1 px-10 pb-10">
              <form onSubmit={handleStep1Submit} className="w-full max-w-lg space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-[#014b62] mb-1">Form Title <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter form title"
                    className="w-full px-4 py-2.5 border border-[#9fc8d4] rounded-lg focus:outline-none focus:border-[#014b62] text-[#014b62] placeholder-[#9fc8d4]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#014b62] mb-1">Description <span className="text-red-500">*</span></label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter form description"
                    rows={3}
                    className="w-full px-4 py-2.5 border border-[#9fc8d4] rounded-lg focus:outline-none focus:border-[#014b62] text-[#014b62] placeholder-[#9fc8d4] resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#014b62] mb-1">Order <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(e.target.value)}
                    placeholder="e.g. 1"
                    min={1}
                    className="w-full px-4 py-2.5 border border-[#9fc8d4] rounded-lg focus:outline-none focus:border-[#014b62] text-[#014b62] placeholder-[#9fc8d4]"
                  />
                </div>
                {isEditMode && (
                  <div>
                    <label className="block text-sm font-semibold text-[#014b62] mb-1">Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-4 py-2.5 border border-[#9fc8d4] rounded-lg focus:outline-none focus:border-[#014b62] text-[#014b62] bg-white"
                    >
                      <option value="DRAFT">DRAFT</option>
                      <option value="ACTIVE">ACTIVE</option>
                    </select>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#014b62] text-white font-bold py-3 rounded-lg hover:bg-[#023a4b] transition-colors disabled:opacity-60"
                >
                  {loading ? "Saving..." : isEditMode ? "Update & Next →" : "Next →"}
                </button>
              </form>
            </div>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <div className="flex flex-1 relative pb-10">
              {/* Left Toolbar */}
              <div className="relative flex flex-col items-center gap-2 px-4 pt-4">
                <div className="relative">
                  <button
                    onClick={() => setShowTypeMenu((v) => !v)}
                    className="w-10 h-10 flex items-center justify-center bg-[#8ba8b4] text-white rounded hover:bg-[#7a9fad] transition-colors text-xl font-light"
                  >+</button>
                  {showTypeMenu && (
                    <div className="absolute left-12 top-0 z-20 bg-white border border-gray-200 rounded shadow-lg min-w-[120px] py-1">
                      {FIELD_TYPES.map((t) => (
                        <button
                          key={t}
                          onClick={() => handleAddField(t)}
                          className="block w-full text-left px-4 py-1.5 text-sm text-[#014b62] hover:bg-[#e8f4f7] transition-colors"
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="w-10 h-10 flex items-center justify-center bg-[#8ba8b4] text-white rounded hover:bg-[#7a9fad] transition-colors"
                  title="Back to form info"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              </div>

              {/* Form Preview */}
              <div className="flex-1 flex flex-col items-center pr-10">
                <h2 className="text-2xl font-extrabold text-[#014b62] mb-6">{title}</h2>

                {fields.length > 0 && (
                  <div className="w-full max-w-2xl grid grid-cols-2 gap-4 mb-6">
                    {fields.map((field, index) => (
                      <FieldCard
                        key={field._localId}
                        field={field}
                        index={index}
                        onUpdate={handleUpdateField}
                        onDelete={handleDeleteField}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        isOver={overIndex === index}
                      />
                    ))}
                  </div>
                )}

                <button
                  onClick={handleSaveFields}
                  disabled={loading}
                  className="w-full max-w-2xl bg-[#014b62] text-white font-bold py-3 rounded-lg hover:bg-[#023a4b] transition-colors disabled:opacity-60"
                >
                  {loading ? "Saving..." : "Submit"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CreateForm;
