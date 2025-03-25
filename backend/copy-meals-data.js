import { promises as fs } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function copyMealsData() {
  try {
    // Ensure backend/data directory exists
    const dataDir = join(__dirname, "data");
    await fs.mkdir(dataDir, { recursive: true });

    // Define example data if source file doesn't exist
    const exampleMeals = [
      {
        id: "m1",
        name: "Margherita Pizza",
        price: 12.99,
        description: "Classic Italian pizza with fresh tomatoes and mozzarella",
        image: "images/meals/pizza-margherita.jpg",
        category: "Italian",
        nutritionalInfo: {
          calories: 285,
          protein: 12,
          carbs: 36,
          fat: 10,
          fiber: 2,
        },
        tags: ["vegetarian", "italian", "popular"],
      },
    ];

    // Try to copy from root data directory or use example data
    const sourcePath = join(__dirname, "..", "data", "available-meals.json");
    const destPath = join(dataDir, "available-meals.json");

    try {
      await fs.access(sourcePath);
      const data = await fs.readFile(sourcePath, "utf8");
      await fs.writeFile(destPath, data, "utf8");
      console.log("Successfully copied available-meals.json to backend/data");
    } catch (err) {
      if (err.code === "ENOENT") {
        console.log("Source meals file not found, creating example data");
        await fs.writeFile(
          destPath,
          JSON.stringify(exampleMeals, null, 2),
          "utf8"
        );
      } else {
        throw err;
      }
    }

    // Create empty orders.json and success.json if they don't exist
    const ordersPath = join(dataDir, "orders.json");
    const successPath = join(dataDir, "success.json");

    try {
      await fs.access(ordersPath);
    } catch (err) {
      if (err.code === "ENOENT") {
        await fs.writeFile(ordersPath, "[]", "utf8");
        console.log("Created empty orders.json");
      }
    }

    try {
      await fs.access(successPath);
    } catch (err) {
      if (err.code === "ENOENT") {
        await fs.writeFile(successPath, "[]", "utf8");
        console.log("Created empty success.json");
      }
    }

    console.log("Data setup complete");
  } catch (error) {
    console.error("Error setting up data:", error);
  }
}

copyMealsData();
