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
    const categoryDropdown = document.getElementById("categoryDropdown");
    const toggleSpeechButton = document.getElementById("toggleSpeechButton");
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
    mealCategory.addEventListener("change", handleCategoryChange);
    toggleSpeechButton.addEventListener("click", toggleSpeech);
    recipeContainer.addEventListener("click", function (event) {
        if (event.target.classList.contains("viewRecipeButton")) {
            const recipeId = event.target.dataset.recipeId;
            fetchAndDisplayRecipeDetails(recipeId);
        }
    });

    // Functions
    function handleSearchInput(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            fetchRecipes(searchInput.value);
        }
    }

    function handleAlphabetClick(event) {
        if (event.target.classList.contains('letter')) {
            fetchRecipesByFirstLetter(event.target.textContent);
        }
    }

    function closeModal() {
        modal.style.display = "none";
        hideSpeechButton();
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
        const recipeId = modalContent.dataset.recipeId;
        saveRecipeLocally(recipeId);
        displaySavedRecipes();
    }

    function handleSavedRecipeClick(event) {
        if (event.target.tagName.toLowerCase() === 'li') {
            fetchRecipeByName(event.target.textContent);
        }
    }

    function toggleSpeech() {
        if ('speechSynthesis' in window) {
            if (speechSynthesis.speaking) {
                speechSynthesis.cancel();
            } else {
                readRecipeDetails();
            }
        } else {
            alert("Speech synthesis is not supported in your browser.");
        }
    }

    function readRecipeDetails() {
        const recipeDetails = modalContent.textContent;
        const speech = new SpeechSynthesisUtterance(recipeDetails);
        speech.rate = 1;
        speech.volume = 1;
        speechSynthesis.speak(speech);
    }

    function checkIfRecipeIsSaved(recipeId) {
        try {
            let savedRecipes = JSON.parse(localStorage.getItem("savedRecipes")) || [];
            const saveButton = document.getElementById("saveButton");
            saveButton.style.display = savedRecipes.includes(recipeId) ? "none" : "block";
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
        checkIfRecipeIsSaved(recipe.idMeal);
        showSpeechButton();
    }

    async function fetchRecipes(searchQuery, category = '') {
        try {
            let searchUrl = `https://www.themealdb.com/api/json/v1/1/search.php?s=${searchQuery}`;
            if (category) {
                searchUrl += `&c=${category}`;
            }
            const response = await fetch(searchUrl);
            const data = await response.json();
            recipes = data.meals || [];
            totalRecipes = recipes.length;
            displayRecipes(recipes);
        } catch (error) {
            console.error("Error fetching recipes:", error);
        }
    }

    async function fetchRecipesByFirstLetter(letter) {
        try {
            const searchUrl = letter === '' ? 'https://www.themealdb.com/api/json/v1/1/search.php' : `https://www.themealdb.com/api/json/v1/1/search.php?f=${letter}`;
            const response = await fetch(searchUrl);
            const data = await response.json();
            recipes = data.meals || [];
            totalRecipes = recipes.length;
            displayRecipes(recipes);
        } catch (error) {
            console.error("Error fetching recipes by first letter:", error);
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
            const startIndex = (currentPage - 1) * pageSize;
            const endIndex = Math.min(startIndex + pageSize, recipes.length);
            for (let i = startIndex; i < endIndex; i++) {
                const recipe = recipes[i];
                const recipeElement = document.createElement("div");
                recipeElement.classList.add("recipe");
                recipeElement.innerHTML = `
                    <h3>${recipe.strMeal}</h3>
                    <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}" loading="lazy">
                    <button class="viewRecipeButton" data-recipe-id="${recipe.idMeal}">View Recipe</button>
                `;
                recipeContainer.appendChild(recipeElement);
            }
            totalRecipes = recipes.length;
            updatePaginationControls();
        } else {
            recipeContainer.innerHTML = "<p class='no-recipes-message'>No recipes found.</p>";
            updatePaginationControls(0);
        }
    }


    function updatePaginationControls() {
        const totalPages = Math.ceil(totalRecipes / pageSize);
        const prevPageDisabled = currentPage === 1;
        const nextPageDisabled = currentPage === totalPages || totalPages < 1;
        prevPageButton.disabled = prevPageDisabled;
        nextPageButton.disabled = nextPageDisabled;
        document.getElementById("currentPage").textContent = `Page ${currentPage}`;
        const paginationContainer = document.getElementsByClassName("pagination-container")[0];
        paginationContainer.style.display = totalRecipes > 4 ? "flex" : "none";
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
        try {
            let savedRecipes = JSON.parse(localStorage.getItem("savedRecipes")) || [];
            if (!savedRecipes.includes(recipeId)) {
                savedRecipes.push(recipeId);
                localStorage.setItem("savedRecipes", JSON.stringify(savedRecipes));
                alert("Recipe saved successfully!");
            } else {
                alert("Recipe already saved!");
            }
        } catch (error) {
            console.error("Error saving recipe locally:", error);
        }
    }

    function clearSavedRecipes() {
        try {
            localStorage.removeItem('savedRecipes');
            savedRecipesList.innerHTML = '';
        } catch (error) {
            console.error("Error clearing saved recipes:", error);
        }
    }

    async function displaySavedRecipes() {
        try {
            savedRecipesList.innerHTML = "";
            let savedRecipes = JSON.parse(localStorage.getItem("savedRecipes")) || [];
            for (let i = 0; i < savedRecipes.length; i++) {
                const recipeId = savedRecipes[i];
                const lookupUrl = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${recipeId}`;
                const response = await fetch(lookupUrl);
                const data = await response.json();
                const recipe = data.meals[0];
                const li = document.createElement("li");
                li.textContent = recipe.strMeal;
                savedRecipesList.appendChild(li);
            }
        } catch (error) {
            console.error("Error displaying saved recipes:", error);
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

    async function fetchRecipesByCategory(category) {
        try {
            const searchUrl = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`;
            const response = await fetch(searchUrl);
            const data = await response.json();
            recipes = data.meals || [];
            totalRecipes = recipes.length;
            displayRecipes(recipes);
        } catch (error) {
            console.error("Error fetching recipes by category:", error);
        }
    }

    function handleCategoryChange(event) {
        const selectedCategory = event.target.value;
        if (selectedCategory !== "all") {
            fetchRecipesByCategory(selectedCategory);
        } else {
            fetchRecipes(searchInput.value);
        }
        currentPage = 1;
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
        checkIfRecipeIsSaved(recipe.idMeal);
        showSpeechButton();
    }

    function hideSpeechButton() {
        toggleSpeechButton.style.display = "none";
    }

    function showSpeechButton() {
        toggleSpeechButton.style.display = "block";
    }

    displaySavedRecipes();
});