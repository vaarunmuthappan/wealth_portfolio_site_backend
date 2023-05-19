const mongoose = require('mongoose')

const assetSchema = new mongoose.Schema({
    firm: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    BStype: {
        type: String
    },
    category: {
        type: String,
        required: true
    },
    notes: {
        type: String
    },
    price: {
        type: Number,
        required: true
    },
    curPrice: {
        type: Number,
        required: true
    },
    USDPrice: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    soldDate: {
        type: Date,
        required: true
    }
})

module.exports = mongoose.model('asset', assetSchema)