
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
from recommender import recommender
from genai_service import generate_marketing_description


class RecommendationRequest(BaseModel):
    query: str

class ProductItem(BaseModel):
    uniq_id: str
    title: str
    brand: str
    price: str
    material: str
    color: str
    image_url: str
    genai_description: str

class AnalyticsData(BaseModel):
    product_count_by_brand: Dict[str, int]
    avg_price_by_country: Dict[str, float]
    top_materials: Dict[str, int]


app = FastAPI(title="AI Product Recommendation API")


origins = [
    "http://localhost:5173",  
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    """Returns a status message."""
    return {"status": "AI Product Recommendation API is running."}

@app.post("/api/recommend", response_model=List[ProductItem])
def get_recommendations(request: RecommendationRequest):
    """
    Handles semantic search (ML/NLP) and enriches results with GenAI descriptions (LangChain).
    """
    if not recommender or recommender.df.empty:
        raise HTTPException(status_code=503, detail="Service Unavailable: Data not loaded or recommender failed to initialize.")


    recommended_products = recommender.get_recommendations(request.query)

  
    results_with_genai = []
    for product in recommended_products:
        genai_desc = generate_marketing_description(
            title=product['title'],
            material=product['material'],
            color=product['color']
        )
        product['genai_description'] = genai_desc
        results_with_genai.append(product)

    return results_with_genai

@app.get("/api/analytics", response_model=AnalyticsData)
def get_analytics():
    """
    Retrieves pre-calculated analytics for the dashboard visualization.
    """
    if not recommender or recommender.df.empty:
        raise HTTPException(status_code=503, detail="Service Unavailable: Data not loaded or recommender failed to initialize.")

    analytics_data = recommender.get_analytics()
    return analytics_data