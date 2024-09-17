// src/components/FriendRecommendations.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FriendRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const response = await axios.get('http://localhost:5000/friends/recommendations', {
        headers: { Authorization: localStorage.getItem('token') }
      });
      
      // Check if response data is an array
      if (Array.isArray(response.data)) {
        setRecommendations(response.data);
      } else {
        console.error('Unexpected response format:', response.data);
        setRecommendations([]);
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError('Failed to load recommendations');
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="friend-recommendations">
      <h2>Recommended Friends</h2>
      {loading && <p>Loading recommendations...</p>}
      {error && <p>{error}</p>}
      {!loading && !error && recommendations.length === 0 && <p>No recommendations available.</p>}
      {!loading && !error && recommendations.length > 0 && (
        <ul>
          {recommendations.map(friend => (
            <li key={friend._id}>
              {friend.username} - Mutual Friends: {friend.mutualFriendsCount} - Mutual Interests: {friend.mutualInterestsCount}
              <ul>
                {friend.mutualInterests.map((interest, index) => (
                  <li key={index}>{interest}</li>
                ))}
              </ul>
              <button onClick={() => handleAddFriend(friend._id)}>Add Friend</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const handleAddFriend = async (userId) => {
  try {
    await axios.post('http://localhost:5000/friends/send', { userId }, {
      headers: { Authorization: localStorage.getItem('token') }
    });
    // Optionally trigger a refresh or provide feedback to the user
  } catch (err) {
    console.error('Error adding friend:', err);
  }
};

export default FriendRecommendations;
