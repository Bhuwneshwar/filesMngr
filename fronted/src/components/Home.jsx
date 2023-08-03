import { useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function Home() {
  const navigate = useNavigate();
  useEffect(() => {
    //Initial();
  }, []);
  const Initial = async () => {
    try {
      const { data } = await axios.get("/api/");
      console.log(data);
    } catch (e) {
      console.log("Initial error :", e);
    }
  };
  return (
    <>
      <h2>Home</h2>
      <Link to="/sdcard">Sdcard</Link>{" "}
    </>
  );
}

export default Home;
