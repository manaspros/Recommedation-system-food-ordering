import { useState, useEffect } from 'react';
import { currencyFormatter } from '../../util/formatting';
import classes from './PopularItemsTable.module.css';

export default function PopularItemsTable({ userEmail }) {
    const [popularItems, setPopularItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: 'quantity', direction: 'desc' });
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    useEffect(() => {
        async function fetchPopularItems() {
            try {
                setIsLoading(true);
                setError(null);

                const response = await fetch(`http://localhost:3000/admin/dashboard/popular-items?email=${userEmail}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch popular items');
                }

                const data = await response.json();
                setPopularItems(data);
            } catch (error) {
                console.error('Error fetching popular items:', error);
                setError('Failed to load popular items data');
            } finally {
                setIsLoading(false);
            }
        }

        if (userEmail) {
            fetchPopularItems();
        }
    }, [userEmail]);

    // Get unique categories for filtering
    const categories = ['all', ...new Set(popularItems.map(item => item.category))];

    // Handle sorting
    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Apply sorting and filtering
    const sortedAndFilteredItems = [...popularItems]
        .filter(item => {
            // Apply search filter
            if (searchTerm && !item.name.toLowerCase().includes(searchTerm.toLowerCase())) {
                return false;
            }
            // Apply category filter
            if (categoryFilter !== 'all' && item.category !== categoryFilter) {
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
        return <div className={classes.loading}>Loading popular items...</div>;
    }

    if (error) {
        return <div className={classes.error}>{error}</div>;
    }

    return (
        <div className={classes.popularItemsContainer}>
            <h2>Popular Items</h2>

            <div className={classes.filters}>
                <div className={classes.searchFilter}>
                    <input
                        type="text"
                        placeholder="Search items..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={classes.searchInput}
                    />
                </div>

                <div className={classes.categoryFilter}>
                    <label htmlFor="category">Category:</label>
                    <select
                        id="category"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className={classes.select}
                    >
                        {categories.map(category => (
                            <option key={category} value={category}>
                                {category.charAt(0).toUpperCase() + category.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className={classes.tableWrapper}>
                <table className={classes.popularItemsTable}>
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th onClick={() => handleSort('name')} className={classes.sortable}>
                                Item Name
                                {sortConfig.key === 'name' && (
                                    <span>{sortConfig.direction === 'asc' ? ' ▲' : ' ▼'}</span>
                                )}
                            </th>
                            <th onClick={() => handleSort('quantity')} className={classes.sortable}>
                                Quantity Sold
                                {sortConfig.key === 'quantity' && (
                                    <span>{sortConfig.direction === 'asc' ? ' ▲' : ' ▼'}</span>
                                )}
                            </th>
                            <th onClick={() => handleSort('revenue')} className={classes.sortable}>
                                Revenue
                                {sortConfig.key === 'revenue' && (
                                    <span>{sortConfig.direction === 'asc' ? ' ▲' : ' ▼'}</span>
                                )}
                            </th>
                            <th>Price</th>
                            <th onClick={() => handleSort('category')} className={classes.sortable}>
                                Category
                                {sortConfig.key === 'category' && (
                                    <span>{sortConfig.direction === 'asc' ? ' ▲' : ' ▼'}</span>
                                )}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedAndFilteredItems.map((item, index) => (
                            <tr key={item.id} className={index % 2 === 0 ? classes.evenRow : classes.oddRow}>
                                <td>
                                    <img
                                        src={`http://localhost:3000/${item.image}`}
                                        alt={item.name}
                                        className={classes.itemImage}
                                    />
                                </td>
                                <td>{item.name}</td>
                                <td>{item.quantity}</td>
                                <td>{currencyFormatter.format(item.revenue / 100)}</td>
                                <td>{currencyFormatter.format(item.price / 100)}</td>
                                <td>{item.category}</td>
                            </tr>
                        ))}
                        {sortedAndFilteredItems.length === 0 && (
                            <tr>
                                <td colSpan="6" className={classes.noResults}>No items match your search criteria</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className={classes.actionButtons}>
                <button className={classes.actionButton}>Download Data</button>
                <button className={classes.actionButton}>View All Items</button>
            </div>
        </div>
    );
}
