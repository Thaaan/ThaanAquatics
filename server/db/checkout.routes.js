const express = require('express');
const router = express.Router();
const orderModel = require('./order.model');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY_TEST);

router.post('/create-checkout-session', async (req, res) => {
    const cartItems = req.body.items;

    const lineItems = cartItems.map(item => ({
        price_data: {
            currency: 'usd',
            product_data: {
                name: item.productName
            },
            unit_amount: Math.round(item.productPrice * 100), // Stripe expects the amount in cents
        },
        quantity: item.quantity
    }));

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            shipping_address_collection: {
                allowed_countries: ['US', 'CA'],
            },
            shipping_options: [
                { shipping_rate: 'shr_1OAKSAEDDKDRYe98WMPpB7Hf' },
                { shipping_rate: 'shr_1OAKH8EDDKDRYe98VMVr6rc1' },
                { shipping_rate: 'shr_1OASA6EDDKDRYe986a1Bfdmd'}
            ],
            mode: 'payment',
            success_url: 'https://www.thaanaquatics.com/success?session_id={CHECKOUT_SESSION_ID}',
            cancel_url: 'https://www.thaanaquatics.com/'
        });

        res.json({ id: session.id });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

router.get('/success', async (req, res) => {
    const session_id = req.query.session_id;
    if (session_id) {
      try {
        const session = await stripe.checkout.sessions.retrieve(session_id, {
            expand: ['line_items']
          });
          
        const lineItems = session.line_items.data.map(item => ({
            name: item.description,
            quantity: item.quantity
        }));

        const result = await orderModel.addOrder(session, lineItems);
        
        for (const item of lineItems) {
            try {
                const result = await orderModel.soldQuantity(item.name, item.quantity);
            } catch (error) {
                console.error(`Error updating quantity for ${item.name}:`, error);
            }
        }

        res.render('success', {
            id: session_id
        });
      } catch (error) {
        console.log(error);
      }
    } else {
        res.redirect('/');
    }
});

router.post('/api/check-quantity', async (req, res) => {
    const { productName } = req.body;
    try {
        const availableQuantity = await orderModel.getQuantity(productName);
        res.json({ availableQuantity: availableQuantity[0].Quantity });
    } catch (error) {
        res.status(500).send('Error checking product quantity');
    }
});

module.exports = router;