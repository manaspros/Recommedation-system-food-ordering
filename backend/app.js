import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { promises as fs } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import adminRoutes from "./routes/adminRoutes.js";

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json());
app.use(express.static(join(__dirname, "public")));

// More detailed logging for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  if (req.query && Object.keys(req.query).length > 0) {
    console.log("Query params:", req.query);
  }
  next();
});

// Test endpoint to verify server is working
app.get("/test", (req, res) => {
  res.json({ message: "Test endpoint is working!" });
});

// Routes
app.get("/", (req, res) => {
  res.json({ message: "API is running" });
});

// Register admin routes - add logging to verify registration
console.log("Registering admin routes...");
app.use("/admin", adminRoutes);
console.log("Admin routes registered successfully");

// List all available routes for debugging
console.log("Available routes:");
app._router.stack.forEach((middleware) => {
  if (middleware.route) {
    // Routes directly registered on the app
    console.log(
      `${Object.keys(middleware.route.methods)} ${middleware.route.path}`
    );
  } else if (middleware.name === "router") {
    // Router middleware
    middleware.handle.stack.forEach((handler) => {
      if (handler.route) {
        const path = handler.route.path;
        console.log(`${Object.keys(handler.route.methods)} /admin${path}`);
      }
    });
  }
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

// Orders endpoint
app.get("/orders", async (req, res) => {
  try {
    const ordersPath = join(__dirname, "data", "orders.json");
    const ordersData = await fs.readFile(ordersPath, "utf8");
    res.json(JSON.parse(ordersData));
  } catch (error) {
    console.error("Error reading orders data:", error);
    res.status(500).json({ message: "Error reading orders data." });
  }
});

// Post order endpoint
app.post("/orders", async (req, res) => {
  const orderData = req.body.order;

  // Simple validation
  if (!orderData || !orderData.items || !orderData.customer) {
    return res.status(400).json({ message: "Invalid order data." });
  }

  try {
    const ordersPath = join(__dirname, "data", "orders.json");
    const ordersData = await fs.readFile(ordersPath, "utf8");
    const orders = JSON.parse(ordersData);

    // Add new order with generated ID and current date
    const newOrder = {
      ...orderData,
      id: `${Date.now()}.${Math.random().toString().slice(2)}`,
      date: new Date().toISOString(),
    };

    orders.push(newOrder);
    await fs.writeFile(ordersPath, JSON.stringify(orders, null, 2));

    res
      .status(201)
      .json({ message: "Order created successfully", orderId: newOrder.id });
  } catch (error) {
    console.error("Error saving order:", error);
    res.status(500).json({ message: "Failed to save order." });
  }
});

// Delete order endpoint
app.delete("/orders/:id", async (req, res) => {
  const orderId = req.params.id;

  try {
    const ordersPath = join(__dirname, "data", "orders.json");
    const ordersData = await fs.readFile(ordersPath, "utf8");
    const orders = JSON.parse(ordersData);

    const updatedOrders = orders.filter((order) => order.id !== orderId);

    if (orders.length === updatedOrders.length) {
      return res.status(404).json({ message: "Order not found" });
    }

    await fs.writeFile(ordersPath, JSON.stringify(updatedOrders, null, 2));
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ message: "Failed to delete order." });
  }
});

// Catch-all route handler - update to provide more helpful debugging
app.use((req, res) => {
  console.log(`404: ${req.method} ${req.url} - Route not found`);
  res
    .status(404)
    .json({ message: "Endpoint not found", path: req.originalUrl });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(`Error: ${err.message}`);
  console.error(err.stack);
  res
    .status(500)
    .json({ message: "Something went wrong!", error: err.message });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Test endpoint: http://localhost:${PORT}/test`);
  console.log(
    `Admin summary: http://localhost:${PORT}/admin/dashboard/summary?email=manasnandchoudhary@gmail.com`
  );
});

export default app;
