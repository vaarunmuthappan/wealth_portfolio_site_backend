const express = require('express')
const router = express.Router()
const usersController = require('../../controllers/usersController')

router.route('/:id')
    .get(usersController.getUserById)

router.route('/')
    .post(usersController.createNewUser)
    .patch(usersController.updateUser)
    .delete(usersController.deleteUser)

router.route('/team/:ID')
    .get(usersController.getTeam)

module.exports = router