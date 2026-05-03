import { Link, useNavigate } from "react-router-dom";
import { getTokenRole } from "../helpers";

const Sidebar = ({ active }) => {
  const navigate = useNavigate();
  const role = getTokenRole();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/login");
  };

  return (
    <div className="w-52 bg-[#8ba8b4] flex flex-col min-h-screen shrink-0">
      <div className="flex-1 pt-4 flex flex-col">
        <Link
          to="/forms"
          className={`block w-full py-3 px-5 transition-colors ${
            active === "forms"
              ? "bg-[#c8d9df] text-[#014b62] font-bold"
              : "text-white font-normal hover:bg-[#7a9fad]"
          }`}
        >
          Form List
        </Link>
        {role === "ADMIN" ? (
          <Link
            to="/forms/new"
            className={`block w-full py-3 px-5 transition-colors ${
              active === "new"
                ? "bg-[#c8d9df] text-[#014b62] font-bold"
                : "text-white font-normal hover:bg-[#7a9fad]"
            }`}
          >
            Create new form
          </Link>
        ) : (
          <Link
            to="/submissions"
            className={`block w-full py-3 px-5 transition-colors ${
              active === "submissions"
                ? "bg-[#c8d9df] text-[#014b62] font-bold"
                : "text-white font-normal hover:bg-[#7a9fad]"
            }`}
          >
            Submissions
          </Link>
        )}
      </div>
      <div className="p-4 mb-2">
        <button
          onClick={handleLogout}
          title="Logout"
          className="w-full cursor-pointer bg-white text-[#014b62] font-bold py-3 px-4 rounded flex justify-between items-center hover:bg-gray-50 transition-colors"
        >
          <span>{role}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-[#014b62]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
