from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import Request
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import asyncio
import random
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT config
JWT_SECRET = os.environ.get('JWT_SECRET', 'default_secret_key')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_DAYS = 30

# Security
security = HTTPBearer()
start_time = datetime.now(timezone.utc)
VERSION = "v1.0"
# Analytics caching
ANALYTICS_CACHE_TTL = 60  # cache TTL in seconds
analytics_cache = {
    "summary": {"data": None, "timestamp": 0},
    "sources": {"data": None, "timestamp": 0},
    "engagement": {"data": None, "timestamp": 0},
}


app = FastAPI()
api_router = APIRouter(prefix="/api")

# ============= MODELS =============
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    password_hash: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserRegister(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    remember_me: bool = False

class TokenResponse(BaseModel):
    token: str
    email: str

class Lead(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    business_name: str
    address: Optional[str] = None
    website: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    rating: Optional[float] = None
    review_count: Optional[int] = None
    gmb_link: Optional[str] = None
    source: str = "Google Maps"
    status: str = "New"  # New, Emailed, Follow-up, Replied
    notes: Optional[str] = None
    tags: List[str] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_activity: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ScrapingJob(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    keyword: str
    location: str
    filters: Dict[str, Any] = {}
    status: str = "pending"  # pending, running, completed, failed
    progress: int = 0
    total_leads: int = 0
    scraped_leads: int = 0
    results: List[str] = []  # Lead IDs
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: Optional[datetime] = None

class EmailCampaign(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    subject: str
    body: str
    lead_ids: List[str] = []
    status: str = "draft"  # draft, running, completed, paused
    total_emails: int = 0
    sent_count: int = 0
    opened_count: int = 0
    clicked_count: int = 0
    replied_count: int = 0
    follow_up_enabled: bool = True
    follow_up_delay_days: int = 3
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: Optional[datetime] = None

class EmailLog(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    campaign_id: str
    lead_id: str
    status: str = "sent"  # sent, opened, clicked, replied, failed
    sent_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    opened_at: Optional[datetime] = None
    clicked_at: Optional[datetime] = None
    replied_at: Optional[datetime] = None

class StartScraperRequest(BaseModel):
    keyword: str
    location: str
    has_website: Optional[bool] = None
    has_email: Optional[bool] = None
    min_reviews: Optional[int] = None
    data_sources: List[str] = ["Google Maps"]  # Google Maps, Yelp, Facebook Pages, Trustpilot

class AIGenerateRequest(BaseModel):
    lead_name: str
    business_name: str
    previous_email: Optional[str] = None
    tone: str = "Friendly"  # Friendly, Formal, Direct

class CreateCampaignRequest(BaseModel):
    name: str
    subject: str
    body: str
    lead_ids: List[str]
    follow_up_enabled: bool = True
    follow_up_delay_days: int = 3

# ============= MOCK DATA =============
MOCK_LEADS_DATA = [
    {"business_name": "Elite Dental Clinic", "address": "123 Main St, New York, NY", "website": "https://elitedental.com", "email": "info@elitedental.com", "phone": "+1-212-555-0101", "rating": 4.8, "review_count": 234, "gmb_link": "https://g.page/elite-dental", "source": "Google Maps"},
    {"business_name": "Bright Smile Dentistry", "address": "456 Oak Ave, Los Angeles, CA", "website": "https://brightsmile.com", "email": "contact@brightsmile.com", "phone": "+1-323-555-0202", "rating": 4.9, "review_count": 567, "gmb_link": "https://g.page/bright-smile", "source": "Google Maps"},
    {"business_name": "Modern Roofing Solutions", "address": "789 Pine Rd, Chicago, IL", "website": "https://modernroofing.com", "email": "hello@modernroofing.com", "phone": "+1-312-555-0303", "rating": 4.7, "review_count": 189, "gmb_link": "https://g.page/modern-roofing", "source": "Google Maps"},
    {"business_name": "Premium Plumbing Co", "address": "321 Elm St, Houston, TX", "website": "https://premiumplumbing.com", "email": "service@premiumplumbing.com", "phone": "+1-713-555-0404", "rating": 4.6, "review_count": 423, "gmb_link": "https://g.page/premium-plumbing", "source": "Google Maps"},
    {"business_name": "Downtown Law Firm", "address": "654 Market St, San Francisco, CA", "website": "https://downtownlaw.com", "email": "info@downtownlaw.com", "phone": "+1-415-555-0505", "rating": 4.9, "review_count": 312, "gmb_link": "https://g.page/downtown-law", "source": "Google Maps"},
    {"business_name": "Fresh Cafe & Bakery", "address": "987 Broadway, Seattle, WA", "website": "https://freshcafe.com", "email": "orders@freshcafe.com", "phone": "+1-206-555-0606", "rating": 4.5, "review_count": 678, "gmb_link": "https://g.page/fresh-cafe", "source": "Google Maps"},
    {"business_name": "Tech Repair Hub", "address": "147 Tech Blvd, Austin, TX", "website": "https://techrepair.com", "email": "support@techrepair.com", "phone": "+1-512-555-0707", "rating": 4.8, "review_count": 445, "gmb_link": "https://g.page/tech-repair", "source": "Google Maps"},
    {"business_name": "Green Landscaping", "address": "258 Garden Way, Portland, OR", "website": "https://greenlandscape.com", "email": "info@greenlandscape.com", "phone": "+1-503-555-0808", "rating": 4.7, "review_count": 289, "gmb_link": "https://g.page/green-landscape", "source": "Google Maps"},
    {"business_name": "Family Health Clinic", "address": "369 Health Dr, Boston, MA", "website": "https://familyhealth.com", "email": "appointments@familyhealth.com", "phone": "+1-617-555-0909", "rating": 4.9, "review_count": 521, "gmb_link": "https://g.page/family-health", "source": "Google Maps"},
    {"business_name": "Quick Auto Repair", "address": "741 Auto St, Miami, FL", "website": "https://quickauto.com", "email": "service@quickauto.com", "phone": "+1-305-555-1010", "rating": 4.6, "review_count": 334, "gmb_link": "https://g.page/quick-auto", "source": "Google Maps"},
]

# ============= AUTH HELPERS =============
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, email: str, remember_me: bool = False) -> str:
    expiration_days = JWT_EXPIRATION_DAYS if remember_me else 1
    expiration = datetime.now(timezone.utc) + timedelta(days=expiration_days)
    payload = {"user_id": user_id, "email": email, "exp": expiration}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

# ============= AUTH ROUTES =============
@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserRegister):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user = User(
        email=user_data.email,
        password_hash=hash_password(user_data.password)
    )
    user_dict = user.model_dump()
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    await db.users.insert_one(user_dict)
    
    token = create_token(user.id, user.email)
    return TokenResponse(token=token, email=user.email)

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user_doc = await db.users.find_one({"email": credentials.email})
    if not user_doc or not verify_password(credentials.password, user_doc['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user_doc['id'], user_doc['email'], credentials.remember_me)
    return TokenResponse(token=token, email=user_doc['email'])

# ============= SCRAPER ROUTES =============
@api_router.post("/scraper/start")
async def start_scraper(request: StartScraperRequest, current_user: dict = Depends(get_current_user)):
    user_id = current_user['user_id']
    
    # Create scraping job
    job = ScrapingJob(
        user_id=user_id,
        keyword=request.keyword,
        location=request.location,
        filters={
            "has_website": request.has_website,
            "has_email": request.has_email,
            "min_reviews": request.min_reviews
        },
        status="running",
        total_leads=random.randint(50, 100)
    )
    
    job_dict = job.model_dump()
    job_dict['created_at'] = job_dict['created_at'].isoformat()
    await db.scraping_jobs.insert_one(job_dict)
    
    # Start background scraping simulation
    asyncio.create_task(simulate_scraping(job.id, user_id))
    
    return {"job_id": job.id, "status": "started"}

async def simulate_scraping(job_id: str, user_id: str):
    """Simulates scraping with progress updates"""
    job_doc = await db.scraping_jobs.find_one({"id": job_id})
    total = job_doc['total_leads']
    
    for i in range(1, total + 1):
        await asyncio.sleep(0.1)  # Simulate scraping delay
        
        # Create a lead from mock data
        mock_lead = random.choice(MOCK_LEADS_DATA)
        lead = Lead(
            user_id=user_id,
            business_name=f"{mock_lead['business_name']} #{i}",
            address=mock_lead['address'],
            website=mock_lead['website'],
            email=mock_lead['email'],
            phone=mock_lead['phone'],
            rating=mock_lead['rating'],
            review_count=mock_lead['review_count'],
            gmb_link=mock_lead['gmb_link'],
            source=mock_lead['source']
        )
        
        lead_dict = lead.model_dump()
        lead_dict['created_at'] = lead_dict['created_at'].isoformat()
        lead_dict['last_activity'] = lead_dict['last_activity'].isoformat()
        await db.leads.insert_one(lead_dict)
        
        # Update job progress
        await db.scraping_jobs.update_one(
            {"id": job_id},
            {"$set": {"progress": int((i / total) * 100), "scraped_leads": i}, "$push": {"results": lead.id}}
        )
    
    # Mark job as completed
    await db.scraping_jobs.update_one(
        {"id": job_id},
        {"$set": {"status": "completed", "completed_at": datetime.now(timezone.utc).isoformat()}}
    )

@api_router.get("/scraper/status/{job_id}")
async def get_scraper_status(job_id: str, current_user: dict = Depends(get_current_user)):
    job = await db.scraping_jobs.find_one({"id": job_id}, {"_id": 0})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@api_router.get("/scraper/jobs")
async def get_scraper_jobs(current_user: dict = Depends(get_current_user)):
    user_id = current_user['user_id']
    jobs = await db.scraping_jobs.find({"user_id": user_id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return jobs

@api_router.delete("/scraper/job/{job_id}")
async def delete_scraper_job(job_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.scraping_jobs.delete_one({"id": job_id, "user_id": current_user['user_id']})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"message": "Job deleted successfully"}

# ============= LEADS ROUTES =============
@api_router.get("/leads")
async def get_leads(
    skip: int = 0,
    limit: int = 50,
    status: Optional[str] = None,
    source: Optional[str] = None,
    search: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user['user_id']
    query = {"user_id": user_id}
    
    if status:
        query["status"] = status
    if source:
        query["source"] = source
    if search:
        query["$or"] = [
            {"business_name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}}
        ]
    
    leads = await db.leads.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    total = await db.leads.count_documents(query)
    
    return {"leads": leads, "total": total}

@api_router.get("/leads/{lead_id}")
async def get_lead(lead_id: str, current_user: dict = Depends(get_current_user)):
    lead = await db.leads.find_one({"id": lead_id, "user_id": current_user['user_id']}, {"_id": 0})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead

@api_router.put("/leads/{lead_id}")
async def update_lead(lead_id: str, updates: dict, current_user: dict = Depends(get_current_user)):
    updates['last_activity'] = datetime.now(timezone.utc).isoformat()
    result = await db.leads.update_one(
        {"id": lead_id, "user_id": current_user['user_id']},
        {"$set": updates}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"message": "Lead updated successfully"}

@api_router.delete("/leads/{lead_id}")
async def delete_lead(lead_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.leads.delete_one({"id": lead_id, "user_id": current_user['user_id']})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"message": "Lead deleted successfully"}

@api_router.post("/leads/bulk-delete")
async def bulk_delete_leads(lead_ids: List[str], current_user: dict = Depends(get_current_user)):
    result = await db.leads.delete_many({"id": {"$in": lead_ids}, "user_id": current_user['user_id']})
    return {"deleted_count": result.deleted_count}

@api_router.post("/leads/{lead_id}/notes")
async def add_lead_note(lead_id: str, note: dict, current_user: dict = Depends(get_current_user)):
    result = await db.leads.update_one(
        {"id": lead_id, "user_id": current_user['user_id']},
        {"$set": {"notes": note.get('text'), "last_activity": datetime.now(timezone.utc).isoformat()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"message": "Note added successfully"}

@api_router.post("/leads/{lead_id}/tags")
async def add_lead_tags(lead_id: str, tags_data: dict, current_user: dict = Depends(get_current_user)):
    tags = tags_data.get('tags', [])
    result = await db.leads.update_one(
        {"id": lead_id, "user_id": current_user['user_id']},
        {"$set": {"tags": tags, "last_activity": datetime.now(timezone.utc).isoformat()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"message": "Tags updated successfully"}

# ============= CAMPAIGNS ROUTES =============
@api_router.post("/campaigns")
async def create_campaign(request: CreateCampaignRequest, current_user: dict = Depends(get_current_user)):
    campaign = EmailCampaign(
        user_id=current_user['user_id'],
        name=request.name,
        subject=request.subject,
        body=request.body,
        lead_ids=request.lead_ids,
        total_emails=len(request.lead_ids),
        follow_up_enabled=request.follow_up_enabled,
        follow_up_delay_days=request.follow_up_delay_days,
        status="running"
    )
    
    campaign_dict = campaign.model_dump()
    campaign_dict['created_at'] = campaign_dict['created_at'].isoformat()
    await db.campaigns.insert_one(campaign_dict)
    
    # Simulate email sending
    asyncio.create_task(simulate_email_sending(campaign.id))
    
    return {"campaign_id": campaign.id, "status": "started"}

async def simulate_email_sending(campaign_id: str):
    """Simulates email sending with tracking"""
    campaign_doc = await db.campaigns.find_one({"id": campaign_id})
    lead_ids = campaign_doc['lead_ids']
    
    for lead_id in lead_ids:
        await asyncio.sleep(0.5)  # Simulate sending delay
        
        # Create email log
        email_log = EmailLog(
            campaign_id=campaign_id,
            lead_id=lead_id,
            status="sent"
        )
        log_dict = email_log.model_dump()
        log_dict['sent_at'] = log_dict['sent_at'].isoformat()
        await db.email_logs.insert_one(log_dict)
        
        # Simulate some opens and clicks
        if random.random() > 0.4:  # 60% open rate
            await db.email_logs.update_one(
                {"id": email_log.id},
                {"$set": {"status": "opened", "opened_at": datetime.now(timezone.utc).isoformat()}}
            )
            await db.campaigns.update_one({"id": campaign_id}, {"$inc": {"opened_count": 1}})
            
            if random.random() > 0.7:  # 30% click rate
                await db.email_logs.update_one(
                    {"id": email_log.id},
                    {"$set": {"clicked_at": datetime.now(timezone.utc).isoformat()}}
                )
                await db.campaigns.update_one({"id": campaign_id}, {"$inc": {"clicked_count": 1}})
        
        # Update lead status
        await db.leads.update_one(
            {"id": lead_id},
            {"$set": {"status": "Emailed", "last_activity": datetime.now(timezone.utc).isoformat()}}
        )
        
        # Update campaign progress
        await db.campaigns.update_one(
            {"id": campaign_id},
            {"$inc": {"sent_count": 1}}
        )
    
    # Mark campaign as completed
    await db.campaigns.update_one(
        {"id": campaign_id},
        {"$set": {"status": "completed", "completed_at": datetime.now(timezone.utc).isoformat()}}
    )

@api_router.get("/campaigns")
async def get_campaigns(current_user: dict = Depends(get_current_user)):
    user_id = current_user['user_id']
    campaigns = await db.campaigns.find({"user_id": user_id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return campaigns

@api_router.get("/campaigns/{campaign_id}")
async def get_campaign(campaign_id: str, current_user: dict = Depends(get_current_user)):
    campaign = await db.campaigns.find_one({"id": campaign_id, "user_id": current_user['user_id']}, {"_id": 0})
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign

@api_router.delete("/campaigns/{campaign_id}")
async def delete_campaign(campaign_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.campaigns.delete_one({"id": campaign_id, "user_id": current_user['user_id']})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return {"message": "Campaign deleted successfully"}

# ============= AI ROUTES =============
@api_router.post("/ai/generate-follow-up")
async def generate_follow_up(request: AIGenerateRequest, current_user: dict = Depends(get_current_user)):
    try:
        # Get API key from environment
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            raise HTTPException(status_code=500, detail="AI service not configured")
        
        # Create chat instance
        chat = LlmChat(
            api_key=api_key,
            session_id=f"follow_up_{current_user['user_id']}",
            system_message=f"You are an expert email copywriter. Generate compelling follow-up emails in a {request.tone} tone."
        ).with_model("openai", "gpt-4o")
        
        # Generate follow-up
        prompt = f"""Generate a follow-up email for:
Business: {request.business_name}
Contact: {request.lead_name}
Tone: {request.tone}

Provide:
1. Subject line
2. Email body (2-3 paragraphs)

Format as:
SUBJECT: [subject]
BODY: [body]"""
        
        message = UserMessage(text=prompt)
        response = await chat.send_message(message)
        
        # Parse response
        lines = response.strip().split('\n')
        subject = ""
        body = ""
        body_started = False
        
        for line in lines:
            if line.startswith('SUBJECT:'):
                subject = line.replace('SUBJECT:', '').strip()
            elif line.startswith('BODY:'):
                body = line.replace('BODY:', '').strip()
                body_started = True
            elif body_started:
                body += '\n' + line
        
        return {"subject": subject, "body": body.strip()}
    except Exception as e:
        logging.error(f"AI generation error: {str(e)}")
        return {
            "subject": f"Following up on our conversation, {request.lead_name}",
            "body": f"Hi {request.lead_name},\n\nI wanted to follow up on my previous email regarding {request.business_name}. I believe our services could be valuable to your business.\n\nWould you have 15 minutes this week for a quick call?\n\nBest regards"
        }

# ============= ANALYTICS ROUTES =============
@api_router.get("/analytics/dashboard")
async def get_dashboard_analytics(current_user: dict = Depends(get_current_user)):
    user_id = current_user['user_id']
    
    # Get counts
    total_leads = await db.leads.count_documents({"user_id": user_id})
    total_campaigns = await db.campaigns.count_documents({"user_id": user_id})
    
    # Get campaign stats
    campaigns = await db.campaigns.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
    total_emails_sent = sum(c.get('sent_count', 0) for c in campaigns)
    total_opens = sum(c.get('opened_count', 0) for c in campaigns)
    total_replies = sum(c.get('replied_count', 0) for c in campaigns)
    
    open_rate = (total_opens / total_emails_sent * 100) if total_emails_sent > 0 else 0
    reply_rate = (total_replies / total_emails_sent * 100) if total_emails_sent > 0 else 0
    
    # Get leads over time (last 7 days)
    leads_by_date = {}
    for i in range(6, -1, -1):
        date = (datetime.now(timezone.utc) - timedelta(days=i)).strftime('%Y-%m-%d')
        leads_by_date[date] = 0
    
    all_leads = await db.leads.find({"user_id": user_id}, {"_id": 0, "created_at": 1}).to_list(10000)
    for lead in all_leads:
        date_str = lead['created_at'][:10]
        if date_str in leads_by_date:
            leads_by_date[date_str] += 1
    
    # Recent activity
    recent_campaigns = await db.campaigns.find({"user_id": user_id}, {"_id": 0}).sort("created_at", -1).limit(5).to_list(5)
    
    # Get leads by source for pie chart
    leads_by_source = {}
    for lead in all_leads:
        source = lead.get('source', 'Unknown')
        leads_by_source[source] = leads_by_source.get(source, 0) + 1
    
    return {
        "total_leads": total_leads,
        "active_campaigns": total_campaigns,
        "emails_sent": total_emails_sent,
        "open_rate": round(open_rate, 1),
        "reply_rate": round(reply_rate, 1),
        "leads_by_date": [{'date': k, 'count': v} for k, v in leads_by_date.items()],
        "leads_by_source": [{'name': k, 'value': v} for k, v in leads_by_source.items()],
"recent_campaigns": recent_campaigns
  }

# Include router

  
@api_router.get("/analytics/summary")
async def get_analytics_summary(current_user: dict = Depends(get_current_user)):
    user_id = current_user['user_id']
    now_ts = datetime.now(timezone.utc).timestamp()
    cache = analytics_cache["summary"]
    if cache["data"] is not None and now_ts - cache["timestamp"] < ANALYTICS_CACHE_TTL:
        return cache["data"]
    total_leads = await db.leads.count_documents({"user_id": user_id})
    campaigns = await db.campaigns.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
    total_emails_sent = sum(c.get("sent_count", 0) for c in campaigns)
    total_opens = sum(c.get("opened_count", 0) for c in campaigns)
    total_replies = sum(c.get("replied_count", 0) for c in campaigns)
    open_rate = (total_opens / total_emails_sent * 100) if total_emails_sent > 0 else 0
    reply_rate = (total_replies / total_emails_sent * 100) if total_emails_sent > 0 else 0
    data = {
        "total_leads": total_leads,
        "total_campaigns": len(campaigns),
        "open_rate": round(open_rate, 1),
        "reply_rate": round(reply_rate, 1)
    }
    analytics_cache["summary"] = {"data": data, "timestamp": now_ts}
    return data

@api_router.get("/analytics/sources")
async def get_analytics_sources(current_user: dict = Depends(get_current_user)):
    user_id = current_user['user_id']
    now_ts = datetime.now(timezone.utc).timestamp()
    cache = analytics_cache["sources"]
    if cache["data"] is not None and now_ts - cache["timestamp"] < ANALYTICS_CACHE_TTL:
        return cache["data"]
    all_leads = await db.leads.find({"user_id": user_id}, {"_id": 0, "source": 1}).to_list(10000)
    leads_by_source = {}
    for lead in all_leads:
        source = lead.get('source', 'Unknown')
        leads_by_source[source] = leads_by_source.get(source, 0) + 1
    data = {
        "leads_by_source": [{"name": k, "value": v} for k, v in leads_by_source.items()]
    }
    analytics_cache["sources"] = {"data": data, "timestamp": now_ts}
    return data

@api_router.get("/analytics/engagement")
async def get_analytics_engagement(current_user: dict = Depends(get_current_user)):
    user_id = current_user['user_id']
    now_ts = datetime.now(timezone.utc).timestamp()
    cache = analytics_cache["engagement"]
    if cache["data"] is not None and now_ts - cache["timestamp"] < ANALYTICS_CACHE_TTL:
        return cache["data"]
    campaigns = await db.campaigns.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
    total_emails_sent = sum(c.get("sent_count", 0) for c in campaigns)
    total_opens = sum(c.get("opened_count", 0) for c in campaigns)
    total_replies = sum(c.get("replied_count", 0) for c in campaigns)
    open_rate = (total_opens / total_emails_sent * 100) if total_emails_sent > 0 else 0
    reply_rate = (total_replies / total_emails_sent * 100) if total_emails_sent > 0 else 0
    data = {
        "emails_sent": total_emails_sent,
        "open_rate": round(open_rate, 1),
        "reply_rate": round(reply_rate, 1)
    }
    analytics_cache["engagement"] = {"data": data, "timestamp": now_ts}
    return data

  # Global error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "message": exc.detail, "data": None},
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logging.error(f"Unhandled exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"success": False, "message": "Internal server error", "data": None},
    )

# Health check endpoint
@api_router.get("/health")
async def health():
    uptime = (datetime.now(timezone.utc) - start_time).total_seconds()
    return {"status": "ok", "uptime": uptime, "version": VERSION}
app.include_router(api_router)


app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
