import Meals from '../components/Meals';
import Recommendations from '../components/Recommendations';
import HealthRecommendations from '../components/HealthRecommendations';
import { useAuth0 } from '@auth0/auth0-react';

export default function Home() {
    const { isAuthenticated } = useAuth0();

    return (
        <>
            {isAuthenticated && (
                <>
                    <Recommendations />
                    <HealthRecommendations />
                </>
            )}
            <Meals />
        </>
    );
}
