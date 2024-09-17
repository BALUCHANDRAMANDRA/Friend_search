
const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();


router.post('/send', authMiddleware, async (req, res) => {
    const { userId } = req.body;
    try {
        const user = await User.findById(req.user.id);
        const friend = await User.findById(userId);

        if (!friend) return res.status(404).json({ error: 'User not found' });

        
        if (friend.friendRequests.some(request => request.user.toString() === user._id.toString())) {
            return res.status(400).json({ error: 'Friend request already sent' });
        }

        if (user.friends.includes(userId)) {
            return res.status(400).json({ error: 'User is already your friend' });
        }

       
        friend.friendRequests.push({ user: user._id });
        await friend.save();

        res.json({ message: 'Friend request sent' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.post('/respond', authMiddleware, async (req, res) => {
    const { userId, action } = req.body;  
    try {
        const user = await User.findById(req.user.id);
        const friend = await User.findById(userId);

        if (!friend) return res.status(404).json({ error: 'User not found' });

        
        user.friendRequests = user.friendRequests.filter(request => request.user.toString() !== userId);

        if (action === 'accepted') {
            
            if (!user.friends.includes(friend._id)) {
                user.friends.push(friend._id);
            }

            if (!friend.friends.includes(user._id)) {
                friend.friends.push(user._id);
            }
        }

        await user.save();
        await friend.save();

        res.json({ message: `Friend request ${action === 'accepted' ? 'accepted' : 'rejected'}` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.post('/unfriend', authMiddleware, async (req, res) => {
    const { userId } = req.body;
    try {
        const user = await User.findById(req.user.id);
        const friend = await User.findById(userId);

        if (!friend) return res.status(404).json({ error: 'User not found' });

        
        user.friends = user.friends.filter(id => id.toString() !== userId);
        friend.friends = friend.friends.filter(id => id.toString() !== user._id.toString());

        await user.save();
        await friend.save();

        res.json({ message: 'User unfriended' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



router.get('/recommendations', authMiddleware, async (req, res) => {
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


// Get Friends List
router.get('/', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('friends', 'username');
        res.json(user.friends);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Get Friend Requests
router.get('/requests', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('friendRequests.user');
        res.json(user.friendRequests);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
