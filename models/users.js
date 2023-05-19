const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    firm: {
        type: String,
        required: true
    },
    role: {
        type: String
    },
    active: {
        type: String
    },
    refreshToken: [String]
})

module.exports = mongoose.model('User', UserSchema)