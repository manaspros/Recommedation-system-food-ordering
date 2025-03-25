const fs = require("fs").promises;
const path = require("path");

async function moveDataFiles() {
  try {
    // Ensure backend/data directory exists
    const backendDataDir = path.join(__dirname, "backend", "data");
    await fs.mkdir(backendDataDir, { recursive: true });

    // List of files to move
    const filesToMove = [
      "available-meals.json",
      "orders.json",
      "success.json",
      "user-preferences.json",
    ];

    for (const file of filesToMove) {
      const sourceFile = path.join(__dirname, "data", file);
      const targetFile = path.join(backendDataDir, file);

      try {
        // Check if source file exists
        await fs.access(sourceFile);

        // Copy the file to backend/data
        await fs.copyFile(sourceFile, targetFile);
        console.log(`Copied ${file} to backend/data directory`);

        // No need to delete the original files as they may still be referenced elsewhere
      } catch (err) {
        if (err.code === "ENOENT") {
          console.log(
            `${file} doesn't exist in the source directory, creating empty file in backend/data`
          );

          // Create empty file
          if (file === "success.json" || file === "user-preferences.json") {
            await fs.writeFile(targetFile, "[]");
          } else {
            // For other files, check if target exists before creating empty
            try {
              await fs.access(targetFile);
              console.log(`${file} already exists in the target directory`);
            } catch (targetErr) {
              if (targetErr.code === "ENOENT") {
                console.log(`Creating empty ${file} in backend/data`);
                await fs.writeFile(targetFile, "[]");
              }
            }
          }
        } else {
          console.error(`Error processing ${file}:`, err);
        }
      }
    }

    console.log("All data files have been processed.");
  } catch (error) {
    console.error("Error moving data files:", error);
  }
}

moveDataFiles();
