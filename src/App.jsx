import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Login from "./pages/Login";
import Forms from "./pages/Forms";
import CreateForm from "./pages/CreateForm";
import Submissions from "./pages/Submissions";

function App() {
  return (
    <>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forms" element={<Forms />} />
          <Route path="/forms/new" element={<CreateForm />} />
          <Route path="/forms/:id/edit" element={<CreateForm />} />
          <Route path="/submissions" element={<Submissions />} />
          <Route path="/" element={<Navigate to="/forms" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
