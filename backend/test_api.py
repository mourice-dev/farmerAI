"""Quick test for all FarmerAI API endpoints."""
import requests
import json

BASE = "http://localhost:8000"

# Test 1: Health check
print("=== TEST 1: Health Check ===")
r = requests.get(f"{BASE}/")
print(json.dumps(r.json(), indent=2))

# Test 2: List classes
print("\n=== TEST 2: Classes ===")
r = requests.get(f"{BASE}/api/v1/classes")
data = r.json()
print(f"Total classes: {data['count']}")
print(f"Model: {data['model']}")
print(f"Accuracy: {data['val_accuracy']}")
print(f"First 5: {data['classes'][:5]}")

# Test 3: Disease knowledge
print("\n=== TEST 3: Disease Info (Tomato Late Blight) ===")
r = requests.get(f"{BASE}/api/v1/diseases/Tomato___Late_blight")
info = r.json()
print(f"Disease: {info['common_name']}")
print(f"Severity: {info['severity']}")
print(f"Spread Risk: {info['spread_risk']}")
print(f"Prevention steps: {len(info['prevention'])}")
print(f"Treatment steps: {len(info['treatment'])}")
print(f"Spread prevention steps: {len(info['spread_prevention'])}")

# Test 4: Diagnose with sample leaf image
print("\n=== TEST 4: Diagnose sample_leaf.jpg ===")
with open("sample_leaf.jpg", "rb") as f:
    r = requests.post(
        f"{BASE}/api/v1/diagnose",
        files={"file": ("sample_leaf.jpg", f, "image/jpeg")}
    )
result = r.json()
print(json.dumps(result, indent=2))
top_disease = result.get("diagnosis", {}).get("scientific_label")

# Test 5: Chat Endpoint (grounded on diagnosis & weather)
print("\n=== TEST 5: Chat with LLM (/api/v1/chat) ===")
chat_payload = {
    "message": "My tomato leaves have dark patches with pale halos. What should I spray?",
    "weather": "22°C, 85% humidity, rain expected tonight",
    "farm_context": "Musanze, Rwanda — 0.5 ha",
    "diagnosis_label": top_disease,
    "diagnosis_confidence": 0.95
}
r = requests.post(f"{BASE}/api/v1/chat", json=chat_payload)
if r.status_code == 200:
    chat_res = r.json()
    print(f"Model: {chat_res.get('model')}")
    print(f"Grounded: {chat_res.get('grounded_on_diagnosis')}")
    print(f"Reply snippet:\n{chat_res.get('reply', '')[:300]}...")
elif r.status_code == 503:
    print("[INFO] LLM not yet configured (503). Set DEEPSEEK_API_KEY in backend/.env to activate live chat.")
else:
    print(f"[WARN] Chat returned status {r.status_code}: {r.text}")

# Test 6: Streaming Chat Endpoint (/api/v1/chat/stream)
print("\n=== TEST 6: Streaming Chat (/api/v1/chat/stream) ===")
r = requests.post(f"{BASE}/api/v1/chat/stream", json={"message": "Brief safety tip for spraying"}, stream=True)
if r.status_code == 200:
    print("Stream chunks received:")
    chunk_count = 0
    for line in r.iter_lines():
        if line:
            decoded = line.decode('utf-8')
            if decoded.startswith("data: "):
                chunk_count += 1
                if chunk_count <= 4:
                    print(f"  {decoded}")
    print(f"Total stream packets: {chunk_count}")
elif r.status_code == 503:
    print("[INFO] LLM not yet configured (503).")
else:
    print(f"[WARN] Stream returned status {r.status_code}: {r.text}")

# Test 7: Fusion Endpoint (/api/v1/advise)
print("\n=== TEST 7: Vision + LLM Fusion (/api/v1/advise) ===")
with open("sample_leaf.jpg", "rb") as f:
    r = requests.post(
        f"{BASE}/api/v1/advise",
        files={"file": ("sample_leaf.jpg", f, "image/jpeg")},
        data={
            "message": "Explain this leaf condition and tell me what to do.",
            "weather": "Sunny, 25°C",
            "farm_context": "Huye district, Season B"
        }
    )
if r.status_code == 200:
    advise_res = r.json()
    print("Diagnosis from leaf:", advise_res.get("diagnosis"))
    print(f"Advice snippet:\n{advise_res.get('advice', '')[:250]}...")
elif r.status_code == 503:
    print("[INFO] LLM not yet configured (503).")
else:
    print(f"[WARN] Advise returned status {r.status_code}: {r.text}")

print("\n=== API TEST SUITE FINISHED ===")

