import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../App';
import { getCart, createPaymentIntent, confirmPayment, clearCart } from '../services/api';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import './CheckoutPage.css';

// Load Stripe (use your publishable key)
const stripePromise = loadStripe('pk_test_51SN67fGl9ZxmIbd4rI1ep1Ks5BSdIyGLnmyX5ucGrVzsY0npOTCMQIly2BXCTRcQEe3MS6XedZfYAT8DGUyAZssv00iAkpUEyZ');

function CheckoutForm({ cartItems, total }) {
  const navigate = useNavigate();
  const { setCart } = useContext(AuthContext);
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('stripe'); // 'stripe' or '2checkout'

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Create payment intent
      const gameIds = cartItems.map(game => game.id);
      const { client_secret } = await createPaymentIntent(gameIds);

      // Confirm payment
      const result = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (result.error) {
        setError(result.error.message);
        setProcessing(false);
      } else {
        // Payment succeeded
        await confirmPayment(result.paymentIntent.id, gameIds);
        await clearCart();
        setCart([]);
        setSucceeded(true);
        
        setTimeout(() => {
          navigate('/profile');
        }, 2000);
      }
    } catch (err) {
      setError(err.message || 'Payment failed');
      setProcessing(false);
    }
  };

  const cardStyle = {
    style: {
      base: {
        color: '#fff',
        fontFamily: 'Arial, sans-serif',
        fontSize: '16px',
        '::placeholder': {
          color: '#8b929a',
        },
      },
      invalid: {
        color: '#ff6b6b',
      },
    },
  };

  if (succeeded) {
    return (
      <div className="payment-success">
        <div className="success-icon">✓</div>
        <h2>Payment Successful!</h2>
        <p>Your games have been added to your library.</p>
        <p>Redirecting to your profile...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="checkout-form">
      {/* Payment Method Selector */}
      <div className="payment-method-selector">
        <h3>Select Payment Method</h3>
        <div className="payment-methods">
          <button
            type="button"
            className={`payment-method-btn ${paymentMethod === 'stripe' ? 'active' : ''}`}
            onClick={() => setPaymentMethod('stripe')}
          >
            <span className="payment-icon">💳</span>
            <span>Credit/Debit Card</span>
            <span className="payment-provider">(Stripe)</span>
          </button>
          <button
            type="button"
            className={`payment-method-btn ${paymentMethod === '2checkout' ? 'active' : ''}`}
            onClick={() => setPaymentMethod('2checkout')}
          >
            <span className="payment-icon">🌐</span>
            <span>2Checkout</span>
            <span className="payment-provider">(Multiple Options)</span>
          </button>
        </div>
      </div>

      {/* Payment Information */}
      <div className="payment-section">
        <h3>Payment Information</h3>

        {paymentMethod === 'stripe' ? (
          <div className="card-element-wrapper">
            <CardElement options={cardStyle} />
          </div>
        ) : (
          <div className="twocheckout-info">
            <p>You will be redirected to 2Checkout to complete your payment securely.</p>
            <p className="payment-note">✓ Supports credit cards, PayPal, and more</p>
          </div>
        )}

        {error && <div className="payment-error">{error}</div>}
      </div>

      <button
        type="submit"
        disabled={(!stripe && paymentMethod === 'stripe') || processing}
        className="complete-purchase-btn"
      >
        {processing ? 'Processing...' : `Pay $${total.toFixed(2)}`}
      </button>
    </form>
  );
}

function CheckoutPage() {
  const { user } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const items = await getCart();
      setCartItems(items);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, game) => sum + parseFloat(game.discounted_price), 0);
  };

  if (loading) {
    return <div className="loading">Loading checkout...</div>;
  }

  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <div className="main-navbar">
          <div className="nav-left">
            <div className="nav-logo">NotSteam</div>
            <nav className="main-links">
              <Link to="/">STORE</Link>
            </nav>
          </div>
        </div>
        <div className="empty-cart">
          <h2>Your cart is empty</h2>
          <Link to="/" className="continue-shopping-btn">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      {/* Navbar */}
      <div className="main-navbar">
        <div className="nav-left">
          <div className="nav-logo">STEAM</div>
          <nav className="main-links">
            <Link to="/">STORE</Link>
            <Link to="/profile">PROFILE</Link>
          </nav>
        </div>
      </div>

      <div className="checkout-container">
        <h1 className="checkout-title">Checkout</h1>

        <div className="checkout-content">
          {/* Cart Items */}
          <div className="checkout-main">
            <div className="cart-items-section">
              <h2>Items in Cart ({cartItems.length})</h2>
              <div className="cart-items-list">
                {cartItems.map((game) => (
                  <div key={game.id} className="cart-item">
                    <img 
                      src={game.image || '/placeholder-game.jpg'} 
                      alt={game.title} 
                      className="cart-item-img"
                    />
                    <div className="cart-item-info">
                      <h3>{game.title}</h3>
                      <p className="cart-item-desc">{game.short_description}</p>
                    </div>
                    <div className="cart-item-price">
                      {game.discount_percentage > 0 && (
                        <span className="cart-discount">-{game.discount_percentage}%</span>
                      )}
                      <div className="cart-prices">
                        {game.discount_percentage > 0 && (
                          <span className="cart-price-old">${game.price}</span>
                        )}
                        <span className="cart-price-new">${game.discounted_price}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Form */}
            <div className="payment-form-section">
              <Elements stripe={stripePromise}>
                <CheckoutForm cartItems={cartItems} total={calculateTotal()} />
              </Elements>
            </div>
          </div>

          {/* Order Summary */}
          <div className="checkout-sidebar">
            <div className="order-summary">
              <h3>Order Summary</h3>
              <div className="summary-row">
                <span>Subtotal</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Tax</span>
                <span>$0.00</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-total">
                <span>Total</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
            </div>

            <div className="checkout-info">
              <p>
                <strong>✓</strong> Instant access after purchase
              </p>
              <p>
                <strong>✓</strong> Download and play immediately
              </p>
              <p>
                <strong>✓</strong> Steam Cloud saves
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;