import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Navigate } from 'react-router-dom';
import DashboardSummary from './DashboardSummary';
import SalesChart from './SalesChart';
import PopularItemsTable from './PopularItemsTable';
import CustomerSegmentation from './CustomerSegmentation';
import InventoryForecast from './InventoryForecast';
import PerformanceMetrics from './PerformanceMetrics';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import classes from './AdminDashboard.module.css';

export default function AdminDashboard() {
    const { user, isAuthenticated, isLoading } = useAuth0();
    const [activeSection, setActiveSection] = useState('summary');
    const [summaryData, setSummaryData] = useState(null);
    const [isLoadingSummary, setIsLoadingSummary] = useState(true);
    const [error, setError] = useState(null);

    // Check if user is admin - this would normally use proper role checking
    const isAdmin = isAuthenticated &&
        (user?.email === 'admin@example.com' || user?.email === 'manasnandchoudhary@gmail.com');

    useEffect(() => {
        async function fetchSummaryData() {
            if (!isAuthenticated || !isAdmin) return;

            try {
                setIsLoadingSummary(true);
                setError(null);

                const response = await fetch(`http://localhost:3000/admin/dashboard/summary?email=${user.email}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch dashboard summary');
                }

                const data = await response.json();
                setSummaryData(data);
            } catch (error) {
                console.error('Error fetching dashboard summary:', error);
                setError('Failed to load dashboard summary. Please try again.');
            } finally {
                setIsLoadingSummary(false);
            }
        }

        fetchSummaryData();
    }, [isAuthenticated, isAdmin, user?.email]);

    if (isLoading) {
        return <div className="center">Loading...</div>;
    }

    if (!isAuthenticated || !isAdmin) {
        return <Navigate to="/" replace />;
    }

    // Render active section based on sidebar selection
    const renderActiveSection = () => {
        switch (activeSection) {
            case 'summary':
                return <DashboardSummary data={summaryData} isLoading={isLoadingSummary} error={error} />;
            case 'sales':
                return <SalesChart userEmail={user.email} />;
            case 'popular':
                return <PopularItemsTable userEmail={user.email} />;
            case 'customers':
                return <CustomerSegmentation userEmail={user.email} />;
            case 'inventory':
                return <InventoryForecast userEmail={user.email} />;
            case 'performance':
                return <PerformanceMetrics userEmail={user.email} />;
            default:
                return <DashboardSummary data={summaryData} isLoading={isLoadingSummary} error={error} />;
        }
    };

    return (
        <div className={classes.adminDashboard}>
            <AdminSidebar
                activeSection={activeSection}
                onSectionChange={setActiveSection}
            />
            <div className={classes.mainContent}>
                <AdminHeader user={user} title={`Admin Dashboard: ${activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}`} />
                <div className={classes.dashboardContent}>
                    {renderActiveSection()}
                </div>
            </div>
        </div>
    );
}
