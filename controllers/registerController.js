const User = require('../models/users');
const bcrypt = require('bcrypt');

const handleNewUser = async (req, res) => {
    const { user, pwd, firm, firstName, lastName } = req.body;
    if (!user || !pwd || !firm) return res.sendStatus(400);

    // check for duplicate usernames in the db
    const duplicate = await User.findOne({ firm: firm }).exec();
    if (duplicate) return res.sendStatus(409); //Conflict 

    try {
        //encrypt the password
        const hashedPwd = await bcrypt.hash(pwd, 10);

        //create and store the new user
        const result = await User.create({
            "username": user,
            "password": hashedPwd,
            "firm": firm,
            "role": "Admin",
            "status": "Active",
            "firstName": firstName,
            "lastName": lastName
        });

        res.status(201).json({ 'success': `New user ${user} created!` });
    } catch (err) {
        res.status(500).json({ 'message': err.message });
    }
}

module.exports = { handleNewUser };