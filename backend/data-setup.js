import { promises as fs } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function setupDataDirectories() {
  const dataDir = join(__dirname, "data");

  try {
    await fs.mkdir(dataDir, { recursive: true });

    // Ensure empty JSON files exist
    const requiredFiles = ["orders.json", "success.json"];

    for (const file of requiredFiles) {
      const filePath = join(dataDir, file);
      try {
        await fs.access(filePath);
        console.log(`${file} already exists`);
      } catch (error) {
        if (error.code === "ENOENT") {
          await fs.writeFile(filePath, "[]", "utf8");
          console.log(`Created empty ${file}`);
        } else {
          throw error;
        }
      }
    }

    console.log("Backend data directory structure created successfully");
  } catch (error) {
    console.error("Error creating directory structure:", error);
  }
}

setupDataDirectories();
