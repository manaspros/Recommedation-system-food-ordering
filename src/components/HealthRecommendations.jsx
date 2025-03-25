import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import MealItem from './MealItem.jsx';
import classes from './HealthRecommendations.module.css';

export default function HealthRecommendations() {
    const [recommendations, setRecommendations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const { user, isAuthenticated } = useAuth0();

    useEffect(() => {
        async function fetchHealthRecommendations() {
            if (!isAuthenticated || !user?.email) return;

            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch(`http://localhost:3000/health-recommendations?userId=${user.email}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch health recommendations');
                }

                const data = await response.json();
                setRecommendations(data);
            } catch (error) {
                setError(error.message || 'Failed to load health recommendations');
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchHealthRecommendations();
    }, [user?.email, isAuthenticated]);

    // Don't show anything if user is not authenticated
    if (!isAuthenticated) {
        return null;
    }

    if (isLoading) {
        return <p className="center">Loading health-based recommendations...</p>;
    }

    // If there's an error or no recommendations, don't show this section
    if (error || recommendations.length === 0) {
        return null;
    }

    return (
        <section className={classes.healthRecommendations}>
            <h2>Healthy Picks for You</h2>
            <div className={classes.container}>
                {recommendations.map(meal => (
                    <MealItem key={meal.id} meal={meal} isRecommended={true} isHealthy={true} />
                ))}
            </div>
        </section>
    );
}
