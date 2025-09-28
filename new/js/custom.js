document.addEventListener('DOMContentLoaded', function () {
  const popoverButton = document.getElementById('myPopoverButton');
  const popoverContent = document.getElementById('popoverContent');
  const popover = new bootstrap.Popover(popoverButton, {
    html: true, // Allows HTML content in the popover
    sanitize: false,
    content: popoverContent.innerHTML, // Uses the inner HTML of the hidden div
    //title: 'Contact Forms', // Optional: Add a title to the popover
    placement: 'bottom' // Optional: Specify popover placement
  });
});
/*
var myCarousel = document.getElementById('carouselExampleDark');
myCarousel.addEventListener('slide.bs.carousel', event =>{
  console.log(event);
});*/
const myCarouselEle = document.querySelector("#carouselExampleDark");
const carousel = new bootstrap.Carousel(myCarouselEle, {
  /*interval: 9000,*/
  wrap: false
}) 


function calculateSettingAsThemeString({ localStorageTheme, systemSettingDark }) {
  if (localStorageTheme !== null) {
    return localStorageTheme;
  }

  if (systemSettingDark.matches) {
    return "dark";
  }

  return "light";
}

/**
* Utility function to update the button text and aria-label.
*/
function updateButton({ buttonEl, isDark }) {
  const newCta = isDark ? "images/sun.png" : "images/moon-2.png";
  buttonEl.setAttribute("src", newCta);
  
}

/**
* Utility function to update the theme setting on the html tag
*/
function updateThemeOnHtmlEl({ theme }) {
  document.querySelector("html").setAttribute("data-theme", theme);
}


/**
* On page load:
*/

/**
* 1. Grab what we need from the DOM and system settings on page load
*/
const button = document.querySelector(".theme-picker");
const localStorageTheme = localStorage.getItem("theme");
const systemSettingDark = window.matchMedia("(prefers-color-scheme: dark)");

/**
* 2. Work out the current site settings
*/
let currentThemeSetting = calculateSettingAsThemeString({ localStorageTheme, systemSettingDark });

/**
* 3. Update the theme setting and button text accoridng to current settings
*/
updateButton({ buttonEl: button, isDark: currentThemeSetting === "dark" });
/*updateThemeOnHtmlEl({ theme: currentThemeSetting });

/**
* 4. Add an event listener to toggle the theme
*/
button.addEventListener("click", (event) => {
  const newTheme = currentThemeSetting === "dark" ? "light" : "dark";
  var pageName = button.dataset.pageId;
  var element = document.body;
   element.classList.toggle("dark-mode");

  /*localStorage.setItem("theme", newTheme);*/
  updateButton({ buttonEl: button, isDark: newTheme === "dark" });
  /*updateThemeOnHtmlEl({ theme: newTheme });*/

  /*currentThemeSetting = newTheme;
  /** var element = document.body;
   element.classList.toggle("dark-mode");
    */
}); 