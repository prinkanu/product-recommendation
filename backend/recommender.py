
import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer

DATA_PATH = '../intern_data_ikarus.csv' 
EMBEDDING_MODEL = 'all-MiniLM-L6-v2'


class ProductRecommender:
    """
    Handles data loading, embedding generation, semantic search, and analytics calculation.
    """
    def __init__(self):
        self.df = self._load_and_prepare_data()
        self.model = SentenceTransformer(EMBEDDING_MODEL)
        self.product_embeddings = self._generate_embeddings()

    def _load_and_prepare_data(self) -> pd.DataFrame:
        """Loads the CSV, cleans columns, and prepares text features for NLP embeddings."""
        try:
            df = pd.read_csv(DATA_PATH, low_memory=False)
        except FileNotFoundError:
            print(f"Error: Data file not found at {DATA_PATH}")
            return pd.DataFrame()

        if df.empty:
            return df

       
        df['price'] = df['price'].astype(str).str.replace('$', '').str.replace(',', '').str.strip()
        df['price_numeric'] = pd.to_numeric(df['price'], errors='coerce')
        df = df.fillna('Unknown')

        
        df['text_for_embedding'] = df['title'] + " " + df['description'] + " " + df['categories'] + " " + df['material'] + " " + df['color']

    
        df['first_image'] = df['images'].str.split(',').str[0].str.replace("['", "").str.replace("']", "").str.strip()
        return df

    def _generate_embeddings(self) -> np.ndarray:
        """Generates vector embeddings for all products, simulating the Vector Database indexing phase."""
        if self.df.empty:
            return np.array([])

        print("Indexing vectors... This may take a moment.")
        embeddings = self.model.encode(self.df['text_for_embedding'].tolist(), convert_to_tensor=False)
        print("Vector indexing complete.")
        return embeddings

    def get_recommendations(self, user_query: str, top_k: int = 5) -> list:
        """
        Performs Semantic Search using cosine similarity to find the most relevant products.
        """
        if self.df.empty or self.product_embeddings.size == 0:
            return []

     
        query_embedding = self.model.encode([user_query], convert_to_tensor=False)

        similarities = cosine_similarity(query_embedding, self.product_embeddings)[0]

        
        top_indices = np.argsort(similarities)[-top_k:][::-1]
        recommended_products = self.df.iloc[top_indices]

    
        results = []
        for _, row in recommended_products.iterrows():
            results.append({
                "uniq_id": row['uniq_id'],
                "title": row['title'],
                "brand": row['brand'],
                "price": row.get('price', 'N/A'),
                "material": row.get('material', 'N/A'),
                "color": row.get('color', 'N/A'),
                "image_url": row.get('first_image', '')
            })
        return results

    def get_analytics(self) -> dict:
        """Calculates key statistical summaries for the Analytics Dashboard."""
        if self.df.empty:
            return {}

        analytics = {
            "product_count_by_brand": self.df['brand'].value_counts().head(5).to_dict(),
            "avg_price_by_country": self.df.groupby('country_of_origin')['price_numeric'].mean().sort_values(ascending=False).head(5).round(2).to_dict(),
            "top_materials": self.df['material'].value_counts().head(5).to_dict(),
        }
        
        return {k: {str(key).replace('nan', 'Unknown'): v for key, v in val.items()} for k, val in analytics.items()}



recommender = ProductRecommender()