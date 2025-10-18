
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';


ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const API_URL = 'http://127.0.0.1:8000/api/analytics';

const getChartColors = (count) => {
    const palette = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1', '#17a2b8'];
    return Array(count).fill().map((_, i) => palette[i % palette.length]);
};

function Analytics() {
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            
            const response = await axios.get(API_URL);
            setAnalyticsData(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching analytics:", error);
            setLoading(false);
        }
    };

    if (loading) return <div style={{textAlign: 'center', padding: '50px'}}>Loading Analytics Dashboard...</div>;
    if (!analyticsData) return <div style={{textAlign: 'center', padding: '50px', color: '#dc3545'}}>Error: Failed to load analytics data. Ensure the FastAPI backend is running.</div>;


    const brandLabels = Object.keys(analyticsData.product_count_by_brand);
    const brandData = {
        labels: brandLabels,
        datasets: [{
            label: 'Product Count',
            data: Object.values(analyticsData.product_count_by_brand),
            backgroundColor: getChartColors(brandLabels.length),
        }]
    };

    
    const countryLabels = Object.keys(analyticsData.avg_price_by_country);
    const countryPriceData = {
        labels: countryLabels,
        datasets: [{
            label: 'Average Price ($)',
            data: Object.values(analyticsData.avg_price_by_country),
            backgroundColor: getChartColors(countryLabels.length)[0], 
        }]
    };
    
  
    const materialLabels = Object.keys(analyticsData.top_materials);
    const materialData = {
        labels: materialLabels,
        datasets: [{
            label: 'Product Count',
            data: Object.values(analyticsData.top_materials),
            backgroundColor: getChartColors(materialLabels.length)[3], 
        }]
    };


    return (
        <div>
            <h2>Product Database Analytics Dashboard</h2>
            <p>Data visualization provides key insights into the current product catalog.</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                
                {/* Chart 1: Top 5 Brands */}
                <div className="chart-container">
                    <h3>Top 5 Brands by Product Count</h3>
                    <Doughnut data={brandData} />
                </div>

                {/* Chart 2: Average Price by Country of Origin */}
                <div className="chart-container">
                    <h3>Average Price by Country of Origin (Top 5)</h3>
                    <Bar data={countryPriceData} />
                </div>
            </div>
            
            {/* Chart 3: Top 5 Materials */}
            <div className="chart-container" style={{ gridColumn: 'span 2' }}>
                <h3>Top 5 Materials Used in Products</h3>
                <Bar data={materialData} />
            </div>
        </div>
    );
}

export default Analytics;