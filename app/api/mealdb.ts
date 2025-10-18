// app/api/mealdb.ts

const BASE_URL = "https://www.themealdb.com/api/json/v1/1";

export async function getDessertRecipes() {
  const response = await fetch(`${BASE_URL}/filter.php?c=Dessert`);
  return response.json();
}

export async function searchMealDB(query: string) {
  const response = await fetch(`${BASE_URL}/search.php?s=${query}`);
  return response.json();
}

export async function getMealDetail(id: string) {
  const response = await fetch(`${BASE_URL}/lookup.php?i=${id}`);
  return response.json();
}
