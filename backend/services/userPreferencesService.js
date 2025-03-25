import fs from "fs/promises";
import path from "path";

class UserPreferencesService {
  constructor() {
    this.preferencesFile = "./data/user-preferences.json";
    this.ensurePreferencesFile();
  }

  async ensurePreferencesFile() {
    try {
      await fs.access(this.preferencesFile);
    } catch (error) {
      // File doesn't exist, create it with empty array
      await fs.writeFile(this.preferencesFile, JSON.stringify([]), "utf8");
    }
  }

  async getUserPreferences(userId) {
    try {
      const data = await fs.readFile(this.preferencesFile, "utf8");
      const preferences = JSON.parse(data);
      return (
        preferences.find((pref) => pref.userId === userId) || {
          userId,
          dietaryPreferences: [],
          allergies: [],
          favoriteCuisines: [],
        }
      );
    } catch (error) {
      console.error("Error reading user preferences:", error);
      return {
        userId,
        dietaryPreferences: [],
        allergies: [],
        favoriteCuisines: [],
      };
    }
  }

  async updateUserPreferences(userId, preferences) {
    try {
      const data = await fs.readFile(this.preferencesFile, "utf8");
      const allPreferences = JSON.parse(data);

      const userIndex = allPreferences.findIndex(
        (pref) => pref.userId === userId
      );

      if (userIndex >= 0) {
        // Update existing preferences
        allPreferences[userIndex] = {
          ...allPreferences[userIndex],
          ...preferences,
          userId,
        };
      } else {
        // Add new user preferences
        allPreferences.push({ ...preferences, userId });
      }

      await fs.writeFile(
        this.preferencesFile,
        JSON.stringify(allPreferences, null, 2),
        "utf8"
      );
      return {
        success: true,
        preferences:
          allPreferences[
            userIndex >= 0 ? userIndex : allPreferences.length - 1
          ],
      };
    } catch (error) {
      console.error("Error updating user preferences:", error);
      return { success: false, error: error.message };
    }
  }

  // Method to get health-based recommendations
  async getHealthBasedRecommendations(userId) {
    try {
      // Get user preferences
      const userPref = await this.getUserPreferences(userId);

      // Get all meals
      const mealsData = await fs.readFile(
        "./data/available-meals.json",
        "utf8"
      );
      const allMeals = JSON.parse(mealsData);

      // Filter meals based on dietary preferences
      let recommendedMeals = allMeals;

      // Apply dietary filters
      if (
        userPref.dietaryPreferences &&
        userPref.dietaryPreferences.length > 0
      ) {
        recommendedMeals = recommendedMeals.filter((meal) => {
          // Check if the meal matches any of the user's dietary preferences
          return (
            meal.tags &&
            meal.tags.some((tag) => userPref.dietaryPreferences.includes(tag))
          );
        });
      }

      // Filter out allergies
      if (userPref.allergies && userPref.allergies.length > 0) {
        recommendedMeals = recommendedMeals.filter((meal) => {
          // Assume each meal might have an 'allergens' array, skip if not present
          if (!meal.allergens) return true;

          // Keep meals that don't contain user's allergies
          return !meal.allergens.some((allergen) =>
            userPref.allergies.includes(allergen)
          );
        });
      }

      // Prioritize by favorite cuisines
      if (userPref.favoriteCuisines && userPref.favoriteCuisines.length > 0) {
        // Sort to put favorite cuisines first
        recommendedMeals.sort((a, b) => {
          const aIsFavorite = userPref.favoriteCuisines.includes(a.category);
          const bIsFavorite = userPref.favoriteCuisines.includes(b.category);

          if (aIsFavorite && !bIsFavorite) return -1;
          if (!aIsFavorite && bIsFavorite) return 1;
          return 0;
        });
      }

      // Prioritize by health score (based on nutritional info)
      recommendedMeals.sort((a, b) => {
        // Example health score calculation (can be customized)
        const aHealthScore = this.calculateHealthScore(a);
        const bHealthScore = this.calculateHealthScore(b);

        return bHealthScore - aHealthScore; // Higher score first
      });

      return recommendedMeals.slice(0, 5); // Return top 5 recommendations
    } catch (error) {
      console.error("Error getting health recommendations:", error);
      return [];
    }
  }

  calculateHealthScore(meal) {
    // Simple health score calculation based on nutritional values
    if (!meal.nutritionalInfo) return 0;

    const { calories, protein, carbs, fat, fiber } = meal.nutritionalInfo;

    // Higher protein and fiber are good, lower calories and fat are good
    // This is a simple model - can be made more sophisticated
    return (
      protein * 3 +
      fiber * 2 -
      calories / 100 -
      fat / 2 +
      (meal.tags && meal.tags.includes("healthy") ? 10 : 0)
    );
  }
}

export default new UserPreferencesService();
