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
            unit_amount: item.productPrice * 100, // Stripe expects the amount in cents
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
                { shipping_rate: 'shr_1OAKH8EDDKDRYe98VMVr6rc1' },
                { shipping_rate: 'shr_1OAKSAEDDKDRYe98WMPpB7Hf' }
            ],
            mode: 'payment',
            success_url: 'https://thaanaquatics.com/success?session_id={CHECKOUT_SESSION_ID}',
            cancel_url: 'https://thaanaquatics.com/cancel'
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

        //take out the quantity from the items database
        
        res.render('success');
      } catch (error) {
        console.log(error);
      }
    } else {
        res.redirect('/');
    }
});

router.get('/cancel', (req, res) => {
    res.render('cancel');
});  

module.exports = router;