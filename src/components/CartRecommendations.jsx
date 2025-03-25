import { useState, useEffect, useContext } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import CartContext from '../store/CartContext.jsx';
import classes from './CartRecommendations.module.css';

export default function CartRecommendations() {
    const [recommendations, setRecommendations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const { user } = useAuth0();
    const cartCtx = useContext(CartContext);

    useEffect(() => {
        async function fetchCartRecommendations() {
            if (!user?.email || cartCtx.items.length === 0) return;

            setIsLoading(true);
            setError(null);

            try {
                console.log('Fetching cart recommendations for items:', cartCtx.items);

                const response = await fetch('http://localhost:3000/cart-recommendations', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId: user.email,
                        cartItems: cartCtx.items
                    }),
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Server error response:', errorText);
                    throw new Error('Failed to fetch recommendations');
                }

                const data = await response.json();
                console.log('Received recommendations:', data);
                setRecommendations(data);
            } catch (error) {
                console.error('Error fetching cart recommendations:', error);
                setError(error.message);
            } finally {
                setIsLoading(false);
            }
        }

        fetchCartRecommendations();
    }, [user?.email, cartCtx.items]);

    const handleAddToCart = (item) => {
        cartCtx.addItem(item);
    };

    if (isLoading) {
        return <div className={classes.loading}>Loading recommendations...</div>;
    }

    if (error || recommendations.length === 0) {
        return null; // Don't show anything if there's an error or no recommendations
    }

    return (
        <section className={classes.cartRecommendations}>
            <h3>You might also like...</h3>
            <div className={classes.recommendationsContainer}>
                {recommendations.map(meal => (
                    <div key={meal.id} className={classes.recommendedItem}>
                        <img
                            src={`http://localhost:3000/${meal.image}`}
                            alt={meal.name}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'%3E%3Crect width='150' height='150' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='14' text-anchor='middle' dominant-baseline='middle' fill='%239ca3af'%3ENo Image%3C/text%3E%3C/svg%3E";
                            }}
                        />
                        <div className={classes.details}>
                            <h4>{meal.name}</h4>
                            <div className={classes.price}>₹{(meal.price / 100).toFixed(2)}</div>
                            <button
                                className={classes.addButton}
                                onClick={() => handleAddToCart({
                                    id: meal.id,
                                    name: meal.name,
                                    price: meal.price,
                                    image: meal.image,
                                    quantity: 1
                                })}
                            >
                                + Add
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
