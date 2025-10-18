
from langchain_core.prompts import PromptTemplate


class LLMService:
    """A service class to simulate Generative AI text generation."""
    def invoke(self, prompt: str) -> str:

        product_details = prompt.split('Title: ')[-1].split(', Material: ')[0]
        return f"An exquisite piece blending form and function. This {product_details} is designed for unparalleled luxury and comfort, elevating any space instantly."

llm_mock = LLMService()

def generate_marketing_description(title: str, material: str, color: str) -> str:
    """
    Uses a LangChain prompt to generate a creative marketing description.
    """
    prompt_template = PromptTemplate.from_template(
        "Generate a concise, 30-word marketing description for a product "
        "with Title: {title}, Material: {material}, and Color: {color}. "
        "The tone must be luxurious and emphasize design quality."
    )

    prompt = prompt_template.format(title=title, material=material, color=color)


    response = llm_mock.invoke(prompt)

    return response