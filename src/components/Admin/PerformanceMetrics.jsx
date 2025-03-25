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
    Legend
} from 'chart.js';
import classes from './PerformanceMetrics.module.css';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

export default function PerformanceMetrics({ userEmail }) {
    const [performanceData, setPerformanceData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchPerformanceData() {
            try {
                setIsLoading(true);
                setError(null);

                const response = await fetch(`http://localhost:3000/admin/dashboard/performance?email=${userEmail}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch performance metrics');
                }

                const data = await response.json();
                setPerformanceData(data);
            } catch (error) {
                console.error('Error fetching performance metrics:', error);
                setError('Failed to load performance metrics');
            } finally {
                setIsLoading(false);
            }
        }

        if (userEmail) {
            fetchPerformanceData();
        }
    }, [userEmail]);

    // Prepare peak hours chart data
    const peakHoursChartData = performanceData ? {
        labels: performanceData.peakHours.map(hour => `${hour.hour}:00`),
        datasets: [
            {
                label: 'Orders per Hour',
                data: performanceData.peakHours.map(hour => hour.orders),
                backgroundColor: 'rgba(75, 192, 192, 0.8)',
            }
        ]
    } : null;

    const peakHoursOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Peak Hours Analysis',
                font: {
                    size: 16
                }
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Order Count',
                    font: {
                        size: 12
                    }
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Hour of Day',
                    font: {
                        size: 12
                    }
                }
            }
        }
    };

    if (isLoading) {
        return <div className={classes.loading}>Loading performance metrics...</div>;
    }

    if (error) {
        return <div className={classes.error}>{error}</div>;
    }

    if (!performanceData) {
        return <div className={classes.noData}>No performance data available.</div>;
    }

    return (
        <div className={classes.performanceMetricsContainer}>
            <h2>System Performance Metrics</h2>

            <div className={classes.metricsCards}>
                <div className={classes.metricCard}>
                    <h3>Avg. Order Fulfillment Time</h3>
                    <div className={classes.metricValue}>{performanceData.avgFulfillmentTime} min</div>
                </div>

                <div className={classes.metricCard}>
                    <h3>Customer Rating</h3>
                    <div className={classes.metricValue}>
                        {performanceData.avgCustomerRating.toFixed(1)}
                        <span className={classes.ratingStars}>
                            {'★'.repeat(Math.round(performanceData.avgCustomerRating))}
                            {'☆'.repeat(5 - Math.round(performanceData.avgCustomerRating))}
                        </span>
                    </div>
                </div>

                <div className={classes.metricCard}>
                    <h3>System Uptime</h3>
                    <div className={classes.metricValue}>{performanceData.systemUptime}%</div>
                </div>

                <div className={classes.metricCard}>
                    <h3>Order Error Rate</h3>
                    <div className={classes.metricValue}>{performanceData.orderErrorRate}%</div>
                </div>
            </div>

            <div className={classes.chartsRow}>
                <div className={classes.chartContainer}>
                    <Bar data={peakHoursChartData} options={peakHoursOptions} />
                </div>
            </div>

            <div className={classes.additionalMetrics}>
                <h3>Additional System Metrics</h3>

                <div className={classes.metricsGrid}>
                    <div className={classes.metricItem}>
                        <span className={classes.metricLabel}>Response Time:</span>
                        <span className={classes.metricValue}>{performanceData.responseTime} sec</span>
                    </div>

                    <div className={classes.metricItem}>
                        <span className={classes.metricLabel}>Active Users:</span>
                        <span className={classes.metricValue}>{performanceData.activeUsers}</span>
                    </div>

                    <div className={classes.metricItem}>
                        <span className={classes.metricLabel}>Menu Items:</span>
                        <span className={classes.metricValue}>{performanceData.menuItemCount}</span>
                    </div>
                </div>
            </div>

            <div className={classes.recommendations}>
                <h3>System Recommendations</h3>

                <ul className={classes.recommendationList}>
                    <li>
                        <span className={classes.recommendationTitle}>Optimize Peak Hours</span>
                        <p>Consider adding more staff during peak hours (6-8 PM) to improve order fulfillment time.</p>
                    </li>
                    <li>
                        <span className={classes.recommendationTitle}>Improve Mobile Experience</span>
                        <p>Mobile orders have a higher error rate. Consider optimizing the mobile checkout flow.</p>
                    </li>
                    <li>
                        <span className={classes.recommendationTitle}>Menu Diversity</span>
                        <p>Consider adding more vegetarian options as they are gaining popularity.</p>
                    </li>
                </ul>
            </div>

            <div className={classes.actionButtons}>
                <button className={classes.actionButton}>Generate Performance Report</button>
                <button className={classes.actionButton}>View System Logs</button>
            </div>
        </div>
    );
}
