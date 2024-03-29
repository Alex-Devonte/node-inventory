const Category = require('../models/category');
const Item = require('../models/item');

const asyncHandler = require('express-async-handler');
const { body, validationResult } = require("express-validator");

//Display list of all categories
exports.category_list = asyncHandler(async (req, res, next) => {
    //Get all categories and item count for each category
    const categories = await Category.aggregate([
            {
                $lookup: {
                    from: 'items',
                    localField: '_id',
                    foreignField: 'category',
                    as: 'items'
                },
            },
            {
                //Virtuals aren't directly accessible in aggregation queries so use $addFields to manually create url field
                $addFields: {
                    url:  {$concat: ['/inventory/categories/', { $toString: '$_id' }]}
                }
            },
            {
                $project: {
                    _id: 0,
                    name: 1,
                    description: 1,
                    url: 1,
                    count: {$size: '$items'},
                },
            },
    ]).exec();
    
    res.render('categories', {
        title: 'Categories',
        categories: categories,
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
    body('name')
        .trim()
        .isLength({min: 3, max: 20})
        .withMessage('Category name must be between 3 & 20 characters')
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
    
    body('description', 'Description cannot be more than 120 characters')
        .trim()
        .isLength({max: 120})
        .escape(),
    
    //Process request
    asyncHandler (async (req, res, next) => {
        const errors = validationResult(req);
        const category = new Category({
            name: req.body.name, 
            description: req.body.description || 'No description'
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

//Display category update form
exports.update_category_get = asyncHandler(async (req, res, next) => {
    const category = await Category.findById(req.params.id).exec();

    if (category === null) {
        const err = new Error('Category not found');
        err.status = 404;
        return next(err);
    }

    res.render('category_form', {
        title: 'Update Category',
        category: category
    });
});

exports.update_category_post = [
    body('name')
        .trim()
        .isLength({min: 3, max: 20})
        .withMessage('Category name must be between 3 & 20 characters')
        .custom(async (value) => {
            const categoryExists = await Category.findOne({name: value})
                .collation({locale: 'en', strength: 2})
                .exec();
            //Return true if user didn't change name
            if (value === categoryExists?.name) {
                return true;
            }
            else if (categoryExists) {
                throw new Error('A category with that name already exists');
            }
            return true;
        })
        .escape(),
    
    body('description', 'Description cannot be more than 120 characters')
        .trim()
        .isLength({max: 120})
        .escape(),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        
        const category = new Category({
            name: req.body.name,
            description: req.body.description,
            _id: req.params.id //REQUIRED: Or else New new will be assigned
        });

        if (!errors.isEmpty()) {
            res.render('category_form', {
               title: 'Update Category',
               category: category,
               errors: errors.array() 
            });
        } else {
            const updatedCategory = await Category.findByIdAndUpdate(req.params.id, category, {});
            res.redirect(updatedCategory.url);
        }
    })
    
];

//Display category delete page
exports.delete_category_get = asyncHandler(async (req, res, next) => {
    //Get category and all items in that category
    const [category, itemsInCategory] = await Promise.all([
        Category.findById(req.params.id).exec(),
        Item.find({category: req.params.id}, 'name').exec(),
    ]);
  
    //Redirect if category can't be found
    if (category === null) {
        res.redirect("/categories");
    }
  
    res.render("category_delete", {
      title: "Delete Category",
      category: category,
      categoryItems: itemsInCategory,
    });
  });

//Handle Category delete POST
exports.delete_category_post = asyncHandler(async (req, res, next) => {
    //Get category and all items in that category
    const [category, itemsInCategory] = await Promise.all([
        Category.findById(req.params.id).exec(),
        Item.find({category: req.params.id}, 'name').exec(),
    ]);

    if (itemsInCategory.length > 0) {
        //Category has items so it can't be deleted yet
        res.render('category_delete', {
            title: 'Delete Category',
            category: category,
            categoryItems: itemsInCategory,
        });
    } else {
        //Category has no items so delete it and redirect
        await Category.findByIdAndDelete(req.body.categoryid);
        res.redirect('/inventory/categories')
    }
});