document.addEventListener("DOMContentLoaded", function () {
    // Variables
    const alphabet = document.getElementsByClassName("alphabet")[0];
    const modal = document.getElementById("modal");
    const searchButton = document.getElementById("searchButton");
    const randomButton = document.getElementById("randomButton");
    const closeButton = document.getElementsByClassName("close")[0];
    const searchInput = document.getElementById("searchInput");
    const saveButton = document.getElementById("saveButton");
    const modalContent = document.getElementById("modalContent");
    const recipeContainer = document.getElementById("recipeContainer");
    const savedRecipesList = document.getElementById("savedRecipesList");
    const resetButton = document.getElementById("resetButton");
    const prevPageButton = document.getElementById("prevPageButton");
    const nextPageButton = document.getElementById("nextPageButton");
    let currentPage = 1;
    const pageSize = 4;
    let recipes = [];
    let totalRecipes = 0;

    searchInput.focus();

    // Event listeners
    searchInput.addEventListener("keydown", handleSearchInput);
    searchButton.addEventListener("click", () => fetchRecipes(searchInput.value));
    randomButton.addEventListener("click", fetchRandomRecipe);
    alphabet.addEventListener("click", handleAlphabetClick);
    closeButton.addEventListener("click", closeModal);
    window.addEventListener("click", outsideModalClick);
    document.addEventListener("keydown", escapeKeyCloseModal);
    saveButton.addEventListener("click", handleSaveButtonClick);
    resetButton.addEventListener("click", clearSavedRecipes);
    savedRecipesList.addEventListener("click", handleSavedRecipeClick);
    prevPageButton.addEventListener("click", goToPrevPage);
    nextPageButton.addEventListener("click", goToNextPage);

    // Functions
    function handleSearchInput(event) {
        event.key === "Enter" ? (event.preventDefault(), fetchRecipes(searchInput.value)) : null;
    }

    function handleAlphabetClick(event) {
        event.target.classList.contains('letter') ? fetchRecipesByFirstLetter(event.target.textContent) : null;
    }

    function closeModal() {
        modal.style.display = "none";
    }

    function outsideModalClick(event) {
        event.target === modal ? closeModal() : null;
    }

    function escapeKeyCloseModal(event) {
        event.key === "Escape" && modal.style.display === "block" ? closeModal() : null;
    }

    function handleSaveButtonClick() {
        const recipeId = modalContent.dataset.recipeId;
        saveRecipeLocally(recipeId);
        displaySavedRecipes();
    }

    function handleSavedRecipeClick(event) {
        event.target.tagName.toLowerCase() === 'li' ? fetchRecipeByName(event.target.textContent) : null;
    }

    function checkIfRecipeIsSaved(recipeId) {
        try {
            let savedRecipes = JSON.parse(localStorage.getItem("savedRecipes")) || [];
            const saveButton = document.getElementById("saveButton");
            savedRecipes.includes(recipeId) ? saveButton.style.display = "none" : saveButton.style.display = "block";
        } catch (error) {
            console.error("Error checking if recipe is saved:", error);
        }
    }

    function displayRandomRecipe(recipe) {
        const modalTitle = document.getElementById("modalTitle");
        modalTitle.textContent = recipe.strMeal;
        modalContent.innerHTML = `
            <p>${recipe.strInstructions}</p>
            <p>Category: ${recipe.strCategory}</p>
            <p>Area: ${recipe.strArea}</p>
            <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}" />
        `;
        modalContent.dataset.recipeId = recipe.idMeal;
        modal.style.display = "block";
    }

    async function fetchRecipes(searchQuery) {
        try {
            const searchUrl = `https://www.themealdb.com/api/json/v1/1/search.php?s=${searchQuery}`;
            const response = await fetch(searchUrl);
            const data = await response.json();
            recipes = data.meals;
            totalRecipes = recipes.length;
            displayRecipes(recipes);
            const paginationContainers = document.getElementsByClassName('pagination-container');
            if (paginationContainers.length > 0) {
                const paginationContainer = paginationContainers[0];
                // Checks if there are 4 or more recipes in order to show pagination
                if (totalRecipes >= 4) {
                    paginationContainer.style.display = "flex";
                } else {
                    paginationContainer.style.display = "none";
                }
            }
        } catch (error) {
            console.error("Error fetching recipes:", error);
        }
    }


    async function fetchRecipesByFirstLetter(letter) {
        try {
            const searchUrl = `https://www.themealdb.com/api/json/v1/1/search.php?f=${letter}`;
            const response = await fetch(searchUrl);
            const data = await response.json();
            // Updates the recipes array
            recipes = data.meals;
            displayRecipes(recipes);
        } catch (error) {
            console.error("Error fetching recipes:", error);
        }
    }

    async function fetchRandomRecipe() {
        try {
            const randomUrl = 'https://www.themealdb.com/api/json/v1/1/random.php';
            const response = await fetch(randomUrl);
            const data = await response.json();
            displayRandomRecipe(data.meals[0]);
        } catch (error) {
            console.error("Error fetching random recipe:", error);
        }
    }

    function displayRecipes(recipes) {
        recipeContainer.innerHTML = "";
        if (recipes && recipes.length > 0) {
            // Paginate the recipes
            const startIndex = (currentPage - 1) * pageSize;
            const endIndex = startIndex + pageSize;
            const recipesToShow = recipes.slice(startIndex, endIndex);
            recipesToShow.forEach(recipe => {
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
            Array.from(viewRecipeButtons).forEach(button => {
                button.addEventListener("click", () => {
                    const recipeId = button.getAttribute("data-recipe-id");
                    fetchAndDisplayRecipeDetails(recipeId);
                });
            });
        } else {
            recipeContainer.innerHTML = "<p class='no-recipes-message'>No recipes found.</p>";
            updatePaginationControls(recipes.length);
        }
    }

    function updatePaginationControls(totalRecipes) {
        const totalPages = Math.ceil(totalRecipes / pageSize);
        document.getElementById("currentPage").textContent = currentPage;
        const pagination = document.getElementsByClassName("pagination")[0];
        pagination.style.display = "flex";
        document.getElementById("prevPageButton").disabled = currentPage === 1;
        document.getElementById("nextPageButton").disabled = currentPage === totalPages;
    }

    function goToPrevPage() {
        if (currentPage > 1) {
            currentPage--;
            displayRecipes(recipes);
        }
    }

    function goToNextPage() {
        const totalPages = Math.ceil(totalRecipes / pageSize);
        if (currentPage < totalPages) {
            currentPage++;
            displayRecipes(recipes);
        }
    }

    function saveRecipeLocally(recipeId) {
        let savedRecipes = JSON.parse(localStorage.getItem("savedRecipes")) || [];
        !savedRecipes.includes(recipeId) ? (savedRecipes.push(recipeId), localStorage.setItem("savedRecipes", JSON.stringify(savedRecipes)), alert("Recipe saved successfully!")) : alert(" Recipe already saved!");
    }

    function clearSavedRecipes() {
        localStorage.removeItem('savedRecipes');
        savedRecipesList.innerHTML = '';
    }

    async function displaySavedRecipes() {
        savedRecipesList.innerHTML = "";
        let savedRecipes = JSON.parse(localStorage.getItem("savedRecipes")) || [];
        for (let i = 0; i < savedRecipes.length; i++) {
            const recipeId = savedRecipes[i];
            try {
                const lookupUrl = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${recipeId}`;
                const response = await fetch(lookupUrl);
                const data = await response.json();
                const recipe = data.meals[0];
                const li = document.createElement("li");
                li.textContent = recipe.strMeal;
                savedRecipesList.appendChild(li);
            } catch (error) {
                console.error("Error fetching recipe details:", error);
            }
        }
    }

    async function fetchAndDisplayRecipeDetails(recipeId) {
        try {
            const lookupUrl = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${recipeId}`;
            const response = await fetch(lookupUrl);
            const data = await response.json();
            displayRecipeDetails(data.meals[0]);
        } catch (error) {
            console.error("Error fetching recipe details:", error);
        }
    }

    async function fetchRecipeByName(recipeName) {
        try {
            const searchUrl = `https://www.themealdb.com/api/json/v1/1/search.php?s=${recipeName}`;
            const response = await fetch(searchUrl);
            const data = await response.json();
            if (data.meals && data.meals.length > 0) {
                const recipe = data.meals[0];
                displayRecipeDetails(recipe);
                checkIfRecipeIsSaved(recipe.idMeal);
            } else {
                console.error("Recipe not found:", recipeName);
            }
        } catch (error) {
            console.error("Error fetching recipe by name:", error);
        }
    }

    function displayRecipeDetails(recipe) {
        const modalTitle = document.getElementById("modalTitle");
        modalTitle.textContent = recipe.strMeal;
        modalContent.innerHTML = `
            <p>${recipe.strInstructions}</p>
            <p>Category: ${recipe.strCategory}</p>
            <p>Area: ${recipe.strArea}</p>
            <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}" />
        `;
        modalContent.dataset.recipeId = recipe.idMeal;
        modal.style.display = "block";
    }

    displaySavedRecipes();
});