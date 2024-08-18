import { useGlobalContext } from "../AppContext";
import axios from "axios";
import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
const Sdcard = () => {
  const { list, updateState } = useGlobalContext();
  const { location } = useParams();

  useEffect(() => {
    // getList();
  }, []);
  const getList = async () => {
    try {
      const { data } = await axios.get(
        `/api/sdcard/${location}`
        //"/api/sdcard/"
      );
      console.log(data);
      updateState("list", data);
    } catch (e) {
      console.log("getList error :", e);
    }
  };
  return (
    <div>
      <div className="container">
        <aside>aside</aside>
        <main>
          <div className="search">
            <div className="title">Search here files or folder</div>
            <div className="icon">icon</div>
          </div>
          <section className="recent">
            <div>Recent</div>
            <div className="list">
              <div className="outercard">
                <div className="card"></div>
                <div className="card">jj</div>
                <div className="card"></div>
                <div className="card"></div>
                <div className="card"></div>
                <div className="card"></div>
                <div className="card"></div>
                <div className="card"></div>
                <div className="card"></div>
              </div>
            </div>
          </section>
          <section className="categories">
            <div>Categories</div>
            <div className="list">
              <div className="category"></div>
              <div className="category"></div>
              <div className="category"></div>
              <div className="category"></div>
              <div className="category"></div>
              <div className="category"></div>
            </div>
          </section>
          <section className="storage">
            <div>Storage</div>
          </section>
        </main>
      </div>

      {list.length == 0 ? "Loading..." : ""}

      <div className="listBar">
        {list.map((file) => {
          const {
            name,
            fullPath,
            type,
            url,
            lastModified,
            size,
            numberOfFiles,
          } = file;
          return type === "folder" ? (
            <Link key={fullPath} to={fullPath}>
              {name} <br />
            </Link>
          ) : (
            <>
              <a
                target="_blank"
                href={url}
                key={fullPath}
                className=""
                download
              >
                {name}
              </a>
              <br />
            </>
          );
        })}
      </div>
    </div>
  );
};

export default Sdcard;
