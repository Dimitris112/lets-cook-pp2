document.addEventListener("DOMContentLoaded", function () {
    // Variables
    const alphabet = document.getElementsByClassName("alphabet")[0];
    const modal = document.getElementById("modal");
    const searchButton = document.getElementById("searchButton");
    const randomButton = document.getElementById("randomButton");
    const closeButton = document.querySelector(".close");
    const searchInput = document.getElementById("searchInput");
    const saveButton = document.getElementById("saveButton");
    const modalContent = document.getElementById("modalContent");
    const recipeContainer = document.getElementById("recipeContainer");
    const savedRecipesList = document.getElementById("savedRecipesList");
    const resetButton = document.getElementById("resetButton");

    searchInput.focus();

    // Event listeners
    searchInput.addEventListener("keydown", handleSearchInput);
    searchButton.addEventListener("click", handleSearchButtonClick);
    randomButton.addEventListener("click", fetchRandomRecipe);
    alphabet.addEventListener("click", handleAlphabetClick);
    closeButton.addEventListener("click", closeModal);
    window.addEventListener("click", outsideModalClick);
    document.addEventListener("keydown", escapeKeyCloseModal);
    saveButton.addEventListener("click", handleSaveButtonClick);
    resetButton.addEventListener("click", clearSavedRecipes);
    savedRecipesList.addEventListener("click", handleSavedRecipeClick);

    // Functions
    function handleSearchInput(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            fetchRecipes(searchInput.value);
        }
    }

    function handleSearchButtonClick() {
        fetchRecipes(searchInput.value);
    }

    function handleAlphabetClick(event) {
        if (event.target.classList.contains('letter')) {
            fetchRecipesByFirstLetter(event.target.textContent);
        }
    }

    function closeModal() {
        modal.style.display = "none";
    }

    function outsideModalClick(event) {
        if (event.target === modal) {
            closeModal();
        }
    }

    function escapeKeyCloseModal(event) {
        if (event.key === "Escape" && modal.style.display === "block") {
            closeModal();
        }
    }

    function handleSaveButtonClick() {
        saveRecipeLocally(modalContent.dataset.recipeId);
        displaySavedRecipes();
    }

    function handleSavedRecipeClick(event) {
        if (event.target.tagName.toLowerCase() === 'li') {
            const recipeName = event.target.textContent;
            fetchRecipeByName(recipeName);
        }
    }

    function checkIfRecipeIsSaved(recipeId) {
        try {
            let savedRecipes = JSON.parse(localStorage.getItem("savedRecipes")) || [];
            const saveButton = document.getElementById("saveButton");
            if (savedRecipes.includes(recipeId)) {
                saveButton.style.display = "none";
            } else {
                saveButton.style.display = "block";
            }
        } catch (error) {
            console.error("Error checking if recipe is saved:", error);
        }
    }

    async function fetchRecipes(searchQuery) {
        try {
            const searchUrl = `https://www.themealdb.com/api/json/v1/1/search.php?s=${searchQuery}`;
            const response = await fetch(searchUrl);
            const data = await response.json();
            displayRecipes(data.meals);
        } catch (error) {
            console.error("Error fetching recipes:", error);
        }
    }

    async function fetchRecipesByFirstLetter(letter) {
        try {
            const searchUrl = `https://www.themealdb.com/api/json/v1/1/search.php?f=${letter}`;
            const response = await fetch(searchUrl);
            const data = await response.json();
            displayRecipes(data.meals);
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
            recipes.forEach(recipe => {
                const recipeElement = document.createElement("div");
                recipeElement.classList.add("recipe");
                recipeElement.innerHTML = `
                    <h3>${recipe.strMeal}</h3>
                    <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}">
                    <button class="viewRecipeButton" data-recipe-id="${recipe.idMeal}">View Recipe</button>
                `;
                recipeContainer.appendChild(recipeElement);
            });

            const viewRecipeButtons = document.querySelectorAll(".viewRecipeButton");
            viewRecipeButtons.forEach(button => {
                button.addEventListener("click", () => {
                    const recipeId = button.getAttribute("data-recipe-id");
                    fetchAndDisplayRecipeDetails(recipeId);
                });
            });
        } else {
            recipeContainer.innerHTML = "<p class='no-recipes-message'>No recipes found.</p>";
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

    function saveRecipeLocally(recipeId) {
        // Retrieves saved recipes from local storage
        let savedRecipes = JSON.parse(localStorage.getItem("savedRecipes")) || [];
        // Checks if the recipe is already saved
        if (!savedRecipes.includes(recipeId)) {
            savedRecipes.push(recipeId);
            // Stores the updated list of saved recipes back to local storage
            localStorage.setItem("savedRecipes", JSON.stringify(savedRecipes));
            alert("Recipe saved successfully!");
        } else {
            alert(" Recipe already saved!");
        }
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