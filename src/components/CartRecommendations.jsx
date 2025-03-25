import { useState, useEffect, useContext } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import CartContext from '../store/CartContext.jsx';
import classes from './CartRecommendations.module.css';

export default function CartRecommendations() {
    const [recommendations, setRecommendations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const { user, isAuthenticated } = useAuth0();
    const cartCtx = useContext(CartContext);

    useEffect(() => {
        async function fetchCartRecommendations() {
            if (!isAuthenticated || !user?.email || cartCtx.items.length === 0) {
                setRecommendations([]);
                return;
            }

            // Only fetch recommendations if there are items in the cart
            setIsLoading(true);

            try {
                const response = await fetch('http://localhost:3000/cart-recommendations', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        userId: user.email,
                        cartItems: cartCtx.items
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch recommendations');
                }

                const data = await response.json();
                setRecommendations(data);
            } catch (error) {
                console.error('Error fetching cart recommendations:', error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchCartRecommendations();
    }, [cartCtx.items, user?.email, isAuthenticated]);

    // Don't show if no recommendations or not authenticated
    if (!isAuthenticated || recommendations.length === 0) {
        return null;
    }

    // Show loading state
    if (isLoading) {
        return <p className={classes.loading}>Finding recommendations for you...</p>;
    }

    function handleAddToCart(meal) {
        cartCtx.addItem(meal);
    }

    return (
        <section className={classes.recommendations}>
            <h3>You might also like</h3>
            <div className={classes.items}>
                {recommendations.map(meal => (
                    <div key={meal.id} className={classes.item}>
                        <img src={`http://localhost:3000/${meal.image}`} alt={meal.name} />
                        <div className={classes.details}>
                            <h4>{meal.name}</h4>
                            <div className={classes.price}>${(meal.price / 100).toFixed(2)}</div>
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
