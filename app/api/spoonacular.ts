// app/api/spoonacular.ts

const SPOONACULAR_API_KEY = "287dbafbf4a841bd886af40dac9f37f0";
const BASE_URL = "https://api.spoonacular.com";

export async function getPopularRecipes() {
  const response = await fetch(
    `${BASE_URL}/recipes/random?number=10&apiKey=${SPOONACULAR_API_KEY}`
  );
  return response.json();
}

export async function searchSpoonacularRecipes(query: string) {
  const response = await fetch(
    `${BASE_URL}/recipes/complexSearch?query=${query}&number=10&apiKey=${SPOONACULAR_API_KEY}`
  );
  return response.json();
}

export async function getRecipeDetail(id: number) {
  const response = await fetch(
    `${BASE_URL}/recipes/${id}/information?includeNutrition=true&apiKey=${SPOONACULAR_API_KEY}`
  );
  return response.json();
}
