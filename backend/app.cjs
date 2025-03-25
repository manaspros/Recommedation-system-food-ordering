const fs = require("fs/promises");
const bodyParser = require("body-parser");
const express = require("express");
const Stripe = require("stripe");
const path = require("path");
const stripe = new Stripe(
  "sk_test_51Q8bGm2MsMA6tFEfqWrnpvjAwoR8mVkNYs6QKXqrXyW57d5mbu1YT21PJfaVxuxbdAcu5g1lcHIyE2di3Qh475xC00wepeGUTK"
);

// Create express app
const app = express();
app.use(bodyParser.json());
app.use(express.static("public"));

// CORS configuration
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// Initialize the services after the app to avoid hoisting issues
let recommendationService = null;
let userPreferencesService = null;
let adminRoutes = null;

// Initialize services dynamically
async function initServices() {
  try {
    // Dynamic import for ESM modules
    const recModule = await import("./services/recommendationService.js");
    recommendationService = recModule.default;

    const prefModule = await import("./services/userPreferencesService.js");
    userPreferencesService = prefModule.default;

    // Import admin routes
    const adminRoutesModule = await import("./routes/adminRoutes.js");
    adminRoutes = adminRoutesModule.default;

    // Use admin routes
    app.use("/admin", adminRoutes);

    console.log("Services initialized successfully");
    startServer();
  } catch (error) {
    console.error("Error initializing services:", error);
    process.exit(1);
  }
}

// Add a seed function to create test data if orders.json is empty
async function seedTestData() {
  try {
    const ordersPath = "./data/orders.json";
    const data = await fs.readFile(ordersPath, "utf8");
    const orders = JSON.parse(data);

    if (orders.length === 0) {
      console.log("Creating sample order data for testing");
      const testOrder = {
        id: "test-order-1",
        customer: {
          name: "Test User",
          email: "test@example.com", // Replace with your login email when testing
          street: "Test Street",
          "postal-code": "12345",
        },
        items: [
          {
            id: "m1",
            name: "Mac & Cheese",
            price: 100,
            quantity: 2,
          },
          {
            id: "m2",
            name: "Margherita Pizza",
            price: 200,
            quantity: 1,
          },
        ],
      };

      orders.push(testOrder);
      await fs.writeFile(ordersPath, JSON.stringify(orders, null, 2));
      console.log("Sample order created successfully");
    }
  } catch (error) {
    console.error("Error seeding test data:", error);
  }
}

// Get available meals
app.get("/meals", async (req, res) => {
  try {
    const meals = await fs.readFile("./data/available-meals.json", "utf8");
    res.json(JSON.parse(meals));
  } catch (error) {
    console.error("Error reading meals data:", error);
    res.status(500).json({ message: "Error reading meals data." });
  }
});

app.get("/orderget", async (req, res) => {
  try {
    const meals = await fs.readFile("./data/orders.json", "utf8");
    res.json(JSON.parse(meals));
  } catch (error) {
    console.error("Error reading orders data:", error);
    res.status(500).json({ message: "Error reading meals data." });
  }
});

app.post("/orders", async (req, res) => {
  const orderData = req.body.order;

  // Validate order data
  if (!orderData || !orderData.items || orderData.items.length === 0) {
    return res.status(400).json({ message: "Missing data." });
  }

  const { email, name, street, "postal-code": postalCode } = orderData.customer;
  if (
    !email ||
    !email.includes("@") ||
    !name ||
    !name.trim() ||
    !street ||
    !street.trim() ||
    !postalCode ||
    !postalCode.trim()
  ) {
    return res.status(400).json({
      message: "Missing data: Email, name, street, postal code is missing.",
    });
  }

  // Create a new order
  const newOrder = { ...orderData, id: (Math.random() * 1000).toString() };
  try {
    const orders = await fs.readFile("./data/orders.json", "utf8");
    const allOrders = JSON.parse(orders);
    allOrders.push(newOrder);
    await fs.writeFile("./data/orders.json", JSON.stringify(allOrders));
    res.status(201).json({ message: "Order created!" });
  } catch (error) {
    res.status(500).json({ message: "Error processing the order." });
  }
});

// Create a checkout session
const YOUR_DOMAIN = "http://localhost:3000";

app.post("/create-checkout-session", async (req, res) => {
  const { products } = req.body;

  // Validate products data
  if (!products || products.length === 0) {
    return res.status(400).json({ message: "No products provided" });
  }

  const lineItems = products.map((product) => ({
    price_data: {
      currency: "inr",
      product_data: {
        name: product.name,
        images: [product.image], // Use `images` instead of `image`
      },
      unit_amount: product.price * 100, // Amount should be in the smallest currency unit
    },
    quantity: product.quantity,
  }));

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${YOUR_DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${YOUR_DOMAIN}/cancel`,
    });
    res.json({ id: session.id });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res
      .status(500)
      .json({ message: "Something went wrong with Stripe checkout" });
  }
});

// Endpoint to handle successful payments and store them in success.json
app.get("/success", async (req, res) => {
  const { session_id } = req.query; // Get session_id from query parameters

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);

    // Check the payment status
    if (session.payment_status === "paid") {
      const paymentData = {
        id: session.id,
        amount_total: session.amount_total,
        currency: session.currency,
        customer_email: session.customer_email,
        date: new Date().toISOString(),
        // Add any other data you want to save
      };

      const successOrders = await fs.readFile("./data/success.json", "utf8");
      const allSuccessOrders = JSON.parse(successOrders);
      allSuccessOrders.push(paymentData);
      await fs.writeFile(
        "./data/success.json",
        JSON.stringify(allSuccessOrders)
      );

      // Return a success message that the frontend will use
      res.redirect(`http://localhost:5175/success?payment=success`);
    } else {
      res.status(400).json({ message: "Payment not completed" });
    }
  } catch (error) {
    console.error("Error processing success:", error);
    res.status(500).json({ message: "Error processing the payment." });
  }
});

// Serve the success page
app.get("/success", (req, res) => {
  res.sendFile(__dirname + "/src/components/success.jsx"); // Adjust this path
});

// DELETE route to remove an order by ID
app.delete("/orders/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const orders = await fs.readFile("./data/orders.json", "utf8");
    const allOrders = JSON.parse(orders);
    const updatedOrders = allOrders.filter((order) => order.id !== id); // Filter out the order to delete

    await fs.writeFile("./data/orders.json", JSON.stringify(updatedOrders));
    res.status(200).json({ message: "Order deleted successfully." });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ message: "Error deleting the order." });
  }
});

// New endpoint: Get personalized recommendations
app.get("/recommendations", async (req, res) => {
  const userId = req.query.userId; // This could be email or user ID

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const recommendations = await recommendationService.getUserRecommendations(
      userId
    );
    res.json(recommendations);
  } catch (error) {
    console.error("Error generating recommendations:", error);
    res.status(500).json({ message: "Failed to generate recommendations" });
  }
});

// Health-based recommendations endpoint
app.get("/health-recommendations", async (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
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
      res
        .status(500)
        .json({ message: "Failed to update preferences", error: result.error });
    }
  } catch (error) {
    console.error("Error updating user preferences:", error);
    res.status(500).json({ message: "Failed to update preferences" });
  }
});

// New endpoint: Get cart-specific recommendations
app.post("/cart-recommendations", async (req, res) => {
  const { userId, cartItems } = req.body;

  if (!userId || !cartItems || cartItems.length === 0) {
    return res
      .status(400)
      .json({ message: "User ID and cart items are required" });
  }

  try {
    const recommendations = await recommendationService.getCartRecommendations(
      userId,
      cartItems
    );
    res.json(recommendations);
  } catch (error) {
    console.error("Error generating cart recommendations:", error);
    res
      .status(500)
      .json({ message: "Failed to generate cart recommendations" });
  }
});

// Catch-all route for undefined routes
app.use((req, res) => {
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  res.status(404).json({ message: "Not found" });
});

// Start the server function
function startServer() {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

// Call the seed function before initializing services
seedTestData().then(() => {
  // Initialize services and start server
  initServices();
});
