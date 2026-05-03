import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import { getMySubmissions } from "../services/submission.service";

const Submissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const fetchSubmissions = useCallback(async () => {
    try {
      const data = await getMySubmissions();
      setSubmissions(data);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch submissions",
      );
    }
  }, []);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const formatDate = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleString();
  };

  return (
    <>
      <div className="flex flex-1 font-sans">
        <Sidebar active="submissions" />

        {/* Main Content */}
        <div className="flex-1 bg-white flex flex-col">
          <div className="flex justify-end px-10 pt-6 pb-4">
            <h1 className="text-3xl font-extrabold text-[#014b62]">
              My Submissions
            </h1>
          </div>

          <div className="px-10">
            <div className="overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#014b62] text-white">
                    <th className="py-3 px-4 font-semibold w-1/4">Form</th>
                    <th className="py-3 px-4 font-semibold">Submitted At</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((sub) => (
                    <tr
                      key={sub._id}
                      onClick={() =>
                        setSelectedSubmission(
                          selectedSubmission?._id === sub._id ? null : sub,
                        )
                      }
                      className="border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-4 font-bold text-[#014b62]">
                        {sub.formId?.title || "—"}
                      </td>
                      <td className="py-4 px-4 text-[#014b62]">
                        {formatDate(sub.createdAt)}
                      </td>
                    </tr>
                  ))}
                  {submissions.length === 0 && (
                    <tr>
                      <td
                        colSpan="2"
                        className="py-10 text-center text-gray-400 italic"
                      >
                        You have not submitted any forms yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Submission Detail Side Panel */}
      {selectedSubmission && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(100, 116, 125, 0.55)" }}
          onClick={() => setSelectedSubmission(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="pt-8 pb-4 px-8 text-center border-b border-gray-100">
              <h2 className="text-xl font-extrabold text-[#014b62]">
                {selectedSubmission.formId?.title || "Submission"}
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                {formatDate(selectedSubmission.createdAt)}
              </p>
            </div>

            {/* Data */}
            <div className="px-8 py-6 space-y-4">
              {selectedSubmission.data &&
              Object.keys(selectedSubmission.data).length > 0 ? (
                Object.entries(selectedSubmission.data).map(([key, val]) => (
                  <div key={key}>
                    <p className="text-xs font-bold text-[#8ba8b4] uppercase tracking-wide mb-0.5">
                      {key}
                    </p>
                    {/* Color field: show swatch + hex */}
                    {typeof val === "string" &&
                    /^#[0-9A-Fa-f]{6}$/.test(val) ? (
                      <div className="flex items-center gap-2">
                        <div
                          className="w-5 h-5 rounded border border-gray-200 shrink-0"
                          style={{ backgroundColor: val }}
                        />
                        <p className="text-sm font-mono text-[#014b62]">
                          {val}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-[#014b62] font-semibold break-words">
                        {String(val)}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 italic text-center">
                  No data recorded.
                </p>
              )}
            </div>

            {/* Close */}
            <div className="px-8 pb-6">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="w-full bg-[#014b62] text-white font-bold py-2.5 rounded-lg hover:bg-[#023a4b] transition-colors text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Submissions;
