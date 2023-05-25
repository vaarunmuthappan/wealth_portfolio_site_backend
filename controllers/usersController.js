const mongoose = require('mongoose');
const User = require('../models/users')
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')

// npm run dev to start server

// @desc Get all users in same company
// @route GET /users
// @access Private
const addNewUser = asyncHandler(async (req, res) => {
    // Get all users from MongoDB
    //lean returns without extra data in json
    const username = req.body.username
    const currentUser = await User.findOne({ username })

    res.json(currentUser)
})
// To test:
// curl -X GET http://localhost:3000/users/ -H "Content-Type: application/json" -d '{"username":"vkvk"}

// @desc Get all users in same company
// @route GET /users
// @access Private
const getTeam = asyncHandler(async (req, res) => {
    // Get all users from MongoDB
    //lean returns without extra data in json
    const userID = new mongoose.Types.ObjectId(req.params.ID)
    const currentUser = await User.findOne({ _id: userID })
    const firm = currentUser.firm

    const users = await User.find({ firm }).select('-password').lean()

    // If no users 
    if (!users?.length) {
        return res.status(400).json({ message: 'No users found' })
    }

    res.json(users)
})

// @desc Get user by userid
// @route GET /users/:id
// @access Private
const getUserById = asyncHandler(async (req, res) => {
    // Get all users from MongoDB
    //lean returns without extra data in json
    const userID = new mongoose.Types.ObjectId(req.params.id)
    const currentUser = await User.findOne({ _id: userID }).select('-refreshToken -_id -__v -password');

    // If no users 
    if (!currentUser) {
        return res.status(400).json({ message: 'No users found' })
    }

    res.json(currentUser)
})

// @desc Create new user
// @route POST /users
// @access Private
const createNewUser = asyncHandler(async (req, res) => {
    const { username, password, firstName, lastName, firm, role, active } = req.body
    // Confirm data
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and Password are required' })
    }

    try {
        //encrypt the password
        const hashedPwd = await bcrypt.hash(password, 10);

        //create and store the new user
        const result = await User.create({
            "username": username,
            "password": hashedPwd,
            "firstName": firstName,
            "lastName": lastName,
            "firm": firm,
            "role": role,
            "active": active
        });

        res.status(201).json({ 'success': `New user ${username} created!` });
    } catch (err) {
        res.status(500).json({ 'message': err.message });
    }
})
// To test:
// curl -X POST http://localhost:3000/users/ -H "Content-Type: application/json" -d '{"username":"KKK", "password":"KKK"}'

// @desc Update a user
// @route PATCH /users/:id
// @access Private
const updateUser = asyncHandler(async (req, res) => {
    // added firm
    const { firstName, lastName, username, active, password, firm, role } = req.body

    const ID = new mongoose.Types.ObjectId(req.body.id)

    // Does the user exist to update?
    const user = await User.findById(ID).exec()

    if (!user) {
        return res.status(400).json({ message: 'User not found' })
    }

    user.username = username
    user.firstName = firstName
    user.lastName = lastName
    user.role = role
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
    createNewUser,
    addNewUser,
    updateUser,
    deleteUser,
    getTeam,
    getUserById,
}