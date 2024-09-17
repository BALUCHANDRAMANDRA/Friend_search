const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, async(req,res) =>{
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('friends', 'username').populate('friendRequests.user', 'username');
        if (!user) return res.status(404).json({ error: 'User not found' });
        
        res.json({
            id: user._id,
            username: user.username,
            friends: user.friends,
            friendRequests: user.friendRequests
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.get('/me/recommendations', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate('friends')
            .exec();

        if (!user) return res.status(404).json({ error: 'User not found' });

        const friendsOfFriends = await User.find({
            _id: { $ne: user._id, $nin: user.friends }
        })
        .populate('friends')
        .exec();

        const recommendations = friendsOfFriends
            .map(friend => {
                const mutualFriendsCount = user.friends.filter(f => friend.friends.includes(f)).length;
                return { ...friend._doc, mutualFriendsCount };
            })
            .sort((a, b) => b.mutualFriendsCount - a.mutualFriendsCount); 

        res.json(recommendations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/search', authMiddleware, async(req,res) =>{
    const {query} = req.query;
    try{
        const users = await User.find({username: new RegExp(query, 'i')}).select('-password');
        res.json(users);
    }catch{
        res.status(400).json({err: err.message});
    }
});


module.exports = router;