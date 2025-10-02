document.addEventListener('DOMContentLoaded', function () {
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const closeMenuBtn = document.getElementById('close-menu-btn');

    if (hamburgerBtn && mobileMenu) {
        hamburgerBtn.addEventListener('click', function () {
            mobileMenu.classList.toggle('open');
        });
    }

    if (closeMenuBtn && mobileMenu) {
        closeMenuBtn.addEventListener('click', function () {
            mobileMenu.classList.remove('open');
        });
    }

    // Optional: Close menu when clicking outside of it (if it's a full overlay)
    // For a side-sliding menu like this, clicking a link is usually how it's dismissed
    // or the explicit close button.

    // Optional: Close menu when a navigation link is clicked
    const mobileNavLinks = mobileMenu.querySelectorAll('nav a');
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', function() {
            mobileMenu.classList.remove('open');
        });
    });
});