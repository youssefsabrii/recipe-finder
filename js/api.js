const BASE_URL = "https://www.themealdb.com/api/json/v1/1/";

export async function searchMealAPI(term) {
  const res = await fetch(`${BASE_URL}search.php?s=${term}`);
  return res.json();
}

export async function getMealById(id) {
  const res = await fetch(`${BASE_URL}lookup.php?i=${id}`);
  return res.json();
}
