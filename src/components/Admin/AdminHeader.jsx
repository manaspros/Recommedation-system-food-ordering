import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBell, FaCog, FaSearch, FaCloudDownloadAlt } from 'react-icons/fa';
import { useAuth0 } from '@auth0/auth0-react';
import classes from './AdminHeader.module.css';

export default function AdminHeader({ user, title }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isActive, setIsActive] = useState(false);
    const { logout } = useAuth0();

    const handleToggle = () => {
        setIsActive(!isActive);
    };

    return (
        <div className={classes.adminHeader}>
            <div className={classes.headerTitle}>
                <h1>{title}</h1>
            </div>

            <div className={classes.headerControls}>
                <div className={classes.searchBar}>
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className={classes.searchButton}>
                        <FaSearch />
                    </button>
                </div>

                <div className={classes.headerActions}>
                    <button className={classes.exportButton}>
                        <FaCloudDownloadAlt />
                        <span>Export</span>
                    </button>

                    <button className={classes.iconButton}>
                        <FaBell />
                    </button>

                    <button className={classes.iconButton}>
                        <FaCog />
                    </button>

                    {/* Profile Menu - Similar to Home Page */}
                    <div className="profile-menu">
                        <div className={`action ${isActive ? 'active' : ''}`} onClick={handleToggle}>
                            {user?.picture ? (
                                <img src={user.picture} alt={user.name} />
                            ) : (
                                <div className={classes.defaultAvatar}>
                                    {user?.name?.charAt(0) || 'A'}
                                </div>
                            )}
                        </div>
                        <div className={`menu ${isActive ? 'active' : ''}`}>
                            <div className="profile">
                                {user?.picture ? (
                                    <img src={user.picture} alt={user.name} />
                                ) : (
                                    <div className={classes.defaultAvatar}>
                                        {user?.name?.charAt(0) || 'A'}
                                    </div>
                                )}
                                <div className="info">
                                    <h2>{user?.name || 'Admin'}</h2>
                                    <p>{user?.email}</p>
                                </div>
                            </div>

                            <ul>
                                <li>
                                    <img src="/images/admin.svg" alt="Admin" />
                                    <Link to="/admin">Admin Dashboard</Link>
                                </li>
                                <li>
                                    <img src="/images/setting.png" alt="Orders" />
                                    <Link to="/backends">Orders</Link>
                                </li>
                                <li>
                                    <img src="/images/help.png" alt="Help" />
                                    <Link to="/explain">Help</Link>
                                </li>
                                <li>
                                    <img src="/images/logout.png" alt="Logout" />
                                    <a href="#" onClick={() => logout()}>Log out</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
