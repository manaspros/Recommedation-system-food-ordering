import express from "express";
import { promises as fs } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Log registered routes for debugging
console.log("Admin routes being registered:");
console.log(" - /dashboard/summary");
console.log(" - /dashboard/sales-trends");
console.log(" - /dashboard/popular-items");
console.log(" - /dashboard/customer-insights");
console.log(" - /dashboard/inventory-forecast");
console.log(" - /dashboard/performance");

// Authentication middleware for admin routes
const authenticateAdmin = async (req, res, next) => {
  const { email } = req.query;
  console.log("Auth middleware checking email:", email);

  // For demo purposes: Only specific users can access admin routes
  // In production, implement proper authentication with JWT or similar
  const adminEmails = ["admin@example.com", "manasnandchoudhary@gmail.com"];

  if (!email || !adminEmails.includes(email)) {
    console.log("Authentication failed for email:", email);
    return res
      .status(403)
      .json({ message: "Access denied. Admin privileges required." });
  }

  console.log("Authentication successful for email:", email);
  next();
};

// Apply middleware to all routes
router.use(authenticateAdmin);

// Helper function to safely read files
async function readJsonFile(filePath) {
  try {
    console.log("Attempting to read file:", filePath);
    const data = await fs.readFile(filePath, "utf8");
    console.log(`Successfully read file: ${filePath}`);
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    if (error.code === "ENOENT") {
      console.error(`File not found: ${filePath}`);
    }
    throw error;
  }
}

// Dashboard Summary - Key metrics
router.get("/dashboard/summary", async (req, res) => {
  console.log("Dashboard summary endpoint called");
  try {
    // Load orders data
    const ordersPath = join(__dirname, "..", "data", "orders.json");
    console.log("Orders path:", ordersPath);

    // Check if file exists
    try {
      await fs.access(ordersPath);
      console.log("Orders file exists");
    } catch (error) {
      console.error("Orders file does not exist:", error.message);
    }

    const orders = await readJsonFile(ordersPath).catch(() => []);

    // Load successful payments data
    const successPath = join(__dirname, "..", "data", "success.json");
    console.log("Success path:", successPath);

    // Check if file exists
    try {
      await fs.access(successPath);
      console.log("Success file exists");
    } catch (error) {
      console.error("Success file does not exist:", error.message);
    }

    const successfulPayments = await readJsonFile(successPath).catch(() => []);

    // Calculate dashboard metrics
    console.log(
      `Found ${orders.length} orders and ${successfulPayments.length} payments`
    );

    const totalOrders = orders.length;
    const totalRevenue = successfulPayments.reduce(
      (sum, payment) => sum + (payment.amount_total || 0) / 100,
      0
    );

    // Get unique customer count
    const uniqueCustomers = new Set(
      orders.map((order) => order.customer?.email).filter(Boolean)
    ).size;

    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const responseData = {
      totalOrders,
      totalRevenue,
      avgOrderValue,
      uniqueCustomers,
      pendingOrders: orders.filter(
        (order) => !successfulPayments.some((p) => p.id === order.id)
      ).length,
      completedOrders: successfulPayments.length,
      conversionRate:
        ((successfulPayments.length / totalOrders) * 100).toFixed(2) + "%",
    };

    console.log("Sending summary response:", responseData);
    res.json(responseData);
  } catch (error) {
    console.error("Error generating dashboard summary:", error);
    res.status(500).json({
      message: "Failed to generate dashboard summary",
      error: error.message,
    });
  }
});

// Sales Trends - Daily/Weekly/Monthly data
router.get("/dashboard/sales-trends", async (req, res) => {
  console.log("Sales trends endpoint called with period:", req.query.period);
  try {
    const { period = "daily" } = req.query;

    // Load successful payments (they contain the payment date)
    const successPath = join(__dirname, "..", "data", "success.json");
    const successData = await fs.readFile(successPath, "utf8");
    const successfulPayments = JSON.parse(successData);

    // Add dates for orders without them (for demo purpose)
    const paymentsWithDates = successfulPayments.map((payment) => {
      if (!payment.date) {
        // Generate random date within last 30 days for demo data
        const randomDays = Math.floor(Math.random() * 30);
        const date = new Date();
        date.setDate(date.getDate() - randomDays);
        return { ...payment, date: date.toISOString() };
      }
      return payment;
    });

    // Group by the specified period
    const salesByPeriod = {};

    paymentsWithDates.forEach((payment) => {
      const date = new Date(payment.date);
      let key;

      if (period === "daily") {
        key = date.toISOString().split("T")[0]; // YYYY-MM-DD
      } else if (period === "weekly") {
        // Get week number
        const weekNumber = Math.ceil(
          (date.getDate() +
            new Date(date.getFullYear(), date.getMonth(), 1).getDay()) /
            7
        );
        key = `${date.getFullYear()}-W${weekNumber}`;
      } else if (period === "monthly") {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          "0"
        )}`;
      }

      if (!salesByPeriod[key]) {
        salesByPeriod[key] = {
          period: key,
          revenue: 0,
          orders: 0,
        };
      }

      salesByPeriod[key].revenue += (payment.amount_total || 0) / 100;
      salesByPeriod[key].orders += 1;
    });

    // Convert to array and sort by date
    const result = Object.values(salesByPeriod).sort((a, b) =>
      a.period.localeCompare(b.period)
    );

    res.json(result);
  } catch (error) {
    console.error("Error generating sales trends:", error);
    res.status(500).json({ message: "Failed to generate sales trends" });
  }
});

// Popular Items - Most ordered products
router.get("/dashboard/popular-items", async (req, res) => {
  console.log("Popular items endpoint called");
  try {
    // Load orders and meals data
    const ordersPath = join(__dirname, "..", "data", "orders.json");
    const mealsPath = join(__dirname, "..", "data", "available-meals.json");

    const ordersData = await fs.readFile(ordersPath, "utf8");
    const mealsData = await fs.readFile(mealsPath, "utf8");

    const orders = JSON.parse(ordersData);
    const meals = JSON.parse(mealsData);

    // Count items and revenue by product
    const itemsData = {};

    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (!itemsData[item.id]) {
          const mealDetails = meals.find((meal) => meal.id === item.id) || {};

          itemsData[item.id] = {
            id: item.id,
            name: item.name,
            quantity: 0,
            revenue: 0,
            avgOrderValue: 0,
            category: mealDetails.category || "Uncategorized",
            image: mealDetails.image,
            price: item.price,
          };
        }

        itemsData[item.id].quantity += item.quantity;
        itemsData[item.id].revenue += item.price * item.quantity;
      });
    });

    // Calculate average order value
    Object.keys(itemsData).forEach((id) => {
      itemsData[id].avgOrderValue = (
        itemsData[id].revenue / itemsData[id].quantity
      ).toFixed(2);
    });

    // Convert to array and sort by quantity
    const popularItems = Object.values(itemsData).sort(
      (a, b) => b.quantity - a.quantity
    );

    res.json(popularItems);
  } catch (error) {
    console.error("Error generating popular items:", error);
    res.status(500).json({ message: "Failed to generate popular items data" });
  }
});

// Customer Insights - User ordering patterns
router.get("/dashboard/customer-insights", async (req, res) => {
  console.log("Customer insights endpoint called");
  try {
    // Load orders data
    const ordersPath = join(__dirname, "..", "data", "orders.json");
    const ordersData = await fs.readFile(ordersPath, "utf8");
    const orders = JSON.parse(ordersData);

    // Analyze customer data
    const customers = {};

    orders.forEach((order) => {
      const { email } = order.customer;

      if (!customers[email]) {
        customers[email] = {
          email,
          name: order.customer.name,
          orderCount: 0,
          totalSpent: 0,
          avgOrderValue: 0,
          favoriteItems: {},
          lastOrderDate: null,
        };
      }

      const customer = customers[email];
      customer.orderCount += 1;

      // Calculate total spent
      const orderTotal = order.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      customer.totalSpent += orderTotal;

      // Track favorite items
      order.items.forEach((item) => {
        if (!customer.favoriteItems[item.id]) {
          customer.favoriteItems[item.id] = {
            id: item.id,
            name: item.name,
            quantity: 0,
          };
        }

        customer.favoriteItems[item.id].quantity += item.quantity;
      });

      // Get most recent order date
      const orderDate = order.date || new Date().toISOString();
      if (!customer.lastOrderDate || orderDate > customer.lastOrderDate) {
        customer.lastOrderDate = orderDate;
      }
    });

    // Process customer data for response
    const customerInsights = Object.values(customers)
      .map((customer) => {
        // Calculate average order value
        customer.avgOrderValue = (
          customer.totalSpent / customer.orderCount
        ).toFixed(2);

        // Get favorite items as array, sorted by quantity
        const favoriteItems = Object.values(customer.favoriteItems).sort(
          (a, b) => b.quantity - a.quantity
        );

        // Get top favorite item
        const topFavoriteItem =
          favoriteItems.length > 0 ? favoriteItems[0] : null;

        return {
          email: customer.email,
          name: customer.name,
          orderCount: customer.orderCount,
          totalSpent: customer.totalSpent,
          avgOrderValue: customer.avgOrderValue,
          topFavoriteItem,
          lastOrderDate: customer.lastOrderDate,
        };
      })
      .sort((a, b) => b.totalSpent - a.totalSpent);

    res.json(customerInsights);
  } catch (error) {
    console.error("Error generating customer insights:", error);
    res.status(500).json({ message: "Failed to generate customer insights" });
  }
});

// Inventory Forecast - Projected inventory needs
router.get("/dashboard/inventory-forecast", async (req, res) => {
  console.log("Inventory forecast endpoint called");
  try {
    // Load orders and meals data
    const ordersPath = join(__dirname, "..", "data", "orders.json");
    const mealsPath = join(__dirname, "..", "data", "available-meals.json");

    const ordersData = await fs.readFile(ordersPath, "utf8");
    const mealsData = await fs.readFile(mealsPath, "utf8");

    const orders = JSON.parse(ordersData);
    const meals = JSON.parse(mealsData);

    // Filter orders from last 30 days for forecasting
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Add dummy dates for demo if dates not available
    const ordersWithDates = orders.map((order) => {
      if (!order.date) {
        const randomDays = Math.floor(Math.random() * 30);
        const date = new Date();
        date.setDate(date.getDate() - randomDays);
        return { ...order, date: date.toISOString() };
      }
      return order;
    });

    const recentOrders = ordersWithDates.filter(
      (order) => new Date(order.date) >= thirtyDaysAgo
    );

    // Calculate daily usage rate for each item
    const itemUsage = {};

    recentOrders.forEach((order) => {
      order.items.forEach((item) => {
        if (!itemUsage[item.id]) {
          itemUsage[item.id] = {
            id: item.id,
            name: item.name,
            totalQuantity: 0,
            dailyRate: 0,
            weeklyForecast: 0,
            monthlyForecast: 0,
            mealDetails: meals.find((meal) => meal.id === item.id) || {},
          };
        }

        itemUsage[item.id].totalQuantity += item.quantity;
      });
    });

    // Calculate daily rate and forecasts
    const daysInPeriod = 30; // Using 30 days for calculation

    Object.keys(itemUsage).forEach((id) => {
      const item = itemUsage[id];
      item.dailyRate = item.totalQuantity / daysInPeriod;
      item.weeklyForecast = Math.ceil(item.dailyRate * 7);
      item.monthlyForecast = Math.ceil(item.dailyRate * 30);
    });

    // Convert to array and sort by monthly forecast
    const inventoryForecast = Object.values(itemUsage).sort(
      (a, b) => b.monthlyForecast - a.monthlyForecast
    );

    res.json(inventoryForecast);
  } catch (error) {
    console.error("Error generating inventory forecast:", error);
    res.status(500).json({ message: "Failed to generate inventory forecast" });
  }
});

// Performance metrics endpoint
router.get("/dashboard/performance", async (req, res) => {
  console.log("Performance metrics endpoint called");
  try {
    // This would normally pull from a performance tracking system
    // For demo, we'll generate some realistic metrics

    // Simulated order fulfillment times (in minutes)
    const fulfillmentTimes = [12, 18, 15, 22, 11, 14, 17, 13, 19, 16];
    const avgFulfillmentTime =
      fulfillmentTimes.reduce((sum, time) => sum + time, 0) /
      fulfillmentTimes.length;

    // Simulated customer ratings (1-5)
    const customerRatings = [4, 5, 5, 3, 4, 5, 4, 4, 5, 4];
    const avgCustomerRating =
      customerRatings.reduce((sum, rating) => sum + rating, 0) /
      customerRatings.length;

    // Simulated system uptime
    const systemUptime = 99.8; // percentage

    // Simulated order error rate
    const orderErrorRate = 1.2; // percentage

    // Peak hours analysis
    const peakHours = [
      { hour: 12, orders: 24 },
      { hour: 13, orders: 28 },
      { hour: 18, orders: 32 },
      { hour: 19, orders: 36 },
      { hour: 20, orders: 27 },
    ];

    res.json({
      avgFulfillmentTime,
      avgCustomerRating,
      systemUptime,
      orderErrorRate,
      peakHours,
      responseTime: 2.3, // seconds
      activeUsers: 145,
      menuItemCount: 20,
    });
  } catch (error) {
    console.error("Error generating performance metrics:", error);
    res.status(500).json({ message: "Failed to generate performance metrics" });
  }
});

// Debug endpoint to verify router is working
router.get("/test", (req, res) => {
  res.json({ message: "Admin router is working properly" });
});

// Log all routes in this router for debugging
console.log("Admin Router Routes:");
router.stack.forEach((route) => {
  if (route.route) {
    const methods = Object.keys(route.route.methods).join(",").toUpperCase();
    console.log(`${methods} /admin${route.route.path}`);
  }
});

export default router;
