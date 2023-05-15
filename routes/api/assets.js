const express = require('express')
const router = express.Router()
const itemController = require('../../controllers/itemController')

router.route('/')
    .get(itemController.getAllItems)
    .post(itemController.createNewItems)
    .patch(itemController.updateItems)
    .delete(itemController.deleteItems)

module.exports = router