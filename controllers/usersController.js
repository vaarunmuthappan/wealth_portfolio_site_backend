const User = require('../models/users')
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')

// npm run dev to start server

// @desc Get all users in same company
// @route GET /users
// @access Private
const getAllUsers = asyncHandler(async (req, res) => {
    // Get all users from MongoDB
    //lean returns without extra data in json
    const username = req.body.username
    const currentUser = await User.findOne({ username })
    //const firm = currentUser.firm
    //const users = await User.find({ firm }).select('-password').lean()

    // If no users 
    // if (!users?.length) {
    //     return res.status(400).json({ message: 'No users found' })
    // }

    res.json(currentUser)
})
// To test:
// curl -X GET http://localhost:3000/users/ -H "Content-Type: application/json" -d '{"username":"vkvk"}

// @desc Create new user
// @route POST /users
// @access Private
const createNewUser = asyncHandler(async (req, res) => {
    const { username, password } = req.body

    // Confirm data
    if (!username || !password) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    // Check for duplicate username
    const duplicate = await User.findOne({ username }).lean().exec()

    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate username' })
    }

    try {
        //encrypt the password
        const hashedPwd = await bcrypt.hash(pwd, 10);

        //create and store the new user
        const result = await User.create({
            "username": username,
            "password": hashedPwd
        });

        console.log(result);

        res.status(201).json({ 'success': `New user ${username} created!` });
    } catch (err) {
        res.status(500).json({ 'message': err.message });
    }
})
// To test:
// curl -X POST http://localhost:3000/users/ -H "Content-Type: application/json" -d '{"username":"KKK", "password":"KKK"}'

// @desc Update a user
// @route PATCH /users
// @access Private
const updateUser = asyncHandler(async (req, res) => {
    // added firm
    const { id, username, roles, active, password, firm } = req.body

    // Confirm data 
    if (!id || !username || !firm || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean') {
        return res.status(400).json({ message: 'All fields except password are required' })
    }

    // Does the user exist to update?
    const user = await User.findById(id).exec()

    if (!user) {
        return res.status(400).json({ message: 'User not found' })
    }

    // Check for duplicate 
    const duplicate = await User.findOne({ username }).lean().exec()

    // Allow updates to the original user 
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate username' })
    }

    user.username = username
    user.roles = roles
    user.active = active
    user.firm = firm

    if (password) {
        // Hash password 
        user.password = await bcrypt.hash(password, 10) // salt rounds 
    }

    const updatedUser = await user.save()

    res.json({ message: `${updatedUser.username} updated` })
})

// @desc Delete a user
// @route DELETE /users
// @access Private
const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.body

    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'User ID Required' })
    }

    // Does the user still have assigned notes?
    // const note = await Note.findOne({ user: id }).lean().exec()
    // if (note) {
    //     return res.status(400).json({ message: 'User has assigned notes' })
    // }

    // Does the user exist to delete?
    const user = await User.findById(id).exec()

    if (!user) {
        return res.status(400).json({ message: 'User not found' })
    }

    const result = await user.deleteOne()

    const reply = `Username ${result.username} with ID ${result._id} deleted`

    res.json(reply)
})

module.exports = {
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser,
}