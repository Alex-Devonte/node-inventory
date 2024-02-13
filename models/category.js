const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CategorySchema = new Schema({
    name: {type: String, required: true, minLength: 3},
    description: {type: String, maxLength: 50},
    item: [{type: Schema.Types.ObjectId, ref: 'Item'}]
});

//Virtual for Category  URL
CategorySchema.virtual('url').get(function() {
    return `/inventory/categories/${this._id}`;
});

module.exports = mongoose.model('Category', CategorySchema);