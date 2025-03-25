import { useEffect, useState } from 'react'; // Ensure you import useState
import useHttp from '../hooks/useHttp.js';
import Error from './Error.jsx';
import { useAuth0 } from '@auth0/auth0-react';

const BackendPage = () => {
  const { isAuthenticated, user, isLoading: authLoading } = useAuth0();
  const [orders, setOrders] = useState([]); // State to hold orders

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:3000/orderget');
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const data = await response.json();
      setOrders(data); // Update orders state
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.email === 'manasnandchoudhary@gmail.com') {
      fetchOrders(); // Fetch orders when component mounts
    }
  }, [isAuthenticated, user]);

  const handleDelete = async (orderId) => {
    try {
      const response = await fetch(`http://localhost:3000/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error deleting order: ${response.statusText}`);
      }

      // Refresh the orders list after successful deletion
      fetchOrders();
    } catch (error) {
      console.error(error);
      alert(error.message); // Handle error accordingly
    }
  };

  // Handle loading states
  if (authLoading) {
    return <p className="center">Fetching meals...</p>;
  }

  // Check if user is authenticated and email matches
  if (isAuthenticated && user?.email === 'manasnandchoudhary@gmail.com') {
    return (
      <ul className="orders-list">
        {orders.length ? (
          orders.map((order) => (
            <li key={order.id} className="order-item">
              {/* Customer Info */}
              <div className="customer-info">
                <img
                  className="customer-avatar"
                  src="https://avatar.iran.liara.run/public"
                  alt="Customer Avatar"
                />
                <div className="customer-details">
                  <h3>{order.customer.name}</h3>
                  <p>Hostel: {order.customer.street}</p>
                  <p>Room no: {order.customer['postal-code']}</p> {/* Updated field */}
                </div>
              </div>

              {/* Ordered Items */}
              <div className="order-items">
                {order.items.map((meal) => (
                  <div key={meal.id} className="meal-item">
                    <img src={`http://localhost:3000/${meal.image}`} alt={meal.name} />
                    <h4>{meal.name}</h4>
                    <p>{meal.description}</p>
                  </div>
                ))}
              </div>

              {/* Delete Button */}
              <button onClick={() => handleDelete(order.id)}>Delete Order</button>
            </li>
          ))
        ) : (
          <p>No meals found.</p>
        )}
      </ul>
    );
  } else {
    // Display message for unauthorized access
    return <p>You do not have permission to view this page.</p>;
  }
};

export default BackendPage;
