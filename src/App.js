import { Route, Routes, BrowserRouter as Router } from "react-router-dom"
import NotFound from './pages/notfound/index.js';
import Home from './pages/home/index.js';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;



