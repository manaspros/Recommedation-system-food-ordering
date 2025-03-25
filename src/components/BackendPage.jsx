import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import classes from './BackendPage.module.css'; // Create this file for styling

const BackendPage = () => {
  const { isAuthenticated, user, isLoading: authLoading } = useAuth0();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCompleted, setShowCompleted] = useState(false);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Pass the includeCompleted parameter
      const response = await fetch(`http://localhost:3000/orders?includeCompleted=${showCompleted}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Orders loaded successfully:', data.length);
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.email === 'manasnandchoudhary@gmail.com') {
      fetchOrders();
    }
  }, [isAuthenticated, user, showCompleted]);

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
      alert(error.message);
    }
  };

  const handleMarkAsCompleted = async (orderId) => {
    try {
      const response = await fetch(`http://localhost:3000/orders/${orderId}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error marking order as completed: ${response.statusText}`);
      }

      // Refresh the orders list after successful update
      fetchOrders();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  // Default placeholder for images that fail to load
  const defaultImagePlaceholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'%3E%3Crect width='150' height='150' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='14' text-anchor='middle' dominant-baseline='middle' fill='%239ca3af'%3ENo Image%3C/text%3E%3C/svg%3E";

  // Handle loading states
  if (authLoading || isLoading) {
    return <p className="center">Loading orders data...</p>;
  }

  // Check if user is authenticated and email matches
  if (isAuthenticated && user?.email === 'manasnandchoudhary@gmail.com') {
    return (
      <div className={classes.backendPage}>
        <div className={classes.controls}>
          <h2>Order Management</h2>
          <div className={classes.filterOptions}>
            <label>
              <input
                type="checkbox"
                checked={showCompleted}
                onChange={() => setShowCompleted(!showCompleted)}
              />
              Show Completed Orders
            </label>
          </div>
        </div>

        {error && <div className={classes.error}>{error}</div>}

        {orders.length === 0 && (
          <div className={classes.noOrders}>
            {showCompleted ? "No completed orders found" : "No pending orders found"}
          </div>
        )}

        <ul className={classes.ordersList}>
          {orders.map((order) => (
            <li key={order.id} className={`${classes.orderItem} ${order.completed ? classes.completedOrder : ''}`}>
              {/* Order Status Badge */}
              {order.completed && (
                <div className={classes.completedBadge}>
                  Completed
                  <div className={classes.completedTime}>
                    {new Date(order.completedAt).toLocaleString()}
                  </div>
                </div>
              )}

              {/* Customer Info */}
              <div className={classes.customerInfo}>
                <img
                  className={classes.customerAvatar}
                  src="https://avatar.iran.liara.run/public"
                  alt="Customer Avatar"
                />
                <div className={classes.customerDetails}>
                  <h3>{order.customer.name}</h3>
                  <p>Hostel: {order.customer.street}</p>
                  <p>Room no: {order.customer['postal-code']}</p>
                </div>
              </div>

              {/* Ordered Items */}
              <div className={classes.orderItems}>
                {order.items.map((meal) => (
                  <div key={meal.id} className={classes.mealItem}>
                    <div className={classes.imageContainer}>
                      {meal.image ? (
                        <img
                          src={`http://localhost:3000/${meal.image}`}
                          alt={meal.name}
                          onError={(e) => {
                            console.log(`Image failed to load: ${meal.image}`);
                            e.target.onerror = null; // Prevent infinite loop
                            e.target.src = defaultImagePlaceholder;
                          }}
                        />
                      ) : (
                        <div className={classes.placeholderImage}>
                          <span>{meal.name.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                    <h4>{meal.name}</h4>
                    <p>{meal.quantity}x ₹{meal.price / 100}</p>
                  </div>
                ))}
              </div>

              {/* Order Total */}
              <div className={classes.orderTotal}>
                <p>Total: ₹{order.items.reduce((sum, item) => sum + (item.price * item.quantity) / 100, 0)}</p>
                <p>Order Date: {new Date(order.date || Date.now()).toLocaleDateString()}</p>
              </div>

              {/* Action Buttons */}
              <div className={classes.orderActions}>
                {!order.completed && (
                  <button
                    onClick={() => handleMarkAsCompleted(order.id)}
                    className={classes.completeButton}
                  >
                    Mark as Completed
                  </button>
                )}
                <button
                  onClick={() => handleDelete(order.id)}
                  className={classes.deleteButton}
                >
                  Delete Order
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  } else {
    // Display message for unauthorized access
    return <p>You do not have permission to view this page.</p>;
  }
};

export default BackendPage;
