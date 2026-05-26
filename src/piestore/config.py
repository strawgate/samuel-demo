import os

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Pydantic AI Gateway (primary)
    model: str = "gateway/google-cloud:gemini-2.5-flash"
    pydantic_ai_gateway_api_key: str = ""

    # Legacy: Direct Vertex AI (fallback if gateway key not set)
    google_application_credentials: str = ""
    vertex_model: str = "gemini-2.5-flash"
    vertex_project: str = "pydantic-platform"
    vertex_location: str = "us-central1"

    # Postgres (local in container)
    database_url: str = "postgresql://piestore:piestore@localhost:5432/piestore"

    # Admin auth - simple token
    admin_token: str = "demo-admin-token"

    # App
    public_base_url: str = "http://localhost:8000"

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()

# pydantic-ai gateway provider reads directly from os.environ
if settings.pydantic_ai_gateway_api_key:
    os.environ.setdefault("PYDANTIC_AI_GATEWAY_API_KEY", settings.pydantic_ai_gateway_api_key)
