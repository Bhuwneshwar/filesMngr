import { useGlobalContext } from "../AppContext";
import axios from "axios";
import React, { useEffect } from "react";
import { useParams, Link} from "react-router-dom";
const Sdcard = () => {
  const { list, updateState } = useGlobalContext();
  const { location } = useParams();

  useEffect(() => {
    getList();
    alert(location);
  }, []);
  const getList = async () => {
    try {
      const { data } = await axios.get(
        `/api/sdcard/${location}`
        //"/api/sdcard/" 
        );
      updateState("list", data);
    } catch (e) {
      console.log("getList error :", e);
    }
  };
  return (
    <div>
      {list.map((file) => {
        const { name, fullPath, type, url, lastModified, size, numberOfFiles } =
          file;
        return type === "folder" ? (
          <Link key={fullPath} to={fullPath}>
            {name} <br />
          </Link>
        ) : (
          <>
            <a target="_blank" href={url} key={fullPath} className="" download>
              {name}
            </a>
            <br />
          </>
        );
      })}
    </div>
  );
};

export default Sdcard;
