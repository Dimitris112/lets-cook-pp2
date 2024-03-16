document.addEventListener("DOMContentLoaded", function () {
    const browseByName = document.getElementsByClassName("browse-by-name")[0];

    /**
     * Function to generate letters from A to Z dynamically
     * and add them to the browse-by-name section
     */
    function generateAlphabet() {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (let letter of letters) {
            const span = document.createElement("span");
            span.classList.add("letter");
            span.textContent = letter;
            browseByName.appendChild(span);
        }
    }

    generateAlphabet();

    function handleLetterClick(event) {
        const searchQuery = event.target.textContent;
        fetchRecipesByFirstLetter(searchQuery);
    }

    // Add event listeners to each letter if letters is iterable
    const letters = document.getElementsByClassName("letter");
    if (letters && letters.length) {
        for (let i = 0; i < letters.length; i++) {
            letters[i].addEventListener("click", handleLetterClick);
        }
    } else {
        console.error("No letters found or letters is not iterable.");
    }

    const searchButton = document.getElementById("searchButton");
    const randomButton = document.getElementById("randomButton");
    const modal = document.getElementById("modal");
    const closeButton = document.getElementsByClassName("close");
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
    });

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
        const recipeContainer = document.getElementById("recipeContainer");
        recipeContainer.innerHTML = "";

        if (recipes && recipes.length > 0) {
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
            for (let i = 0; i < viewRecipeButtons.length; i++) {
                viewRecipeButtons[i].addEventListener("click", () => {
                    const recipeId = viewRecipeButtons[i].getAttribute("data-recipe-id");
                    fetchAndDisplayRecipeDetails(recipeId);
                });
            }
        } else {
            recipeContainer.innerHTML = "<p class='no-recipes-message'>No recipes found.</p>";
        }
    }

    function displayRandomRecipe(recipe) {
        const modalTitle = document.getElementById("modalTitle");
        modalTitle.textContent = recipe.strMeal;
        const modalContent = document.getElementById("modalContent");
        modalContent.innerHTML = `
            <p>${recipe.strInstructions}</p>
            <p>Category: ${recipe.strCategory}</p>
            <p>Area: ${recipe.strArea}</p>
            <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}" />
        `;
        modal.style.display = "block";
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

    function displayRecipeDetails(recipe) {
        const modalTitle = document.getElementById("modalTitle");
        modalTitle.textContent = recipe.strMeal;
        const modalContent = document.getElementById("modalContent");
        modalContent.innerHTML = `
            <p>${recipe.strInstructions}</p>
            <p>Category: ${recipe.strCategory}</p>
            <p>Area: ${recipe.strArea}</p>
            <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}" />
        `;
        modal.style.display = "block";
    }
    // Event listener to close the modal when the user clicks outside
    window.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });
    async function fetchMultipleData() {
        try {
            const urls = [
                'https://www.themealdb.com/api/json/v1/1/search.php?s=Arrabiata',
                'https://www.themealdb.com/api/json/v1/1/search.php?f=a',
                'https://www.themealdb.com/api/json/v1/1/lookup.php?i=52772',
                'https://www.themealdb.com/api/json/v1/1/random.php',
                'https://www.themealdb.com/api/json/v1/1/categories.php',
                'https://www.themealdb.com/api/json/v1/1/list.php?c=list',
                'https://www.themealdb.com/api/json/v1/1/list.php?a=list',
                'https://www.themealdb.com/api/json/v1/1/list.php?i=list'
            ];

            const results = await Promise.all(urls.map(url => fetch(url).then(response => response.json())));

            console.log('Results:', results);
        } catch (error) {
            console.error('Error:', error);
        }
    }

    fetchMultipleData();
});