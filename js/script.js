import { searchMealAPI, getMealById } from "./api.js";

const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const mealsContainer = document.getElementById("meals");
const errorContainer = document.getElementById("error-container");
const mealDetails = document.getElementById("meal-details");
const mealDetailsContent = document.querySelector(".meal-details-content");
const backBtn = document.getElementById("back-btn");
const copyIngredientsBtn = document.getElementById("copy-ingredients");
const loading = document.getElementById("loading");
const darkModeToggle = document.getElementById("dark-mode-toggle");
const clearSearch = document.getElementById("clear-search");
const searchHistoryList = document.getElementById("search-history");

const searchHistory = [];

// Load Dark Mode & Last Search
window.addEventListener("DOMContentLoaded", () => {
  const darkMode = localStorage.getItem("darkMode");
  if (darkMode === "enabled") document.body.classList.add("dark-mode");

  // جلب آخر بحث، ولكن لو فشل يتم استخدام القيمة الافتراضية
  const lastSearch = localStorage.getItem("lastSearch") || "chicken";
  searchMeals(lastSearch);
});

// Search History
function addToSearchHistory(term) {
  if (!searchHistory.includes(term)) {
    searchHistory.push(term);
    const option = document.createElement("option");
    option.value = term;
    searchHistoryList.appendChild(option);
  }
}

// Events
searchBtn.addEventListener("click", () => searchMeals());
searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    searchMeals();
  }
});
mealsContainer.addEventListener("click", handleMealClick);
backBtn.addEventListener("click", () => {
  mealDetails.classList.add("hidden");
  mealsContainer.classList.remove("hidden");
});
copyIngredientsBtn.addEventListener("click", copyIngredients);
clearSearch.addEventListener("click", () => {
  searchInput.value = "";
  searchInput.focus();
});
darkModeToggle.addEventListener("click", toggleDarkMode);

// Loading
function showLoading() {
  loading.classList.remove("hidden");
  searchBtn.disabled = true;
}
function hideLoading() {
  loading.classList.add("hidden");
  searchBtn.disabled = false;
}

// Dark Mode
function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
  const icon = darkModeToggle.querySelector("i");
  if (document.body.classList.contains("dark-mode")) {
    icon.classList.replace("fa-moon", "fa-sun");
    localStorage.setItem("darkMode", "enabled");
  } else {
    icon.classList.replace("fa-sun", "fa-moon");
    localStorage.setItem("darkMode", "disabled");
  }
}

// Error
function showError(msg) {
  errorContainer.textContent = msg;
  errorContainer.classList.remove("hidden");
}
function hideError() {
  errorContainer.classList.add("hidden");
  errorContainer.textContent = "";
}

// Search Meals
async function searchMeals(term) {
  const searchTerm = term || searchInput.value.trim();
  if (!searchTerm) {
    showError("Please enter a search term");
    return;
  }

  showLoading();
  mealsContainer.innerHTML = "";
  hideError();

  try {
    const data = await searchMealAPI(searchTerm);

    if (!data.meals) {
      showError("No recipes found");
    } else {
      displayMeals(data.meals);
      addToSearchHistory(searchTerm);

      // حفظ البحث الأخير **فقط لو فيه نتائج**
      localStorage.setItem("lastSearch", searchTerm);
    }
  } catch {
    showError("Something went wrong.");
  } finally {
    hideLoading();
  }
}

// Display Meals
function displayMeals(meals) {
  mealsContainer.innerHTML = meals
    .map(
      (meal) => `
      <div class="meal" data-meal-id="${meal.idMeal}" data-title="${
        meal.strMeal
      }">
        <img src="${meal.strMealThumb}" alt="${meal.strMeal}" loading="lazy">
        <div class="meal-info">
          <h3 class="meal-title">${meal.strMeal}</h3>
          ${
            meal.strCategory
              ? `<div class="meal-category">${meal.strCategory}</div>`
              : ""
          }
        </div>
      </div>`
    )
    .join("");
}

// Handle Meal Click
async function handleMealClick(e) {
  const mealEl = e.target.closest(".meal");
  if (!mealEl) return;
  const mealId = mealEl.dataset.mealId;
  showLoading();
  try {
    const data = await getMealById(mealId);
    if (data.meals && data.meals[0]) renderMealDetails(data.meals[0]);
  } catch {
    showError("Could not load recipe details.");
  } finally {
    hideLoading();
  }
}

// Render Meal Details
function renderMealDetails(meal) {
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    if (meal[`strIngredient${i}`])
      ingredients.push(
        `<li><i class="fas fa-check-circle"></i> ${meal[`strMeasure${i}`]} ${
          meal[`strIngredient${i}`]
        }</li>`
      );
  }

  mealDetailsContent.innerHTML = `
    <img src="${meal.strMealThumb}" alt="${
    meal.strMeal
  }" class="meal-details-img">
    <h2 class="meal-details-title">${meal.strMeal}</h2>
    <div class="meal-details-category"><span>${
      meal.strCategory || "Uncategorized"
    }</span></div>
    <div class="meal-details-instructions"><h3>Instructions</h3><p>${
      meal.strInstructions
    }</p></div>
    <div class="meal-details-ingredients"><h3>Ingredients</h3><ul class="ingredients-list">${ingredients.join(
      ""
    )}</ul></div>
    ${
      meal.strYoutube
        ? `<a href="${meal.strYoutube}" target="_blank" class="youtube-link"><i class="fab fa-youtube"></i> Watch Video</a>`
        : ""
    }
  `;
  mealsContainer.classList.add("hidden");
  mealDetails.classList.remove("hidden");
  mealDetails.scrollIntoView({ behavior: "smooth" });
}

// Copy Ingredients
function copyIngredients() {
  const listItems = mealDetailsContent.querySelectorAll(".ingredients-list li");
  if (listItems.length === 0) return;

  const text = Array.from(listItems)
    .map((li) => li.textContent)
    .join("\n");
  navigator.clipboard.writeText(text).then(() => {
    copyIngredientsBtn.classList.add("copied");
    setTimeout(() => copyIngredientsBtn.classList.remove("copied"), 2000);
  });
}
