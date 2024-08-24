const express = require("express");
const fileUpload = require("express-fileupload");
const fs = require("fs");
const fspro = require("fs").promises;
const util = require("util");
const readdirAsync = util.promisify(fs.readdir);
const statAsync = util.promisify(fs.stat);
const multer = require("multer");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
app.use(express.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// app.use(fileUpload());

// app.use("/sdcard", express.static("C:/Users/Krabi/OneDrive/Desktop"));
//app.use('/uploads', express.static('uploads'))
// app.use(express.static(path.join(__dirname, "public")));
//

// // Create a new file
// app.post("/files", (req, res) => {
//   console.log({ req });
//   const file = req.files.file;
//   const filename = file.name;
//   const filePath = path.join(__dirname, "uploads", filename);
//   file.mv(filePath, (err) => {
//     if (err) {
//       console.error(err);
//       res.status(500).send(err);
//     } else {
//       res.send("File uploaded successfully");
//     }
//   });
// });

// // Get a list of files
// // const getFileInfoAsync = async (filePath) => {
// //   try {
// //     const stats = await fspro.stat(filePath);
// //     return stats;
// //   } catch (error) {
// //     throw error;
// //   }
// // };

// const url = `http://localhost:5003/`;

function buildFileTree(startPath, res) {
  if (!fs.existsSync(startPath)) {
    console.log("Path does not exist:", startPath);
    return [];
  }

  const files = fs.readdirSync(startPath);
  const tree = [];

  for (const file of files) {
    const currentPath = path.join(startPath, file);
    const stat = fs.statSync(currentPath);

    let node;
    if (stat.isDirectory()) {
      node = {
        name: file,
        type: "folder",
        url: `${sharedIpAddress}${currentPath}`,
        fullPath: currentPath,
        numberOfFiles: stat.size,
        lastModified: stat.mtime,
        children: [],
      };
      node.children = buildFileTree(currentPath);
    } else {
      node = {
        name: file,
        type: "file",
        url: `${sharedIpAddress}${currentPath}`,
        fullPath: currentPath,
        size: stat.size,
        lastModified: stat.mtime,
      };
    }

    // if (stat.isDirectory()) {
    //   // Recursively build tree for subdirectories
    //   node.children = buildFileTree(currentPath);
    // }

    // tree.push(node);
    res.write(JSON.stringify(node));
    console.log(node.name);
  }
  res.end();
  return tree;
}

// app.get("/api/sdcard/:location", async (req, res) => {
//   try {
//     const { location } = req.params;
//     console.log({ location });

//     // Example usage:
//     const startPath = "C:/Users/Krabi/OneDrive/Desktop";
//     const fileTree = await buildFileTree(startPath);

//     console.log("make tree complete ");

//     /*  function searchFileOrFolder(startPath, targetName) {
//       if (!fs.existsSync(startPath)) {
//         console.log("Path does not exist:", startPath);
//         return;
//       }

//       const files = fs.readdirSync(startPath);

//       for (const file of files) {
//         const currentPath = path.join(startPath, file);
//         const stat = fs.statSync(currentPath);

//         if (stat.isDirectory()) {
//           // Recursively search in subdirectories
//           searchFileOrFolder(currentPath, targetName);
//         } else if (file === targetName) {
//           console.log("Found:", currentPath);
//         }
//       }
//     }

//     // Example usage:
//     const startPath = "/sdcard";
//     const targetName = "nandani.db";

//     searchFileOrFolder(startPath, targetName);
// */

//     /*    const response = await Promise.all(
//       files.map(async (fileOrFolder) => {
//         const targetPath = `${dirPath}/${fileOrFolder}`;
//         const url = `http://localhost:5003`;
//         const stats = await statAsync(targetPath);

//         if (stats.isFile()) {
//           return {
//             name: fileOrFolder,
//             type: "file",
//             url: `${url}${dirPath}/${fileOrFolder}`,
//             fullPath: targetPath,
//             size: stats.size,
//             lastModified: stats.mtime,
//           };
//         } else if (stats.isDirectory()) {
//           return {
//             name: fileOrFolder,
//             type: "folder",
//             url: `${url}/sdcard/${fileOrFolder}`,
//             fullPath: targetPath,
//             numberOfFiles: stats.size,
//             lastModified: stats.mtime,
//           };
//         } else {
//           return {
//             name: fileOrFolder,
//             type: "other",
//             url: `${url}/sdcard/${fileOrFolder}`,
//             fullPath: targetPath,
//           };
//         }
//       })
//     );*/

//     res.send(fileTree);
//   } catch (e) {
//     console.error(e);
//     res.status(500).send(e);
//   }
// });

// app.get("/api/sdcar", async (req, res) => {
//   try {
//     // const dirPath = path.join(__dirname, "uploads");
//     //   fs.readdir(dirPath, (err, files) => {
//     let content;
//     fs.readdir("/sdcard", (err, files) => {
//       if (err) {
//         console.error(err);
//         res.status(500).send(err);
//       } else {
//         //return res.downloadFile("/sdcard/IMG_20230301_190039_520.jpg");

//         // Async function to get information about a file or folder

//         // Usage example:
//         content = files;
//       }
//     });

//     let response = [];
//     await content.forEach(async (fileOrFolder) => {
//       const targetPath = "/sdcard/" + fileOrFolder; // Replace with the file or folder path you want to get info about

//       const stats = await getFileInfoAsync(targetPath);

//       if (stats.isFile()) {
//         console.log("File Info:");
//         console.log("File Size:", stats.size, "bytes");
//         console.log("Last Modified:", stats.mtime);
//         response.push({
//           name: fileOrFolder,
//           type: "file",
//           url: "http://localhost:5003/sdcard/" + fileOrFolder,
//           fullPath: "/sdcard/" + fileOrFolder,
//         });
//       } else if (stats.isDirectory()) {
//         console.log("Directory Info:");
//         console.log("Number of Files:", stats.size);
//         console.log("Last Modified:", stats.mtime);
//         response.push({
//           name: fileOrFolder,
//           type: "folder",
//           url: "http://localhost:5003/sdcard/" + fileOrFolder,
//           fullPath: "/sdcard/" + fileOrFolder,
//         });
//       } else {
//         console.log("Not a file or folder");
//         response.push({
//           name: fileOrFolder,
//           type: "other",
//           url: "http://localhost:5003/sdcard/" + fileOrFolder,
//           fullPath: "/sdcard/" + fileOrFolder,
//         });
//       }
//     });
//     res.send(response);
//   } catch (e) {
//     console.log(e);
//   }
// });

// // Serve static files from the 'public' folder

// app.get("/api/files", (req, res) => {
//   // const dirPath = path.join(__dirname, "uploads");
//   //   fs.readdir(dirPath, (err, files) => {
//   fs.readdir("/sdcard", (err, files) => {
//     if (err) {
//       console.error(err);
//       res.status(500).send(err);
//     } else {
//       res.send(files);
//     }
//   });
// });

// // Delete a file
// app.delete("/files/:filename", (req, res) => {
//   const filename = req.params.filename;
//   const filePath = path.join(__dirname, "uploads", filename);
//   fs.unlink(filePath, (err) => {
//     if (err) {
//       console.error(err);
//       res.status(500).send(err);
//     } else {
//       res.send("File deleted successfully");
//     }
//   });
// });

// app.get("/search/:search", async (req, res) => {
//   try {
//     const search = req.params.search;
//     res.setHeader("Content-Type", "text/plain");

//     let found = false; // Flag to check if the file or folder was found

//     function searchFileOrFolder(startPath, targetName) {
//       if (!fs.existsSync(startPath)) {
//         console.log("Path does not exist:", startPath);
//         return;
//       }

//       const files = fs.readdirSync(startPath);

//       for (const file of files) {
//         const currentPath = path.join(startPath, file);
//         const stat = fs.statSync(currentPath);

//         if (stat.isDirectory()) {
//           // Recursively search in subdirectories
//           searchFileOrFolder(currentPath, targetName);
//         } else if (file === targetName) {
//           console.log("Found:", currentPath);
//           res.write("Found:", currentPath);
//           found = true; // Set found flag to true
//         }
//       }
//     }

//     // Example usage:
//     const startPath = "C:/Users/Krabi/OneDrive/Desktop";
//     const targetName = search;

//     searchFileOrFolder(startPath, targetName);

//     if (!found) {
//       res.write("No such file or folder\n");
//     }

//     res.end(); // End the response after all writes
//   } catch (error) {
//     console.log("Error AT SEARCH: " + error);
//     res.status(500).send(error.message);
//   }
// });

const { exec } = require("child_process");

function getAvailableDrives(callback) {
  exec("wmic logicaldisk get name", (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return callback(error, null);
    }
    // console.log({ stdout });

    // Split the output by newlines and filter out any empty lines
    const drives = stdout
      .split("\n")
      .map((line) => line.trim()) // Trim whitespace from each line
      .filter((line) => /^[A-Z]:$/i.test(line)); // Only keep valid drive letters

    callback(null, drives);
  });
}
getAvailableDrives((error, drives) => {
  if (error) {
    console.error("Failed to get drives:", error);
  } else {
    console.log("Available drives:", drives);
    drives.forEach((drive) => {
      app.use("/" + drive + "/", express.static(drive + "/")); // This assumes your drives are mounted at the root level
    });
  }
});
app.get("/api/v1/", async (req, res) => {
  try {
    getAvailableDrives((error, drives) => {
      if (error) {
        console.error("Failed to get drives:", error);
        res.status(404);
      } else {
        console.log("Available drives:", drives);
        // app.use(drives + "/", express.static(drives + "/")); // This assumes your drives are mounted at the root level

        res.send({ drives });
      }
    });
  } catch (error) {
    console.log("Error: ", error);
  }
});
// Example usage:

const mime = require("mime-types");

// app.use("/C:/", express.static("C:/")); // This assumes your drives are mounted at the root level

app.get("/api/v1/drive/:drive", async (req, res) => {
  try {
    const drive = req.params.drive;
    const query = req.query;
    console.log({ drive }, "drive");
    console.log({ query }, "query");

    let levels = "";
    for (const level in query) {
      console.log({ level });
      levels = path.join(levels, query[level]);
    }
    console.log({ levels });

    const directoryPath = path.join(drive, "/", levels);
    console.log({ directoryPath });
    // app.use(directoryPath, express.static(directoryPath)); // This assumes your drives are mounted at the root level

    const baseUrl = `http://localhost:5003/drive/${drive}`;
    const files = await fspro.readdir(directoryPath);
    console.log({ files }, "files");

    const items = [];
    for (const file of files) {
      const currentPath = path.join(directoryPath, file);
      console.log({ currentPath });

      try {
        const stat = fs.statSync(currentPath);

        let node;
        if (stat.isDirectory()) {
          node = {
            name: file,
            type: "folder",
            url: `${baseUrl}/${levels}/${file}`,
            fullPath: currentPath,
            numberOfFiles: fs.readdirSync(currentPath).length,
            lastModified: stat.mtime,
          };
        } else {
          const mimeType =
            mime.lookup(currentPath) || "application/octet-stream";

          node = {
            name: file,
            type: "file",
            mimeType: mimeType,
            url: `${baseUrl}/${levels}/${file}`,
            fullPath: currentPath,
            size: stat.size,
            serverUrl: `http://localhost:5003/`,
            lastModified: stat.mtime,
          };
        }
        items.push(node);
      } catch (error) {
        console.log(error);
      }
    }

    res.send({ items });
  } catch (error) {
    console.log("error in read directory", error);
    res.status(500).send("Error reading directory");
  }
});

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const drive = req.params.drive;
    const query = req.query;
    console.log({ drive }, "drive");
    console.log({ query }, "query");

    let levels = "";
    for (const level in query) {
      console.log({ level });
      levels = path.join(levels, query[level]);
    }
    console.log({ levels });

    directoryPath = path.join(drive, "/", levels);
    console.log({ directoryPath });

    // Example: Dynamically setting the path based on a field in the request body
    const dynamicPath = directoryPath || "./uploads"; // Use './uploads' if no dynamicPath is provided

    // Make sure the directory exists, or create it
    fs.mkdir(dynamicPath, { recursive: true }, (err) => {
      if (err) {
        return cb(err, dynamicPath);
      }
      cb(null, dynamicPath);
    });
  },
  filename: function (req, file, cb) {
    cb(
      null,
      // file.originalname + "-" + Date.now() + path.extname(file.originalname)
      file.originalname
    );
  },
});

// Initialize upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 * 1024 }, // 10 GB limit per file
}).array("files", 100); // Accept up to 100 files at once

app.post("/api/v1/copy-files/drive/:drive", (req, res) => {
  try {
    upload(req, res, (err) => {
      if (err) {
        console.log(err);

        return res.status(500).json({ message: "Upload failed", error: err });
      }
      res
        .status(200)
        .json({ message: "Files uploaded successfully", files: req.files });
    });
  } catch (error) {
    console.log(error);
    res.status(501);
  }
});

app.get(
  "/api/v1/search-all-types-files-recursively",
  async function (req, res) {
    try {
      res.setHeader("Content-Type", "text/plain");

      const startPath = "C:/Users/Krabi/OneDrive/Desktop";
      buildFileTree(startPath, res);
    } catch (error) {
      console.log(error);
    }
  }
);

const crypto = require("crypto");

// Function to calculate file hash
const calculateFileHash = (filePath) => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    const stream = fs.createReadStream(filePath);

    stream.on("data", (data) => {
      hash.update(data);
    });

    stream.on("end", () => {
      resolve(hash.digest("hex"));
    });

    stream.on("error", (err) => {
      reject(err);
    });
  });
};

// Function to find duplicate files
const findDuplicateFiles = async (startPath) => {
  const fileHashes = {};
  const duplicates = [];

  const searchDirectory = async (dirPath) => {
    const files = fs.readdirSync(dirPath);

    for (const file of files) {
      const currentPath = path.join(dirPath, file);
      const stat = fs.statSync(currentPath);

      if (stat.isDirectory()) {
        await searchDirectory(currentPath); // Recursively search subdirectories
      } else {
        const fileHash = await calculateFileHash(currentPath);

        if (fileHashes[fileHash]) {
          duplicates.push({
            original: fileHashes[fileHash],
            duplicate: currentPath,
          });
        } else {
          fileHashes[fileHash] = currentPath;
        }
      }
    }
  };

  await searchDirectory(startPath);
  return duplicates;
};

// Route to search for duplicate files
app.get("/search-duplicates", async (req, res) => {
  try {
    const { dir } = req.query; // Directory to search (passed as a query parameter)

    if (!dir) {
      return res.status(400).json({ error: "Directory path is required" });
    }

    if (!fs.existsSync(dir)) {
      return res.status(400).json({ error: "Directory does not exist" });
    }

    const duplicates = await findDuplicateFiles(dir);

    if (duplicates.length === 0) {
      return res.status(200).json({ message: "No duplicates found" });
    }

    res
      .status(200)
      .json({ message: "Duplicates found", duplicates: duplicates });
  } catch (error) {
    console.error("Error finding duplicates:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Function to find the largest files
const findLargestFiles = async (startPath, maxFiles) => {
  const fileSizes = [];

  const searchDirectory = (dirPath) => {
    const files = fs.readdirSync(dirPath);

    for (const file of files) {
      const currentPath = path.join(dirPath, file);
      const stat = fs.statSync(currentPath);

      if (stat.isDirectory()) {
        searchDirectory(currentPath); // Recursively search subdirectories
      } else {
        fileSizes.push({ filePath: currentPath, size: stat.size });
      }
    }
  };

  searchDirectory(startPath);

  // Sort files by size in descending order and take the top 'maxFiles' files
  fileSizes.sort((a, b) => b.size - a.size);

  return fileSizes.slice(0, maxFiles);
};

// Route to search for the largest files
app.get("/search-largest-files", async (req, res) => {
  try {
    const { dir, maxFiles = 10 } = req.query; // Directory to search and number of files to return (default 10)

    if (!dir) {
      return res.status(400).json({ error: "Directory path is required" });
    }

    if (!fs.existsSync(dir)) {
      return res.status(400).json({ error: "Directory does not exist" });
    }

    const largestFiles = await findLargestFiles(dir, parseInt(maxFiles, 10));

    if (largestFiles.length === 0) {
      return res.status(200).json({ message: "No files found" });
    }

    res
      .status(200)
      .json({ message: "Largest files found", files: largestFiles });
  } catch (error) {
    console.error("Error finding largest files:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Function to delete empty folders recursively
const deleteEmptyFolders = (folderPath) => {
  let isFolderEmpty = true;

  // Read the contents of the directory
  const files = fs.readdirSync(folderPath);

  for (const file of files) {
    const currentPath = path.join(folderPath, file);
    const stat = fs.statSync(currentPath);

    if (stat.isDirectory()) {
      // Recursively delete empty subfolders
      const isSubFolderEmpty = deleteEmptyFolders(currentPath);

      if (isSubFolderEmpty) {
        // If the subfolder is empty, delete it
        fs.rmdirSync(currentPath);
      } else {
        isFolderEmpty = false;
      }
    } else {
      // If there are files in the directory, it's not empty
      isFolderEmpty = false;
    }
  }

  return isFolderEmpty;
};

// Route to delete all empty folders
app.get("/delete-empty-folders", async (req, res) => {
  try {
    const { dir } = req.query; // Directory to start from

    if (!dir) {
      return res.status(400).json({ error: "Directory path is required" });
    }

    if (!fs.existsSync(dir)) {
      return res.status(400).json({ error: "Directory does not exist" });
    }

    // Start deleting empty folders from the specified directory
    const rootIsEmpty = deleteEmptyFolders(dir);

    if (rootIsEmpty) {
      fs.rmdirSync(dir); // Optionally remove the root directory if it's empty
    }

    res.status(200).json({ message: "Empty folders deleted successfully" });
  } catch (error) {
    console.error("Error deleting empty folders:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const os = require("os");

function detectOS() {
  const platform = os.platform();

  switch (platform) {
    case "win32":
      console.log("Operating System: Windows");
      break;
    case "linux":
      console.log("Operating System: Linux");
      break;
    case "darwin":
      console.log("Operating System: macOS");
      break;
    default:
      console.log("Operating System: Unknown");
  }
}

detectOS();

function getIPAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];

  for (const interfaceName in interfaces) {
    const interfaceInfo = interfaces[interfaceName];

    for (const i of interfaceInfo) {
      // Check if the interface has an IPv4 or IPv6 address and is not an internal (localhost) interface
      if (i.family === "IPv4" || i.family === "IPv6") {
        if (!i.internal) {
          addresses.push({ interface: interfaceName, address: i.address });
        }
      }
    }
  }

  return addresses;
}

const ipAddresses = getIPAddresses();
console.log("Available IP addresses:", ipAddresses);

// const PORT = 3003; // Change this to the port your server is running on

function getIPAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];

  for (const interfaceName in interfaces) {
    const interfaceInfo = interfaces[interfaceName];

    for (const i of interfaceInfo) {
      if (i.family === "IPv4" && !i.internal) {
        addresses.push(i.address);
      }
    }
  }

  return addresses;
}
let sharedIpAddress;
function displayServerInfo() {
  const ipAddresses = getIPAddresses();
  sharedIpAddress = `http://` + ipAddresses[1] + `:port`;

  console.log(`  VITE v4.4.7  ready in 620 ms\n`);
  console.log(`  ➜  Local:   http://localhost:${2020}/`);

  ipAddresses.forEach((ip) => {
    console.log(`  ➜  Network: http://${ip}:${2020}/`);
  });
}

displayServerInfo();

// function getAvailableDrives(callback) {
//   exec("ls /storage", (error, stdout, stderr) => {
//     if (error) {
//       console.error(`exec error: ${error}`);
//       return callback(error, null);
//     }

//     // Split the output by newlines and filter out any empty lines
//     const drives = stdout
//       .split("\n")
//       .map((line) => line.trim()) // Trim whitespace from each line
//       .filter((line) => line !== "" && line !== "self"); // Filter out any non-storage directories

//     callback(null, drives);
//   });
// }

// getAvailableDrives((error, drives) => {
//   if (error) {
//     console.error("Failed to get drives:", error);
//   } else {
//     console.log("Available drives:", drives);
//     drives.forEach((drive) => {
//       app.use("/" + drive, express.static("/storage/" + drive)); // Serve each drive's contents
//     });
//   }
// });

// app.get("/api/v1/drives", async (req, res) => {
//   try {
//     getAvailableDrives((error, drives) => {
//       if (error) {
//         console.error("Failed to get drives:", error);
//         res.status(500).send({ error: "Failed to retrieve drives" });
//       } else {
//         console.log("Available drives:", drives);
//         res.send({ drives });
//       }
//     });
//   } catch (error) {
//     console.log("Error: ", error);
//     res.status(500).send({ error: "Internal Server Error" });
//   }
// });

const port = process.env.PORT || 5003;
app.listen(port, () =>
  console.log(`Server running on port http://localhost:${port}`)
);
