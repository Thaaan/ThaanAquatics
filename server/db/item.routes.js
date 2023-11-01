const express = require('express');
const router = express.Router();
const itemModel = require('./item.model');

router.get('/all', async (req, res) => {
    try {
        const items = await itemModel.getAllItems();
        res.render('shop', { items: items });
    } catch (error) {
        res.status(500).send('Error retrieving items.');
    }
});

router.get('/category/:category', async (req, res) => {
    try {
        const itemCategory = req.params.category;
        const items = await itemModel.getItemByCategory(itemCategory);
        res.render('shop', { items: items });
    } catch (error) {
        res.status(500).send('Error retrieving items.');
    }
});

router.get('/api/name/:name', async (req, res) => {
    try {
        const itemName = req.params.name;
        const item = await itemModel.getItemByName(itemName);
        if (item && item.length > 0) { // Check if the item array has records
            res.json(item[0]); // Send the first item (assuming each name is unique)
        } else {
            res.status(404).json({ message: "Item not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/api/category/:category', async (req, res) => {
    try {
        const itemCategory = req.params.category;
        const items = await itemModel.getItemByCategory(itemCategory);
        if (items && items.length > 0) { 
            res.json(items);
        } else {
            res.status(404).json({ message: "Item not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


module.exports = router;
