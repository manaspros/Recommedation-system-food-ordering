import { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { currencyFormatter } from '../../util/formatting';
import classes from './CustomerSegmentation.module.css';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

export default function CustomerSegmentation({ userEmail }) {
    const [customers, setCustomers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: 'totalSpent', direction: 'desc' });
    const [searchTerm, setSearchTerm] = useState('');
    const [customerSegments, setCustomerSegments] = useState({});

    useEffect(() => {
        async function fetchCustomerData() {
            try {
                setIsLoading(true);
                setError(null);

                const response = await fetch(
                    `http://localhost:3000/admin/dashboard/customer-insights?email=${userEmail}`
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch customer data');
                }

                const data = await response.json();
                setCustomers(data);

                // Calculate customer segments
                calculateCustomerSegments(data);
            } catch (error) {
                console.error('Error fetching customer data:', error);
                setError('Failed to load customer data');
            } finally {
                setIsLoading(false);
            }
        }

        if (userEmail) {
            fetchCustomerData();
        }
    }, [userEmail]);

    const calculateCustomerSegments = (customerData) => {
        // Define customer segments
        const frequencySegments = {
            highFrequency: 0,   // 3+ orders
            mediumFrequency: 0, // 2 orders
            lowFrequency: 0     // 1 order
        };

        const valueSegments = {
            highValue: 0,     // Over 500
            mediumValue: 0,   // 200-500
            lowValue: 0       // Under 200
        };

        // Count customers in each segment
        customerData.forEach(customer => {
            // Frequency segmentation
            if (customer.orderCount >= 3) {
                frequencySegments.highFrequency += 1;
            } else if (customer.orderCount === 2) {
                frequencySegments.mediumFrequency += 1;
            } else {
                frequencySegments.lowFrequency += 1;
            }

            // Value segmentation
            if (customer.totalSpent >= 50000) { // 500 in cents
                valueSegments.highValue += 1;
            } else if (customer.totalSpent >= 20000) { // 200 in cents
                valueSegments.mediumValue += 1;
            } else {
                valueSegments.lowValue += 1;
            }
        });

        setCustomerSegments({
            frequency: frequencySegments,
            value: valueSegments
        });
    };

    // Create chart data for frequency segments
    const frequencyChartData = {
        labels: ['High Frequency (3+ orders)', 'Medium Frequency (2 orders)', 'Low Frequency (1 order)'],
        datasets: [
            {
                data: [
                    customerSegments.frequency?.highFrequency || 0,
                    customerSegments.frequency?.mediumFrequency || 0,
                    customerSegments.frequency?.lowFrequency || 0
                ],
                backgroundColor: [
                    '#4361ee',
                    '#3a0ca3',
                    '#7209b7'
                ],
                borderWidth: 1
            }
        ]
    };

    // Create chart data for value segments
    const valueChartData = {
        labels: ['High Value (₹500+)', 'Medium Value (₹200-499)', 'Low Value (Under ₹200)'],
        datasets: [
            {
                data: [
                    customerSegments.value?.highValue || 0,
                    customerSegments.value?.mediumValue || 0,
                    customerSegments.value?.lowValue || 0
                ],
                backgroundColor: [
                    '#f72585',
                    '#b5179e',
                    '#560bad'
                ],
                borderWidth: 1
            }
        ]
    };

    // Chart options
    const chartOptions = {
        plugins: {
            legend: {
                position: 'bottom',
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const label = context.label || '';
                        const value = context.raw;
                        const percentage = Math.round((value / customers.length) * 100);
                        return `${label}: ${value} customers (${percentage}%)`;
                    }
                }
            }
        },
        responsive: true,
        maintainAspectRatio: false
    };

    // Handle sorting
    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Apply sorting and filtering
    const sortedAndFilteredCustomers = [...customers]
        .filter(customer => {
            if (searchTerm && !customer.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
                !customer.email.toLowerCase().includes(searchTerm.toLowerCase())) {
                return false;
            }
            return true;
        })
        .sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });

    if (isLoading) {
        return <div className={classes.loading}>Loading customer data...</div>;
    }

    if (error) {
        return <div className={classes.error}>{error}</div>;
    }

    return (
        <div className={classes.customerSegmentationContainer}>
            <h2>Customer Segmentation</h2>

            <div className={classes.customersOverview}>
                <div className={classes.overviewCard}>
                    <h3>Total Customers</h3>
                    <p className={classes.overviewValue}>{customers.length}</p>
                </div>
                <div className={classes.overviewCard}>
                    <h3>Average Lifetime Value</h3>
                    <p className={classes.overviewValue}>
                        {currencyFormatter.format(customers.reduce((sum, customer) => sum + (customer.totalSpent / 100), 0) / customers.length)}
                    </p>
                </div>
            </div>

            <div className={classes.segmentationCharts}>
                <div className={classes.chartContainer}>
                    <h3>Customer Frequency</h3>
                    <div className={classes.pieChartWrapper}>
                        <Pie data={frequencyChartData} options={chartOptions} />
                    </div>
                </div>

                <div className={classes.chartContainer}>
                    <h3>Customer Value</h3>
                    <div className={classes.pieChartWrapper}>
                        <Pie data={valueChartData} options={chartOptions} />
                    </div>
                </div>
            </div>

            <div className={classes.customerTableSection}>
                <h3>Customer Details</h3>

                <div className={classes.tableControls}>
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={classes.searchInput}
                    />
                </div>

                <div className={classes.tableWrapper}>
                    <table className={classes.customerTable}>
                        <thead>
                            <tr>
                                <th onClick={() => handleSort('name')} className={classes.sortable}>
                                    Name
                                    {sortConfig.key === 'name' && (
                                        <span>{sortConfig.direction === 'asc' ? ' ▲' : ' ▼'}</span>
                                    )}
                                </th>
                                <th onClick={() => handleSort('email')} className={classes.sortable}>
                                    Email
                                    {sortConfig.key === 'email' && (
                                        <span>{sortConfig.direction === 'asc' ? ' ▲' : ' ▼'}</span>
                                    )}
                                </th>
                                <th onClick={() => handleSort('orderCount')} className={classes.sortable}>
                                    Orders
                                    {sortConfig.key === 'orderCount' && (
                                        <span>{sortConfig.direction === 'asc' ? ' ▲' : ' ▼'}</span>
                                    )}
                                </th>
                                <th onClick={() => handleSort('totalSpent')} className={classes.sortable}>
                                    Total Spent
                                    {sortConfig.key === 'totalSpent' && (
                                        <span>{sortConfig.direction === 'asc' ? ' ▲' : ' ▼'}</span>
                                    )}
                                </th>
                                <th>Favorite Item</th>
                                <th>Last Order</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedAndFilteredCustomers.map(customer => (
                                <tr key={customer.email}>
                                    <td>{customer.name}</td>
                                    <td>{customer.email}</td>
                                    <td>{customer.orderCount}</td>
                                    <td>{currencyFormatter.format(customer.totalSpent / 100)}</td>
                                    <td>{customer.topFavoriteItem?.name || 'N/A'}</td>
                                    <td>{customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString() : 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className={classes.actionButtons}>
                <button className={classes.actionButton}>Export Customer Data</button>
                <button className={classes.actionButton}>Generate Customer Report</button>
            </div>
        </div>
    );
}
