import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))

DB_URL = os.getenv("DATABASE_URL")
if not DB_URL or "postgresql" not in DB_URL:
    print("Invalid or missing DATABASE_URL for PostgreSQL.")
    exit(1)

# Extract connection details
import urllib.parse
parsed = urllib.parse.urlparse(DB_URL)
user = parsed.username
password = parsed.password
host = parsed.hostname
port = parsed.port
dbname = parsed.path.lstrip('/')

try:
    # Connect to the default 'postgres' database to create a new DB
    conn = psycopg2.connect(
        dbname='postgres',
        user=user,
        password=password,
        host=host,
        port=port
    )
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cursor = conn.cursor()

    # Check if database exists
    cursor.execute(f"SELECT 1 FROM pg_catalog.pg_database WHERE datname = '{dbname}'")
    exists = cursor.fetchone()

    if not exists:
        cursor.execute(f"CREATE DATABASE {dbname}")
        print(f"Database '{dbname}' created successfully.")
    else:
        print(f"Database '{dbname}' already exists.")

    cursor.close()
    conn.close()

except Exception as e:
    print(f"An error occurred: {e}")
    exit(1)
