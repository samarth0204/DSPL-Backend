const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
        name: { 
            type: String,
            required:[true,"Please Enter Product Name"],
            trim: true, 
        },
        price: { 
            type: Number, 
            required:[true,"Please Enter Product Price"],
            maxLength:[7,"Price cannot exceed 7 digits"],
        },
        size: { 
            type: Number, 
            required:[true,"Please Enter Product Price"],
            maxLength:[7,"Price cannot exceed 7 digits"],
            default: 25
        },
        description: { 
            type: String, 
            required: [true,"Please Enter Product Description"],
        },
        category: { 
            type: String,
            required:  [true,"Please Enter Product Category"] 
        },
        images:[
            {
                public_id: {
                    type: String, 
                    required: true,
                },
                url: {
                    type: String,
                    required: true,
                }
            }
        ],
        stock:{
            type: Number,
            required: [true,"Please Enter Product Stock"],
            maxLength: [3, "Stock cannot exceed 3 digits"],
            default: 1,
        },
        numOfReviews:{
            type: Number,
            default: 0,
        },
        review:[
            {
                name: {
                    type: String,
                    required: true,
                },
                rating: {
                    type: Number,
                    required: true,
                    min: 1,
                    max: 5,
                },
                comment: {
                    type: String,
                    required: true,
                }
            }
        ],
        user:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        }

})

module.exports = mongoose.model('Product', productSchema);