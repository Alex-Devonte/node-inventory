const Category = require('../models/category');
const asyncHandler = require('express-async-handler');

exports.category_list = asyncHandler(async (req, res, next) => {
    //Get all categories
    const categories = await Category.find({}).exec();

    res.render('categories', {
        title: 'Categories',
        categories_list: categories
    });
});