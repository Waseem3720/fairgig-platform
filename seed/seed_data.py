import sqlite3
import os
import random
from datetime import datetime, timedelta
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUTH_DB = os.path.join(BASE_DIR, "services", "auth", "auth.db")
EARNINGS_DB = os.path.join(BASE_DIR, "services", "earnings", "earnings.db")
GRIEVANCE_DB = os.path.join(BASE_DIR, "services", "grievance", "grievance.db")

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

def create_tables():
    # Auth
    conn_auth = sqlite3.connect(AUTH_DB)
    c_auth = conn_auth.cursor()
    c_auth.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            full_name VARCHAR(100) NOT NULL,
            email VARCHAR(150) NOT NULL UNIQUE,
            phone VARCHAR(20),
            hashed_password VARCHAR(255) NOT NULL,
            role VARCHAR(20) NOT NULL,
            city VARCHAR(50),
            platform VARCHAR(50),
            is_active BOOLEAN,
            created_at DATETIME,
            updated_at DATETIME
        )
    ''')
    c_auth.execute('CREATE TABLE IF NOT EXISTS refresh_tokens (id INTEGER PRIMARY KEY, user_id INTEGER, token VARCHAR(500), is_revoked BOOLEAN, created_at DATETIME, expires_at DATETIME)')
    conn_auth.commit()
    conn_auth.close()

    # Earnings
    conn_earn = sqlite3.connect(EARNINGS_DB)
    c_earn = conn_earn.cursor()
    c_earn.execute('''
        CREATE TABLE IF NOT EXISTS shift_logs (
            id INTEGER PRIMARY KEY,
            worker_id INTEGER NOT NULL,
            platform VARCHAR(50) NOT NULL,
            date DATE NOT NULL,
            hours_worked FLOAT NOT NULL,
            gross_earned FLOAT NOT NULL,
            platform_deductions FLOAT NOT NULL,
            net_received FLOAT NOT NULL,
            city VARCHAR(50),
            zone VARCHAR(100),
            category VARCHAR(50),
            notes TEXT,
            screenshot_url VARCHAR(500),
            verification_status VARCHAR(20),
            verified_by INTEGER,
            verification_notes TEXT,
            verified_at DATETIME,
            created_at DATETIME,
            updated_at DATETIME
        )
    ''')
    conn_earn.commit()
    conn_earn.close()

def seed_data():
    print("Seeding Auth Database...")
    conn_auth = sqlite3.connect(AUTH_DB)
    c_auth = conn_auth.cursor()
    
    # Check if empty
    c_auth.execute("SELECT COUNT(*) FROM users")
    if c_auth.fetchone()[0] > 0:
        print("Data already exists. Skipping auth.")
    else:
        # Create users
        hashed_pw = hash_password("password123")
        now = datetime.now()
        
        # 1 Admin/Advocate
        c_auth.execute('''
            INSERT INTO users (full_name, email, hashed_password, role, is_active, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', ("Sana Ahmed", "advocate@fairgig.com", hashed_pw, "advocate", 1, now))
        
        # 1 Verifier
        c_auth.execute('''
            INSERT INTO users (full_name, email, hashed_password, role, is_active, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', ("Tariq Ali", "verifier@fairgig.com", hashed_pw, "verifier", 1, now))

        # 50 Workers
        for i in range(1, 101):
            name = f"Worker {i}"
            city = random.choice(CITIES)
            pl = random.choice(PLATFORMS)
            c_auth.execute('''
                INSERT INTO users (full_name, email, hashed_password, role, city, platform, is_active, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (name, f"worker{i}@gmail.com", hashed_pw, "worker", city, pl["name"], 1, now))

        # Important test user for judges
        c_auth.execute('''
            INSERT INTO users (full_name, email, hashed_password, role, city, platform, is_active, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', ("Ahmed", "ahmed@gmail.com", hashed_pw, "worker", "Lahore", "Careem", 1, now))
        
        conn_auth.commit()

    conn_auth.close()

    print("Seeding Earnings Database...")
    conn_earn = sqlite3.connect(EARNINGS_DB)
    c_earn = conn_earn.cursor()
    
    c_earn.execute("SELECT COUNT(*) FROM shift_logs")
    if c_earn.fetchone()[0] > 0:
        print("Data already exists. Skipping earnings.")
    else:
        now = datetime.now()
        start_date = now - timedelta(days=90) # Last 3 months
        
        # For workers 3 through 103 (Worker 1...100, Ahmed)
        for w_id in range(3, 104):
            city = random.choice(CITIES)
            zone = random.choice(ZONES[city])
            pl = random.choice(PLATFORMS)
            
            # Generate 20-40 shifts per worker
            num_shifts = random.randint(20, 40)
            
            for _ in range(num_shifts):
                shift_date = start_date + timedelta(days=random.randint(0, 89))
                hours = random.uniform(4.0, 12.0)
                hourly_gross = random.uniform(300, 600)  # PKR
                gross = round(hours * hourly_gross, 2)
                
                # Introduce occasional anomalies
                deduction_rate = pl["deduction_rate"]
                if random.random() < 0.05: # 5% chance of unusually high deduction
                    deduction_rate += 0.15
                    
                deductions = round(gross * deduction_rate, 2)
                net = round(gross - deductions, 2)
                
                status = random.choices(["pending", "verified", "disputed"], weights=[20, 70, 10])[0]

                c_earn.execute('''
                    INSERT INTO shift_logs (worker_id, platform, date, hours_worked, gross_earned, platform_deductions, net_received, city, zone, category, verification_status, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (w_id, pl["name"], shift_date.strftime("%Y-%m-%d"), hours, gross, deductions, net, city, zone, pl["cat"], status, now))
        
        conn_earn.commit()
    conn_earn.close()
    print("Seeding Complete!")

if __name__ == "__main__":
    create_tables()
    seed_data()
