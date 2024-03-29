# Let's Cook
Go to the website -> [Live link](https://dimitris112.github.io/lets-cook-pp2/){:target="_blank"}


- responsiveness screenshot will be here
- ## [Purpose of the project](#purpose-of-the-project)
- ## [User Stories](#user-stories)
- ## [Features](#features)
- ## [Future Features](#future-features)
- ## [Typography and color scheme](#typography-and-color-scheme)
- ## [Technology](#technology)
- ## [Testing](#testing)
    - [Code Validation](#code-validation)
    - [Test cases](#test-cases)
    - [Fixed bugs](#fixed-bugs)
    - [Unfixed bugs](#unfixed-bugs)
    - [Supported screens and browsers](#supported-screens-and-browsers)
- ## [Deployment](#deployment)
    - [Gitpod](#via-gitpod)
    - [Github Pages](#via-github-pages)
- ## [Credits](#credits)

# Purpose of the project
- The purpose of the project is a website called "Let's Cook" that serves as a recipe finder. The project aims to provide users with a platform to search, browse, and discover recipes based on various criteria such as keywords, categories, and alphabetical order. Additionally, users can save locally their favorite recipes for future reference.

## User stories
- As a food explorer, I want to try recipes from different cultures and regions to expand my knowledge in gastronomy.
 - As a food enthousiast, I want to explore recipes from different cuisines and categories.
 - As a busy individual, I want to be able to search recipes based on specific ingredients or keywords so that I can quickly find recipes that match my available ingredients or dietary preferences. This feature would save me time and help me make the most out of my limited cooking time.
 - As someone passionate about cooking, I want to have a functionality to save recipes that I find intriguing or unique, empowering me to experiment with new flavors and techniques at my own pace.
 - couple more will come if i add any more functionality

## Features 
 - ### **DISCLAIMER**
 The speech which reads the details of the recipes works **ONLY** in browsers that include `Web Speech API`. Click here for more information -> [WebSpeech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API){:target="_blank"}
 
 The scrollbar effects / colors will be visible **ONLY** to browsers that include the `::-webkit-scrollbar`. Here's the link for more information -> 
 [Webkit Scrollbar](https://developer.mozilla.org/en-US/docs/Web/CSS/::-webkit-scrollbar){:target="_blank"}

![Scrollbar](assets/images/validation/scrollbar.gif "Scrollbar with the webkit effects")

 

## Future Features

## Typography and color scheme
- The project utilizes the **Montserrat** font family from Google Fonts, while the primary font is Montserrat / the fallback font is Sans-serrif. As for the color scheme for the body `background: linear-gradient(135deg, #ff9a00, #ee0979);` it ensures a vibrant orange for primary color `"ff9a00"` and bold pink for the secondary color `"ee0979"` while the `linear-gradient of 135deg` let's it flow diagonally from the bottom left to the top right with a value of 135degrees creating a smooth color change.

## Technology
## Testing
 - ### Code Validation
  1. For the HTML validation I used [w3](https://validator.w3.org/){:target="_blank"} which shows the [page](https://validator.w3.org/nu/?doc=https%3A%2F%2Fdimitris112.github.io%2Flets-cook-pp2%2F){:target="_blank"} error free. 
  2. For the CSS I used the same method which is also error free but received warnings about the `::-webkit-scrollbar` because it is not universal among the browsers. See for yourself -> [CLICK ME](https://jigsaw.w3.org/css-validator/validator?uri=https%3A%2F%2Fdimitris112.github.io%2Flets-cook-pp2%2F&profile=css3svg&usermedium=all&warning=1&vextwarning=&lang=en){:target="_blank"}
  3. For the JavaScript I used 

 - ### Test cases "user story based with screenshots"
 - ### Fixed bugs
 - ### Unfixed bugs
 - ### Supported screend and browsers
## Deployment
 - ### Via Gitpod
 - ### Via Github pages
 1. Before you do anything, make sure in your repository you've included an `index.html` and `README.md` file.
 2. Now once you've done the 1st step, your next move is to navigate to your repository ***Settings*** located near the top left corner. If you cannot see the ***Settings*** tab, click the ... dropdown menu and select it.
 3. In the ***Code and Automation*** section , click ***Pages***
 4. Under the **Build and Deployment** you can deploy from a *branch*. You have to select **main** as your branch and `/root` as your folder. Then click **save**
 5. ***OPTIONAL*** you can create your custom domain if you want to. Click [here](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site){:target="_blank"} for more information.
 6. The URL for the page takes some time to be created, once it's done it will be displayed at the top. In the meantime while you're waiting, find something to cook!
## Credits