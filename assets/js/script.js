document.addEventListener("DOMContentLoaded", function () {
    const searchButton = document.getElementById("searchButton");
    const randomButton = document.getElementById("randomButton");
    const modal = document.getElementById("modal");
    const closeButton = document.querySelector(".close");
    const searchInput = document.getElementById("searchInput");


    searchInput.focus();


    searchInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            const searchQuery = searchInput.value;
            fetchRecipes(searchQuery);
        }
    });

    searchButton.addEventListener("click", () => {
        const searchQuery = searchInput.value;
        fetchRecipes(searchQuery);
    });

    randomButton.addEventListener("click", () => {
        fetchRandomRecipe();
    })


    function displayRecipes(recipes) {
        const recipeContainer = document.getElementById("recipeContainer");
        recipeContainer.innerHTML = "";
        recipes.forEach((recipe) => {
            const recipeElement = document.createElement("div");
            recipeElement.classList.add("recipe");
            recipeElement.innerHTML = `
            <h3>${recipe.strMeal}</h3>
            <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}">
            <button class="viewRecipeButton" data-recipe-id="${recipe.idMeal}">View Recipe</button>
        `;
            recipeContainer.appendChild(recipeElement);
        });

        const viewRecipeButtons = document.getElementsByClassName("viewRecipeButton");
        viewRecipeButtons.forEach((button) => {
            button.addEventListener("click", () => {
                const recipeId = button.getAttribute("data-recipe-id");
                fetchAndDisplayRecipeDetails(recipeId);
            });
        });
    }
});