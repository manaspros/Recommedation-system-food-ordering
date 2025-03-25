import { promises as fs } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import adminRoutes from "./routes/adminRoutes.js";
import Stripe from "stripe";

// Initialize Stripe with your secret key
const stripe = new Stripe(
  "sk_test_51Q8bGm2MsMA6tFEfqWrnpvjAwoR8mVkNYs6QKXqrXyW57d5mbu1YT21PJfaVxuxbdAcu5g1lcHIyE2di3Qh475xC00wepeGUTK"
);

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

// Create a checkout session endpoint
const YOUR_DOMAIN = "http://localhost:3000";

app.post("/create-checkout-session", async (req, res) => {
  const { products } = req.body;

  // Validate products data
  if (!products || products.length === 0) {
    return res.status(400).json({ message: "No products provided" });
  }

  try {
    console.log("Creating checkout session for products:", products);

    // Match app.cjs implementation - multiply prices by 100
    const lineItems = products.map((product) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: product.name,
          images: product.image ? [`${YOUR_DOMAIN}/${product.image}`] : [],
        },
        // Multiply by 100 to match app.cjs implementation
        unit_amount: product.price * 100,
      },
      quantity: product.quantity,
    }));

    console.log("Line items for Stripe:", lineItems);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${YOUR_DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${YOUR_DOMAIN}/cancel`,
    });

    console.log("Checkout session created:", session.id);
    res.json({ id: session.id });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({
      message: "Something went wrong with Stripe checkout",
      error: error.message,
    });
  }
});

// Process successful payments and store them
app.get("/success", async (req, res) => {
  const { session_id } = req.query;

  try {
    console.log("Processing successful payment for session:", session_id);

    const session = await stripe.checkout.sessions.retrieve(session_id);

    // Check the payment status
    if (session.payment_status === "paid") {
      const paymentData = {
        id: session.id,
        amount_total: session.amount_total,
        currency: session.currency,
        customer_email: session.customer_email,
        date: new Date().toISOString(),
      };

      const successPath = join(__dirname, "data", "success.json");
      const successData = await fs.readFile(successPath, "utf8");
      const allSuccessOrders = JSON.parse(successData);

      allSuccessOrders.push(paymentData);
      await fs.writeFile(
        successPath,
        JSON.stringify(allSuccessOrders, null, 2)
      );

      // Redirect to the frontend success page
      res.redirect(`http://localhost:5173/success?payment=success`);
    } else {
      res.status(400).json({ message: "Payment not completed" });
    }
  } catch (error) {
    console.error("Error processing payment success:", error);
    res.status(500).json({ message: "Error processing the payment." });
  }
});

// Orders endpoints
app.get("/orders", async (req, res) => {
  try {
    const ordersPath = join(__dirname, "data", "orders.json");
    console.log("Reading orders from:", ordersPath);
    const ordersData = await fs.readFile(ordersPath, "utf8");
    const orders = JSON.parse(ordersData);

    // Only return orders that are not marked as completed
    // If includeCompleted query param is true, return all orders
    const includeCompleted = req.query.includeCompleted === "true";
    const filteredOrders = includeCompleted
      ? orders
      : orders.filter((order) => !order.completed);

    res.json(filteredOrders);
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

// Add an endpoint to mark orders as completed
app.put("/orders/:id/complete", async (req, res) => {
  const orderId = req.params.id;

  try {
    const ordersPath = join(__dirname, "data", "orders.json");
    const ordersData = await fs.readFile(ordersPath, "utf8");
    const orders = JSON.parse(ordersData);

    const orderIndex = orders.findIndex((order) => order.id === orderId);

    if (orderIndex === -1) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Mark the order as completed and add completion timestamp
    orders[orderIndex].completed = true;
    orders[orderIndex].completedAt = new Date().toISOString();

    await fs.writeFile(ordersPath, JSON.stringify(orders, null, 2));
    res.json({
      message: "Order marked as completed",
      order: orders[orderIndex],
    });
  } catch (error) {
    console.error("Error marking order as completed:", error);
    res.status(500).json({ message: "Failed to mark order as completed" });
  }
});

// Health-based recommendations endpoint
app.get("/health-recommendations", async (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    // Import the module dynamically
    const { default: userPreferencesService } = await import(
      "./services/userPreferencesService.js"
    );

    const recommendations =
      await userPreferencesService.getHealthBasedRecommendations(userId);
    res.json(recommendations);
  } catch (error) {
    console.error("Error generating health recommendations:", error);
    res
      .status(500)
      .json({ message: "Failed to generate health recommendations" });
  }
});

// Get user preferences
app.get("/user-preferences", async (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    // Import the module dynamically
    const { default: userPreferencesService } = await import(
      "./services/userPreferencesService.js"
    );

    const preferences = await userPreferencesService.getUserPreferences(userId);
    res.json(preferences);
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    res.status(500).json({ message: "Failed to fetch user preferences" });
  }
});

// Update user preferences
app.post("/user-preferences", async (req, res) => {
  const { userId, preferences } = req.body;

  if (!userId || !preferences) {
    return res
      .status(400)
      .json({ message: "User ID and preferences are required" });
  }

  try {
    // Import the module dynamically
    const { default: userPreferencesService } = await import(
      "./services/userPreferencesService.js"
    );

    const result = await userPreferencesService.updateUserPreferences(
      userId,
      preferences
    );

    if (result.success) {
      res.json({
        message: "Preferences updated successfully",
        preferences: result.preferences,
      });
    } else {
      res.status(500).json({
        message: "Failed to update preferences",
        error: result.error,
      });
    }
  } catch (error) {
    console.error("Error updating user preferences:", error);
    res.status(500).json({ message: "Failed to update preferences" });
  }
});

// Get personalized recommendations endpoint
app.get("/recommendations", async (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    // Import the module dynamically
    const { default: recommendationService } = await import(
      "./services/recommendationService.js"
    );

    const recommendations = await recommendationService.getUserRecommendations(
      userId
    );
    res.json(recommendations);
  } catch (error) {
    console.error("Error generating recommendations:", error);
    res.status(500).json({ message: "Failed to generate recommendations" });
  }
});

// Add cart recommendations endpoint
app.post("/cart-recommendations", async (req, res) => {
  const { userId, cartItems } = req.body;

  console.log("Cart recommendations requested for user:", userId);
  console.log("Cart items:", cartItems);

  if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
    return res.status(400).json({ message: "Valid cart items are required" });
  }

  try {
    // Load all available meals
    const mealsPath = join(__dirname, "data", "available-meals.json");
    const mealsData = await fs.readFile(mealsPath, "utf8");
    const allMeals = JSON.parse(mealsData);

    // Load orders to find user's previous orders (for collaborative filtering)
    const ordersPath = join(__dirname, "data", "orders.json");
    const ordersData = await fs.readFile(ordersPath, "utf8");
    const orders = JSON.parse(ordersData);

    // Extract cart item IDs
    const cartItemIds = cartItems.map((item) => item.id);

    // Find cart items details from all meals
    const cartItemsDetails = allMeals.filter((meal) =>
      cartItemIds.includes(meal.id)
    );

    // Extract categories and tags from cart items
    const cartCategories = new Set(
      cartItemsDetails.map((item) => item.category).filter(Boolean)
    );

    const cartTags = new Set(
      cartItemsDetails.flatMap((item) => item.tags || [])
    );

    console.log("Cart categories:", [...cartCategories]);
    console.log("Cart tags:", [...cartTags]);

    // Find user's order history
    const userOrders = orders.filter(
      (order) => order.customer && order.customer.email === userId
    );

    // Get items user has ordered in the past
    const userOrderItemIds = new Set(
      userOrders.flatMap((order) => order.items.map((item) => item.id))
    );

    // Calculate recommendation scores for potential items
    const scoredItems = allMeals
      .filter((meal) => !cartItemIds.includes(meal.id)) // Exclude items already in cart
      .map((meal) => {
        let score = 0;

        // Score based on matching category
        if (meal.category && cartCategories.has(meal.category)) {
          score += 2;
        }

        // Score based on matching tags
        const matchingTags = (meal.tags || []).filter((tag) =>
          cartTags.has(tag)
        );
        score += matchingTags.length * 1.5;

        // Score based on user's order history
        if (userOrderItemIds.has(meal.id)) {
          score += 1; // Boost score if user ordered it before
        }

        // Slight boost for popular items
        if (meal.tags && meal.tags.includes("popular")) {
          score += 0.5;
        }

        return { meal, score };
      });

    // Sort by score and take top recommendations
    scoredItems.sort((a, b) => b.score - a.score);

    // Take top 3 recommendations
    const recommendations = scoredItems.slice(0, 3).map((item) => item.meal);

    console.log(`Returning ${recommendations.length} cart recommendations`);
    res.json(recommendations);
  } catch (error) {
    console.error("Error generating cart recommendations:", error);
    res.status(500).json({
      message: "Failed to generate recommendations",
      error: error.message,
    });
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
