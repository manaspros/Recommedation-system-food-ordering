import { Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';

export default function MainHeader() {
    const { isAuthenticated } = useAuth0();

    return (
        <header id="main-header">
            <div id="title">
                <img src={logoImg} alt="A restaurant" />
                <h1>ReactFood</h1>
            </div>
            <nav>
                <ul>
                    <li>
                        <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''} end>Browse Meals</NavLink>
                    </li>
                    {isAuthenticated && (
                        <li>
                            <NavLink to="/profile" className={({ isActive }) => isActive ? 'active' : ''}>My Profile</NavLink>
                        </li>
                    )}
                    <li>
                        <Button textOnly onClick={handleShowCart}>Cart ({totalCartItems})</Button>
                    </li>
                </ul>
            </nav>
        </header>
    );
}