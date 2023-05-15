const User = require('../models/users')
const Assets = require('../models/assets')
const asyncHandler = require('express-async-handler')

// @desc Get all items for specific firm
// @route GET /items
// @access Private
const getAllItems = asyncHandler(async (req, res) => {
    const username = req.body.username
    console.log(username)
    //const currentUser = await User.findOne({ username })
    //const firm = currentUser.firm
    // Get all notes from MongoDB
    const assets = await Assets.find({ "firmOwner": username }).lean()

    // If no notes 
    if (!assets?.length) {
        return res.status(400).json({ message: 'No assets found' })
    }

    // Add username to each note before sending the response 
    // See Promise.all with map() here: https://youtu.be/4lqJBBEpjRE 
    // You could also do this with a for...of loop
    // const notesWithUser = await Promise.all(notes.map(async (note) => {
    //     const user = await User.findById(note.user).lean().exec()
    //     return { ...note, username: user.username }
    // }))

    res.json(assets)
})
//curl -X GET http://localhost:3000/users/ -H "Content-Type: application/json" -d '{"username":"vkvk"}

// @desc Create new item
// @route POST /item
// @access Private
const createNewItems = asyncHandler(async (req, res) => {
    const firmOwner = req.body.firmOwner;
    const name = req.body.name;
    const category = req.body.category;
    const notes = req.body.notes;
    const price = Number(req.body.price);
    const curPrice = Number(req.body.curPrice);
    const USDPrice = Number(req.body.USDPrice);
    const currency = req.body.currency;
    const quantity = Number(req.body.quantity);
    const date = Date.parse(req.body.date);
    var BStype = "Assets";
    if (category == "Bank Borrowings" || category == "Mortgage") {
        BStype = "Liabilities";
    }

    // Confirm data
    if (!category || !name || !price || !quantity) {
        return res.status(400).json({ message: 'Some fields are required' })
    }

    // Check for duplicate title
    // const duplicate = await Note.findOne({ title }).lean().exec()
    //
    // if (duplicate) {
    //     return res.status(409).json({ message: 'Duplicate note title' })
    // }

    // Create and store the new item 
    const note = await Assets.create({ firmOwner, name, BStype, category, notes, price, curPrice, USDPrice, currency, quantity, date })

    if (note) { // Created 
        return res.status(201).json({ message: 'New item created' })
    } else {
        return res.status(400).json({ message: 'Invalid note data received' })
    }

})
// To test:
// curl -X POST http://localhost:3000/items/ -H "Content-Type: application/json" -d '{"firmOwner":"KM Capital","name":"cashdeposit3","category":"cash","notes":"cat","price":100,"currency":"GBP","quantity":100,"date":"2019-05-29T02:22:49.052Z","curPrice":0,"USDPrice":0}'

// @desc Update a item
// @route PATCH /item
// @access Private
const updateItems = asyncHandler(async (req, res) => {
    const userOwner = req.body.userOwner;
    const name = req.body.name;
    const category = req.body.category;
    const notes = req.body.notes;
    const price = Number(req.body.price);
    const curPrice = Number(req.body.curPrice);
    const USDPrice = Number(req.body.USDPrice);
    const currency = req.body.currency;
    const quantity = Number(req.body.quantity);
    const date = Date.parse(req.body.date);
    var BStype = "Assets";
    if (category == "Bank Borrowings" || category == "Mortgage") {
        BStype = "Liabilities";
    }

    // Confirm data
    if (!category || !name || !currency || !quantity) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    // Confirm note exists to update
    const item = await Note.findById(id).exec()

    if (!item) {
        return res.status(400).json({ message: 'Note not found' })
    }

    // Check for duplicate title
    //const duplicate = await Assets.findOne({ title }).lean().exec()

    // // Allow renaming of the original note 
    // if (duplicate && duplicate?._id.toString() !== id) {
    //     return res.status(409).json({ message: 'Duplicate note title' })
    // }

    item.userOwner = userOwner
    item.name = name
    item.category = category
    item.notes = notes
    item.price = price
    item.curPrice = curPrice
    item.USDPrice = USDPrice
    item.currency = currency
    item.quantity = quantity
    item.USDPrice = USDPrice
    item.date = date

    const updatedItem = await item.save()

    res.json(`'${updatedItem.name}' updated`)
})

// @desc Delete an item
// @route DELETE /item
// @access Private
const deleteItems = asyncHandler(async (req, res) => {
    const { id } = req.body

    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'Item ID required' })
    }

    // Confirm note exists to delete 
    const item = await Assets.findById(id).exec()

    if (!item) {
        return res.status(400).json({ message: 'Item not found' })
    }

    const result = await item.deleteOne()

    const reply = `Item '${result.name}' with ID ${result._id} deleted`

    res.json(reply)
})

module.exports = {
    getAllItems,
    createNewItems,
    updateItems,
    deleteItems
}