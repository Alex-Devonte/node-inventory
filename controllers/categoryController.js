const Category = require('../models/category');
const Item = require('../models/item');

const asyncHandler = require('express-async-handler');
const { body, validationResult } = require("express-validator");

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

//Display category form on GET
exports.create_category_get = (req, res, next) => {
    res.render('category_form', {title: 'Create Category'});
}

//Handle create category POST
exports.create_category_post = [
    body('name', 'Category name must contain at least 3 characters')
        .trim()
        .isLength({min: 3})
        .custom(async (value) => {
            const categoryExists = await Category.findOne({name: value})
                .collation({locale: 'en', strength: 2})
                .exec();
            if (categoryExists) {
                throw new Error('A category with that name already exists');
            }
            return true;
        })
        .escape(),
    
    body('description', 'Description cannot be more than 50 characters')
        .trim()
        .isLength({max: 50})
        .escape(),
    
    //Process request
    asyncHandler (async (req, res, next) => {
        const errors = validationResult(req);
        const category = new Category({
            name: req.body.name, 
            description: req.body.description
        });

        //Render form again if there are errors
        if (!errors.isEmpty()) {
            res.render('category_form', {
               title: 'Create Category',
               category: category,
               errors: errors.array(), 
            });
        } else {
            //Data is valid and category doesn't already exist so save document and redirect
            await category.save();
            res.redirect(category.url);
        }
    }),
];