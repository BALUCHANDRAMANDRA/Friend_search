const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();


router.get('/', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('friends');
        const recommendations = await User.find({
            _id: { $nin: user.friends.map(f => f._id).concat(user._id) },
            friends: { $in: user.friends }
        }).select('-password');

        res.json(recommendations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
