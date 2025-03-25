import { FaShoppingCart, FaRupeeSign, FaUsers, FaCheck, FaClock, FaExchangeAlt } from 'react-icons/fa';
import { currencyFormatter } from '../../util/formatting';
import classes from './DashboardSummary.module.css';

export default function DashboardSummary({ data, isLoading, error }) {
    if (isLoading) {
        return <div className={classes.loading}>Loading dashboard summary...</div>;
    }

    if (error) {
        return <div className={classes.error}>{error}</div>;
    }

    if (!data) {
        return <div className={classes.noData}>No dashboard data available.</div>;
    }

    const summaryCards = [
        {
            title: 'Total Orders',
            value: data.totalOrders,
            icon: <FaShoppingCart />,
            color: '#4361ee'
        },
        {
            title: 'Revenue',
            value: currencyFormatter.format(data.totalRevenue),
            icon: <FaRupeeSign />,
            color: '#2ecc71'
        },
        {
            title: 'Avg Order Value',
            value: currencyFormatter.format(data.avgOrderValue),
            icon: <FaRupeeSign />,
            color: '#3498db'
        },
        {
            title: 'Unique Customers',
            value: data.uniqueCustomers,
            icon: <FaUsers />,
            color: '#9b59b6'
        },
        {
            title: 'Completed Orders',
            value: data.completedOrders,
            icon: <FaCheck />,
            color: '#27ae60'
        },
        {
            title: 'Pending Orders',
            value: data.pendingOrders,
            icon: <FaClock />,
            color: '#e67e22'
        },
        {
            title: 'Conversion Rate',
            value: data.conversionRate,
            icon: <FaExchangeAlt />,
            color: '#f39c12'
        }
    ];

    return (
        <div className={classes.summaryContainer}>
            <h2>Dashboard Summary</h2>
            <p className={classes.updateTime}>Last updated: {new Date().toLocaleString()}</p>

            <div className={classes.cardsContainer}>
                {summaryCards.map((card, index) => (
                    <div
                        key={index}
                        className={classes.summaryCard}
                        style={{ borderTop: `4px solid ${card.color}` }}
                    >
                        <div className={classes.cardIcon} style={{ color: card.color }}>
                            {card.icon}
                        </div>
                        <div className={classes.cardContent}>
                            <h3>{card.title}</h3>
                            <p className={classes.cardValue}>{card.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className={classes.quickActions}>
                <h3>Quick Actions</h3>
                <div className={classes.actionButtons}>
                    <button className={classes.actionButton}>View All Orders</button>
                    <button className={classes.actionButton}>Download Report</button>
                    <button className={classes.actionButton}>Manage Inventory</button>
                </div>
            </div>
        </div>
    );
}
