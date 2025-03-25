import MealItem from './MealItem.jsx';
import useHttp from '../hooks/useHttp.js';
import Error from './Error.jsx';

const requestConfig = {};

export default function Meals() {
  const {
    data: loadedMeals,
    isLoading,
    error,
  } = useHttp('http://localhost:3000/meals', requestConfig, []);

  if (isLoading) {
    return <p className="center">Fetching meals...</p>;
  }

  if (error) {
    return <Error title="Failed to fetch meals" message={error} />;
  }

  return (
    <ul id="meals">
      {loadedMeals && loadedMeals.length > 0 ? (
        loadedMeals.map((meal) => (
          <MealItem key={meal.id} meal={meal} /> // Use id instead of _id
        ))
      ) : (
        <p>No meals found.</p> // Show a message if there are no meals
      )}
    </ul>
  );
}