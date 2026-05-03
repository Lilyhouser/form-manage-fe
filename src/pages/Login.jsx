import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/auth.service";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await login(username, password);

      if (response.status === 200) {
        localStorage.setItem("accessToken", response.data.accessToken);
        navigate("/forms");
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError(err.response.data.message);
      } else {
        setError("An error occurred during login. Please try again.");
      }
    }
  };

  return (
    <div className="flex flex-1 bg-[#8ba8b4] items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] w-full max-w-md p-8 sm:p-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-[#014b62] mb-3">Login</h1>
          <div className="w-36 h-[2px] bg-[#014b62] mx-auto opacity-70 mb-3"></div>
          <p className="text-[#014b62] font-bold text-[15px]">
            Welcome to Form Management
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-[#b2d2db] rounded-lg focus:outline-none focus:border-[#014b62] focus:ring-1 focus:ring-[#014b62] text-[#014b62] placeholder-[#7999a5] font-medium"
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-[#b2d2db] rounded-lg focus:outline-none focus:border-[#014b62] focus:ring-1 focus:ring-[#014b62] text-[#014b62] placeholder-[#7999a5] font-medium"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#014b62] text-white font-bold py-3 px-4 rounded-lg hover:bg-[#023a4b] transition-colors duration-200 mt-2 text-[17px]"
          >
            Login
          </button>
        </form>

        <div className="text-center mt-6 text-[13px] text-[#7999a5]">
          If you do not have an account yet,{" "}
          <Link
            to="/signup"
            className="text-[#014b62] font-bold hover:underline"
          >
            sign up
          </Link>{" "}
          here
        </div>
      </div>
    </div>
  );
};

export default Login;
