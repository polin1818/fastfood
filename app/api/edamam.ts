// app/api/edamam.ts

const APP_ID = "42852968";
const APP_KEY = "7897f9d827662f31172fd3ed10f02ae1";
const BASE_URL = "https://api.edamam.com/api/recipes/v2";

export async function getAfricanRecipes() {
  const response = await fetch(
    `${BASE_URL}?type=public&q=african&app_id=${APP_ID}&app_key=${APP_KEY}`,
    {
      headers: {
        "Edamam-Account-User": "Billy12",
      },
    }
  );
  return response.json();
}

export async function searchEdamamRecipes(query: string) {
  const response = await fetch(
    `${BASE_URL}?type=public&q=${query}&app_id=${APP_ID}&app_key=${APP_KEY}`,
    {
      headers: {
        "Edamam-Account-User": "Billy12",
      },
    }
  );
  return response.json();
}
