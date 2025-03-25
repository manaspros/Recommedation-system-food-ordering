import fs from "fs/promises";

// Simple recommendation system using collaborative filtering approach
class RecommendationService {
  async getUserRecommendations(userId) {
    try {
      // Log for debugging
      console.log(`Generating recommendations for user: ${userId}`);

      // 1. Get all order data
      const ordersData = await fs.readFile("./data/orders.json", "utf8");
      const orders = JSON.parse(ordersData);

      // Log order count for debugging
      console.log(`Found ${orders.length} orders in database`);

      // 2. Get all available meals
      const mealsData = await fs.readFile(
        "./data/available-meals.json",
        "utf8"
      );
      const allMeals = JSON.parse(mealsData);
      console.log(`Found ${allMeals.length} meals in database`);

      // 3. Find user's past orders
      const userOrders = orders.filter(
        (order) => order.customer.email === userId
      );
      console.log(`User has ${userOrders.length} past orders`);

      if (userOrders.length === 0) {
        // If no past orders, return popular items
        console.log("No past orders, returning popular items");
        return this.getPopularItems(orders, allMeals);
      }

      // 4. Extract items the user has ordered before
      const userItems = new Set();
      userOrders.forEach((order) => {
        order.items.forEach((item) => userItems.add(item.id));
      });

      // 5. Find similar users (who ordered at least one same item)
      const similarUsers = new Set();
      orders.forEach((order) => {
        if (
          userOrders.some((uo) => uo.customer.email === order.customer.email)
        ) {
          return; // Skip the current user's orders
        }

        const hasCommonItem = order.items.some((item) =>
          userItems.has(item.id)
        );
        if (hasCommonItem) {
          similarUsers.add(order.customer.email);
        }
      });

      // 6. Get items ordered by similar users that current user hasn't tried
      const recommendedItemIds = new Set();
      orders.forEach((order) => {
        if (similarUsers.has(order.customer.email)) {
          order.items.forEach((item) => {
            if (!userItems.has(item.id)) {
              recommendedItemIds.add(item.id);
            }
          });
        }
      });

      // 7. Convert IDs to actual meal objects
      const recommendations = allMeals.filter((meal) =>
        recommendedItemIds.has(meal.id)
      );

      // 8. If not enough recommendations, add some popular items
      if (recommendations.length < 3) {
        const popularItems = this.getPopularItems(orders, allMeals);
        popularItems.forEach((item) => {
          if (!recommendedItemIds.has(item.id) && !userItems.has(item.id)) {
            recommendations.push(item);
          }
        });
      }

      // Return reduced recommendations
      const finalRecommendations = recommendations.slice(0, 5);
      console.log(`Returning ${finalRecommendations.length} recommendations`);
      return finalRecommendations;
    } catch (error) {
      console.error("Error generating recommendations:", error);
      return [];
    }
  }

  async getCartRecommendations(userId, cartItems) {
    try {
      console.log(`Generating cart recommendations for user: ${userId}`);
      console.log(`Current cart items:`, cartItems);

      // 1. Get all order data
      const ordersData = await fs.readFile("./data/orders.json", "utf8");
      const orders = JSON.parse(ordersData);

      // 2. Get all available meals
      const mealsData = await fs.readFile(
        "./data/available-meals.json",
        "utf8"
      );
      const allMeals = JSON.parse(mealsData);

      // 3. Extract cart item IDs
      const cartItemIds = cartItems.map((item) => item.id);

      // 4. Find categories and tags of items in cart
      const cartItemsDetails = allMeals.filter((meal) =>
        cartItemIds.includes(meal.id)
      );
      const cartCategories = new Set(
        cartItemsDetails.map((item) => item.category).filter(Boolean)
      );
      const cartTags = new Set(
        cartItemsDetails.flatMap((item) => item.tags || [])
      );

      console.log("Cart categories:", [...cartCategories]);
      console.log("Cart tags:", [...cartTags]);

      // 5. Find user's past orders
      const userOrders = orders.filter(
        (order) => order.customer.email === userId
      );
      const userOrderItemIds = new Set(
        userOrders.flatMap((order) => order.items.map((item) => item.id))
      );

      // 6. Calculate scores for potential recommendation items
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

          // Score based on user's order history (avoid recommending items they already bought)
          if (userOrderItemIds.has(meal.id)) {
            score -= 1;
          }

          // Slight boost for popular items
          if (meal.tags && meal.tags.includes("popular")) {
            score += 0.5;
          }

          return { meal, score };
        });

      // 7. Sort by score and take top recommendations
      scoredItems.sort((a, b) => b.score - a.score);
      const recommendations = scoredItems.slice(0, 3).map((item) => item.meal);

      console.log(`Returning ${recommendations.length} cart recommendations`);
      return recommendations;
    } catch (error) {
      console.error("Error generating cart recommendations:", error);
      return [];
    }
  }

  getPopularItems(orders, allMeals) {
    // Count order frequency for each item
    const itemCounts = {};
    orders.forEach((order) => {
      order.items.forEach((item) => {
        itemCounts[item.id] = (itemCounts[item.id] || 0) + 1;
      });
    });

    // Sort by popularity
    const sortedItems = Object.keys(itemCounts).sort(
      (a, b) => itemCounts[b] - itemCounts[a]
    );

    // Return the actual meal objects
    return sortedItems
      .slice(0, 5)
      .map((id) => allMeals.find((meal) => meal.id === id))
      .filter(Boolean);
  }
}

export default new RecommendationService();
