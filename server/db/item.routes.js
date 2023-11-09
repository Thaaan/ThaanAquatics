const express = require('express');
const router = express.Router();
const itemModel = require('./item.model');
const fs = require('fs');
const path = require('path');

router.get('/products/:category/:name', async (req, res) => {
    try {
        const itemName = req.params.name;
        const item = await itemModel.getItemByName(itemName);
        if (item && item.length > 0) {
            const dirPath = path.join(__dirname, '..', '..', 'public', item[0].photoPath, '..');

            fs.readdir(dirPath, (err, files) => {
                if (err) {
                    console.error(err);
                    res.status(500).send('Error reading directory');
                    return;
                }
        
                const photoPaths = files.map(file => path.join(path.join(item[0].photoPath, '..'), file));
        
                res.render('item-page', {
                    item: item[0],
                    photos: photoPaths
                });
            });
        } else {
            res.status(404).json({ message: "Item not found" });
        }
    } catch (error) {
        res.status(500).send('Error retrieving items.');
    }
});

router.get('/products/all', async (req, res) => {
    try {
        const items = await itemModel.getAllItems();
        res.render('category-page', {
            items: items,
            currentCategory: 'All'
        });
    } catch (error) {
        res.status(500).send('Error retrieving items.');
    }
});

router.get('/products/:category', async (req, res) => {
    try {
        const itemCategory = req.params.category;
        const items = await itemModel.getItemByCategory(itemCategory);
        res.render('category-page', {
            items: items,
            currentCategory: itemCategory
        });
    } catch (error) {
        res.status(500).send('Error retrieving items.');
    }
});

router.get('/search', async (req, res) => {
    try {
        const query = req.query.q;
        const items = await itemModel.containsQuery(query);
        res.render('category-page', {
            items: items,
            currentCategory: 'Search:' + query
        });
    } catch (error) {
        res.status(500).send('Error retrieving items.')
    }
})


module.exports = router;
