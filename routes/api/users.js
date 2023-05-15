const express = require('express')
const router = express.Router()
const registerController = require('../../controllers/registerController');
const usersController = require('../../controllers/usersController')

router.route('/')
    .get(usersController.getAllUsers)
    .post(registerController.handleNewUser)
    .patch(usersController.updateUser)
    .delete(usersController.deleteUser)

module.exports = router