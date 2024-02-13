const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ItemSchema = new Schema({
    category: {type: Schema.Types.ObjectId, ref: 'Category', required: true},
    name: {type: String, required: true, minLength: 3},
    description: {type: String, maxLength: 50},
    price: {type: Number, required: true, min: 0.99, max: 999.99},
    qtyInStock: {type: Number, required: true, min: 0, max: 99},
    img: {type: String}
});

//Virtual for Item's URL
ItemSchema.virtual('url').get(function() {
    return `inventory/items/${this._id}`;
});

module.exports = mongoose.model('Item', ItemSchema);