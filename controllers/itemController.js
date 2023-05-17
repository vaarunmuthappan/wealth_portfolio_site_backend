const mongoose = require('mongoose')
const User = require('../models/users')
const Assets = require('../models/assets')
const asyncHandler = require('express-async-handler')

// @desc Get all items by category
// @route GET /items
// @access Private
const getChartItems = asyncHandler(async (req, res) => {
    const firmName = req.params.firm;
    console.log(firmName)
    //const currentUser = await User.findOne({ username })
    //const firm = currentUser.firm
    // Get all notes from MongoDB
    const assets = await Assets.aggregate(
        [
            {
                $match: {
                    "BStype": "Assets",
                    "firm": firmName
                }
            },
            {
                $group: {
                    _id: "$category",
                    sum: { $sum: "$USDPrice" }
                }
            },
            {
                $group: {
                    _id: null,
                    Categories: {
                        $mergeObjects: {
                            $arrayToObject: [
                                [{ k: "$_id", v: "$sum" }]
                            ]
                        }
                    }
                }
            }
        ]
    )
    const liabilities = await Assets.aggregate(
        [
            {
                $match: {
                    "BStype": "Liabilities",
                    "firm": firmName
                }
            },
            {
                $group: {
                    _id: "$category",
                    sum: { $sum: "$USDPrice" }
                }
            },
            {
                $group: {
                    _id: null,
                    Categories: {
                        $mergeObjects: {
                            $arrayToObject: [
                                [{ k: "$_id", v: "$sum" }]
                            ]
                        }
                    }
                }
            }
        ]
    )
    // If no notes 
    if (!assets?.length) {
        return res.status(400).json({ message: 'No assets found' })
    }

    const totals = await Assets.aggregate(
        [
            {
                $match: {
                    "firm": firmName
                }
            },
            {
                $group: {
                    _id: "$BStype",
                    sum: { $sum: "$USDPrice" }
                }
            },
            {
                $unwind: "$_id"
            }
        ]);

    res.json({
        assetCat: assets[0].Categories,
        liabCat: liabilities[0].Categories,
        liabTot: totals[1],
        assetTotal: totals[0]
    })
})
//curl -X GET http://localhost:3000/users/ -H "Content-Type: application/json" -d '{"username":"vkvk"}

// @desc Get all items by category
// @route GET /items
// @access Private
const getTableItems = asyncHandler(async (req, res) => {
    try {
        const userID = new mongoose.Types.ObjectId(req.params.userID)
        const currentUser = await User.findOne({ _id: userID })

        const firm = currentUser.firm
        // sort should look like this: { "field": "userId", "sort": "desc"}
        const { page = 1, pageSize = 20, sort = null, search = "" } = req.query;

        // formatted sort should look like { userId: -1 }
        const generateSort = () => {
            const sortParsed = JSON.parse(sort);
            const sortFormatted = {
                [sortParsed.field]: (sortParsed.sort = "asc" ? 1 : -1),
            };

            return sortFormatted;
        };
        const sortFormatted = Boolean(sort) ? generateSort() : {};

        console.log(pageSize, firm)

        const transactions = await Assets.aggregate([
            {
                $match: {
                    "firm": firm,
                    $or: [
                        { name: { $regex: new RegExp(search, "i") } },
                        { category: { $regex: new RegExp(search, "i") } },
                    ]
                }
            }
            // {
            //     $or: [
            //         { name: { $regex: new RegExp(search, "i") } },
            //         { category: { $regex: new RegExp(search, "i") } },
            //     ]
            // }
        ]).sort(sortFormatted)
            .skip(page * pageSize)
            .limit(Number(pageSize));

        // .find({
        //     $or: [
        //         { name: { $regex: new RegExp(search, "i") } },
        //         { category: { $regex: new RegExp(search, "i") } },
        //     ],
        // })
        //     .sort(sortFormatted)
        //     .skip(page * pageSize)
        //     .limit(pageSize);
        console.log(transactions)
        const total = await Assets.countDocuments({
            name: { $regex: search, $options: "i" },
        });

        res.status(200).json({
            transactions,
            total,
        });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
})

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

// @desc Create new item
// @route POST /item
// @access Private
const createNewItems = asyncHandler(async (req, res) => {
    const firm = req.body.firm;
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
    if (!category || !name || !price || !quantity || !USDPrice) {
        return res.status(400).json({ message: 'Some fields are required' })
    }

    // Check for duplicate title
    // const duplicate = await Note.findOne({ title }).lean().exec()
    //
    // if (duplicate) {
    //     return res.status(409).json({ message: 'Duplicate note title' })
    // }

    // Create and store the new item 
    const note = await Assets.create({ firm, name, BStype, category, notes, price, curPrice, USDPrice, currency, quantity, date })

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
    if (!req?.body?.id) {
        return res.status(400).json({ 'message': 'ID parameter is required.' });
    }

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
        return res.status(400).json({ 'message': 'All fields are required' })
    }

    // Confirm note exists to update
    const item = await Assets.findOne({ _id: req.body.id }).exec()

    if (!item) {
        return res.status(400).json({ "message": 'Item not found' })
    }

    // Check for duplicate title
    //const duplicate = await Assets.findOne({ title }).lean().exec()

    // // Allow renaming of the original note 
    // if (duplicate && duplicate?._id.toString() !== id) {
    //     return res.status(409).json({ message: 'Duplicate note title' })
    // }

    if (req.body?.userOwner) item.userOwner = userOwner
    if (req.body?.name) item.name = req.body.name
    if (req.body?.category) item.category = req.body.category
    if (req.body?.notes) item.notes = req.body.notes
    if (req.body?.price) item.price = req.body.price
    if (req.body?.curPrice) item.curPrice = req.body.curPrice
    if (req.body?.USDPrice) item.USDPrice = req.body.USDPrice
    if (req.body?.currency) item.currency = req.body.currency
    if (req.body?.quantity) item.quantity = req.body.quantity
    if (req.body?.USDPrice) item.USDPrice = req.body.USDPrice
    if (req.body?.date) item.date = req.body.date
    item.BStype = BStype

    const updatedItem = await item.save()

    res.json(`'${updatedItem.name}' updated`)
})

// @desc Delete an item
// @route DELETE /item
// @access Private
const deleteItems = asyncHandler(async (req, res) => {
    if (!req?.body?.id) return res.status(400).json({ 'message': 'Item ID required.' });

    // Confirm note exists to delete 
    const item = await Assets.findOne({ _id: req.body.id }).exec();

    if (!item) {
        return res.status(400).json({ "message": 'Item not found' })
    }

    const result = await item.deleteOne()

    const reply = `Item '${result.name}' with ID ${result._id} deleted`
    res.json(reply)
})

module.exports = {
    getAllItems,
    createNewItems,
    updateItems,
    deleteItems,
    getChartItems,
    getTableItems,
}