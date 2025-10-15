import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors"; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// --- Setup File Paths ---
// Define the path to your static files directory (the 'Public' folder)
const publicDir = path.join(__dirname, "Public");

// Create 'data' directory if it doesn't exist
const dataDir = path.join(__dirname, "Data"); // NOTE: Using 'Data' to match your image
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}
const playersFile = path.join(dataDir, "players.json");


// --- Middleware ---
app.use(cors()); 
app.use(express.json());

// **CRITICAL FIX:** Tell Express to serve files from the 'Public' folder.
app.use(express.static(publicDir)); 


// --- API Endpoints ---
// (API code for /api/players POST and GET remains the same as before)
// ... [Existing API code goes here] ...
app.get("/api/players", (req, res) => {
    fs.readFile(playersFile, "utf8", (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') return res.send([]); 
            return res.status(500).send("Error reading player data");
        }
        res.send(JSON.parse(data || "[]"));
    });
});

app.post("/api/players", (req, res) => {
    const newRecord = req.body; 
    fs.readFile(playersFile, "utf8", (err, data) => {
        let players = [];
        if (!err && data) {
            try {
                players = JSON.parse(data);
            } catch (e) {
                console.error("Error parsing players.json:", e);
                players = [];
            }
        }
        
        players.push(newRecord);
        
        fs.writeFile(playersFile, JSON.stringify(players, null, 2), (err) => {
            if (err) return res.status(500).send("Error saving data");
            res.send({ message: "Player data saved successfully" });
        });
    });
});


// **FIX 2:** Explicitly serve index.html when the root '/' is requested
app.get('/', (req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
});


// --- Start Server ---
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`Open in browser: http://localhost:${PORT}`);
});