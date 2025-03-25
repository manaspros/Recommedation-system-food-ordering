import { useEffect } from 'react';
import useHttp from '../hooks/useHttp.js';
import Error from './Error.jsx';
import { useAuth0 } from '@auth0/auth0-react';
import { Navigate } from 'react-router-dom';

const requestConfig = {};

export default function Meals({ children }) {
  const { isAuthenticated, user, getAccessTokenSilently, isLoading: authLoading } = useAuth0();
  
  const {
    data: loadedOrders,
    isLoading,
    error,
  } = useHttp('http://localhost:3000/orderget', requestConfig, []);

  useEffect(() => {
    const fetchRoles = async () => {
      if (!isAuthenticated || !user) {
        console.log('User is not authenticated or user object is not available.');
        return;
      }
  
      try {
        const token = await getAccessTokenSilently({
          audience: 'https://dev-kb5tbifrd145c4lz.us.auth0.com/api/v2/',
          scope: 'read:orders ',
        });
  
        console.log('Access Token:', token); // Log the token for verification
        // Ensure userId is correctly formatted
        const userId = `auth0|${user.sub.split('|')[1]}`;
        console.log('Formatted User ID:', userId); // Log formatted user ID
  
        const url = `https://dev-kb5tbifrd145c4lz.us.auth0.com/api/v2/users/${userId}/roles`;
        console.log('Fetching roles from URL:', url); // Log the complete URL
  
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
  
        // Check response status
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error fetching roles:', errorData);
          throw new Error(`Failed to fetch roles: ${errorData.message}`);
        }
  
        const roles = await response.json();
        console.log('Roles:', roles);
      } catch (err) {
        console.error('Error in fetchRoles:', err.message);
      }
    };
  
    if (isAuthenticated && user) {
      fetchRoles();
    }
  }, [isAuthenticated, getAccessTokenSilently, user]);
  

  // Check if the user has the "read:orders" role
  // const hasReadOrdersRole = true;
  // const hasReadOrdersRole = user?.['https://dev-kb5tbifrd145c4lz.us.auth0.com/roles']?.includes('read:orders');
  // console.log(hasReadOrdersRole);
  // const roles = user?.['https://your-namespace.com/roles'] || [];
  // console.log(roles);
  // useEffect(() => { 
  //   console.log(user?.['https://dev-kb5tbifrd145c4lz.us.auth0.com/roles']);
  // }, []);

  // Handle loading states
  if (authLoading || isLoading) {
    return <p className="center">Fetching meals...</p>;
  }

  // Display error message if there's an issue with data fetching
  if (error) {
    return <Error title="Failed to fetch meals" message={error} />;
  }

  // Conditional rendering based on authentication and role
  if (isAuthenticated) {
    return (
      <ul className="orders-list">
        {loadedOrders.length ? (
          loadedOrders.map((order) => (
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
                  <p>Room: {order.customer.hostelNumber}</p>
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
            </li>
          ))
        ) : (
          <p>No meals found.</p>
        )}
      </ul>
    );
  } else {
    // Redirect or display a message for unauthorized access
    return <p>You do not have permission to view this page.</p>;
  }
}
