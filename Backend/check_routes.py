import sys
from app import app

with app.app_context():
    print("Registered Routes:")
    for rule in app.url_map.iter_rules():
        print(f"{rule.endpoint}: {rule.rule} ({','.join(rule.methods)})")
