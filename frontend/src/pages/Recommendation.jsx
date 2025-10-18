
import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/recommend';

function Recommendation() {
    const [query, setQuery] = useState('');
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);
    // Initialize the chat history with an opening message from the AI
    const [chatHistory, setChatHistory] = useState([
        { sender: 'AI', message: 'Welcome! Describe the furniture you are looking for (e.g., "a large modern leather sofa").' }
    ]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        const userQuery = query.trim();
        setQuery('');
        setLoading(true);

        // Add user message to history
        setChatHistory(prev => [...prev, { sender: 'User', message: userQuery }]);

        try {
            // Call the FastAPI endpoint with the user's query
            const response = await axios.post(API_URL, { query: userQuery });
            setRecommendations(response.data);

            // Add AI response to history
            setChatHistory(prev => [
                ...prev, 
                { sender: 'AI', message: `Found ${response.data.length} semantic matches for your request.` }
            ]);
        } catch (error) {
            console.error("API Error:", error);
            setChatHistory(prev => [
                ...prev, 
                { sender: 'AI', message: 'Error: Could not fetch recommendations. Please ensure the FastAPI server is running.' }
            ]);
            setRecommendations([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>AI Product Recommendation Chat</h2>
            
            {/* Chat History Container: Displays the back-and-forth conversation */}
            <div style={{ height: '300px', overflowY: 'auto', border: '1px solid #ccc', padding: '15px', marginBottom: '20px', borderRadius: '8px', backgroundColor: '#fff' }}>
                {chatHistory.map((chat, index) => (
                    <div key={index} style={{ marginBottom: '10px', textAlign: chat.sender === 'User' ? 'right' : 'left' }}>
                        <span style={{ 
                            display: 'inline-block',
                            maxWidth: '70%',
                            padding: '10px 15px',
                            borderRadius: '18px',
                            backgroundColor: chat.sender === 'User' ? '#007bff' : '#e6e6e6',
                            color: chat.sender === 'User' ? 'white' : '#333',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}>
                            {chat.message}
                        </span>
                    </div>
                ))}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px' }}>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Type your product query here..."
                    style={{ flexGrow: 1, padding: '12px', borderRadius: '6px', border: '1px solid #ccc' }}
                    disabled={loading}
                />
                <button 
                    type="submit" 
                    style={{ padding: '12px 25px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                    disabled={loading}
                >
                    {loading ? 'Searching...' : 'Recommend'}
                </button>
            </form>

            {/* Recommendations Display */}
            {recommendations.length > 0 && (
                <div style={{ marginTop: '30px' }}>
                    <h3>Recommendations:</h3>
                    {recommendations.map(product => (
                        <div key={product.uniq_id} className="recommendation-card">
                            <img 
                                // Uses the first image URL from the product data
                                src={product.image_url || 'https://via.placeholder.com/150?text=No+Image'} 
                                alt={product.title} 
                                onError={(e) => e.target.src = 'https://via.placeholder.com/150?text=Image+Error'} 
                            />
                            <div style={{ flex: 1 }}>
                                <h4>{product.title} ({product.brand})</h4>
                                <p><strong>Price:</strong> {product.price}</p>
                                <p><strong>Details:</strong> {product.material} / {product.color}</p>
                                <p>
                                    <strong style={{ color: '#007bff' }}>AI-Generated Description:</strong> 
                                    {/* This safely renders the HTML/Markdown output from your GenAI service */}
                                    <span dangerouslySetInnerHTML={{ __html: product.genai_description }} />
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Recommendation;