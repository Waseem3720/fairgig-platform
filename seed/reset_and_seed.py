import os
import psycopg2
from datetime import datetime
from passlib.context import CryptContext
from dotenv import load_dotenv

load_dotenv()
AUTH_DB_URL = os.getenv("AUTH_DB_URL", "postgresql://postgres:waseem591@localhost:5432/auth_db")
EARNINGS_DB_URL = os.getenv("EARNINGS_DB_URL", "postgresql://postgres:waseem591@localhost:5432/earnings_db")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def reset_and_seed():
    now = datetime.now()
    hashed_pw = hash_password("password123")
    
    # ---------------------------------------------------------
    # 1. RESET AND SEED AUTH DATABASE
    # ---------------------------------------------------------
    print("Connecting to Auth DB to reset and re-seed...")
    try:
        conn = psycopg2.connect(AUTH_DB_URL)
        c = conn.cursor()
        
        # Truncate all data
        c.execute("TRUNCATE TABLE users RESTART IDENTITY CASCADE;")
        print("Truncated all existing users.")
        
        # Insert Waseem (Worker)
        c.execute('''
            INSERT INTO users (full_name, email, hashed_password, role, city, platform, is_active, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        ''', ("Waseem", "waseem@gmail.com", hashed_pw, "worker", "Lahore", "Careem", True, now))
        
        # Insert Wasqas (Worker)
        c.execute('''
            INSERT INTO users (full_name, email, hashed_password, role, city, platform, is_active, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        ''', ("Wasqas", "wasqas@gmail.com", hashed_pw, "worker", "Islamabad", "Foodpanda", True, now))
        
        # Insert Mubisher (Verifier)
        c.execute('''
            INSERT INTO users (full_name, email, hashed_password, role, is_active, created_at)
            VALUES (%s, %s, %s, %s, %s, %s)
        ''', ("Mubisher", "mubisher@fairgig.com", hashed_pw, "verifier", True, now))
        
        # Insert Adnan (Advocate)
        c.execute('''
            INSERT INTO users (full_name, email, hashed_password, role, is_active, created_at)
            VALUES (%s, %s, %s, %s, %s, %s)
        ''', ("Adnan", "adnan@fairgig.com", hashed_pw, "advocate", True, now))
        
        conn.commit()
        print("4 new users (Waseem, Wasqas, Mubisher, Adnan) seeded successfully!")
    except Exception as e:
        print(f"Error seeding Auth DB: {e}")
    finally:
        if 'conn' in locals() and conn:
            c.close()
            conn.close()

    # ---------------------------------------------------------
    # 2. RESET EARNINGS DATABASE
    # ---------------------------------------------------------
    print("Connecting to Earnings DB to reset data...")
    try:
        conn_earn = psycopg2.connect(EARNINGS_DB_URL)
        c_earn = conn_earn.cursor()
        
        # Truncate shifting data
        c_earn.execute("TRUNCATE TABLE shift_logs RESTART IDENTITY CASCADE;")
        print("Truncated all existing shift logs.")
        
        conn_earn.commit()
        print("Earnings DB reset completed. Currently empty and waiting for manual testing.")
    except Exception as e:
        print(f"Error resetting Earnings DB: {e}")
    finally:
        if 'conn_earn' in locals() and conn_earn:
            c_earn.close()
            conn_earn.close()

if __name__ == "__main__":
    reset_and_seed()
