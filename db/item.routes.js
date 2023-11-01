const express = require('express');
const router = express.Router();
const itemModel = require('../db/item.model');

router.get('/item/:name', async (req, res) => {
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


module.exports = router;
