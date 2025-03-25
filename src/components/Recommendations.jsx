import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import MealItem from './MealItem.jsx';
import classes from './Recommendations.module.css';

export default function Recommendations() {
    const [recommendations, setRecommendations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const { user, isAuthenticated } = useAuth0();

    useEffect(() => {
        async function fetchRecommendations() {
            if (!isAuthenticated || !user?.email) return;

            setIsLoading(true);
            setError(null);

            try {
                console.log("Fetching recommendations for user:", user.email);
                const response = await fetch(`http://localhost:3000/recommendations?userId=${user.email}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch recommendations');
                }

                const data = await response.json();
                console.log("Received recommendations:", data);
                setRecommendations(data);
            } catch (error) {
                setError(error.message || 'Failed to load recommendations');
                console.error("Recommendation error:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchRecommendations();
    }, [user?.email, isAuthenticated]);

    // Don't show anything if user is not authenticated
    if (!isAuthenticated) {
        return null;
    }

    if (isLoading) {
        return <p className="center">Loading recommendations...</p>;
    }

    // If there's an error or no recommendations, don't show this section
    if (error || recommendations.length === 0) {
        console.log("No recommendations to show", { error, count: recommendations.length });
        return null;
    }

    return (
        <section className={classes.recommendations}>
            <h2>Recommended for You</h2>
            <div className={classes.container}>
                {recommendations.map(meal => (
                    <MealItem key={meal.id} meal={meal} isRecommended={true} />
                ))}
            </div>
        </section>
    );
}
