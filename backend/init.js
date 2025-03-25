import { promises as fs } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import adminRoutes from "./routes/adminRoutes.js";

// Get directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create Express app
const app = express();
const PORT = 3000;

// Configure middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(join(__dirname, "public")));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Ensure data directory exists
async function ensureDataDirectory() {
  const dataDir = join(__dirname, "data");

  try {
    await fs.mkdir(dataDir, { recursive: true });
    console.log("Data directory is ready:", dataDir);
  } catch (error) {
    if (error.code !== "EEXIST") {
      console.error("Failed to create data directory:", error);
    }
  }
}

// Add a test endpoint
app.get("/test", (req, res) => {
  res.json({ message: "API test endpoint is working!" });
});

// Orders endpoints
app.get("/orders", async (req, res) => {
  try {
    const ordersPath = join(__dirname, "data", "orders.json");
    console.log("Reading orders from:", ordersPath);
    const ordersData = await fs.readFile(ordersPath, "utf8");
    res.json(JSON.parse(ordersData));
  } catch (error) {
    console.error("Error reading orders data:", error);
    res.status(500).json({ message: "Error reading orders data." });
  }
});

// Add an alias for the /orders endpoint to support legacy code
app.get("/orderget", async (req, res) => {
  console.log("orderget endpoint called - redirecting to /orders");
  try {
    const ordersPath = join(__dirname, "data", "orders.json");
    const ordersData = await fs.readFile(ordersPath, "utf8");
    res.json(JSON.parse(ordersData));
  } catch (error) {
    console.error("Error reading orders data:", error);
    res.status(500).json({ message: "Error reading orders data." });
  }
});

// Register admin routes
console.log("Registering admin routes...");
app.use("/admin", adminRoutes);
console.log("Admin routes registered");

// Root endpoint
app.get("/", (req, res) => {
  res.json({ message: "Food ordering API server is running" });
});

// Meals endpoint
app.get("/meals", async (req, res) => {
  try {
    const mealsPath = join(__dirname, "data", "available-meals.json");
    const mealsData = await fs.readFile(mealsPath, "utf8");
    res.json(JSON.parse(mealsData));
  } catch (error) {
    console.error("Error reading meals data:", error);
    res.status(500).json({ message: "Error reading meals data." });
  }
});

// Catch-all route handler
app.use((req, res) => {
  console.log(`404: No route found for ${req.method} ${req.url}`);
  res.status(404).json({ message: "Endpoint not found" });
});

// Initialize backend
async function init() {
  console.log("Initializing backend services...");

  try {
    // Ensure data directory exists first
    await ensureDataDirectory();

    // Setup sample data if needed
    await import("./data/create-data-folder.js");

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
      console.log(`Test API endpoint: http://localhost:${PORT}/test`);
      console.log(
        `Admin summary: http://localhost:${PORT}/admin/dashboard/summary?email=manasnandchoudhary@gmail.com`
      );

      // Debug routes
      console.log("\nRegistered Routes:");
      app._router.stack.forEach((middleware) => {
        if (middleware.route) {
          // Routes directly registered on the app
          const methods = Object.keys(middleware.route.methods)
            .join(",")
            .toUpperCase();
          console.log(`${methods} ${middleware.route.path}`);
        } else if (middleware.name === "router") {
          // Router middleware
          middleware.handle.stack.forEach((handler) => {
            if (handler.route) {
              const path = handler.route.path;
              const methods = Object.keys(handler.route.methods)
                .join(",")
                .toUpperCase();
              const prefix = middleware.regexp.toString().includes("/admin")
                ? "/admin"
                : "";
              console.log(`${methods} ${prefix}${path}`);
            }
          });
        }
      });
    });
  } catch (error) {
    console.error("Backend initialization failed:", error);
    process.exit(1);
  }
}

// Run the initialization
init();
