import os
from dotenv import load_dotenv

load_dotenv()

DEFAULT_MODEL = os.getenv("OLLAMA_MODEL", "gemma2:2b")
DEBUG_MODE = True
CLUSTER_DISTANCE_THRESHOLD = 0.5
