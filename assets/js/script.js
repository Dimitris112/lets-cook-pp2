document.addEventListener("DOMContentLoaded", function () {

    const browseHeading = document.createElement("h2");
    browseHeading.classList.add("browse-heading");
    browseHeading.textContent = "Browse the Recipes";
    document.body.insertBefore(browseHeading, document.body.firstChild);

    // Div for spacing
    const spaceDiv = document.createElement("div");
    spaceDiv.style.height = "20px";
    document.body.insertBefore(spaceDiv, browseHeading.nextSibling);

    // Create the alphabet section
    const browseByName = document.createElement("div");
    browseByName.classList.add("browse-by-name");
    browseByName.style.marginTop = "20px";
    document.body.insertBefore(browseByName, spaceDiv.nextSibling);

    let alphabetGenerated = false;

    function generateAlphabet() {
        if (!alphabetGenerated) {
            const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            for (let letter of letters) {
                const span = document.createElement("span");
                span.classList.add("letter");
                span.textContent = letter;
                browseByName.appendChild(span);
            }
            alphabetGenerated = true;
        }
    }

    generateAlphabet();

    function handleLetterClick(event) {
        const searchQuery = event.target.textContent;
        fetchRecipesByFirstLetter(searchQuery);
    }

    const letters = document.getElementsByClassName("letter");
    for (let i = 0; i < letters.length; i++) {
        letters[i].addEventListener("click", handleLetterClick);
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
            for (let i = 0; i < recipes.length; i++) {
                const recipe = recipes[i];
                const recipeElement = document.createElement("div");
                recipeElement.classList.add("recipe");
                recipeElement.innerHTML = `
                    <h3>${recipe.strMeal}</h3>
                    <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}">
                    <button class="viewRecipeButton" data-recipe-id="${recipe.idMeal}">View Recipe</button>
                `;
                recipeContainer.appendChild(recipeElement);
            }

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
        modalContent.dataset.recipeId = recipe.idMeal;
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
        modalContent.dataset.recipeId = recipe.idMeal;
        modal.style.display = "block";
    }

    closeButton[0].addEventListener("click", () => {
        modal.style.display = "none";
    });

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