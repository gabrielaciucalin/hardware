import psutil
import requests
import socket
import uuid
import time
import platform
import subprocess

print("[DEBUG] Module loaded")

# CONFIG
DEFAULT_PORT = 5000
SERVER_IP = input("Introduceți IP-ul serverului Flask (ex: 192.168.1.100): ").strip()
BACKEND_URL = f"http://{SERVER_IP}:{DEFAULT_PORT}/api/hardware"
MACHINE_ID = str(uuid.getnode())
INTERVAL_SEC = 60


def get_internal_ip():
    try:
        return socket.gethostbyname(socket.gethostname())
    except:
        return "N/A"

def get_external_ip():
    try:
        print("[DEBUG] Getting external IP...")
        return requests.get("https://api.ipify.org").text
    except Exception as e:
        print("[ERROR] External IP failed:", e)
        return "N/A"


# CONFIG

def get_internal_ip():
    try:
        return socket.gethostbyname(socket.gethostname())
    except:
        return "N/A"

def get_external_ip():
    try:
        return requests.get("https://api.ipify.org").text
    except:
        return "N/A"

def get_smart_status():
    try:
        result = subprocess.check_output("wmic diskdrive get status", shell=True)
        result = result.decode().strip().split("\n")[1:]
        return all("OK" in status for status in result)
    except:
        return False

def collect_data():
    cpu_freq = psutil.cpu_freq()
    battery = psutil.sensors_battery()
    net_io = psutil.net_io_counters()

    data = {
        "machine_id": MACHINE_ID,
        "cpu_cores_usage": psutil.cpu_percent(percpu=True),
        "cpu_frequency": cpu_freq.current if cpu_freq else None,
        "cpu_voltage": None,  
        "active_processes": len(psutil.pids()),

        "ram_used": round(psutil.virtual_memory().used / 1024 / 1024),  # MB
        "ram_free": round(psutil.virtual_memory().available / 1024 / 1024),  # MB
        "swap_used": round(psutil.swap_memory().used / 1024 / 1024),  # MB

        "storage_used": round(psutil.disk_usage('/').used / (1024 ** 3)),  # GB
        "smart_status": "OK" if get_smart_status() else "NOT OK",
        "storage_temp": None,  

        "read_write_rate": "N/A",  

        "net_upload": round(net_io.bytes_sent / (1024 * 1024)),  # total MB urcat
        "net_download": round(net_io.bytes_recv / (1024 * 1024)),  # total MB descărcat
        "ip_internal": get_internal_ip(),
        "ip_external": get_external_ip(),
        "net_total_usage": round((net_io.bytes_sent + net_io.bytes_recv) / (1024 * 1024)),  # MB
        "net_packets_sent": net_io.packets_sent,
        "net_packets_received": net_io.packets_recv,

        "battery_level": battery.percent if battery else None,
        "battery_status": "Charging" if battery and battery.power_plugged else "Not Charging"
    }

    return data

def send_data():
    data = collect_data()
    try:
        res = requests.post(BACKEND_URL, json=data)
        print(f"[INFO] Data sent: {res.status_code} - {res.text}")
    except Exception as e:
        print(f"[ERROR] Could not send data: {e}")

def run_loop():
    while True:
        send_data()
        time.sleep(INTERVAL_SEC)

if __name__ == "__main__":
    print("[AGENT] Starting hardware monitor agent...")
    run_loop()
