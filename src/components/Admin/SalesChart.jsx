import { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    TimeScale
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import classes from './SalesChart.module.css';
import { currencyFormatter } from '../../util/formatting';

// Register the components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    TimeScale,
    Title,
    Tooltip,
    Legend
);

export default function SalesChart({ userEmail }) {
    const [salesData, setSalesData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [period, setPeriod] = useState('daily');
    const [chartType, setChartType] = useState('line');

    useEffect(() => {
        async function fetchSalesData() {
            try {
                setIsLoading(true);
                setError(null);

                const response = await fetch(
                    `http://localhost:3000/admin/dashboard/sales-trends?email=${userEmail}&period=${period}`
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch sales data');
                }

                const data = await response.json();
                setSalesData(data);
            } catch (error) {
                console.error('Error fetching sales data:', error);
                setError('Failed to load sales data');
            } finally {
                setIsLoading(false);
            }
        }

        if (userEmail) {
            fetchSalesData();
        }
    }, [userEmail, period]);

    const prepareChartData = () => {
        // Format dates/periods based on period type
        const labels = salesData.map(item => item.period);

        const chartData = {
            labels,
            datasets: [
                {
                    label: 'Revenue',
                    data: salesData.map(item => item.revenue),
                    borderColor: '#4361ee',
                    backgroundColor: 'rgba(67, 97, 238, 0.2)',
                    yAxisID: 'y',
                },
                {
                    label: 'Order Count',
                    data: salesData.map(item => item.orders),
                    borderColor: '#f72585',
                    backgroundColor: 'rgba(247, 37, 133, 0.2)',
                    yAxisID: 'y1',
                }
            ]
        };

        return chartData;
    };

    const chartOptions = {
        responsive: true,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        stacked: false,
        plugins: {
            title: {
                display: true,
                text: `Sales Trends (${period})`,
                font: {
                    size: 16
                }
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.dataset.label === 'Revenue') {
                            label += currencyFormatter.format(context.raw);
                        } else {
                            label += context.raw;
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            y: {
                type: 'linear',
                display: true,
                position: 'left',
                title: {
                    display: true,
                    text: 'Revenue',
                    font: {
                        size: 12
                    }
                },
                ticks: {
                    callback: function (value) {
                        return currencyFormatter.format(value);
                    }
                }
            },
            y1: {
                type: 'linear',
                display: true,
                position: 'right',
                title: {
                    display: true,
                    text: 'Orders',
                    font: {
                        size: 12
                    }
                },
                grid: {
                    drawOnChartArea: false,
                },
            },
        },
    };

    if (isLoading) {
        return <div className={classes.loading}>Loading sales data...</div>;
    }

    if (error) {
        return <div className={classes.error}>{error}</div>;
    }

    return (
        <div className={classes.salesChartContainer}>
            <div className={classes.controls}>
                <div className={classes.periodSelector}>
                    <label htmlFor="period">Time Period:</label>
                    <select
                        id="period"
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className={classes.select}
                    >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                    </select>
                </div>

                <div className={classes.chartTypeSelector}>
                    <label htmlFor="chartType">Chart Type:</label>
                    <select
                        id="chartType"
                        value={chartType}
                        onChange={(e) => setChartType(e.target.value)}
                        className={classes.select}
                    >
                        <option value="line">Line Chart</option>
                        <option value="bar">Bar Chart</option>
                    </select>
                </div>
            </div>

            <div className={classes.chartWrapper}>
                {chartType === 'line' ? (
                    <Line data={prepareChartData()} options={chartOptions} />
                ) : (
                    <Bar data={prepareChartData()} options={chartOptions} />
                )}
            </div>

            <div className={classes.summaryStats}>
                <div className={classes.statCard}>
                    <h4>Total Revenue</h4>
                    <p>{currencyFormatter.format(salesData.reduce((sum, item) => sum + item.revenue, 0))}</p>
                </div>
                <div className={classes.statCard}>
                    <h4>Total Orders</h4>
                    <p>{salesData.reduce((sum, item) => sum + item.orders, 0)}</p>
                </div>
                <div className={classes.statCard}>
                    <h4>Average Daily Revenue</h4>
                    <p>{currencyFormatter.format(salesData.reduce((sum, item) => sum + item.revenue, 0) / (salesData.length || 1))}</p>
                </div>
            </div>

            <div className={classes.exportControls}>
                <button className={classes.exportButton}>Export as CSV</button>
                <button className={classes.exportButton}>Export as PDF</button>
                <button className={classes.exportButton}>Email Report</button>
            </div>
        </div>
    );
}
