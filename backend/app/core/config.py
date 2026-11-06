import os

# Database configuration
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/breakout_radar")

# API settings
API_V1_STR = "/api/v1"
PROJECT_NAME = "Breakout Radar"
