import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css'


const Home = () => {
  const [users, setUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [search, setSearch] = useState('');
  const [loggedInUser, setLoggedInUser] = useState(null); 

  useEffect(() => {
    fetchLoggedInUser();
    fetchUsers();
    fetchFriends();
    fetchFriendRequests();
    fetchRecommendations();
  }, []);

  const fetchLoggedInUser = async () => {
    try {
      const response = await axios.get('http://localhost:5000/users/me', {
        headers: { Authorization: localStorage.getItem('token') }
      });
      setLoggedInUser(response.data);
    } catch (err) {
      console.error('Error fetching logged-in user:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/users', {
        headers: { Authorization: localStorage.getItem('token') }
      });
      setUsers(response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchFriends = async () => {
    try {
      const response = await axios.get('http://localhost:5000/friends', {
        headers: { Authorization: localStorage.getItem('token') }
      });
      setFriends(response.data);
    } catch (err) {
      console.error('Error fetching friends:', err);
    }
  };

  const fetchFriendRequests = async () => {
    try {
      const response = await axios.get('http://localhost:5000/friends/requests', {
        headers: { Authorization: localStorage.getItem('token') }
      });
      setFriendRequests(response.data);
    } catch (err) {
      console.error('Error fetching friend requests:', err);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const response = await axios.get('http://localhost:5000/friends/recommendations', {
        headers: { Authorization: localStorage.getItem('token') }
      });
      setRecommendations(response.data);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    }
  };

  const handleSearch = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/users/search?query=${search}`, {
        headers: { Authorization: localStorage.getItem('token') }
      });
      setUsers(response.data);
    } catch (err) {
      console.error('Error searching users:', err);
    }
  };

  const addFriend = async (userId) => {
    try {
      await axios.post('http://localhost:5000/friends/send', { userId }, {
        headers: { Authorization: localStorage.getItem('token') }
      });
      fetchFriendRequests();
    } catch (err) {
      console.error('Error adding friend:', err);
    }
  };

  const acceptRequest = async (userId) => {
    try {
      await axios.post('http://localhost:5000/friends/respond', { userId, action: 'accepted' }, {
        headers: { Authorization: localStorage.getItem('token') }
      });
      fetchFriends();
      fetchFriendRequests();
    } catch (err) {
      console.error('Error accepting friend request:', err);
    }
  };

  const rejectRequest = async (userId) => {
    try {
      await axios.post('http://localhost:5000/friends/respond', { userId, action: 'rejected' }, {
        headers: { Authorization: localStorage.getItem('token') }
      });
      fetchFriendRequests();
    } catch (err) {
      console.error('Error rejecting friend request:', err);
    }
  };

  const unfriend = async (userId) => {
    try {
      setFriends(prevFriends => prevFriends.filter(friend => friend._id !== userId));
      await axios.post('http://localhost:5000/friends/unfriend', { userId }, {
        headers: { Authorization: localStorage.getItem('token') }
      });
    } catch (err) {
      console.error('Error unfriending user:', err);
    }
  };

  return (
    <div className="home-container">
      <div className="header">
        <h1>Home</h1>
        {loggedInUser && <span className="logged-in-user">Welcome, {loggedInUser.username}</span>}
      </div>

      
      <input
        type="text"
        placeholder="Search users"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>

      
      <div className='head'><h2>Users</h2></div>
      <ul>
        {users
          .filter(user => user._id !== loggedInUser?._id) 
          .map(user => (
            <li key={user._id}>
              {user.username}
              <button onClick={() => addFriend(user._id)}>Add Friend</button>
            </li>
          ))
        }
      </ul>

      
      <div className='head'><h2>Friend Requests</h2></div>
      <ul>
        {friendRequests.map(request => (
          <li key={request.user._id}>
            {request.user.username}
            <button onClick={() => acceptRequest(request.user._id)}>Accept</button>
            <button onClick={() => rejectRequest(request.user._id)}>Reject</button>
          </li>
        ))}
      </ul>

    
      <div className='head'><h2>Friends</h2></div>
      <ul>
        {friends.map(friend => (
          <li key={friend._id}>
            {friend.username}
            <button onClick={() => unfriend(friend._id)}>Unfriend</button>
          </li>
        ))}
      </ul>

    
      <div className='head'><h2>Recommended Friends</h2></div>
      <ul>
        {recommendations.map(friend => (
          <li key={friend._id}>
            {friend.username} - Mutual Friends: {friend.mutualFriendsCount} - Mutual Interests: {friend.mutualInterestsCount}
            <button onClick={() => addFriend(friend._id)}>Add Friend</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Home;
