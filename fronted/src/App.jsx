import "./App.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import Sdcard from "./pages/Sdcard";
import Home from "./pages/Home";
import Computer from "./pages/Computer";
import Drive from "./components/Drive";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/drive/:drive" element={<Drive />} />
        <Route path="/sdcard/:location?" element={<Sdcard />} />
        <Route path="/computer-drive/:location?" element={<Computer />} />
        <Route path="*" element={<h1>Sorry 404 page not fount</h1>} />
      </Routes>
    </>
  );
}

export default App;
