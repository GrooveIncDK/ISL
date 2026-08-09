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

  if (systemSettingDark.matches("dark-theme")) {
    return "dark-theme";
  }

  return "light-theme";
}

/**
* Utility function to update the theme to either light or dark.
*/
function updateButton({ buttonEl, isDark }) {
  const newCta = isDark  ? "images/moon-2.png" : "images/sun.png";
  buttonEl.setAttribute("src", newCta);
  
}

localStorage.setItem("theme","dark-theme");
const button = document.querySelector(".theme-picker");
const localStorageTheme = localStorage.getItem("theme");
//const localStorageThemeIcon = localStorage.getItem("theme-icon");
const systemSettingDark = window.matchMedia("(prefers-color-scheme: dark-theme)");

/**
* 2. Work out the current site settings
*/

let currentThemeSetting = calculateSettingAsThemeString({ localStorageTheme, systemSettingDark });
/**
* 3. Update the theme setting and button text accoridng to current settings
*/
console.log(currentThemeSetting);
updateButton({ buttonEl: button, isDark: currentThemeSetting === "dark-theme" });
button.addEventListener("click", (event) => {
  const newTheme = currentThemeSetting === "dark-theme" ? "light-theme" : "dark-theme";
  var html = document.getElementsByTagName('html');
    html[0].classList.remove(currentThemeSetting);
    html[0].classList.add(newTheme);
 /*localStorage.setItem("theme", newTheme);*/
  updateButton({ buttonEl: button, isDark: newTheme === "dark-theme" });
  currentThemeSetting = newTheme;
  
}); 