import { useEffect, useState, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import {
  getAllForms,
  getActiveForms,
  getFormById,
  updateForm,
} from "../services/form.service";

import FormDetailModal from "../components/FormDetailModal";
import Sidebar from "../components/Sidebar";
import { getTokenRole } from "../helpers";

const Forms = () => {
  const [forms, setForms] = useState([]);
  const [selectedForm, setSelectedForm] = useState(null);
  const [loadingForm, setLoadingForm] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const dragIndex = useRef(null);

  const isAdmin = getTokenRole() === "ADMIN";

  const fetchForms = useCallback(async () => {
    try {
      const data = isAdmin ? await getAllForms() : await getActiveForms();
      setForms(data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch forms");
    }
  }, [isAdmin]);

  const handleRowClick = useCallback(async (id) => {
    try {
      setLoadingForm(true);
      const data = await getFormById(id);
      setSelectedForm(data);
    } catch (error) {
      toast.error(error.response.data.message || "Failed to fetch form detail");
    } finally {
      setLoadingForm(false);
    }
  }, []);

  // --- Drag handlers (only triggered from drag handle td) ---
  const handleDragStart = useCallback((e, index) => {
    dragIndex.current = index;
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragOver = useCallback((e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  }, []);

  const handleDrop = useCallback(
    async (e, dropIdx) => {
      e.preventDefault();
      const fromIdx = dragIndex.current;
      if (fromIdx === null || fromIdx === dropIdx) {
        setDragOverIndex(null);
        return;
      }

      // Reorder locally
      const reordered = [...forms];
      const [moved] = reordered.splice(fromIdx, 1);
      reordered.splice(dropIdx, 0, moved);

      // Reassign order values (1-based)
      const updated = reordered.map((f, i) => ({ ...f, order: i + 1 }));
      setForms(updated);
      setDragOverIndex(null);
      dragIndex.current = null;

      // Persist order changes to the server for affected forms
      try {
        await Promise.all(
          updated.map((f) => updateForm(f._id, { order: f.order })),
        );
      } catch (err) {
        console.error("Failed to save order", err);
        fetchForms(); // rollback on error
      }
    },
    [forms, fetchForms],
  );

  const handleDragEnd = useCallback(() => {
    dragIndex.current = null;
    setDragOverIndex(null);
  }, []);

  useEffect(() => {
    fetchForms();
  }, [fetchForms]);

  return (
    <>
      <div className="flex flex-1 font-sans">
        <Sidebar active="forms" />

        {/* Main Content */}
        <div className="flex-1 bg-white flex flex-col">
          <div className="flex justify-end px-10 pt-6 pb-4">
            <h1 className="text-3xl font-extrabold text-[#014b62]">
              Form Management
            </h1>
          </div>

          <div className="px-10">
            <div className="overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#014b62] text-white">
                    <th className="py-3 px-4 font-semibold w-10"></th>
                    <th className="py-3 px-4 font-semibold w-24">Order</th>
                    <th className="py-3 px-4 font-semibold w-1/4">Title</th>
                    <th className="py-3 px-4 font-semibold">Description</th>
                    <th className="py-3 px-6 font-semibold w-36 text-center">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {forms.map((form, index) => (
                    <tr
                      key={form._id}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                      onClick={() => handleRowClick(form._id)}
                      className={`border-b border-gray-100 cursor-pointer transition-colors ${
                        dragOverIndex === index
                          ? "bg-[#e8f4f7] border-t-2 border-t-[#014b62]"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      {/* Drag handle — only this cell initiates drag */}
                      <td
                        draggable
                        onDragStart={(e) => {
                          e.stopPropagation();
                          handleDragStart(e, index);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="py-4 px-4 select-none cursor-grab active:cursor-grabbing"
                      >
                        <div className="flex flex-col gap-[4px] w-4">
                          <div className="h-[2px] bg-[#8ba8b4] rounded"></div>
                          <div className="h-[2px] bg-[#8ba8b4] rounded"></div>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-bold text-[#014b62]">
                        {form.order}
                      </td>
                      <td className="py-4 px-4 font-bold text-[#014b62]">
                        {form.title}
                      </td>
                      <td className="py-4 px-4 font-semibold text-[#014b62]">
                        {form.description}
                      </td>
                      <td className="py-4 px-6 text-center">
                        {form.status === "ACTIVE" ? (
                          <span className="inline-block py-1 px-4 bg-[#c8e6c9] text-[#2e7d32] font-bold text-sm rounded">
                            ACTIVE
                          </span>
                        ) : (
                          <span className="inline-block py-1 px-4 bg-[#f0f4a8] text-[#757a1e] font-bold text-sm rounded">
                            DRAFT
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {forms.length === 0 && (
                    <tr>
                      <td
                        colSpan="5"
                        className="py-10 text-center text-gray-400 italic"
                      >
                        No forms available. Create a new one!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      {loadingForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(100,116,125,0.4)" }}
        >
          <div className="bg-white rounded-xl px-8 py-6 shadow-xl text-[#014b62] font-semibold">
            Loading...
          </div>
        </div>
      )}

      {/* Form Detail Modal */}
      {selectedForm && (
        <FormDetailModal
          form={selectedForm}
          onClose={() => setSelectedForm(null)}
          onFormDeleted={(deletedId) => {
            setForms((prev) => prev.filter((f) => f._id !== deletedId));
            setSelectedForm(null);
          }}
          onFormUpdated={() => {
            fetchForms();
            setSelectedForm(null);
          }}
        />
      )}
    </>
  );
};

export default Forms;
