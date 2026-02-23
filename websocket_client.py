#!/usr/bin/env python3
"""
WebSocket Client untuk Battery Monitor
Install: pip install websocket-client psycopg2-binary
"""

import websocket
import json
import time
from datetime import datetime
import psycopg2

# ===== CONFIG =====
SERVER_IP = "172.20.10.2"  # IP laptop yang running server
WS_PORT = 8080

# PostgreSQL Config - sesuaikan dengan database kamu
DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'tifa_db',
    'user': 'postgres',
    'password': 'Roger@123#'
}

# Device ID robot (sesuaikan dengan m_device di database)
DEVICE_ID = 1  # Ganti dengan device_id robot yang sesuai

# ===== DATABASE CONNECTION =====
db_conn = None

def get_db_connection():
    """Get or create database connection"""
    global db_conn
    try:
        if db_conn is None or db_conn.closed:
            db_conn = psycopg2.connect(**DB_CONFIG)
            print("[DB] Connected to PostgreSQL")
        return db_conn
    except Exception as e:
        print(f"[DB ERROR] Failed to connect: {e}")
        return None

def save_to_database(battery_data, raw_message):
    """
    Simpan data battery ke tabel h_battery di PostgreSQL.
    
    Struktur tabel h_battery (dari DBeaver):
    - h_battery_id (int8): auto-generated
    - device_id (int8): ID device/robot dari m_device
    - battery_percent (numeric 5,2): persentase baterai
    - voltage (numeric 8,3): tegangan baterai
    - recorded_at (timestamptz): auto-generated dengan default now()
    - raw_payload (jsonb): JSON mentah dari WebSocket
    - current (float8): arus listrik dalam mA
    - cycle_count (int4): jumlah cycle pengisian
    - status (varchar): status baterai
    """
    conn = get_db_connection()
    if conn is None:
        print("[DB ERROR] No database connection")
        return False
    
    try:
        cursor = conn.cursor()
        
        # Extract data dari battery_data
        battery_percent = battery_data.get('battery_percent')
        voltage = battery_data.get('voltage')
        current = battery_data.get('current')
        cycle_count = battery_data.get('cycle_count')
        status = battery_data.get('status')
        
        # Insert ke h_battery dengan semua kolom
        sql = """
            INSERT INTO h_battery (device_id, battery_percent, voltage, raw_payload, current, cycle_count, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING h_battery_id
        """
        
        cursor.execute(sql, (
            DEVICE_ID,
            battery_percent,
            voltage,
            json.dumps(raw_message),  # Simpan raw payload sebagai JSONB
            current,
            cycle_count,
            status
        ))
        
        # Get inserted ID
        battery_id = cursor.fetchone()[0]
        conn.commit()
        cursor.close()
        
        print(f"[DB] Saved to h_battery (ID: {battery_id})")
        return True
        
    except Exception as e:
        print(f"[DB ERROR] Failed to save: {e}")
        if conn:
            conn.rollback()
        return False

# ===== CALLBACK FUNCTIONS =====
def on_message(ws, message):
    """Dipanggil tiap kali terima data dari server"""
    try:
        data = json.loads(message)
        
        if data.get('code') == 'BATTERY':
            battery = data.get('data', {})
            timestamp = datetime.now().strftime('%H:%M:%S')
            
            # Display data
            print(f"[{timestamp}] Battery: {battery.get('battery_percent', 'N/A')}% | "
                  f"{battery.get('voltage', 'N/A')}V | {battery.get('current', 'N/A')}mA | "
                  f"Cycle: {battery.get('cycle_count', 'N/A')} | {battery.get('status', 'N/A')}")
            
            # Simpan ke PostgreSQL
            save_to_database(battery, data)
            
    except json.JSONDecodeError:
        print(f"[ERROR] Invalid JSON: {message}")
    except Exception as e:
        print(f"[ERROR] {e}")

def on_error(ws, error):
    """Dipanggil saat ada error"""
    print(f"[ERROR] {error}")

def on_close(ws, close_status_code, close_msg):
    """Dipanggil saat koneksi ditutup"""
    print(f"[DISCONNECTED] Code: {close_status_code}, Message: {close_msg}")

def on_open(ws):
    """Dipanggil saat koneksi berhasil"""
    print(f"[CONNECTED] to ws://{SERVER_IP}:{WS_PORT}")
    # Test database connection on startup
    get_db_connection()

# ===== MAIN =====
if __name__ == "__main__":
    websocket.enableTrace(False)  # Set True untuk debug
    
    print("=" * 50)
    print("Battery Monitor WebSocket Client")
    print(f"Server: ws://{SERVER_IP}:{WS_PORT}")
    print(f"Database: {DB_CONFIG['database']}@{DB_CONFIG['host']}")
    print(f"Device ID: {DEVICE_ID}")
    print("=" * 50)
    
    ws_url = f"ws://{SERVER_IP}:{WS_PORT}"
    
    ws = websocket.WebSocketApp(
        ws_url,
        on_open=on_open,
        on_message=on_message,
        on_error=on_error,
        on_close=on_close
    )
    
    # Auto-reconnect
    while True:
        try:
            ws.run_forever()
            print("[INFO] Reconnecting in 5 seconds...")
            time.sleep(5)
        except KeyboardInterrupt:
            print("\n[INFO] Stopping client...")
            # Close database connection
            if db_conn and not db_conn.closed:
                db_conn.close()
                print("[DB] Connection closed")
            break
        except Exception as e:
            print(f"[ERROR] {e}")
            time.sleep(5)
