import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import folderIcon from "../assets/image_processing20210616-14620-7bsr8i.png";
const Drive = () => {
  const { drive } = useParams();
  const location = useLocation();
  // Parse query parameters
  const searchParams = new URLSearchParams(location.search);

  // Extract levels from query parameters
  const levels = [];
  for (let [key, value] of searchParams.entries()) {
    levels.push(value);
  }

  // Set level count and query string
  levels.length;
  let queryString;
  if (levels.length > 0) {
    queryString = levels
      .map((level, i) => `lv${i + 1}=${encodeURIComponent(level)}`)
      .join("&");
  }

  const [items, setItems] = useState([]);
  const [levelCount, setLevelCount] = useState(levels.length);
  const [query, setQuery] = useState(queryString);

  useEffect(() => {
    // Parse query parameters
    const searchParams = new URLSearchParams(location.search);

    // Extract levels from query parameters
    const levels = [];
    for (let [key, value] of searchParams.entries()) {
      levels.push(value);
    }

    // Set level count and query string
    setLevelCount(levels.length);

    if (levels.length > 0) {
      const queryString = levels
        .map((level, i) => `lv${i + 1}=${encodeURIComponent(level)}`)
        .join("&");
      setQuery(queryString);
    }
  }, [location.search]); // Depend on location.search to update levels and query when it changes

  const initial = async () => {
    try {
      const { data } = await axios.get(`/api/v1/drive/${drive}/?${query}`);
      console.log({ data });
      setItems(data.items);
    } catch (error) {
      console.log("Error: " + error);
    }
  };
  const allFilesGet = async () => {
    try {
      const response = await axios({
        method: "get",
        url: `/api/v1/search-all-types-files-recursively`,
        responseType: "stream",
      });

      const reader = response.data.getReader();
      const decoder = new TextDecoder("utf-8");

      let result;

      while (!(result = await reader.read().done)) {
        const chunk = decoder.decode(result.value, { stream: true });
        console.log({ chunk });
      }
    } catch (error) {
      console.log("Error: " + error);
    }
  };
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const copyHere = async () => {
    const formData = new FormData();
    console.log({ files });

    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }
    console.log({ drive, query });

    formData.append("drive", drive);
    formData.append("query", query);

    try {
      //   dispatch("loading", true);
      const { data } = await axios.post(
        `/api/v1/copy-files/drive/${drive}/?${query}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            // Calculate the percentage completed
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          },
        }
      );

      console.log("File uploaded successfully:", { data });

      if (data.success) {
        // if (MyDetails) {
        //   dispatch("MyDetails", { ...MyDetails, coverImg: data.coverImg });
        //   toast.success("Cover image uploaded successfully!");
        // }
      }
      if (data.message) {
        initial();
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert(error.message);

      //   toast.error("Error uploading cover image!");
    }
    // dispatch("loading", false);
  };

  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

  function truncateText(text, maxLength) {
    if (text.length > maxLength) {
      return text.slice(0, maxLength) + "...";
    }
    return text;
  }
  function formatSize(bytes) {
    const units = ["B", "KB", "MB", "GB", "TB"];
    let unitIndex = 0;
    let size = bytes;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return size.toFixed(2) + " " + units[unitIndex];
  }
  function formatDate(isoDate) {
    const date = new Date(isoDate);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
  useEffect(() => {
    // if (query !== "") {
    initial();
    // }
  }, [query, drive, location]); // Depend on query to refetch data when it changes

  return (
    <div className="storage-manage">
      <button onClick={allFilesGet}> Get All Files </button>
      <h3>{drive}</h3>
      <div className="items">
        <input type="file" onChange={handleFileChange} multiple />
        <button onClick={copyHere}>Copy Here</button>
        {uploadProgress > 0 && (
          <div style={{ marginTop: "20px" }}>
            <progress value={uploadProgress} max="100" />
            <span>{uploadProgress}%</span>
          </div>
        )}
        {items.map((item, i) => {
          const {
            numberOfFiles,
            name,
            type,
            mimeType,
            url,
            fullPath,
            size,
            serverUrl,
            lastModified,
          } = item;

          const path = encodeURIComponent(item.name);

          return item.type === "folder" ? (
            <Link
              className="item"
              key={i}
              to={`/drive/${drive}/?${query}&lv${levelCount + 1}=${path}`}
            >
              <div className="icon">
                <figure>
                  <img src={folderIcon} alt="icon" />
                </figure>
              </div>
              <div className="details">
                <p className="name">{truncateText(item.name, 50)}</p>
                <p className="size">{numberOfFiles} files</p>
                <p className="date">{formatDate(lastModified)}</p>
              </div>
            </Link>
          ) : (
            <a
              className="item"
              key={i}
              target="_blank"
              href={item.serverUrl + item.fullPath}
            >
              <div className="icon">
                <figure>
                  <img src={item.serverUrl + item.fullPath} alt="icon" />
                </figure>
              </div>
              <div className="details">
                <p className="name">{truncateText(item.name, 50)}</p>
                <p className="size">{formatSize(item.size)}</p>
                <p className="date">{formatDate(lastModified)}</p>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default Drive;
