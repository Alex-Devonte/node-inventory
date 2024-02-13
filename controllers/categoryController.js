const Category = require('../models/category');
const asyncHandler = require('express-async-handler');
const Item = require('../models/item');

//Display list of all categories
exports.category_list = asyncHandler(async (req, res, next) => {
    //Get all categories
    const categories = await Category.find({}).exec();

    res.render('categories', {
        title: 'Categories',
        categories_list: categories
    });
});

//Display detail page for category
exports.category_detail = asyncHandler(async (req, res, next) => {
    //Get category and all item under that category
    const [category, categoryItems] = await Promise.all([
        Category.findById(req.params.id).exec(),
        Item.find({ category: req.params.id}, 'name').exec()
    ]);

    res.render('category_detail', {
        title: 'Category Detail',
        category: category,
        category_items: categoryItems
    })
});