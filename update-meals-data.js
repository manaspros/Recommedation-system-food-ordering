import { promises as fs } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Meal data with IDs preserved but no nutritional info yet
const meals = [
  {
    id: "m1",
    name: "Mac & Cheese",
    price: 100,
    description:
      "Creamy cheddar cheese mixed with perfectly cooked macaroni, topped with crispy breadcrumbs. A classic comfort food.",
    image: "images/mac-and-cheese.jpg",
  },
  {
    id: "m2",
    name: "Margherita Pizza",
    price: 200,
    description:
      "A classic pizza with fresh mozzarella, tomatoes, and basil on a thin and crispy crust.",
    image: "images/margherita-pizza.jpg",
  },
  {
    id: "m3",
    name: "Caesar Salad",
    price: 150,
    description:
      "Romaine lettuce tossed in Caesar dressing, topped with croutons and parmesan shavings.",
    image: "images/caesar-salad.jpg",
  },
  {
    id: "m4",
    name: "Spaghetti Carbonara",
    price: 140,
    description:
      "Al dente spaghetti with a creamy sauce made from egg yolk, pecorino cheese, pancetta, and pepper.",
    image: "images/spaghetti-carbonara.jpg",
  },
  {
    id: "m5",
    name: "Veggie Burger",
    price: 150,
    description:
      "A juicy veggie patty served on a whole grain bun with lettuce, tomato, and a tangy sauce.",
    image: "images/veggie-burger.jpg",
  },
  {
    id: "m6",
    name: "Grilled Chicken Sandwich",
    price: 150,
    description:
      "Tender grilled chicken breast with avocado, bacon, lettuce, and honey mustard on a toasted bun.",
    image: "images/grilled-chicken-sandwich.jpg",
  },
  {
    id: "m7",
    name: "Steak Frites",
    price: 130,
    description:
      "Succulent steak cooked to your preference, served with crispy golden fries and herb butter.",
    image: "images/steak-frites.jpg",
  },
  {
    id: "m8",
    name: "Sushi Roll Platter",
    price: 140,
    description:
      "An assortment of fresh sushi rolls including California, Spicy Tuna, and Eel Avocado.",
    image: "images/sushi-roll-platter.jpg",
  },
  {
    id: "m9",
    name: "Chicken Curry",
    price: 170,
    description:
      "Tender pieces of chicken simmered in a rich and aromatic curry sauce, served with basmati rice.",
    image: "images/chicken-curry.jpg",
  },
  {
    id: "m10",
    name: "Vegan Buddha Bowl",
    price: 180,
    description:
      "A hearty bowl filled with quinoa, roasted veggies, avocado, and a tahini dressing.",
    image: "images/vegan-buddha-bowl.jpg",
  },
  {
    id: "m11",
    name: "Seafood Paella",
    price: 120,
    description:
      "A Spanish delicacy filled with saffron-infused rice, shrimp, mussels, and chorizo.",
    image: "images/seafood-paella.jpg",
  },
  {
    id: "m12",
    name: "Pancake Stack",
    price: 100,
    description:
      "Fluffy pancakes stacked high, drizzled with maple syrup and topped with fresh berries.",
    image: "images/pancake-stack.jpg",
  },
  {
    id: "m13",
    name: "Miso Ramen",
    price: 90,
    description:
      "A warming bowl of ramen with miso broth, tender pork, soft-boiled egg, and green onions.",
    image: "images/miso-ramen.jpg",
  },
  {
    id: "m14",
    name: "Beef Tacos",
    price: 80,
    description:
      "Three soft tortillas filled with seasoned beef, fresh salsa, cheese, and sour cream.",
    image: "images/beef-tacos.jpg",
  },
  {
    id: "m15",
    name: "Chocolate Brownie",
    price: 60,
    description:
      "A rich and fudgy brownie, topped with a scoop of vanilla ice cream and chocolate sauce.",
    image: "images/chocolate-brownie.jpg",
  },
  {
    id: "m16",
    name: "Lobster Bisque",
    price: 80,
    description:
      "A creamy soup made from lobster stock, aromatic vegetables, and a touch of brandy.",
    image: "images/lobster-bisque.jpg",
  },
  {
    id: "m17",
    name: "Mushroom Risotto",
    price: 70,
    description:
      "Creamy Arborio rice cooked with a medley of wild mushrooms and finished with parmesan.",
    image: "images/mushroom-risotto.jpg",
  },
  {
    id: "m18",
    name: "Eggplant Parmesan",
    price: 70,
    description:
      "Layers of breaded eggplant, marinara sauce, and melted mozzarella and parmesan cheeses.",
    image: "images/eggplant-parmesan.jpg",
  },
  {
    id: "m19",
    name: "Lemon Cheesecake",
    price: 70,
    description:
      "A creamy cheesecake with a tangy lemon flavor, served on a crumbly biscuit base.",
    image: "images/lemon-cheesecake.jpg",
  },
  {
    id: "m20",
    name: "Falafel Wrap",
    price: 100,
    description:
      "Crispy falafels wrapped in a warm pita with lettuce, tomatoes, and a tahini sauce.",
    image: "images/falafel-wrap.jpg",
  },
];

// Function to generate random nutritional info
function generateNutritionInfo() {
  return {
    calories: Math.floor(Math.random() * 500) + 150, // 150-650 calories
    protein: Math.floor(Math.random() * 30) + 5, // 5-35g protein
    carbs: Math.floor(Math.random() * 60) + 10, // 10-70g carbs
    fat: Math.floor(Math.random() * 25) + 3, // 3-28g fat
    fiber: Math.floor(Math.random() * 8) + 1, // 1-9g fiber
  };
}

// Function to generate appropriate tags
function generateTags(mealName, nutritionInfo) {
  const tags = [];

  // Cuisine-based tags
  if (mealName.toLowerCase().includes("pizza")) tags.push("italian");
  if (mealName.toLowerCase().includes("curry")) tags.push("indian");
  if (mealName.toLowerCase().includes("taco")) tags.push("mexican");
  if (
    mealName.toLowerCase().includes("sushi") ||
    mealName.toLowerCase().includes("ramen")
  )
    tags.push("japanese");
  if (mealName.toLowerCase().includes("burger")) tags.push("american");
  if (mealName.toLowerCase().includes("paella")) tags.push("spanish");

  // Diet-based tags
  if (
    mealName.toLowerCase().includes("vegan") ||
    mealName.toLowerCase().includes("buddha bowl")
  ) {
    tags.push("vegan");
    tags.push("vegetarian");
  }
  if (
    mealName.toLowerCase().includes("vegetarian") ||
    mealName.toLowerCase().includes("eggplant") ||
    mealName.toLowerCase().includes("mushroom") ||
    mealName.toLowerCase().includes("falafel")
  ) {
    tags.push("vegetarian");
  }

  // Health-based tags
  if (nutritionInfo.calories < 300 && nutritionInfo.fat < 15)
    tags.push("healthy");
  if (nutritionInfo.protein > 25) tags.push("high-protein");
  if (nutritionInfo.carbs < 20) tags.push("low-carb");
  if (nutritionInfo.fiber > 6) tags.push("high-fiber");

  // Dessert tag
  if (
    mealName.toLowerCase().includes("brownie") ||
    mealName.toLowerCase().includes("cheesecake") ||
    mealName.toLowerCase().includes("pancake")
  ) {
    tags.push("dessert");
  }

  // Popular tag (random 30% of meals)
  if (Math.random() < 0.3) tags.push("popular");

  return tags;
}

// Add allergens based on meal contents
function generateAllergens(mealName) {
  const allergens = [];

  if (
    mealName.toLowerCase().includes("cheese") ||
    mealName.toLowerCase().includes("carbonara") ||
    mealName.toLowerCase().includes("mac") ||
    mealName.toLowerCase().includes("cheesecake")
  ) {
    allergens.push("dairy");
  }

  if (
    mealName.toLowerCase().includes("pancake") ||
    mealName.toLowerCase().includes("brownie") ||
    mealName.toLowerCase().includes("parmesan") ||
    mealName.toLowerCase().includes("bread")
  ) {
    allergens.push("gluten");
  }

  if (
    mealName.toLowerCase().includes("seafood") ||
    mealName.toLowerCase().includes("sushi") ||
    mealName.toLowerCase().includes("lobster")
  ) {
    allergens.push("seafood");
  }

  return allergens;
}

// Add nutrition, tags, allergens and ensure proper price format
const enhancedMeals = meals.map((meal) => {
  const nutritionInfo = generateNutritionInfo();
  const tags = generateTags(meal.name, nutritionInfo);
  const allergens = generateAllergens(meal.name);

  // Make sure price is a number, not a string
  const price =
    typeof meal.price === "string" ? parseFloat(meal.price) : meal.price;

  return {
    ...meal,
    price,
    nutritionalInfo: nutritionInfo,
    tags,
    allergens,
    category:
      tags.find((tag) =>
        [
          "italian",
          "indian",
          "mexican",
          "japanese",
          "american",
          "spanish",
        ].includes(tag)
      ) || "other",
  };
});

async function updateMealsData() {
  try {
    const dataDir = join(__dirname, "backend", "data");
    await fs.mkdir(dataDir, { recursive: true });

    const filePath = join(dataDir, "available-meals.json");
    await fs.writeFile(
      filePath,
      JSON.stringify(enhancedMeals, null, 2),
      "utf8"
    );

    console.log(
      `Successfully updated meals with nutrition data at ${filePath}`
    );

    // Also create a copy in the root data directory for redundancy
    const rootDataDir = join(__dirname, "data");
    await fs.mkdir(rootDataDir, { recursive: true });

    const rootFilePath = join(rootDataDir, "available-meals.json");
    await fs.writeFile(
      rootFilePath,
      JSON.stringify(enhancedMeals, null, 2),
      "utf8"
    );

    console.log(`Also created a copy at ${rootFilePath}`);
  } catch (error) {
    console.error("Error updating meals data:", error);
  }
}

updateMealsData();
