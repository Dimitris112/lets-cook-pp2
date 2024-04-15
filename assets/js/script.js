document.addEventListener("DOMContentLoaded", function () {
    // Variables
    let alphabet = document.getElementsByClassName("alphabet")[0];
    let modal = document.getElementById("modal");
    let searchButton = document.getElementById("searchButton");
    let randomButton = document.getElementById("randomButton");
    let closeButton = document.getElementsByClassName("close")[0];
    let searchInput = document.getElementById("searchInput");
    let saveButton = document.getElementById("saveButton");
    let modalContent = document.getElementById("modalContent");
    let recipeContainer = document.getElementById("recipeContainer");
    let savedRecipesList = document.getElementById("savedRecipesList");
    let resetButton = document.getElementById("resetButton");
    let prevPageButton = document.getElementById("prevPageButton");
    let nextPageButton = document.getElementById("nextPageButton");
    let toggleSpeechButton = document.getElementById("toggleSpeechButton");
    let currentPage = 1;
    let pageSize = 4;
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
     * I've included both the view recipe and remove buttons in the event listener below
     * clicking the view recipe button -> it shows the recipe details
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

    /**
     * The user clicks on a specified button ID and depending on the ID, the appropriate
     * sharing function is called
     */

    document.addEventListener("click", function (event) {
        if (event.target.id === "facebook-share-btn") {
            shareOnFacebook();
        } else if (event.target.id === "twitter-share-btn") {
            shareOnTwitter();
        } else if (event.target.id === "pinterest-share-btn") {
            shareOnPinterest();
        } else if (event.target.id === "email-share-btn") {
            shareByEmail();
        }
    });


    /**
     * Instead of importing every code from the mealdb API 
     * I've set URLs to search for as they have it there in the free version
     * https://www.themealdb.com/api.php
     */

    // Functions

    /**
     * The user types in the search bar and presses enter
     * then it fetches the recipes
     * also each time the user types in the search bar and then clicks on any button / menu, the searchbar will be empty
     * then it checks if there are available recipes to display and if there are
     * it iterates over each recipe creating a recipe card for each one
     * Also resets the current page to always start on 1
     */
    function handleSearchInput(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            if (searchInput && searchInput.value) {
                fetchRecipes(searchInput.value);
            }
            currentPage = 1;
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
     * also logs errors to the console, if they occur
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
     * during this process will be logged to the console
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
     * displays the modal, checks if the recipe is saved and shows the speech button
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
        resetFilterOption();
    }

    /**
     * If the searchbar is empty then the no recipes found message will appear under it
     * Fetches recipes from the API based on a search query and category
     * constructs a URL using these and if it's provided then it makes a HTTP request
     * to that specific URL using the 'fetch' API. Next if it receives a response
     * it extracts the array of recipes and updates the UI to display them
     * if there is an error, it will be logged to the console
     */
    async function fetchRecipes(searchQuery, category = '') {
        try {
            if (!searchQuery.trim()) {
                recipeContainer.innerHTML = "<p class='no-recipes-message'>No recipes found.</p>";
                updatePaginationControls(0);
                searchInput.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                resetFilterOption();
                return;
            }

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


    /**
     * Fetches recipes by the first letter of their name and takes the letter as parameter
     * If the first letter is empty, then it sets the URL to fetch all recipes, else it sets it to fetch recipes starting by the specific letter
     * After fetching the data from the API , updates the recipes array with the retrieved meals and
     * updates the total number of recipes, then calls the display recipes function to render them to the page
     * Logs any error occurred if any are found
     */
    async function fetchRecipesByFirstLetter(letter) {
        try {
            const searchUrl = letter === '' ? 'https://www.themealdb.com/api/json/v1/1/search.php' : `https://www.themealdb.com/api/json/v1/1/search.php?f=${letter}`;
            const response = await fetch(searchUrl);
            const data = await response.json();
            recipes = data.meals || [];
            totalRecipes = recipes.length;
            displayRecipes(recipes);
            resetFilterOption();
        } catch (error) {
            console.error("Error fetching recipes by first letter:", error);
        }
    }

    /**
     * Fetches a random recipe by sending a GET request to the URL, upon receiving the response
     * it parses the JSON data and extracts the random recipe which is stored to the data variable
     * Then the display random recipe function is called using the first index of its array to display
     * the recipe, if any errors occur, they will be caught by the catch block and logged to the console
     */
    async function fetchRandomRecipe() {
        try {
            const randomUrl = 'https://www.themealdb.com/api/json/v1/1/random.php';
            const response = await fetch(randomUrl);
            const data = await response.json();
            displayRandomRecipe(data.meals[0]);
            resetFilterOption();
        } catch (error) {
            console.error("Error fetching random recipe:", error);
        }
    }

    /**
     * Shows recipe cards based on the array of the recipes and it begins
     * by clearing any existing content within the recipe container and each time the user types
     * in the search bar and then clicks on any button / menu, the searchbar will be empty
     * then it checks if there are available recipes to display and if there are
     * it iterates over each recipe creating a recipe card for each one
     * 
     * Each card contains the title, thumbnail image and a button to view the details
     * also the cards are appended to the recipe container
     * 
     * If no recipes are found, it displays a message indicating so and the
     * filter category will be reset
     * 
     * The scroll into view will take the user to whatever he was seeing to the search bar
     * 
     * Finally updates the pagination controls based on the total number of recipes displayed. 
     */
    function displayRecipes(recipes) {
        searchInput.value = "";
        recipeContainer.innerHTML = "";
        if (recipes && recipes.length > 0) {
            const startIndex = (currentPage - 1) * pageSize;
            const endIndex = Math.min(startIndex + pageSize, recipes.length);
            for (let i = startIndex; i < endIndex; i++) {
                const recipe = recipes[i];
                const recipeElement = document.createElement("div");
                recipeElement.classList.add("recipe");
                recipeElement.innerHTML = `
                    <h2>${recipe.strMeal}</h2>
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
            searchInput.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            resetFilterOption();
        }
    }


    /**
     * Calculates the total number of pages required to display all of the recipes based
     * on the total number of recipes found and the page size, also ensures that at least 
     * 1 page is displayed by rounding the up the nearest whole number with the ceil method
     * 
     * Next determines whether the previous or next buttons should be disabled to prevent navigation
     * to a non existent page. If the current page is the First, it disables the previous button, in the
     * same way if the page is the Last page, it disables the next button
     * 
     * Then updates the text content of the current page to display the correct pagination number
     * 
     * When the user goes back and forth through the pages, the scrollIntoView will smoothly
     * go to the first recipe shown in the container
     * 
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
        document.getElementById("recipeContainer").scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });

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

    function resetFilterOption() {
        mealCategory.value = "all";
    }
    /**
     * Saves the recipe locally in the browser's storage, starts by retrieving the
     * array of saved recipes from the local storage and if there are no saved recipes
     * or if retrieving them fails, then it sets an empty array
     * 
     * Checks if the recipe id is already included in the saved array, if it isn't 
     * then it adds it by pushing it, then updates the local storage by stringify method the
     * array and stores it under it using the set item
     * 
     * If it's already saved, then it triggers an alert indicating that it is already saved
     * any errors that occurred during the process are caught by the try and catch block, then 
     * it's logged into the console
     */
    function saveRecipeLocally(recipeId) {
        try {
            let savedRecipes = JSON.parse(localStorage.getItem("savedRecipes")) || [];
            if (!savedRecipes.includes(recipeId)) {
                savedRecipes.push(recipeId);
                localStorage.setItem("savedRecipes", JSON.stringify(savedRecipes));
                console.table(savedRecipes);
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

    /**
     * Clears the content in the saved recipe list and then retrieves the array from the
     * local storage parsing it as JSON, if no recipes are found or ir there is an error it defaults
     * to an empty array. Then iterates over each saved recipe ID and for each ID it constructs a URL
     * to fetch recipe details from the mealdb API, makes async request to the URL and waits for a response
     * 
     * When the response occurs then it parses the JSON data and extracts the first meal from the array
     * creates a new list element for the saved recipe to be at and sets the list text content to be the 
     * name of the meal. Then creates a remove button for each saved recipe, adds a class to the remove button
     * and sets the dataset of the remove button to the ID of the recipe, then appends the remove button as a 
     * child of the list and finally appends the list item to the saved recipe list for it to be displayed
     * 
     * If any error occurs , then by try and catch it will be logged to the console
     */
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

    /**
     * Constructs a URL which fetches the recipe details using the recipe ID and
     * sends a request to the mealDB API to retrieve them. Then parses the response as 
     * JSON data and displays the fetched recipe details on the page and logs any errors during
     * the process
     */
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

    /**
     * The async function has the parameter of recipeName which represents the 
     * name of the recipe to search for, by try and catch method 
     * sets the URL to search for fetching the recipe details based on their name and
     * fetches the data by sending a GET request to the URL provided using fetch and awaits for
     * the response to be received before proceeding further
     * 
     * Parses the JSON response received from the mealDB API into an object
     * Then checks if the API contains any meal data, if it does then displays the details of the first
     * meal found and the data are stored in the recipe variable and then the display recipe details function 
     * is called in order to display them
     * 
     * If an error occurs during the process, it is caught by the catch block and it's logged to the console.
     */
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

    /**
     * The async function takes a single parameter of Category, 
     * sets a URL for fetching recipes by category and sends a GET request to that URL which then
     * parses the response as JSON data
     * 
     * Then extracts the list of recipes from the response data provided or an empty array if none is found
     * Then updates the total recipes based on the fetched data and displays the recipes on the page
     * 
     * By catch it logs any error occurred to the console
     */
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

    /**
     * Manages the changes in the recipe category selection, extracts the value of the selected category from the
     * event target and stores it in the selected category variable
     * 
     * If the selected category is not equal to all (all recipes) then calls the fetch recipes by category passing the selected
     * category as argument which fetches and displays the recipes
     * 
     * Else calls the fetch recipes function passing the value of the search input
     * Also resets the current page to always start on 1 whenever the user changes category
     */
    function handleCategoryChange(event) {
        const selectedCategory = event.target.value;
        if (selectedCategory !== "all") {
            fetchRecipesByCategory(selectedCategory);
        } else {
            fetchRecipes(searchInput.value);
        }
        currentPage = 1;
    }

    /**
     * Presents the details of the recipe within a modal / pop up window
     * the function takes as a single parameter which is the recipe object and
     * it updates the the modal title with the recipe name and fills the 
     * modal content with instructions, category, area and the image of the recipe
     * 
     * Then sets the dataset property of the modal content by setting its style to block
     * to store the recipe ID
     * Also checks if the recipe is already saved and shows the speech button
     */
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

    // Functions for the social media sharing

    /**
     * Retrieves the text content of the modal element and sets a URL for sharing it on Facebook
     * using the Facebook sharing endpoint including 2 parameters
     * U -> for the current page URL on window location href
     * Quote -> contains the recipe details which are encoded using the encodeURIComponent so that special characters
     * will be safely handled in the URL
     * 
     * Then opens a new tab with the new URL where the user will be ready to share it
     * 
     * ------------------------------------- Similar explanation goes for Twitter and Pinterest ---------------------------------------------
     */

    function shareOnFacebook() {
        const recipeDetails = modalContent.textContent;
        const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(recipeDetails)}`;
        window.open(shareUrl, '_blank');
    }

    function shareOnTwitter() {
        const recipeDetails = modalContent.textContent;
        const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(recipeDetails)}`;
        window.open(tweetUrl, '_blank');
    }

    function shareOnPinterest() {
        const recipeDetails = modalContent.textContent;
        const shareUrl = `https://www.pinterest.com/pin/create/button/?url=${encodeURIComponent(window.location.href)}&description=${encodeURIComponent(recipeDetails)}`;
        window.open(shareUrl, '_blank');
    }

    /**
     * Retrieves the recipe details by getting the text content of the modal and then defines
     * the Email subject to prompt the recipient to view the shared recipe
     * 
     * The recipe is encoded by encodeURIComponent so any special characters will be properly shown in the email body
     * Uses the mailTo scheme to include both subject and body parameters for the URL / link which will be used
     * to pre fill the mail for the user
     * 
     * Then triggers a new window to open on the user's default mail client with all of the above info included in it
     */

    function shareByEmail() {
        const recipeDetails = modalContent.textContent;
        const emailSubject = "Check out this recipe!";
        const emailBody = encodeURIComponent(recipeDetails);
        const mailtoLink = `mailto:?subject=${emailSubject}&body=${emailBody}`;
        window.location.href = mailtoLink;
    }

    displaySavedRecipes();
});