const Item = require('../models/item');
const Category = require('../models/category');
const { body, validationResult } = require("express-validator");
const asyncHandler = require('express-async-handler');

exports.index = asyncHandler(async (req, res, next) => {
    res.render('index');
});

//Display list of all the items
exports.item_list = asyncHandler(async (req, res, next) => {
    //Get all items while excluding description field
    const items = await Item.find({}, '-description').exec();

    res.render('items', {
       title: 'Item List',
       item_list: items 
    });
});

//Display detail page for item
exports.item_detail = asyncHandler(async (req, res, next) => {
    //Get specific item by its id
    const itemDetails = await Item.findById(req.params.id).populate('category').exec();
    res.render('item_detail', {
        title: itemDetails.name,
        item: itemDetails
    });
});

//Display create item form
exports.create_item_get = asyncHandler(async (req, res, next) => {
    //Get categories to populate dropdown
    const categories = await Category.find({}, 'name').sort({name: 1}).exec();
    res.render('item_form', {
        title: 'Create Item',
        categories: categories
    })
});

//Handle create item POST
exports.create_item_post = [
    //Convert category to array
    (req, res, next) => {
        if (!Array.isArray(req.body.category)) {
            req.body.category = typeof req.body.category === 'undefined' ? [] : [req.body.category];
        }
        next();
    },

    body('name', 'Please enter item name')
        .trim()
        .isLength({min:3, max: 40})
        .withMessage('Item names must be between 3 & 40 characters long')
        .escape(),

    body('description', 'Description cannot be more than 50 characters')
        .trim()
        .isLength({max: 50})
        .escape(),

    body('price', 'Please enter item price')
        .trim()
        .isFloat({min: 0.99, max: 999.99})
        .withMessage('Price must fall within the range of $0.99 to $999.99')
        .escape(),

        body('stock', 'Stock value must fall within the range of 0 to 99')
        .trim()
        .isInt({min: 0, max: 99})
        .escape(),
        
    body('category.*').escape(),
    
    //Process request
    asyncHandler(async (req, res, next) => {
        //Extract errors from request
        const errors = validationResult(req);

        //Check for Multer error
        if (req.multerError) {
            errors.errors.push({ msg: req.multerError });
        }

        let imagePath;
        if (req.file) {
            if (process.env.NODE_ENV === 'production') {
                imagePath = `${process.env.AWS_BUCKET_URL}${req.file.key}`;
            } else {
                imagePath = "\\" + req.file.path;
            }
        }

        //Create Item object with cleaned data
        const item = new Item({
            category: req.body.category,
            name: req.body.name,
            description: req.body.description || 'No item description',
            price: req.body.price,
            qtyInStock: req.body.stock,
            img: imagePath || ''
        });

        //Render form again if there are errors
        if (!errors.isEmpty()) {
            //Get categories for select input
            const categories = await Category.find({}, 'name').sort({name: 1}).exec();

            res.render('item_form', {
                title: 'Create Item',
                item: item,
                categories: categories,
                errors: errors.array(),
            });
        } else {
            //Data is valid so save document and redirect
            await item.save();
            res.redirect(item.url);
        }
    }),
];

//Display item update form
exports.update_item_get = asyncHandler(async (req, res, next) => {
    //Get item and categories for form
    const [item, categories] = await Promise.all([
       Item.findById(req.params.id).populate('category').exec(),
       Category.find().sort({name: 1}).exec(),
    ]);

    if (item === null) {
        const err = new Error('No item found.');
        err.status = 404;
        return next(err);
    }

    res.render('item_form', {
        title: 'Update Item',
        item: item,
        categories: categories
    });
});

//Handle item update POST
exports.update_item_post = [
    //Convert category to array
    (req, res, next) => {
        if (!Array.isArray(req.body.category)) {
            req.body.category = typeof req.body.category === 'undefined' ? [] : [req.body.category];
        }
        next();
    },

    body('name', 'Please enter item name')
        .trim()
        .isLength({min:3, max: 40})
        .withMessage('Item names must be between 3 & 40 characters long')
        .escape(),

    body('description', 'Description cannot be more than 50 characters')
        .trim()
        .isLength({max: 50})
        .escape(),

    body('price', 'Please enter item price')
        .trim()
        .isFloat({min: 0.99, max: 999.99})
        .withMessage('Price must fall within the range of $0.99 to $999.99')
        .escape(),
   
        body('stock', 'Stock value must fall within the range of 0 to 99')
        .trim()
        .isInt({min: 0, max: 99})
        .escape(),
        
    body('category.*').escape(),

    //Process request
    asyncHandler(async (req, res, next) => {
        //Extract errors from request
        const errors = validationResult(req);

        //Check for Multer error
        if (req.multerError) {
            errors.errors.push({ msg: req.multerError });
        }

        let imagePath;
        if (req.file) {
            if (process.env.NODE_ENV === 'production') {
                imagePath = `${process.env.AWS_BUCKET_URL}${req.file.key}`;
            } else {
                imagePath = "\\" + req.file.path;
            }
        }

        //Create Item object with cleaned data
        const item = new Item({
            category: req.body.category || [],
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            qtyInStock: req.body.stock,
            img: imagePath || '',
            _id: req.params.id, //REQUIRED: Or else New new will be assigned
        });

        //Render form again if there are errors
        if (!errors.isEmpty()) {
            //Get categories for select input
            const categories = await Category.find({}, 'name').sort({name: 1}).exec();

            res.render('item_form', {
                title: 'Update Item',
                item: item,
                categories: categories,
                errors: errors.array(),
            });
            return;
        } else {
            //Data is valid so update document and redirect
            const updatedItem = await Item.findByIdAndUpdate(req.params.id, item, {});
            res.redirect(updatedItem.url);
        }
    }),
];

//Display Item delete form 
exports.delete_item_get = asyncHandler(async (req, res, next) => {
    const itemDetails = await Item.findById(req.params.id).populate('category').exec();

    if (itemDetails) {
        res.render('item_delete', {
            title: itemDetails.name,
            item: itemDetails
        });
    } else {
        res.redirect('/inventory/items');
    }
});

//Handle Item delete POST
exports.delete_item_post = asyncHandler(async (req, res, next) => {
    const itemDetails = await Item.findById(req.params.id).populate('category').exec();

    if (itemDetails) {
        await Item.findByIdAndDelete(req.body.itemid);
    }
    res.redirect('/inventory/items');
});