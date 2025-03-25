import { promises as fs } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function copyUserPreferences() {
  try {
    // Ensure backend/data directory exists
    const dataDir = join(__dirname, "data");
    await fs.mkdir(dataDir, { recursive: true });

    // Source and destination paths
    const sourcePath = join(__dirname, "..", "data", "user-preferences.json");
    const destPath = join(dataDir, "user-preferences.json");

    try {
      // Check if source file exists
      await fs.access(sourcePath);

      // Read the source file
      const data = await fs.readFile(sourcePath, "utf8");

      // Write to destination
      await fs.writeFile(destPath, data, "utf8");

      console.log(
        "Successfully copied user preferences to backend/data directory"
      );
    } catch (err) {
      if (err.code === "ENOENT") {
        console.log(
          "Source user preferences file not found, creating empty file in backend/data"
        );
        await fs.writeFile(destPath, "[]", "utf8");
      } else {
        throw err;
      }
    }
  } catch (error) {
    console.error("Error copying user preferences:", error);
  }
}

copyUserPreferences();
