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
});