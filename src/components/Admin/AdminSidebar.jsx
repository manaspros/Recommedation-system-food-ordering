import {
    FaChartLine,
    FaShoppingCart,
    FaUsers,
    FaBoxOpen,
    FaTachometerAlt,
    FaHome
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import classes from './AdminSidebar.module.css';

export default function AdminSidebar({ activeSection, onSectionChange }) {
    const menuItems = [
        { id: 'summary', name: 'Dashboard', icon: <FaTachometerAlt /> },
        { id: 'sales', name: 'Sales Analytics', icon: <FaChartLine /> },
        { id: 'popular', name: 'Popular Items', icon: <FaShoppingCart /> },
        { id: 'customers', name: 'Customer Insights', icon: <FaUsers /> },
        { id: 'inventory', name: 'Inventory Forecast', icon: <FaBoxOpen /> },
        { id: 'performance', name: 'System Performance', icon: <FaTachometerAlt /> }
    ];

    return (
        <div className={classes.adminSidebar}>
            <div className={classes.logo}>
                <h2>Food Admin</h2>
            </div>

            <ul className={classes.navMenu}>
                {menuItems.map(item => (
                    <li
                        key={item.id}
                        className={`${classes.navItem} ${activeSection === item.id ? classes.active : ''}`}
                        onClick={() => onSectionChange(item.id)}
                    >
                        <div className={classes.icon}>{item.icon}</div>
                        <div className={classes.label}>{item.name}</div>
                    </li>
                ))}
            </ul>

            <div className={classes.homeLink}>
                <Link to="/" className={classes.navItem}>
                    <div className={classes.icon}><FaHome /></div>
                    <div className={classes.label}>Back to Store</div>
                </Link>
            </div>
        </div>
    );
}
