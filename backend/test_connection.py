from app.core.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    test = conn.execute(text("SELECT version();"))
    print(test.fetchone())
    