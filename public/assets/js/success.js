//clear cart when success is loaded
document.addEventListener("DOMContentLoaded", function() {
    const checkoutSessionId = localStorage.getItem('checkoutSessionId');
    
    const urlParams = new URLSearchParams(window.location.search);
    const sessionIdFromUrl = urlParams.get('session_id');

    console.log(sessionIdFromUrl);
    if (checkoutSessionId === sessionIdFromUrl) {
        document.cookie = "cart=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
        localStorage.removeItem('checkoutSessionId'); 
    }
}); 