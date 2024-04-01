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

    /**
     * I've included both the viewrecipe and remove buttons in the event listener below
     * clicking the viewrecipe button -> it shows the recipe details
     * clicking the remove -> it deletes the single recipe
     * clicking on a saved recipe in the list, fetches the recipe by name
     */
    document.addEventListener("click", function (event) {
        if (event.target.classList.contains("viewRecipeButton")) {
            const recipeId = event.target.dataset.recipeId;
            fetchAndDisplayRecipeDetails(recipeId);
        } else if (event.target.classList.contains("remove-button")) {
            const recipeId = event.target.dataset.recipeId;
            removeSavedRecipe.call(event.target, recipeId);
        } else if (event.target.tagName.toLowerCase() === 'li') {
            const recipeName = event.target.textContent.split('Remove')[0].trim();
            fetchRecipeByName(recipeName);
        }
    });


    // Functions
    function handleSearchInput(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            fetchRecipes(searchInput.value);
        }
    }

    /**
     * Clicking on a letter from the alphabet, shows the recipes that start with this letter
     * also each time the user clicks on a different letter, the recipes will start from page 1
     */
    function handleAlphabetClick(event) {
        if (event.target.classList.contains('letter')) {
            fetchRecipesByFirstLetter(event.target.textContent);
        }
        currentPage = 1;
    }

    /**
     * Closing the modal for the recipes also terminates the speech and hides the speech button
     */
    function closeModal() {
        modal.style.display = "none";
        hideSpeechButton();
        speechSynthesis.cancel();
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

    /**
     * Retrieves saved recipes, removes the specified recipe from the array
     * updates the local storage and remove the UI element
     * also logs erros to the console, if they occur
     */
    function removeSavedRecipe(recipeId) {
        try {
            let savedRecipes = JSON.parse(localStorage.getItem("savedRecipes")) || [];
            const index = savedRecipes.indexOf(recipeId);
            if (index !== -1) {
                savedRecipes.splice(index, 1);
                localStorage.setItem("savedRecipes", JSON.stringify(savedRecipes));
                this.parentElement.remove();
            }
        } catch (error) {
            console.error("Error removing saved recipe:", error);
        }
    }

    function handleSaveButtonClick() {
        const recipeId = modalContent.dataset.recipeId;
        saveRecipeLocally(recipeId);
        displaySavedRecipes();
    }

    /**
     * When the user clicks on a saved recipe,
     * the function extracts the recipe name from the clicked item's text content and
     * fetches the recipe details using the name
     */
    function handleSavedRecipeClick(event) {
        if (event.target.tagName.toLowerCase() === 'li') {
            const recipeName = event.target.textContent.split('Remove')[0].trim();
            fetchRecipeByName(recipeName);
        }
    }

    /**
     * If the user's browser include the SpeechSynthesis API
     * then this function cancels any ongoing speech synthesis or
     * proceeds to read the recipe details, else it will show an alert informing the user
     */
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

    /**
     * Uses the web speech api and creates speech synthesis utterance object with
     * recipe details, sets the speech rate and volume and forces the browser to 
     * speak the utterance
     */
    function readRecipeDetails() {
        const recipeDetails = modalContent.textContent;
        const speech = new SpeechSynthesisUtterance(recipeDetails);
        speech.rate = 1;
        speech.volume = 1;
        speechSynthesis.speak(speech);
    }

    /**
     * Checks if a recipe is saved in the browser's local storage and adjust the save button to
     * either be hidden if the recipe is already saved otherwise to be displayed, also any error that may occur
     * during this proccess will be logged to the console
     */
    function checkIfRecipeIsSaved(recipeId) {
        try {
            let savedRecipes = JSON.parse(localStorage.getItem("savedRecipes")) || [];
            const saveButton = document.getElementById("saveButton");
            saveButton.style.display = savedRecipes.includes(recipeId) ? "none" : "block";
        } catch (error) {
            console.error("Error checking if recipe is saved:", error);
        }
    }

    /**
     * Displays a random recipe from the modal, sets the title's text content to the name of the recipe
     * populates the modal with instructions, category, area and the image of the recipe
     * also sets the dataset attribute of the modal content to store the recipe's ID
     * dispalys the modal, checks if the recipe is saved and shows the speech button
     */
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

    /**
     * Fetches recipes from the API based on a search query and category
     * constructs a URL using these and if it's provided then it makes a HTTP request
     * to that specific URL using the 'fetch' API. Next if it receives a response
     * it extracts the array of recipes and updates the UI to display them
     * if there is an error, it will be logged to the console
     */
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

    /**
     * Shows recipe cards based on the array of the recipes and it begins
     * by clearing any existing content within the recipe container
     * then it checks if there are available recipes to display and if there are
     * it itterates over each recipe creating a recipe card for each one
     * Each card contains the title, thumnail image and a button to view the details
     * also the cards are appended to the recipe container
     * If no recipes are found, it displays a message indicating so
     * Finally updates the pagination controls based on the total number of recipes displayed. 
     */
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


    /**
     * Calculates the total number of pages required to display all of the recipes based
     * on the total number of recipes found and the page size, also ensures that at least 
     * 1 page is displayed by rounding the up the nearest whole number with the ceil method
     * Next determines whether the previous or next buttons should be disabled to prevent navigation
     * to a non existant page. If the current page is the First, it disables the previous button, in the
     * same way if the page is the Last page, it disables the next button
     * Then updates the text content of the current page to display the correct pagination number
     * Finally determines whether the pagination container should be displayed or be hidden based
     * on the total number of recipes, if there are more or less than 4 recipes per page
     */
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

    /**
     * Saves the recipe locally in the browser's storage, starts by retrieving the
     * array of saved recipes from the local storage and if there are no saved recipes
     * or if retrieving them fails, then it sets an empty array
     * Checks if the recipe id is already included in the saved array, if it isn't 
     * then it adds it by pushing it, then updates the local storage by stringifying the
     * array and stores it under it using the set item
     * If it's already saved, then it triggers an alert indicating that it is already saved
     * any errors that occured during the proccess are caught by the try and catch block, then 
     * it's logged into the console
     */
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
                const removeButton = document.createElement("button");
                removeButton.textContent = "Remove";
                removeButton.classList.add("remove-button");
                removeButton.dataset.recipeId = recipe.idMeal;
                li.appendChild(removeButton);
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