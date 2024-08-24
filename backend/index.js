const express = require("express");
const fs = require("fs");
const fspro = require("fs").promises;
const util = require("util");
const readdirAsync = util.promisify(fs.readdir);
const statAsync = util.promisify(fs.stat);
const multer = require("multer");
const path = require("path");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const mime = require("mime-types");
const os = require("os");
const { exec } = require("child_process");

const app = express();
app.use(express.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

const port = process.env.PORT || 5003;
let osName;
let sharedIpAddress = "http://localhost";

function detectOS() {
  const platform = os.platform();
  osName = platform;
  console.log({ osName });

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

function getAvailableDrivesInWindows(callback) {
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

function getAvailableDrivesInLinux(callback) {
  exec("ls /storage", (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return callback(error, null);
    }

    // Split the output by newlines and filter out any empty lines
    const drives = stdout
      .split("\n")
      .map((line) => line.trim()) // Trim whitespace from each line
      .filter((line) => line !== "" && line !== "self"); // Filter out any non-storage directories

    callback(null, drives);
  });
}

detectOS();

if (osName === "win32") {
  getAvailableDrivesInWindows((error, drives) => {
    if (error) {
      console.error("Failed to get drives:", error);
    } else {
      console.log("Available drives:", drives);
      drives.forEach((drive) => {
        app.use("/" + drive + "/", express.static(drive + "/")); // This assumes your drives are mounted at the root level
      });
    }
  });
}
if (osName === "linux") {
  getAvailableDrivesInLinux((error, drives) => {
    if (error) {
      console.error("Failed to get drives:", error);
    } else {
      console.log("Available drives:", drives);
      drives.forEach((drive) => {
        app.use("/" + drive, express.static("/" + drive)); // Serve each drive's contents
      });
    }
  });
}

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
sharedIpAddress = `http://${ipAddresses[5].address}:${port}`;

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

    // tree.push(node);
    res.write(JSON.stringify(node));
    console.log(node.name);
  }
  res.end();
  return tree;
}

app.get("/api/v1/", async (req, res) => {
  try {
    if (osName === "win32") {
      getAvailableDrivesInWindows((error, drives) => {
        if (error) {
          console.error("Failed to get drives:", error);
        } else {
          console.log("Available drives:", drives);
          res.send({ drives });
        }
      });
    }
    if (osName === "linux") {
      getAvailableDrivesInLinux((error, drives) => {
        if (error) {
          console.error("Failed to get drives:", error);
        } else {
          console.log("Available drives:", drives);
          res.send({ drives });
        }
      });
    }
  } catch (error) {
    console.log("Error: ", error);
  }
});
// Example usage:

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

    const baseUrl = `${sharedIpAddress}/drive/${drive}`;
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
            serverUrl: sharedIpAddress,
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

app.listen(port, () =>
  console.log(`Server running on port ${sharedIpAddress}`)
);
