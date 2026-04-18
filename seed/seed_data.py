import os
import random
import psycopg2
from datetime import datetime, timedelta
from passlib.context import CryptContext
from dotenv import load_dotenv

load_dotenv()

# We expect distinct DBs per microservice. We fall back to localhost defaults.
AUTH_DB_URL = os.getenv("AUTH_DB_URL", "postgresql://user:password@localhost:5432/auth_db")
EARNINGS_DB_URL = os.getenv("EARNINGS_DB_URL", "postgresql://user:password@localhost:5432/earnings_db")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

CITIES = ["Lahore", "Karachi", "Islamabad"]
ZONES = {
    "Lahore": ["Gulberg", "DHA", "Johar Town", "Model Town", "Walled City"],
    "Karachi": ["Clifton", "Saddar", "Defence", "Gulshan-e-Iqbal"],
    "Islamabad": ["F-8", "F-10", "G-11", "I-8", "Blue Area"]
}

PLATFORMS = [
    {"name": "Careem", "cat": "ride_hailing", "deduction_rate": 0.25},
    {"name": "Bykea", "cat": "ride_hailing", "deduction_rate": 0.15},
    {"name": "InDrive", "cat": "ride_hailing", "deduction_rate": 0.10},
    {"name": "Foodpanda", "cat": "delivery", "deduction_rate": 0.20},
    {"name": "Cheetay", "cat": "delivery", "deduction_rate": 0.18},
    {"name": "Fiverr", "cat": "freelance", "deduction_rate": 0.20},
    {"name": "Upwork", "cat": "freelance", "deduction_rate": 0.10},
    {"name": "GharPar", "cat": "domestic", "deduction_rate": 0.20}
]

def seed_data():
    now = datetime.now()
    hashed_pw = hash_password("password123")

    # ---------------------------------------------------------
    # 1. SEED AUTH DATABASE
    # ---------------------------------------------------------
    print("Connecting to Auth DB...")
    try:
        conn_auth = psycopg2.connect(AUTH_DB_URL)
        c_auth = conn_auth.cursor()
        
        c_auth.execute("SELECT COUNT(*) FROM users")
        if c_auth.fetchone()[0] > 0:
            print("Auth data already exists. Skipping auth seeding.")
        else:
            print("Seeding Auth Database...")
            # 1 Admin/Advocate
            c_auth.execute('''
                INSERT INTO users (full_name, email, hashed_password, role, is_active, created_at)
                VALUES (%s, %s, %s, %s, %s, %s)
            ''', ("Sana Ahmed", "advocate@fairgig.com", hashed_pw, "advocate", True, now))
            
            # 1 Verifier
            c_auth.execute('''
                INSERT INTO users (full_name, email, hashed_password, role, is_active, created_at)
                VALUES (%s, %s, %s, %s, %s, %s)
            ''', ("Tariq Ali", "verifier@fairgig.com", hashed_pw, "verifier", True, now))

            # 100 Workers
            for i in range(1, 101):
                name = f"Worker {i}"
                city = random.choice(CITIES)
                pl = random.choice(PLATFORMS)
                c_auth.execute('''
                    INSERT INTO users (full_name, email, hashed_password, role, city, platform, is_active, created_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                ''', (name, f"worker{i}@gmail.com", hashed_pw, "worker", city, pl["name"], True, now))

            # Important test user for judges
            c_auth.execute('''
                INSERT INTO users (full_name, email, hashed_password, role, city, platform, is_active, created_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            ''', ("Ahmed", "ahmed@gmail.com", hashed_pw, "worker", "Lahore", "Careem", True, now))
            
            conn_auth.commit()
            print("Auth DB seeding completed.")
    except Exception as e:
        print(f"Error seeding Auth DB: {e}")
    finally:
        if 'conn_auth' in locals() and conn_auth:
            c_auth.close()
            conn_auth.close()

    # ---------------------------------------------------------
    # 2. SEED EARNINGS DATABASE
    # ---------------------------------------------------------
    print("Connecting to Earnings DB...")
    try:
        conn_earn = psycopg2.connect(EARNINGS_DB_URL)
        c_earn = conn_earn.cursor()
        
        c_earn.execute("SELECT COUNT(*) FROM shift_logs")
        if c_earn.fetchone()[0] > 0:
            print("Earnings data already exists. Skipping earnings seeding.")
        else:
            print("Seeding Earnings Database...")
            start_date = now - timedelta(days=90) # Last 3 months
            
            # For workers 3 through 103 (Worker 1...100, Ahmed)
            # Assuming ID auto-increments start at 1
            for w_id in range(3, 104):
                city = random.choice(CITIES)
                zone = random.choice(ZONES[city])
                pl = random.choice(PLATFORMS)
                
                num_shifts = random.randint(20, 40)
                
                for _ in range(num_shifts):
                    shift_date = start_date + timedelta(days=random.randint(0, 89))
                    hours = random.uniform(4.0, 12.0)
                    hourly_gross = random.uniform(300, 600)  # PKR
                    gross = round(hours * hourly_gross, 2)
                    
                    deduction_rate = pl["deduction_rate"]
                    if random.random() < 0.05: # 5% chance of unusually high deduction anomaly
                        deduction_rate += 0.15
                        
                    deductions = round(gross * deduction_rate, 2)
                    net = round(gross - deductions, 2)
                    
                    status = random.choices(["pending", "verified", "disputed"], weights=[20, 70, 10])[0]

                    c_earn.execute('''
                        INSERT INTO shift_logs (worker_id, platform, date, hours_worked, gross_earned, platform_deductions, net_received, city, zone, category, verification_status, created_at)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ''', (w_id, pl["name"], shift_date.strftime("%Y-%m-%d"), hours, gross, deductions, net, city, zone, pl["cat"], status, now))
            
            conn_earn.commit()
            print("Earnings DB seeding completed.")
    except Exception as e:
        print(f"Error seeding Earnings DB: {e}")
    finally:
        if 'conn_earn' in locals() and conn_earn:
            c_earn.close()
            conn_earn.close()
            
    print("Seeding Complete!")

if __name__ == "__main__":
    seed_data()
