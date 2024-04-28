var express = require('express');
var router = express.Router();
const multer = require('multer');
const path = require('path');

const aws = require('aws-sdk');
const multerS3 = require('multer-s3');


const fileFilter = function(req, file, cb) {
  const fileTypes = ['image/png', 'image/jpeg'];

  if (fileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    req.multerError ='Invalid file type. Only PNG and JPEG files are allowed.';
    cb(null, false);
  }
}

let upload;

if (process.env.NODE_ENV === 'production') {
    //Configure AWS
    const s3 = new aws.S3({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION
    });

    upload = multer({
        storage: multerS3({
            s3: s3,
            bucket: process.env.AWS_BUCKET,
            metadata: function (req, file, cb) {
                cb(null, {
                    fieldName: file.fieldname,
                    contentType: file.mimetype
                });
            },
            key: function (req, file, cb) {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                cb(null, uniqueSuffix + '-' + file.originalname);
            }
        }), fileFilter: fileFilter
    });
} else {
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'uploads/')
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, uniqueSuffix+file.originalname)
        }
    });

  upload = multer({ 
    storage: storage,
    fileFilter: fileFilter
  });
}


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

router.get('/categories/:id/update', categoryController.update_category_get);
router.post('/categories/:id/update', categoryController.update_category_post);

router.get('/categories', categoryController.category_list);
router.get('/categories/:id', categoryController.category_detail);

module.exports = router;