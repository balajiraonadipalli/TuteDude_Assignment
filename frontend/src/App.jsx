import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import JoinScreen from './components/JoinScreen';
import CosmosScreen from './pages/CosmosScreen';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<JoinScreen />} />
        <Route path="/cosmos" element={<CosmosScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
