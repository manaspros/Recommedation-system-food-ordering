import { useContext, useState } from 'react';
import { currencyFormatter } from '../util/formatting.js';
import Button from './UI/Button.jsx';
import CartContext from '../store/CartContext.jsx';
import './MealItem.css';
import classes from './MealItem.module.css';

export default function MealItem({ meal, isRecommended, isHealthy }) {
  const cartCtx = useContext(CartContext);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isAddedToCart, setIsAddedToCart] = useState(false); // New state for cart message

  function handleAddMealToCart() {
    setIsAddedToCart(true);

    console.log("Adding meal to cart:", {
      id: meal.id,
      name: meal.name,
      price: meal.price,
      image: meal.image
    });

    cartCtx.addItem({
      id: meal.id,
      name: meal.name,
      price: meal.price, // Make sure this is in the smallest currency unit (paise)
      image: meal.image,
      quantity: 1
    });

    // Reset the "Added to Cart" text after 2 seconds
    setTimeout(() => {
      setIsAddedToCart(false);
    }, 2000);
  }

  return (
    <li className={`${classes.meal} ${isRecommended ? classes.recommended : ''} ${isHealthy ? classes.healthy : ''}`}>
      {isRecommended && !isHealthy && <span className={classes.badge}>Recommended</span>}
      {isHealthy && <span className={`${classes.badge} ${classes.healthBadge}`}>Healthy Choice</span>}
      <div className={`nft ${isAnimating ? 'pop-effect' : ''}`}> {/* Animation on the NFT */}
        <div className='main'>
          <article>
            <img className='tokenImage' src={`http://localhost:3000/${meal.image}`} alt={meal.name} />

            <h2>{meal.name}</h2>
            <p className="description">{meal.description}</p>
            <div className='tokenInfo'>
              <p className="price">
                {currencyFormatter.format(meal.price)}
              </p>
              <div className="duration">
                <ins>◷</ins>
                <p>20-30 min</p>
              </div>
            </div>

            <hr />
            {/* Add to Cart section */}
            <div className='creator' onClick={handleAddMealToCart}>
              <div className='wrapper'>
                <img src="https://images.unsplash.com/photo-1620121692029-d088224ddc74?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1932&q=80" alt="Creator" />
              </div>
              {/* Show "Added to Cart" or "Add to Cart" based on state */}
              <p><ins>{isAddedToCart ? 'Added to' : 'Add to'}</ins> Cart</p>
            </div>
          </article>
        </div>
      </div>
    </li>
  );
}
