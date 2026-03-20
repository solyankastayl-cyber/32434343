#!/usr/bin/env python3
"""
Backend Test for TA Render Recovery
====================================

Tests all 6 timeframes for render-plan-v2 endpoint:
- 4H, 1D, 7D, 30D, 180D, 1Y
- Pattern status validation (no_active_figure/active_figure)
- Execution status with reason and detail
"""

import requests
import sys
import json
from datetime import datetime

class TARenderRecoveryTester:
    def __init__(self, base_url="https://tech-analyzer-12.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.results = []

    def log_result(self, test_name, passed, details):
        """Log test result"""
        self.tests_run += 1
        if passed:
            self.tests_passed += 1
        
        result = {
            "test": test_name,
            "passed": passed,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.results.append(result)
        
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status} {test_name}: {details}")

    def test_timeframe_endpoint(self, symbol, timeframe):
        """Test single timeframe endpoint"""
        endpoint = f"/api/ta-engine/render-plan-v2/{symbol}"
        url = f"{self.base_url}{endpoint}"
        
        try:
            response = requests.get(url, params={"timeframe": timeframe}, timeout=30)
            
            if response.status_code != 200:
                self.log_result(f"TF_{timeframe}_status", False, f"HTTP {response.status_code}")
                return None
            
            data = response.json()
            
            # Basic response validation
            if not data.get("ok"):
                self.log_result(f"TF_{timeframe}_ok", False, f"Response not OK: {data.get('error', 'Unknown error')}")
                return None
            
            self.log_result(f"TF_{timeframe}_status", True, f"HTTP 200, response OK")
            return data
            
        except requests.RequestException as e:
            self.log_result(f"TF_{timeframe}_status", False, f"Request failed: {str(e)}")
            return None

    def validate_render_plan_structure(self, data, timeframe):
        """Validate render plan structure"""
        render_plan = data.get("render_plan")
        if not render_plan:
            self.log_result(f"TF_{timeframe}_structure", False, "No render_plan in response")
            return False

        required_layers = ["market_state", "structure", "indicators", "patterns", "liquidity", "execution"]
        missing_layers = []
        
        for layer in required_layers:
            if layer not in render_plan:
                missing_layers.append(layer)
        
        if missing_layers:
            self.log_result(f"TF_{timeframe}_structure", False, f"Missing layers: {missing_layers}")
            return False
        
        self.log_result(f"TF_{timeframe}_structure", True, "All 6 layers present")
        return True

    def validate_pattern_status(self, data, timeframe):
        """Validate pattern status and reason"""
        render_plan = data.get("render_plan", {})
        patterns = render_plan.get("patterns", {})
        
        if not patterns:
            self.log_result(f"TF_{timeframe}_pattern_status", False, "No patterns layer found")
            return False

        # Check status field
        status = patterns.get("status")
        if status not in ["no_active_figure", "active_figure"]:
            self.log_result(f"TF_{timeframe}_pattern_status", False, f"Invalid status: {status}")
            return False

        # If no active figure, should have reason
        if status == "no_active_figure":
            reason = patterns.get("reason")
            if not reason:
                self.log_result(f"TF_{timeframe}_pattern_reason", False, "No reason provided for no_active_figure")
                return False
            else:
                self.log_result(f"TF_{timeframe}_pattern_reason", True, f"Reason: {reason}")
        
        self.log_result(f"TF_{timeframe}_pattern_status", True, f"Status: {status}")
        return True

    def validate_execution_detail(self, data, timeframe):
        """Validate execution status, reason, and detail"""
        render_plan = data.get("render_plan", {})
        execution = render_plan.get("execution", {})
        
        if not execution:
            self.log_result(f"TF_{timeframe}_execution", False, "No execution layer found")
            return False

        # Check status
        status = execution.get("status")
        if status not in ["valid", "waiting", "no_trade"]:
            self.log_result(f"TF_{timeframe}_execution_status", False, f"Invalid execution status: {status}")
            return False

        # Check reason exists
        reason = execution.get("reason")
        if not reason:
            self.log_result(f"TF_{timeframe}_execution_reason", False, "No execution reason provided")
            return False

        # Check detail exists (especially for no_trade)
        detail = execution.get("detail")
        if not detail:
            self.log_result(f"TF_{timeframe}_execution_detail", False, "No execution detail provided")
            return False

        self.log_result(f"TF_{timeframe}_execution", True, f"Status: {status}, Reason: {reason[:50]}..., Detail: {detail[:50]}...")
        return True

    def test_all_timeframes(self, symbol="BTC"):
        """Test all 6 timeframes"""
        timeframes = ["4H", "1D", "7D", "30D", "180D", "1Y"]
        
        print(f"\n🔍 Testing TA Render Recovery for {symbol}")
        print("=" * 60)
        
        for tf in timeframes:
            print(f"\n📊 Testing Timeframe: {tf}")
            print("-" * 30)
            
            # Test endpoint
            data = self.test_timeframe_endpoint(symbol, tf)
            if not data:
                continue
                
            # Validate structure
            self.validate_render_plan_structure(data, tf)
            
            # Validate pattern status
            self.validate_pattern_status(data, tf)
            
            # Validate execution detail
            self.validate_execution_detail(data, tf)

    def run_comprehensive_test(self):
        """Run full test suite"""
        print("🚀 Starting TA Render Recovery Test Suite")
        print("Testing all 6 timeframes: 4H, 1D, 7D, 30D, 180D, 1Y")
        
        # Test BTC across all timeframes
        self.test_all_timeframes("BTC")
        
        print(f"\n📊 Test Summary")
        print("=" * 50)
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed / self.tests_run * 100):.1f}%" if self.tests_run > 0 else "N/A")
        
        # Show detailed results
        if self.tests_run != self.tests_passed:
            print(f"\n❌ Failed Tests:")
            for result in self.results:
                if not result["passed"]:
                    print(f"  - {result['test']}: {result['details']}")
        
        return self.tests_passed == self.tests_run

def main():
    tester = TARenderRecoveryTester()
    success = tester.run_comprehensive_test()
    
    # Save results for analysis
    with open("/app/test_results_ta_render.json", "w") as f:
        json.dump({
            "summary": {
                "total_tests": tester.tests_run,
                "passed_tests": tester.tests_passed,
                "success_rate": tester.tests_passed / tester.tests_run * 100 if tester.tests_run > 0 else 0,
                "timestamp": datetime.now().isoformat()
            },
            "detailed_results": tester.results
        }, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())