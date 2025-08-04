import axios from 'axios';

const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT;

export const sendChatMessage = async (query, conversationId, userId) => {
  try {
    const response = await axios.post(API_ENDPOINT, {
      query,
      conversationId,
      userId
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};