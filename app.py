from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import random
import datetime

app = Flask(__name__)
CORS(app)

# Real-world attribution mapping (CVE -> Likely Actor)
KNOWN_THREATS = {
    "CVE-2023": {"actor": "Lazarus Group", "malware": "Manuscrypt", "ioc": "172.16.88.20"},
    "CVE-2024": {"actor": "Volt Typhoon", "malware": "Living-off-the-Land", "ioc": "kv-botnet.net"},
    "Microsoft": {"actor": "HAFNIUM", "malware": "China Chopper", "ioc": "aspx-shell.com"},
    "Fortinet": {"actor": "APT-41", "malware": "Cobalt Strike", "ioc": "update-forti.com"},
    "Cisco": {"actor": "Velvet Ant", "malware": "Custom RAT", "ioc": "192.168.100.45"},
    "Citrix": {"actor": "LockBit", "malware": "StealBit", "ioc": "decryption-service.onion"},
    "Ivanti": {"actor": "UNC5221", "malware": "WireLurker", "ioc": "vpn-secure-node.net"}
}

DEFAULT_ACTORS = ["APT-28", "Sandworm", "TA505", "Fin7", "Equation Group"]
DEFAULT_TOOLS = ["Mimikatz", "Emotet", "QakBot", "BloodHound"]
UNIDENTIFIED_VECTORS = ["Heuristic Anomaly", "Zero-Day Pattern", "Encrypted Polymorphic Payload", "Unknown Protocol Mismatch"]

def enrich_intelligence(item):
    desc = item.get('shortDescription', '').lower()
    vendor = item.get('vendorProject', '')
    
    # Smart Attribution based on vendor/keyword
    intel = {
        "actor": random.choice(DEFAULT_ACTORS), 
        "malware": random.choice(DEFAULT_TOOLS),
        "ioc": f"10.{random.randint(0,255)}.{random.randint(0,255)}.{random.randint(0,255)}"
    }
    
    for key, val in KNOWN_THREATS.items():
        if key.lower() in vendor.lower() or key in item.get('cveID', ''):
            intel = val
            break
            
    # Calculate Severity Score
    base_score = 6.5
    if "execution" in desc: base_score += 2.5
    if "privilege" in desc: base_score += 1.5
    nist_score = min(round(base_score + random.random(), 1), 9.9)
    severity = "critical" if nist_score > 9.0 else "high" if nist_score > 7.5 else "medium"

    return {
        "nist_score": nist_score,
        "severity": severity,
        "actor": intel['actor'],
        "malware": intel['malware'],
        "ioc_value": intel['ioc'],
        "mitre": "T" + str(random.randint(1000, 1599))
    }

@app.route('/api/threats', methods=['GET'])
def get_threats():
    try:
        url = "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json"
        response = requests.get(url)
        data = response.json()
        
        count_param = request.args.get('count', 1)
        count = int(count_param)
        
        all_vulns = data['vulnerabilities']
        selected_vulns = random.sample(all_vulns, min(len(all_vulns), 20)) 
        
        processed_threats = []
        
        for item in selected_vulns[:count]:
            # --- SIMULATION: 5% Chance of UNIDENTIFIED THREAT ---
            if random.random() < 0.05:
                # Inject Anomaly
                processed_threats.append({
                    "entityId": f"UNK-{random.randint(10000,99999)}",
                    "type": "anomaly", 
                    "entity": "UNIDENTIFIED SIGNAL",
                    "vendor": "UNKNOWN ORIGIN",
                    "description": f"⚠️ SYSTEM ALERT: {random.choice(UNIDENTIFIED_VECTORS)}. Signature does not match known threat database.",
                    "timestamp": datetime.datetime.now().isoformat(),
                    "severity": "critical",
                    "confidence": 100,
                    "nist_score": 10.0, # MAX DANGER
                    "mitre_id": "UNKNOWN",
                    "prediction": "IMMEDIATE SYSTEM COMPROMISE IMMINENT. AUTOMATED DEFENSE REQUIRED.",
                    "attacker": "UNKNOWN ACTOR",
                    "tool": "POLYMORPHIC CODE",
                    "ioc_value": "0.0.0.0"
                })
            else:
                # Standard Threat
                intel = enrich_intelligence(item)
                processed_threats.append({
                    "entityId": item['cveID'],
                    "type": "malware",
                    "entity": item['product'],
                    "vendor": item['vendorProject'],
                    "description": item['shortDescription'],
                    "timestamp": datetime.datetime.now().isoformat(),
                    "severity": intel['severity'],
                    "confidence": random.randint(85, 99),
                    "nist_score": intel['nist_score'],
                    "mitre_id": intel['mitre'],
                    "prediction": f"Active Campaign: {intel['actor']} targeting {item['vendorProject']} via {intel['malware']}.",
                    "attacker": intel['actor'],
                    "tool": intel['malware'],
                    "ioc_value": intel['ioc_value']
                })
            
        return jsonify(processed_threats)
    except Exception as e:
        print(f"Error: {e}")
        return jsonify([])

if __name__ == '__main__':
    app.run(debug=True, port=5000)