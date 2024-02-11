const Item = require('../models/item');
const asyncHandler = require('express-async-handler');

exports.index = asyncHandler(async (req, res, next) => {
    res.render('index');
});

exports.item_list = asyncHandler(async (req, res, next) => {
    //Get all items while excluding description field
    const items = await Item.find({}, '-description').exec();

    res.render('items', {
       title: 'Item List',
       item_list: items 
    });
});

exports.item_detail = asyncHandler(async (req, res, next) => {
    //Get specific item by its id
    const itemDetails = await Item.findById(req.params.id);

    res.render('item_detail', {
        title: itemDetails.name,
        item: itemDetails
    });
});