const stripe = Stripe('pk_test_51I7TsgEDDKDRYe98uISk16Yy5UuF3trOxJ07Gp0BwwBOqVAp6Hm4jrSeGTlhZOIZs3wWEDNrz5OtM3C4pZyT1S8J00BaGysTqx');

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

    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');

    addToCartButtons.forEach((button) => {
        button.addEventListener('click', function() {
            const productName = this.getAttribute('data-product-name');
            const productPrice = this.getAttribute('data-product-price');
            addToCart(productName, productPrice, 1);
        });
    });

    const cartIcon = document.getElementById('cart-icon');
    const cartDropdown = document.querySelector('.cart-dropdown');

    cartIcon.addEventListener('click', function() {
        updateCartDropdown();
        // Toggle dropdown visibility
        cartDropdown.style.display = cartDropdown.style.display === 'block' ? 'none' : 'block';
    });

    document.addEventListener('mousedown', function(event) {
        if (!cartDropdown.contains(event.target) && !cartIcon.contains(event.target)) {
            cartDropdown.style.display = 'none';
        }
    });

    cartDropdown.addEventListener('click', (event) => {
        if (event.target.id === 'checkout-button') {
            const cartItems = getCartFromCookie();
            console.log(JSON.stringify({ items: cartItems }))

            fetch('/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ items: cartItems }),
            })
            .then(response => response.json())
            .then(session => {
                console.log(session);
                // Use Stripe.js to redirect to the checkout page
                return stripe.redirectToCheckout({ sessionId: session.id });
            })
            .catch(error => {
                console.error('Error:', error);
            });
        }
    });
});

function setCartCookie(cart) {
    // Serialize the cart object to a JSON string
    const cartValue = JSON.stringify(cart);
    // Set the cookie to expire in 1 day/s
    const date = new Date();
    date.setTime(date.getTime() + (24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    // Set the cookie with the cart data
    document.cookie = "cart=" + cartValue + ";" + expires + ";path=/";
    console.log('Cookie set: ', document.cookie);
}

function addToCart(productName, productPrice, quantity) {
    let cart = getCartFromCookie();
    let cartItem = cart.find(item => item.productName === productName);

    if (cartItem) {
        cartItem.quantity += quantity;
    } else {
        cart.push({
            productName: productName,
            productPrice: productPrice,
            quantity: quantity
        });
    }

    setCartCookie(cart);
}

function getCartFromCookie() {
    // Retrieve the cookie value
    const name = "cart=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');

    for (let i = 0; i < ca.length; i++) {
        let c = ca[i].trim(); // Use trim() to remove whitespace from both ends of the string
        if (c.indexOf(name) === 0) {
            try {
                // Parse the JSON string back to an object
                return JSON.parse(c.substring(name.length));
            } catch (e) {
                console.error('Error parsing cart cookie:', e);
                return [];
            }
        }
    }
    // Return an empty array if the cart cookie does not exist
    return [];
}

function removeItemFromCart(index) {
    let cart = getCartFromCookie();
    // Remove the item at the specified index
    cart.splice(index, 1);
    // Update the cart cookie
    setCartCookie(cart);
    // Update the cart dropdown to reflect the changes
    updateCartDropdown();
}

function updateCartDropdown() {
    const cart = getCartFromCookie();
    const cartItemsContainer = document.querySelector('.cart-items');
    cartItemsContainer.innerHTML = ''; // Clear current cart items

    let subtotal = 0;
    cart.forEach((item, index) => {
        const listItem = document.createElement('li');
        listItem.className = 'cart-item-grid'; // Add a class for styling
        listItem.innerHTML = `
            <span class="cart-item-name">${item.productName}</span>
            <span class="cart-item-quantity">Qty: ${item.quantity}</span>
            <button class="delete-item" data-index="${index}">Remove</button>
        `;
        cartItemsContainer.appendChild(listItem);

        // Calculate subtotal
        subtotal += item.productPrice * item.quantity;
    });

    // Add subtotal and checkout button
    const checkoutSection = document.createElement('div');
    checkoutSection.className = 'checkout-section';
    checkoutSection.innerHTML = `
        <div class="subtotal">Subtotal: $${subtotal.toFixed(2)}</div>
        <button class="checkout-button" id="checkout-button">Checkout</button>
    `;
    cartItemsContainer.appendChild(checkoutSection);

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<li>Your cart is empty.</li>';
    } else {
        // Add event listeners to the delete buttons after the list is populated
        document.querySelectorAll('.delete-item').forEach(button => {
            button.addEventListener('click', function(event) {
                event.stopPropagation(); // Prevent the dropdown from closing
                removeItemFromCart(this.getAttribute('data-index'));
            });
        });
    }
}