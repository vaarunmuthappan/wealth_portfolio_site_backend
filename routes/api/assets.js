const express = require('express')
const router = express.Router()
const itemController = require('../../controllers/itemController')

router.route('/breakdown/:firm')
    .get(itemController.getChartItems)

router.route('/all/:userID')
    .get(itemController.getTableItems)

router.route('/unformatAll/:userID')
    .get(itemController.getDashTableItems)

router.route('/:id')
    .get(itemController.getSingleItem)

router.route('/')
    .post(itemController.createNewItems)
    .patch(itemController.updateItems)
    .delete(itemController.deleteItems)

module.exports = router