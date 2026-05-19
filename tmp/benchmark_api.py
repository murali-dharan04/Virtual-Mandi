import requests
import time
import statistics

BASE_URL = "https://virtual-mandi.onrender.com"

endpoints = [
    ("/api/ping", "GET"),
    ("/api/test-db", "GET"),
    ("/api/bpp/search", "POST", {"context": {}, "message": {"intent": {"item": {"descriptor": {"name": "tomato"}}}}}),
    ("/api/market-prices?state=dl", "GET"),
    ("/api/suggestions?q=a", "GET")
]

def benchmark():
    print(f"Benchmarking {BASE_URL}...")
    for endpoint, method, *payload in endpoints:
        url = f"{BASE_URL}{endpoint}"
        latencies = []
        for i in range(3):
            start = time.time()
            try:
                if method == "GET":
                    resp = requests.get(url, timeout=10)
                else:
                    resp = requests.post(url, json=payload[0], timeout=10)
                
                latency = time.time() - start
                latencies.append(latency)
                print(f"{method} {endpoint} - Attempt {i+1}: {latency:.2f}s (Status: {resp.status_code})")
            except Exception as e:
                print(f"{method} {endpoint} - Attempt {i+1}: FAILED ({e})")
        
        if latencies:
            print(f"Average {endpoint}: {statistics.mean(latencies):.2f}s\n")

if __name__ == "__main__":
    benchmark()
