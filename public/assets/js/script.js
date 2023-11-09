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
        searchInput.classList.add('no-transition');
        searchButton.classList.add('no-transition');

        resizeTimeout = setTimeout(function() {
            searchInput.classList.remove('no-transition');
            searchButton.classList.remove('no-transition');
        }, 100);
    });

    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');

    addToCartButtons.forEach((button) => {
        button.addEventListener('click', function() {
            const productName = this.getAttribute('data-product-name');
            const productPrice = this.getAttribute('data-product-price');

            const itemContainer = this.closest('.item-details');
            const quantityInput = itemContainer.querySelector('#quantity');
            const quantity = quantityInput ? parseInt(quantityInput.value, 10) : 1;

            addToCart(productName, productPrice, quantity);

            this.textContent = 'Added';
            this.style.backgroundColor = '#C97C8B';
            this.disabled = true;

            setTimeout(() => {
                this.textContent = 'Add to Cart';
                this.style.backgroundColor = '#E91E63';
                this.disabled = false;
            }, 2000);
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

            fetch('/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ items: cartItems }),
            })
            .then(response => response.json())
            .then(session => {
                localStorage.setItem('checkoutSessionId', session.id);
                return stripe.redirectToCheckout({ sessionId: session.id });
            })
            .catch(error => {
                console.error('Error:', error);
            });
        }
    });
});

function setCartCookie(cart) {
    const cartValue = JSON.stringify(cart);
    const date = new Date();
    date.setTime(date.getTime() + (6 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = "cart=" + cartValue + ";" + expires + ";path=/";
}

async function addToCart(productName, productPrice, quantity) {
    const response = await fetch('/api/check-quantity', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productName: productName }),
    });

    const { availableQuantity } = await response.json();

    let cart = getCartFromCookie();
    let cartItem = cart.find(item => item.productName === productName);

    if (cartItem) {
        cartItem.quantity = Math.min(cartItem.quantity + quantity, availableQuantity);
    } else {
        cart.push({
            productName: productName,
            productPrice: productPrice,
            quantity: Math.min(quantity, availableQuantity)
        });
    }

    setCartCookie(cart);
}

function getCartFromCookie() {
    const name = "cart=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');

    for (let i = 0; i < ca.length; i++) {
        let c = ca[i].trim(); // Use trim() to remove whitespace from both ends of the string
        if (c.indexOf(name) === 0) {
            try {
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
    cart.splice(index, 1);
    setCartCookie(cart);
    updateCartDropdown();
}

function updateCartDropdown() {
    const cart = getCartFromCookie();
    const cartItemsContainer = document.querySelector('.cart-items');
    cartItemsContainer.innerHTML = '';

    let subtotal = 0;
    cart.forEach((item, index) => {
        const listItem = document.createElement('li');
        listItem.className = 'cart-item-grid';
        listItem.innerHTML = `
            <span class="cart-item-name">${item.productName}</span>
            <span class="cart-item-quantity">Qty: ${item.quantity}</span>
            <button class="delete-item" data-index="${index}">Remove</button>
        `;
        cartItemsContainer.appendChild(listItem);

        subtotal += item.productPrice * item.quantity;
    });

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
        document.querySelectorAll('.delete-item').forEach(button => {
            button.addEventListener('click', function(event) {
                event.stopPropagation();
                removeItemFromCart(this.getAttribute('data-index'));
            });
        });
    }
}