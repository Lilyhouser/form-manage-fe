import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Forms from './pages/Forms';
import CreateForm from './pages/CreateForm';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forms" element={<Forms />} />
        <Route path="/forms/new" element={<CreateForm />} />
        <Route path="/forms/:id/edit" element={<CreateForm />} />
        <Route path="/" element={<Navigate to="/forms" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
