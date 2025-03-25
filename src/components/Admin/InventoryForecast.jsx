import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import classes from './InventoryForecast.module.css';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

export default function InventoryForecast({ userEmail }) {
    const [inventoryData, setInventoryData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: 'monthlyForecast', direction: 'desc' });
    const [filterCategory, setFilterCategory] = useState('all');
    const [displayCount, setDisplayCount] = useState(10);

    useEffect(() => {
        async function fetchInventoryData() {
            try {
                setIsLoading(true);
                setError(null);

                const response = await fetch(`http://localhost:3000/admin/dashboard/inventory-forecast?email=${userEmail}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch inventory forecast data');
                }

                const data = await response.json();
                setInventoryData(data);
            } catch (error) {
                console.error('Error fetching inventory forecast:', error);
                setError('Failed to load inventory forecast data');
            } finally {
                setIsLoading(false);
            }
        }

        if (userEmail) {
            fetchInventoryData();
        }
    }, [userEmail]);

    // Get unique categories for filtering
    const categories = ['all', ...new Set(inventoryData.map(item =>
        item.mealDetails?.category || 'Uncategorized'))];

    // Handle sorting
    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Apply sorting and filtering
    const filteredAndSortedItems = [...inventoryData]
        .filter(item => {
            if (filterCategory !== 'all') {
                return (item.mealDetails?.category || 'Uncategorized') === filterCategory;
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

    // Prepare chart data with the top items based on monthly forecast
    const prepareChartData = () => {
        const topItems = filteredAndSortedItems.slice(0, displayCount);

        return {
            labels: topItems.map(item => item.name),
            datasets: [
                {
                    label: 'Weekly Forecast',
                    data: topItems.map(item => item.weeklyForecast),
                    backgroundColor: 'rgba(67, 97, 238, 0.6)',
                },
                {
                    label: 'Monthly Forecast',
                    data: topItems.map(item => item.monthlyForecast),
                    backgroundColor: 'rgba(52, 152, 219, 0.6)',
                }
            ]
        };
    };

    const chartOptions = {
        indexAxis: 'y',
        elements: {
            bar: {
                borderWidth: 2,
            },
        },
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom',
            },
            title: {
                display: true,
                text: 'Inventory Forecast by Item',
                font: {
                    size: 16
                }
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Quantity',
                    font: {
                        size: 12
                    }
                }
            }
        }
    };

    if (isLoading) {
        return <div className={classes.loading}>Loading inventory forecast...</div>;
    }

    if (error) {
        return <div className={classes.error}>{error}</div>;
    }

    return (
        <div className={classes.inventoryForecastContainer}>
            <h2>Inventory Forecast</h2>

            <div className={classes.controls}>
                <div className={classes.filterControl}>
                    <label htmlFor="category">Category:</label>
                    <select
                        id="category"
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className={classes.select}
                    >
                        {categories.map(category => (
                            <option key={category} value={category}>
                                {category.charAt(0).toUpperCase() + category.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={classes.displayControl}>
                    <label htmlFor="displayCount">Display:</label>
                    <select
                        id="displayCount"
                        value={displayCount}
                        onChange={(e) => setDisplayCount(Number(e.target.value))}
                        className={classes.select}
                    >
                        <option value={5}>Top 5</option>
                        <option value={10}>Top 10</option>
                        <option value={15}>Top 15</option>
                        <option value={20}>Top 20</option>
                    </select>
                </div>
            </div>

            <div className={classes.chartContainer}>
                <Bar data={prepareChartData()} options={chartOptions} height={displayCount * 20} />
            </div>

            <div className={classes.tableContainer}>
                <h3>Detailed Inventory Forecast</h3>

                <div className={classes.tableWrapper}>
                    <table className={classes.inventoryTable}>
                        <thead>
                            <tr>
                                <th onClick={() => handleSort('name')} className={classes.sortable}>
                                    Item Name
                                    {sortConfig.key === 'name' && (
                                        <span>{sortConfig.direction === 'asc' ? ' ▲' : ' ▼'}</span>
                                    )}
                                </th>
                                <th onClick={() => handleSort('dailyRate')} className={classes.sortable}>
                                    Daily Usage Rate
                                    {sortConfig.key === 'dailyRate' && (
                                        <span>{sortConfig.direction === 'asc' ? ' ▲' : ' ▼'}</span>
                                    )}
                                </th>
                                <th onClick={() => handleSort('weeklyForecast')} className={classes.sortable}>
                                    Weekly Forecast
                                    {sortConfig.key === 'weeklyForecast' && (
                                        <span>{sortConfig.direction === 'asc' ? ' ▲' : ' ▼'}</span>
                                    )}
                                </th>
                                <th onClick={() => handleSort('monthlyForecast')} className={classes.sortable}>
                                    Monthly Forecast
                                    {sortConfig.key === 'monthlyForecast' && (
                                        <span>{sortConfig.direction === 'asc' ? ' ▲' : ' ▼'}</span>
                                    )}
                                </th>
                                <th>Category</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAndSortedItems.map((item, index) => (
                                <tr key={item.id} className={index % 2 === 0 ? classes.evenRow : classes.oddRow}>
                                    <td>{item.name}</td>
                                    <td>{item.dailyRate.toFixed(2)}</td>
                                    <td>{item.weeklyForecast}</td>
                                    <td>{item.monthlyForecast}</td>
                                    <td>{item.mealDetails?.category || 'Uncategorized'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className={classes.actionButtons}>
                <button className={classes.actionButton}>Generate Purchase Order</button>
                <button className={classes.actionButton}>Download Forecast Data</button>
            </div>
        </div>
    );
}
