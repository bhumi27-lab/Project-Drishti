from pathlib import Path
import json
from scan_engine import SigmaScanEngine

def test_engine():
    print("==================================================")
    print("   Testing SigmaScanEngine in scan_service        ")
    print("==================================================")
    
    current_dir = Path(__file__).resolve().parent
    rules_path = current_dir / "Rules"
    logs_path = current_dir / "Logs"
    
    # Initialize the engine
    engine = SigmaScanEngine(rules_path, logs_path)
    
    test_attack = "t1003"
    
    print(f"[*] Running targeted scan test for attack: '{test_attack}'")
    result = engine.run_targeted_scan(selected_attack_name=test_attack)
    
    # Pretty-print the structured JSON output
    print("\n==================================================")
    print("           STRUCTURED JSON TELEMETRY OUTPUT        ")
    print("==================================================")
    print(json.dumps(result, indent=2))
    
    print("\n[+] Test Summary:")
    print(f"    - Target Tested : {result.get('target_tested', test_attack)}")
    print(f"    - Status        : {result.get('status', 'unknown').upper()}")
    print(f"    - Raw Matches   : {result.get('raw_matches', 0)}")
    print(f"    - Incidents     : {result.get('total_incidents', 0)}")
    print(f"    - Campaigns     : {result.get('total_campaigns', 0)}")

if __name__ == "__main__":
    test_engine()