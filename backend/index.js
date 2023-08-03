const express = require("express");
const fileUpload = require("express-fileupload");
const fs = require("fs");
const fspro = require("fs").promises;
const util = require("util");
const readdirAsync = util.promisify(fs.readdir);
const statAsync = util.promisify(fs.stat);

const path = require("path");

const app = express();
app.use(express.json());
app.use(fileUpload());
app.use("/sdcard", express.static("/sdcard"));
//app.use('/uploads', express.static('uploads'))
app.use(express.static(path.join(__dirname, "public")));
//
// Create a new file
app.post("/files", (req, res) => {
  const file = req.files.file;
  const filename = file.name;
  const filePath = path.join(__dirname, "uploads", filename);
  file.mv(filePath, (err) => {
    if (err) {
      console.error(err);
      res.status(500).send(err);
    } else {
      res.send("File uploaded successfully");
    }
  });
});

// Get a list of files
const getFileInfoAsync = async (filePath) => {
  try {
    const stats = await fspro.stat(filePath);
    return stats;
  } catch (error) {
    throw error;
  }
};

app.get("/api/sdcard/:location", async (req, res) => {
  try {
    const { location } = req.params;
    console.log(location);

    const dirPath = `/sdcard${location != "undefined" ? "/" +location : ""}`; // Replace with the desired directory path
    const files = await readdirAsync(dirPath);

    const response = await Promise.all(
      files.map(async (fileOrFolder) => {
        const targetPath = `${dirPath}/${fileOrFolder}`;
        const url = `http://localhost:5003`;
        const stats = await statAsync(targetPath);

        if (stats.isFile()) {
          return {
            name: fileOrFolder,
            type: "file",
            url: `${url}${dirPath}/${fileOrFolder}`,
            fullPath: targetPath,
            size: stats.size,
            lastModified: stats.mtime,
          };
        } else if (stats.isDirectory()) {
          return {
            name: fileOrFolder,
            type: "folder",
            url: `${url}/sdcard/${fileOrFolder}`,
            fullPath: targetPath,
            numberOfFiles: stats.size,
            lastModified: stats.mtime,
          };
        } else {
          return {
            name: fileOrFolder,
            type: "other",
            url: `${url}/sdcard/${fileOrFolder}`,
            fullPath: targetPath,
          };
        }
      })
    );

    res.send(response);
  } catch (e) {
    console.error(e);
    res.status(500).send(e);
  }
});

app.get("/api/sdcar", async (req, res) => {
  try {
    // const dirPath = path.join(__dirname, "uploads");
    //   fs.readdir(dirPath, (err, files) => {
    let content;
    fs.readdir("/sdcard", (err, files) => {
      if (err) {
        console.error(err);
        res.status(500).send(err);
      } else {
        //return res.downloadFile("/sdcard/IMG_20230301_190039_520.jpg");

        // Async function to get information about a file or folder

        // Usage example:
        content = files;
      }
    });

    let response = [];
    await content.forEach(async (fileOrFolder) => {
      const targetPath = "/sdcard/" + fileOrFolder; // Replace with the file or folder path you want to get info about

      const stats = await getFileInfoAsync(targetPath);

      if (stats.isFile()) {
        console.log("File Info:");
        console.log("File Size:", stats.size, "bytes");
        console.log("Last Modified:", stats.mtime);
        response.push({
          name: fileOrFolder,
          type: "file",
          url: "http://localhost:5003/sdcard/" + fileOrFolder,
          fullPath: "/sdcard/" + fileOrFolder,
        });
      } else if (stats.isDirectory()) {
        console.log("Directory Info:");
        console.log("Number of Files:", stats.size);
        console.log("Last Modified:", stats.mtime);
        response.push({
          name: fileOrFolder,
          type: "folder",
          url: "http://localhost:5003/sdcard/" + fileOrFolder,
          fullPath: "/sdcard/" + fileOrFolder,
        });
      } else {
        console.log("Not a file or folder");
        response.push({
          name: fileOrFolder,
          type: "other",
          url: "http://localhost:5003/sdcard/" + fileOrFolder,
          fullPath: "/sdcard/" + fileOrFolder,
        });
      }
    });
    res.send(response);
  } catch (e) {
    console.log(e);
  }
});

// Serve static files from the 'public' folder

app.get("/api/files", (req, res) => {
  // const dirPath = path.join(__dirname, "uploads");
  //   fs.readdir(dirPath, (err, files) => {
  fs.readdir("/sdcard", (err, files) => {
    if (err) {
      console.error(err);
      res.status(500).send(err);
    } else {
      res.send(files);
    }
  });
});

// Delete a file
app.delete("/files/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "uploads", filename);
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error(err);
      res.status(500).send(err);
    } else {
      res.send("File deleted successfully");
    }
  });
});

const port = process.env.PORT || 5003;
app.listen(port, () =>
  console.log(`Server running on port http://localhost:${port}`)
);
