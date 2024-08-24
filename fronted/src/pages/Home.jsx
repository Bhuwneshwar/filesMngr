import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function Home() {
  const navigate = useNavigate();
  const [drives, setDrives] = useState([]);
  useEffect(() => {
    Initial();
  }, []);
  const Initial = async () => {
    try {
      const { data } = await axios.get("/api/v1/");
      console.log({ data });
      setDrives(data.drives);
    } catch (e) {
      console.log("Initial error :", e);
    }
  };
  return (
    <>
      <h2>Home</h2>
      <div className="drives">
        {drives.map((drive, i) => (
          <Link className="drive" key={i} to={"drive/" + drive}>
            {drive}
          </Link>
        ))}
      </div>
    </>
  );
}

export default Home;
