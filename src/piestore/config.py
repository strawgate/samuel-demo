from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Vertex AI - either use service account JSON or gateway endpoints
    google_application_credentials: str = ""
    vertex_model: str = "gemini-2.5-flash"
    vertex_project: str = "pydantic-platform"
    vertex_location: str = "us-central1"

    # Logfire AI Gateway endpoints (optional, for DLP modes)
    vertex_endpoint_enforce: str = ""
    vertex_endpoint_observe: str = ""
    vertex_api_key: str = ""

    # Postgres (local in container)
    database_url: str = "postgresql://piestore:piestore@localhost:5432/piestore"

    # Admin auth - simple token
    admin_token: str = "demo-admin-token"

    # App
    public_base_url: str = "http://localhost:8000"

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
