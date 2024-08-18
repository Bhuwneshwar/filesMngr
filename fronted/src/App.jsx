import "./App.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import Sdcard from "./components/Sdcard";
import Home from "./components/Home";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sdcard/:location?" element={<Sdcard />} />
        <Route path="*" element={<h1>Sorry 404 page not fount</h1>} />
      </Routes>
    </>
  );
}

export default App;
