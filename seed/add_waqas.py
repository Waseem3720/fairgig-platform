import os
import psycopg2
from datetime import datetime
from passlib.context import CryptContext
from dotenv import load_dotenv

load_dotenv()
AUTH_DB_URL = os.getenv("AUTH_DB_URL", "postgresql://postgres:waseem591@localhost:5432/auth_db")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def add_waqas():
    try:
        conn = psycopg2.connect(AUTH_DB_URL)
        c = conn.cursor()
        
        now = datetime.now()
        hashed_pw = hash_password("password123")
        email = "wasqas@gmail.com"  # Using wasqas based on user request spelling
        
        # Check if exists
        c.execute("SELECT COUNT(*) FROM users WHERE email=%s", (email,))
        if c.fetchone()[0] > 0:
            print(f"User {email} already exists.")
        else:
            c.execute('''
                INSERT INTO users (full_name, email, hashed_password, role, city, platform, is_active, created_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            ''', ("Wasqas", email, hashed_pw, "worker", "Lahore", "Careem", True, now))
            conn.commit()
            print(f"Worker 'Wasqas' with email {email} and password 'password123' added successfully!")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if 'conn' in locals() and conn:
            c.close()
            conn.close()

if __name__ == "__main__":
    add_waqas()
