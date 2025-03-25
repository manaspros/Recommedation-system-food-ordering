import { useContext } from 'react';
import Modal from './UI/Modal.jsx';
import CartContext from '../store/CartContext.jsx';
import { currencyFormatter } from '../util/formatting.js';
import Input from './UI/Input.jsx';
import Button from './UI/Button.jsx';
import UserProgressContext from '../store/UserProgressContext.jsx';
import useHttp from '../hooks/useHttp.js';
import Error from './Error.jsx';
import { useAuth0 } from '@auth0/auth0-react';
import { loadStripe } from '@stripe/stripe-js';

const apiURL = 'http://localhost:3000';
const stripePromise = loadStripe("pk_test_51Q8bGm2MsMA6tFEfVYm4aPdFIATc5qnOi4SLneWw56rU6N5Q6MwzCSnSudsxeThOqxQq4D8Wi32uapg0mNihEnFs00uFDb1fFa");

const requestConfig = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
};

export default function Checkout() {
  const cartCtx = useContext(CartContext);
  const { isAuthenticated, user } = useAuth0();
  const userProgressCtx = useContext(UserProgressContext);

  const {
    data,
    isLoading: isSending,
    error,
    sendRequest,
    clearData
  } = useHttp(`${apiURL}/orders`, requestConfig);

  const cartTotal = cartCtx.items.reduce(
    (totalPrice, item) => totalPrice + item.quantity * item.price,
    0
  );

  function handleClose() {
    userProgressCtx.hideCheckout();
  }

  function handleFinish() {
    userProgressCtx.hideCheckout();
    cartCtx.clearCart();
    clearData();
  }

  const makePayment = async () => {
    try {
      const stripe = await stripePromise;

      // Log the cart items before sending
      console.log("Cart items before checkout:", cartCtx.items);

      const body = {
        products: cartCtx.items
      };

      const headers = {
        "Content-Type": "application/json"
      };

      console.log("Sending to checkout API:", JSON.stringify(body));

      const response = await fetch(`${apiURL}/create-checkout-session`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error creating checkout session:", errorData);
        alert(`Checkout error: ${errorData.message || 'Unknown error'}`);
        return;
      }

      const session = await response.json();
      console.log("Received session ID:", session.id);

      // Redirect to the Stripe Checkout page
      const { error } = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (error) {
        console.error("Stripe redirect error:", error);
        alert(`Payment error: ${error.message}`);
      }
    } catch (error) {
      console.error("Error in checkout process:", error);
      alert("Error creating checkout session: " + (error.message || 'Unknown error'));
    }
  };

  function handleSubmit(event) {
    event.preventDefault();

    const fd = new FormData(event.target);
    const customerData = Object.fromEntries(fd.entries());

    sendRequest(
      JSON.stringify({
        order: {
          items: cartCtx.items,
          customer: customerData,
        },
      })
    );
  }

  let actions = (
    <>
      <Button type="button" textOnly onClick={handleClose}>
        Close
      </Button>
      <Button onClick={makePayment}>Submit Order</Button>
    </>
  );

  if (isSending) {
    actions = <span>Sending order data...</span>;
  }

  if (data && !error) {
    return (
      <Modal
        open={userProgressCtx.progress === 'checkout'}
        onClose={handleFinish}
      >
        <h2>Success!</h2>
        <p>Your order was submitted successfully.</p>
        <p>
          We will get back to you with more details via email within the next
          few minutes.
        </p>
        <p className="modal-actions">
          <Button onClick={handleFinish}>Okay</Button>
        </p>
      </Modal>
    );
  }

  return (
    <Modal open={userProgressCtx.progress === 'checkout'} onClose={handleClose}>
      <form onSubmit={handleSubmit} autoComplete="on">
        <h2>Checkout</h2>
        <p>Total Amount: {currencyFormatter.format(cartTotal)}</p>

        <Input label="Full Name" type="text" id="name" defaultValue={isAuthenticated ? user.name : ""} autoComplete="off" />
        <Input label="E-Mail Address" type="email" id="email" defaultValue={isAuthenticated ? user.email : ""} autoComplete="off" />
        <Input label="Hostel" type="text" id="street" defaultValue={isAuthenticated ? user?.user_metadata?.room_no : ""} />
        <div className="control-row">
          <Input label="Room number" type="text" id="postal-code" defaultValue={isAuthenticated ? user?.user_metadata?.hostel_no : ""} autoComplete="off" />
        </div>

        {error && <Error title="Failed to submit order" message={error} />}

        <p className="modal-actions">{actions}</p>
      </form>
    </Modal>
  );
}
