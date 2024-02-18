var express = require('express');
var router = express.Router();
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      // Use the original file name with a unique suffix
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname); // Get the original file extension
      cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
  });

  const upload = multer({ storage: storage });

const itemController = require('../controllers/itemController');
const categoryController = require('../controllers/categoryController');

router.get('/', itemController.index);

router.get('/items/create', itemController.create_item_get);
router.post('/items/create', upload.single('item-img'), itemController.create_item_post);

router.get('/items/:id/delete', itemController.delete_item_get);
router.post('/items/:id/delete', itemController.delete_item_post);

router.get('/items/:id/update', itemController.update_item_get);
router.post('/items/:id/update', upload.single('item-img'), itemController.update_item_post);

router.get('/items', itemController.item_list);
router.get('/items/:id', itemController.item_detail);

router.get('/categories/create', categoryController.create_category_get);
router.post('/categories/create', categoryController.create_category_post);

router.get('/categories/:id/delete', categoryController.delete_category_get);
router.post('/categories/:id/delete', categoryController.delete_category_post);

router.get('/categories', categoryController.category_list);
router.get('/categories/:id', categoryController.category_detail);

module.exports = router;