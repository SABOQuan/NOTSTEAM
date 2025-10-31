import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/';

// ============================================
// GAME API CALLS
// ============================================

export const getGames = async () => {
  const response = await axios.get(`${API_URL}games/`);
  return response.data;
};

export const getFeaturedGames = async () => {
  const response = await axios.get(`${API_URL}games/featured/`);
  return response.data;
};

export const getGameById = async (slugOrId) => {
  const response = await axios.get(`${API_URL}games/${slugOrId}/`);
  return response.data;
};

export const searchGames = async (query) => {
  const response = await axios.get(`${API_URL}games/search/`, {
    params: { q: query }
  });
  return response.data;
};

// ============================================
// WISHLIST API CALLS
// ============================================

export const getWishlist = async () => {
  const response = await axios.get(`${API_URL}wishlist/`);
  return response.data;
};

export const addToWishlist = async (gameId) => {
  const response = await axios.post(`${API_URL}wishlist/`, {
    game_id: gameId
  });
  return response.data;
};

export const removeFromWishlist = async (gameId) => {
  const response = await axios.delete(`${API_URL}wishlist/remove_game/`, {
    data: { game_id: gameId }
  });
  return response.data;
};

// ============================================
// LIBRARY API CALLS
// ============================================

export const getLibrary = async () => {
  const response = await axios.get(`${API_URL}library/`);
  return response.data;
};

export const getRecentGames = async () => {
  const response = await axios.get(`${API_URL}library/recent/`);
  return response.data;
};

// ============================================
// REVIEW API CALLS
// ============================================

export const getGameReviews = async (gameId) => {
  const response = await axios.get(`${API_URL}reviews/`, {
    params: { game_id: gameId }
  });
  return response.data;
};

export const createReview = async (reviewData) => {
  const response = await axios.post(`${API_URL}reviews/`, reviewData);
  return response.data;
};

export const updateReview = async (reviewId, reviewData) => {
  const response = await axios.patch(`${API_URL}reviews/${reviewId}/`, reviewData);
  return response.data;
};

export const deleteReview = async (reviewId) => {
  await axios.delete(`${API_URL}reviews/${reviewId}/`);
};

// ============================================
// CART API CALLS
// ============================================

export const addToCart = async (gameId) => {
  const response = await axios.post(`${API_URL}cart/add/`, {
    game_id: gameId
  });
  return response.data;
};

export const getCart = async () => {
  const response = await axios.get(`${API_URL}cart/`);
  return response.data;
};

export const clearCart = async () => {
  const response = await axios.delete(`${API_URL}cart/clear/`);
  return response.data;
};

// ============================================
// PAYMENT API CALLS
// ============================================

export const createPaymentIntent = async (gameIds) => {
  const response = await axios.post(`${API_URL}payment/create-intent/`, {
    game_ids: gameIds
  });
  return response.data;
};

export const confirmPayment = async (paymentIntentId, gameIds) => {
  const response = await axios.post(`${API_URL}payment/confirm/`, {
    payment_intent_id: paymentIntentId,
    game_ids: gameIds
  });
  return response.data;
};

export const getOrderHistory = async () => {
  const response = await axios.get(`${API_URL}payment/orders/`);
  return response.data;
};

// ============================================
// PROFILE API CALLS
// ============================================

export const getUserProfile = async () => {
  const response = await axios.get(`${API_URL}profiles/me/`);
  return response.data;
};

export const updateUserProfile = async (profileData) => {
  const response = await axios.patch(`${API_URL}profiles/update_profile/`, profileData);
  return response.data;
};