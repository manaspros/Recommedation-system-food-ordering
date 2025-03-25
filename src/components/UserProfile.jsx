import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import classes from './UserProfile.module.css';

// Dietary preference options
const DIETARY_OPTIONS = [
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'gluten-free', label: 'Gluten Free' },
    { value: 'low-carb', label: 'Low Carb' },
    { value: 'high-protein', label: 'High Protein' },
    { value: 'healthy', label: 'Healthy' }
];

const ALLERGENS_OPTIONS = [
    { value: 'nuts', label: 'Nuts' },
    { value: 'dairy', label: 'Dairy' },
    { value: 'gluten', label: 'Gluten' },
    { value: 'seafood', label: 'Seafood' },
    { value: 'eggs', label: 'Eggs' }
];

const CUISINE_OPTIONS = [
    { value: 'Italian', label: 'Italian' },
    { value: 'Asian', label: 'Asian' },
    { value: 'American', label: 'American' },
    { value: 'Mediterranean', label: 'Mediterranean' },
    { value: 'Indian', label: 'Indian' },
    { value: 'Mexican', label: 'Mexican' },
    { value: 'Health', label: 'Health Food' },
    { value: 'Seafood', label: 'Seafood' }
];

export default function UserProfile() {
    const { user, isAuthenticated, isLoading: authLoading } = useAuth0();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [preferences, setPreferences] = useState({
        dietaryPreferences: [],
        allergies: [],
        favoriteCuisines: []
    });
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Fetch user preferences when component mounts
    useEffect(() => {
        async function fetchPreferences() {
            if (!isAuthenticated || !user?.email) return;

            try {
                setIsLoading(true);
                setError(null);

                const response = await fetch(`http://localhost:3000/user-preferences?userId=${user.email}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch preferences');
                }

                const data = await response.json();
                setPreferences({
                    dietaryPreferences: data.dietaryPreferences || [],
                    allergies: data.allergies || [],
                    favoriteCuisines: data.favoriteCuisines || []
                });
            } catch (error) {
                setError('Failed to load your preferences. Please try again.');
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        }

        if (isAuthenticated && user) {
            fetchPreferences();
        }
    }, [user, isAuthenticated]);

    // Handle form submission
    async function handleSubmit(event) {
        event.preventDefault();

        if (!isAuthenticated) return;

        setIsSaving(true);
        setSaveSuccess(false);

        try {
            const response = await fetch('http://localhost:3000/user-preferences', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: user.email,
                    preferences
                })
            });

            if (!response.ok) {
                throw new Error('Failed to save preferences');
            }

            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000); // Clear success message after 3 seconds
        } catch (error) {
            setError('Failed to save preferences. Please try again.');
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    }

    // Handle checkbox changes
    function handleCheckboxChange(category, value) {
        setPreferences(prev => {
            const current = [...prev[category]];
            const index = current.indexOf(value);

            if (index === -1) {
                // Add the value if it's not in the array
                return {
                    ...prev,
                    [category]: [...current, value]
                };
            } else {
                // Remove the value if it's already in the array
                current.splice(index, 1);
                return {
                    ...prev,
                    [category]: current
                };
            }
        });
    }

    if (authLoading || !isAuthenticated) {
        return <p className="center">Please log in to manage your preferences.</p>;
    }

    return (
        <div className={classes.profileContainer}>
            <h2>Dietary Preferences</h2>

            {isLoading && <p className="center">Loading your preferences...</p>}

            {error && <div className={classes.error}>{error}</div>}

            {!isLoading && !error && (
                <form onSubmit={handleSubmit} className={classes.form}>
                    <section className={classes.section}>
                        <h3>Dietary Preferences</h3>
                        <p className={classes.helper}>Select the options that match your diet</p>
                        <div className={classes.optionsGrid}>
                            {DIETARY_OPTIONS.map(option => (
                                <label key={option.value} className={classes.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        value={option.value}
                                        checked={preferences.dietaryPreferences.includes(option.value)}
                                        onChange={() => handleCheckboxChange('dietaryPreferences', option.value)}
                                    />
                                    {option.label}
                                </label>
                            ))}
                        </div>
                    </section>

                    <section className={classes.section}>
                        <h3>Food Allergies</h3>
                        <p className={classes.helper}>Select any allergies you have</p>
                        <div className={classes.optionsGrid}>
                            {ALLERGENS_OPTIONS.map(option => (
                                <label key={option.value} className={classes.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        value={option.value}
                                        checked={preferences.allergies.includes(option.value)}
                                        onChange={() => handleCheckboxChange('allergies', option.value)}
                                    />
                                    {option.label}
                                </label>
                            ))}
                        </div>
                    </section>

                    <section className={classes.section}>
                        <h3>Favorite Cuisines</h3>
                        <p className={classes.helper}>Select the cuisines you prefer</p>
                        <div className={classes.optionsGrid}>
                            {CUISINE_OPTIONS.map(option => (
                                <label key={option.value} className={classes.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        value={option.value}
                                        checked={preferences.favoriteCuisines.includes(option.value)}
                                        onChange={() => handleCheckboxChange('favoriteCuisines', option.value)}
                                    />
                                    {option.label}
                                </label>
                            ))}
                        </div>
                    </section>

                    <div className={classes.actions}>
                        <button
                            type="submit"
                            className={classes.saveButton}
                            disabled={isSaving}
                        >
                            {isSaving ? 'Saving...' : 'Save Preferences'}
                        </button>
                        {saveSuccess && <p className={classes.successMessage}>Preferences saved successfully!</p>}
                    </div>
                </form>
            )}
        </div>
    );
}
