import { promises as fs } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Sample data
const ordersData = [
  {
    id: "test-order-1",
    customer: {
      name: "Test User",
      email: "test@example.com",
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
    date: "2023-12-01T10:30:00.000Z",
  },
  {
    items: [
      {
        id: "m2",
        name: "Margherita Pizza",
        price: 200,
        quantity: 1,
      },
    ],
    customer: {
      name: "Manas Choudhary",
      email: "manasnandchoudhary@gmail.com",
      street: "raman",
      "postal-code": "322",
    },
    id: "324.2208186224287",
    date: "2023-12-15T14:45:00.000Z",
  },
];

const successData = [
  {
    id: "test-order-1",
    amount_total: 40000,
    status: "complete",
    created: "2023-12-01T10:30:00.000Z",
  },
  {
    id: "324.2208186224287",
    amount_total: 52000,
    status: "complete",
    created: "2023-12-15T14:45:00.000Z",
  },
];

// Simple meal data
const mealsData = [
  {
    id: "m1",
    name: "Mac & Cheese",
    price: 100,
    description: "Creamy mac and cheese",
    image: "images/mac-and-cheese.jpg",
    category: "other",
  },
  {
    id: "m2",
    name: "Margherita Pizza",
    price: 200,
    description: "Classic pizza with tomatoes and mozzarella",
    image: "images/margherita-pizza.jpg",
    category: "italian",
  },
];

async function ensureDataFilesExist() {
  try {
    // Create data directory if it doesn't exist
    try {
      await fs.mkdir(__dirname, { recursive: true });
      console.log("Data directory created or already exists");
    } catch (err) {
      console.error("Error creating data directory:", err.message);
    }

    // Create or update orders.json
    const ordersPath = join(__dirname, "orders.json");
    try {
      await fs.access(ordersPath);
      console.log("Orders file already exists");
    } catch (err) {
      await fs.writeFile(ordersPath, JSON.stringify(ordersData, null, 2));
      console.log("Created orders.json with sample data");
    }

    // Create or update success.json
    const successPath = join(__dirname, "success.json");
    try {
      await fs.access(successPath);
      console.log("Success payments file already exists");
    } catch (err) {
      await fs.writeFile(successPath, JSON.stringify(successData, null, 2));
      console.log("Created success.json with sample data");
    }

    // Create or update available-meals.json
    const mealsPath = join(__dirname, "available-meals.json");
    try {
      await fs.access(mealsPath);
      console.log("Meals file already exists");
    } catch (err) {
      await fs.writeFile(mealsPath, JSON.stringify(mealsData, null, 2));
      console.log("Created available-meals.json with sample data");
    }

    console.log("All data files are ready");
  } catch (err) {
    console.error("Error ensuring data files exist:", err);
  }
}

// Run the function
ensureDataFilesExist();
