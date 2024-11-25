require("dotenv/config")
const express = require("express");
const { google } = require("googleapis");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const app = express();
const PORT = 3000;

// Load OAuth2 credential
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

const REDIRECT_URI = "http://localhost:3000/callback";

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

const drive = google.drive({ version: "v3", auth: oauth2Client });

let isAuthenticated = false;

// Middleware for parsing requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const multer = require("multer");
const upload = multer({ dest: "uploads/" }); // Temporary storage for uploaded files

// EJS for rendering
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "public"));

// Authentication Route
app.get("/auth", (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/drive"],
  });
  res.redirect(authUrl);
});

// Callback Route
app.get("/callback", async (req, res) => {
  const code = req.query.code;

  if (code) {
    try {
      const { tokens } = await oauth2Client.getToken(code);
      console.log(tokens, "tokens");
      oauth2Client.setCredentials(tokens);
      isAuthenticated = true;
      res.redirect("/");
    } catch (error) {
      res.status(500).send("Authentication failed.");
    }
  } else {
    res.status(400).send("No code provided.");
  }
});

// List files
app.get("/list", async (req, res) => {
  //   if (!isAuthenticated) return res.redirect("/auth");
  try {
    const response = await drive.files.list({
      pageSize: 10, // Limit the number of files listed (optional)
      fields: "files(id, name)", // Fetch only required fields
    });
    console.log("Files fetched:", response.data.files);
    res.render("index", { files: response.data.files, message: null });
  } catch (error) {
    console.error("Error fetching files:", error.message);
    res.render("index", { files: [], message: "Error fetching files." });
  }
});

// Upload a file
app.post("/upload", upload.single("file"), async (req, res) => {
  //   if (!isAuthenticated) return res.redirect("/auth");
  console.log(req.file);

  const file = req.file; // File uploaded by the user
  if (!file) {
    return res.render("index", { files: [], message: "No file uploaded!" });
  }

  const fileMetadata = { name: file.originalname }; // File name in Drive
  const media = {
    mimeType: file.mimetype,
    body: fs.createReadStream(file.path), // File content
  };

  try {
    // Upload the file to Google Drive
    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: "id",
    });
    console.log("File uploaded. File ID:", response.data.id);
    res.redirect("/list");
  } catch (error) {
    console.error("Error uploading file:", error.message);
    res.render("index", { files: [], message: "Error uploading file." });
  } finally {
    // Delete the temporary file
    fs.unlinkSync(file.path);
  }
});

// Delete a file
app.get("/delete/:id", async (req, res) => {
  //   if (!isAuthenticated) return res.redirect("/auth");
  const fileId = req.params.id;

  try {
    await drive.files.delete({ fileId });
    console.log(`File deleted. File ID: ${fileId}`);
    res.redirect("/list");
  } catch (error) {
    console.error("Error deleting file:", error.message);
    res.render("index", { files: [], message: "Error deleting file." });
  }
});

// Root route
app.get("/", (req, res) => {
  //   if (!isAuthenticated) return res.redirect("/auth");
  res.redirect("/list");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
