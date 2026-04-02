#!/usr/bin/env python3
"""
Quick test of seed endpoint without running full server.
"""

from __future__ import annotations

import sys
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from app.config import load_settings
from app.seed_data_customers import create_groupama_customers
from scripts.seed_customer360 import seed_applications

if __name__ == "__main__":
    settings = load_settings()
    storage_root = settings.app.storage_root
    
    print(f"Storage root: {storage_root}")
    print("=" * 60)
    
    try:
        print("\n1. Seeding customer profiles and journeys...")
        customer_count = create_groupama_customers(storage_root)
        print(f"   ✓ Created {customer_count} customer profiles")
        
        print("\n2. Seeding applications...")
        app_count = seed_applications(storage_root)
        print(f"   ✓ Created {app_count} applications")
        
        print("\n" + "=" * 60)
        print(f"✓ SUCCESS: Seeded {customer_count} customers + {app_count} applications")
        
    except Exception as e:
        print(f"\n✗ ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
