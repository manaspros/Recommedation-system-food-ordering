// SuccessPage.jsx

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import classes from './SuccessPage.module.css';

function SuccessPage() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');

    // If payment was successful, show the popup
    if (paymentStatus === 'success') {
      setVisible(true);

      // Start countdown
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Redirect after 5 seconds
      const redirectTimeout = setTimeout(() => {
        navigate('/');
      }, 5000);

      // Cleanup on unmount
      return () => {
        clearInterval(timer);
        clearTimeout(redirectTimeout);
      };
    }
  }, [navigate]);

  return (
    <div className={classes.successContainer}>
      {visible && (
        <div className={classes.popup}>
          <div className={classes.popupContent}>
            <div className={classes.checkmarkContainer}>
              <div className={classes.checkmark}>✓</div>
            </div>
            <h2>Payment Successful!</h2>
            <p>Thank you for your order. Your food will be on its way soon!</p>
            <p className={classes.redirectMessage}>
              Redirecting to homepage in {countdown} seconds...
            </p>
            <button
              className={classes.homeButton}
              onClick={() => navigate('/')}
            >
              Return to Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SuccessPage;
