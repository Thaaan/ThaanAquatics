document.addEventListener("DOMContentLoaded", function() {
    let resizeTimeout;
    let searchInput = document.querySelector('.search');
    let searchButton = document.querySelector('.searchbutton');

    searchInput.addEventListener('focus', function() {
        searchInput.classList.add('active-transition');
        searchButton.classList.add('active-transition');
        searchButton.classList.remove('inactive-transition');
    });

    searchInput.addEventListener('blur', function() {
        searchButton.classList.add('inactive-transition');
        searchInput.classList.remove('active-transition');
        searchButton.classList.remove('active-transition');
    });

    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        // When the resize starts, add the no-transition class to disable transitions
        searchInput.classList.add('no-transition');
        searchButton.classList.add('no-transition');

        resizeTimeout = setTimeout(function() {
            // After a short delay (100ms), remove the class to re-enable transitions
            searchInput.classList.remove('no-transition');
            searchButton.classList.remove('no-transition');
        }, 100);
    });
});
