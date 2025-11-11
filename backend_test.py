#!/usr/bin/env python3
"""
LeadFlow Genius Backend API Testing Suite
Tests all API endpoints including authentication, scraping, CRM, campaigns, and AI features
"""

import requests
import sys
import time
import json
from datetime import datetime

class LeadFlowAPITester:
    def __init__(self, base_url="https://mapslead-scraper.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.user_email = "robiulalamsuleman@gmail.com"
        self.user_password = "Robi213058@Ul"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        
    def log_test(self, name, success, details="", error=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {error}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details,
            "error": error,
            "timestamp": datetime.now().isoformat()
        })
        
    def make_request(self, method, endpoint, data=None, expected_status=200):
        """Make HTTP request with proper headers"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'
            
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=30)
            else:
                raise ValueError(f"Unsupported method: {method}")
                
            success = response.status_code == expected_status
            return success, response
            
        except Exception as e:
            return False, str(e)
    
    def test_authentication(self):
        """Test authentication endpoints"""
        print("\n🔐 Testing Authentication...")
        
        # Test login with correct credentials
        success, response = self.make_request('POST', 'auth/login', {
            "email": self.user_email,
            "password": self.user_password,
            "remember_me": False
        })
        
        if success and hasattr(response, 'json'):
            try:
                data = response.json()
                if 'token' in data:
                    self.token = data['token']
                    self.log_test("Login with valid credentials", True, f"Token received: {data['token'][:20]}...")
                else:
                    self.log_test("Login with valid credentials", False, error="No token in response")
            except:
                self.log_test("Login with valid credentials", False, error="Invalid JSON response")
        else:
            self.log_test("Login with valid credentials", False, error=f"Status: {response.status_code if hasattr(response, 'status_code') else 'Request failed'}")
        
        # Test login with invalid credentials
        success, response = self.make_request('POST', 'auth/login', {
            "email": "invalid@email.com",
            "password": "wrongpassword"
        }, expected_status=401)
        
        self.log_test("Login with invalid credentials (should fail)", success)
        
    def test_scraper_endpoints(self):
        """Test lead scraper functionality"""
        print("\n🔍 Testing Lead Scraper...")
        
        if not self.token:
            self.log_test("Scraper tests", False, error="No authentication token")
            return
            
        # Start scraping job
        scraper_data = {
            "keyword": "dentist",
            "location": "New York, NY",
            "has_website": True,
            "has_email": True,
            "min_reviews": 10
        }
        
        success, response = self.make_request('POST', 'scraper/start', scraper_data)
        job_id = None
        
        if success and hasattr(response, 'json'):
            try:
                data = response.json()
                job_id = data.get('job_id')
                self.log_test("Start scraping job", True, f"Job ID: {job_id}")
            except:
                self.log_test("Start scraping job", False, error="Invalid response format")
        else:
            self.log_test("Start scraping job", False, error=f"Status: {response.status_code if hasattr(response, 'status_code') else 'Request failed'}")
        
        # Check job status
        if job_id:
            time.sleep(2)  # Wait for job to start
            success, response = self.make_request('GET', f'scraper/status/{job_id}')
            
            if success and hasattr(response, 'json'):
                try:
                    data = response.json()
                    status = data.get('status', 'unknown')
                    progress = data.get('progress', 0)
                    self.log_test("Get scraper job status", True, f"Status: {status}, Progress: {progress}%")
                except:
                    self.log_test("Get scraper job status", False, error="Invalid response format")
            else:
                self.log_test("Get scraper job status", False, error="Failed to get job status")
        
        # Get all scraper jobs
        success, response = self.make_request('GET', 'scraper/jobs')
        
        if success and hasattr(response, 'json'):
            try:
                jobs = response.json()
                self.log_test("Get scraper jobs list", True, f"Found {len(jobs)} jobs")
            except:
                self.log_test("Get scraper jobs list", False, error="Invalid response format")
        else:
            self.log_test("Get scraper jobs list", False, error="Failed to get jobs list")
    
    def test_leads_endpoints(self):
        """Test CRM/leads functionality"""
        print("\n👥 Testing CRM/Leads...")
        
        if not self.token:
            self.log_test("Leads tests", False, error="No authentication token")
            return
            
        # Get leads list
        success, response = self.make_request('GET', 'leads?limit=10')
        leads = []
        
        if success and hasattr(response, 'json'):
            try:
                data = response.json()
                leads = data.get('leads', [])
                total = data.get('total', 0)
                self.log_test("Get leads list", True, f"Found {len(leads)} leads (total: {total})")
            except:
                self.log_test("Get leads list", False, error="Invalid response format")
        else:
            self.log_test("Get leads list", False, error="Failed to get leads")
        
        # Test lead filtering
        success, response = self.make_request('GET', 'leads?status=New&limit=5')
        
        if success:
            self.log_test("Filter leads by status", True)
        else:
            self.log_test("Filter leads by status", False, error="Failed to filter leads")
        
        # Test lead search
        success, response = self.make_request('GET', 'leads?search=dental&limit=5')
        
        if success:
            self.log_test("Search leads", True)
        else:
            self.log_test("Search leads", False, error="Failed to search leads")
        
        # Update lead status (if we have leads)
        if leads and len(leads) > 0:
            lead_id = leads[0]['id']
            success, response = self.make_request('PUT', f'leads/{lead_id}', {"status": "Emailed"})
            
            if success:
                self.log_test("Update lead status", True, f"Updated lead {lead_id}")
            else:
                self.log_test("Update lead status", False, error="Failed to update lead")
    
    def test_campaigns_endpoints(self):
        """Test email campaigns functionality"""
        print("\n📧 Testing Email Campaigns...")
        
        if not self.token:
            self.log_test("Campaigns tests", False, error="No authentication token")
            return
            
        # Get leads for campaign
        success, response = self.make_request('GET', 'leads?limit=5')
        lead_ids = []
        
        if success and hasattr(response, 'json'):
            try:
                data = response.json()
                leads = data.get('leads', [])
                lead_ids = [lead['id'] for lead in leads[:3]]  # Use first 3 leads
            except:
                pass
        
        # Create campaign
        if lead_ids:
            campaign_data = {
                "name": "Test Campaign",
                "subject": "Test Email Subject",
                "body": "Hello {{business_name}}, this is a test email.",
                "lead_ids": lead_ids,
                "follow_up_enabled": True,
                "follow_up_delay_days": 3
            }
            
            success, response = self.make_request('POST', 'campaigns', campaign_data)
            campaign_id = None
            
            if success and hasattr(response, 'json'):
                try:
                    data = response.json()
                    campaign_id = data.get('campaign_id')
                    self.log_test("Create email campaign", True, f"Campaign ID: {campaign_id}")
                except:
                    self.log_test("Create email campaign", False, error="Invalid response format")
            else:
                self.log_test("Create email campaign", False, error="Failed to create campaign")
        else:
            self.log_test("Create email campaign", False, error="No leads available for campaign")
        
        # Get campaigns list
        success, response = self.make_request('GET', 'campaigns')
        
        if success and hasattr(response, 'json'):
            try:
                campaigns = response.json()
                self.log_test("Get campaigns list", True, f"Found {len(campaigns)} campaigns")
            except:
                self.log_test("Get campaigns list", False, error="Invalid response format")
        else:
            self.log_test("Get campaigns list", False, error="Failed to get campaigns")
    
    def test_ai_endpoints(self):
        """Test AI agent functionality"""
        print("\n🤖 Testing AI Agent...")
        
        if not self.token:
            self.log_test("AI tests", False, error="No authentication token")
            return
            
        # Test AI follow-up generation
        ai_data = {
            "lead_name": "John Smith",
            "business_name": "Elite Dental Clinic",
            "previous_email": "",
            "tone": "Friendly"
        }
        
        success, response = self.make_request('POST', 'ai/generate-follow-up', ai_data)
        
        if success and hasattr(response, 'json'):
            try:
                data = response.json()
                subject = data.get('subject', '')
                body = data.get('body', '')
                if subject and body:
                    self.log_test("AI follow-up generation", True, f"Generated email with subject: '{subject[:50]}...'")
                else:
                    self.log_test("AI follow-up generation", False, error="Missing subject or body in response")
            except:
                self.log_test("AI follow-up generation", False, error="Invalid response format")
        else:
            self.log_test("AI follow-up generation", False, error=f"Status: {response.status_code if hasattr(response, 'status_code') else 'Request failed'}")
    
    def test_analytics_endpoints(self):
        """Test analytics/dashboard functionality"""
        print("\n📊 Testing Analytics...")
        
        if not self.token:
            self.log_test("Analytics tests", False, error="No authentication token")
            return
            
        # Get dashboard analytics
        success, response = self.make_request('GET', 'analytics/dashboard')
        
        if success and hasattr(response, 'json'):
            try:
                data = response.json()
                required_fields = ['total_leads', 'active_campaigns', 'emails_sent', 'open_rate', 'reply_rate']
                missing_fields = [field for field in required_fields if field not in data]
                
                if not missing_fields:
                    self.log_test("Get dashboard analytics", True, f"Total leads: {data['total_leads']}, Campaigns: {data['active_campaigns']}")
                else:
                    self.log_test("Get dashboard analytics", False, error=f"Missing fields: {missing_fields}")
            except:
                self.log_test("Get dashboard analytics", False, error="Invalid response format")
        else:
            self.log_test("Get dashboard analytics", False, error="Failed to get analytics")
    
    def run_all_tests(self):
        """Run all test suites"""
        print("🚀 Starting LeadFlow Genius Backend API Tests")
        print(f"Testing against: {self.base_url}")
        print("=" * 60)
        
        start_time = time.time()
        
        # Run test suites
        self.test_authentication()
        self.test_scraper_endpoints()
        self.test_leads_endpoints()
        self.test_campaigns_endpoints()
        self.test_ai_endpoints()
        self.test_analytics_endpoints()
        
        end_time = time.time()
        duration = end_time - start_time
        
        # Print summary
        print("\n" + "=" * 60)
        print("📋 TEST SUMMARY")
        print("=" * 60)
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Tests Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed / self.tests_run * 100):.1f}%")
        print(f"Duration: {duration:.2f} seconds")
        
        if self.tests_passed < self.tests_run:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  - {result['test']}: {result['error']}")
        
        return self.tests_passed == self.tests_run

def main():
    """Main test runner"""
    tester = LeadFlowAPITester()
    success = tester.run_all_tests()
    
    # Save detailed results
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump({
            'summary': {
                'tests_run': tester.tests_run,
                'tests_passed': tester.tests_passed,
                'success_rate': (tester.tests_passed / tester.tests_run * 100) if tester.tests_run > 0 else 0,
                'timestamp': datetime.now().isoformat()
            },
            'results': tester.test_results
        }, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())