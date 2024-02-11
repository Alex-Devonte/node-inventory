var express = require('express');
var router = express.Router();

const itemController = require('../controllers/itemController');
const categoryController = require('../controllers/categoryController');

router.get('/', itemController.index);

router.get('/items', itemController.item_list);

router.get('/items/:id', itemController.item_detail);

router.get('/categories', categoryController.category_list);

module.exports = router;