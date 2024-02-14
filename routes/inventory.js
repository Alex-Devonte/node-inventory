var express = require('express');
var router = express.Router();
const multer = require('multer');
const upload = multer({dest: 'uploads/'});

const itemController = require('../controllers/itemController');
const categoryController = require('../controllers/categoryController');

router.get('/', itemController.index);

router.get('/items/create', itemController.create_item_get);
router.post('/items/create', upload.single('item-img'), itemController.create_item_post);

router.get('/items', itemController.item_list);
router.get('/items/:id', itemController.item_detail);

router.get('/categories', categoryController.category_list);
router.get('/categories/:id', categoryController.category_detail);

module.exports = router;