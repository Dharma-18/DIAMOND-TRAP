import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import { MongoClient } from "mongodb"; // Use the MongoDB driver

// --- Basic Setup ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

// --- 1. DYNAMIC PORT FOR AZURE ---
// Azure provides the port to use via an environment variable.
// We use that port, or fall back to 3000 for local testing.
const port = process.env.PORT || 3000;

// --- 2. DATABASE CONNECTION ---
// Get the secret connection string from the Azure App Service configuration.
const uri = process.env.COSMOSDB_CONNECTION_STRING;

// Check if the connection string exists. If not, the app can't start.
if (!uri) {
    console.error("FATAL ERROR: COSMOSDB_CONNECTION_STRING environment variable is not set.");
    process.exit(1); // Exit the application if the database connection string is missing.
}

const client = new MongoClient(uri);
let playersCollection; // This variable will hold our connection to the 'winners' collection

// Asynchronous function to connect to the database
async function connectDb() {
    try {
        await client.connect();
        const database = client.db("gameDb"); // The database name you created
        playersCollection = database.collection("winners"); // The collection name you created
        console.log("Successfully connected to Azure Cosmos DB!");
    } catch (error) {
        console.error("Failed to connect to the database", error);
        await client.close();
        process.exit(1); // Exit if we can't connect to the DB
    }
}

// --- Middleware ---
app.use(cors());
app.use(express.json());

// Serve the static files (HTML, CSS, JS) from the 'Public' folder
const publicDir = path.join(__dirname, "Public");
app.use(express.static(publicDir));


// --- API Endpoints (Using the Database) ---

// GET: Fetch all player records from the database
app.get("/api/players", async (req, res) => {
    try {
        const players = await playersCollection.find({}).toArray();
        res.json(players); // Send the records as JSON
    } catch (error) {
        console.error("Error fetching player data:", error);
        res.status(500).send("Error fetching player data");
    }
});

// POST: Add a new player record to the database
app.post("/api/players", async (req, res) => {
    try {
        const newRecord = req.body;
        const result = await playersCollection.insertOne(newRecord);
        res.status(201).json({ message: "Player data saved successfully", insertedId: result.insertedId });
    } catch (error) {
        console.error("Error saving player data:", error);
        res.status(500).send("Error saving data");
    }
});


// Fallback to serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
});


// --- Start Server ---
// Connect to the database first, then start the web server.
connectDb().then(() => {
    app.listen(port, () => {
        console.log(`🚀 Server running on port ${port}`);
    });
});