# How to Copy This to a New Repo

## Option 1: Copy the Folder

1. Copy the entire `assurance-twin-starter` folder to your new repo location
2. Rename it to `assurance-twin` (or whatever you want)
3. Initialize git:
   ```bash
   cd assurance-twin
   git init
   git add .
   git commit -m "Initial commit: Assurance Twin prototype"
   ```

## Option 2: Create New Repo and Copy Files

1. Create a new GitHub/GitLab repo called `assurance-twin`
2. Clone it locally
3. Copy all files from `assurance-twin-starter/` into the new repo
4. Commit and push

## What's Included

- **Backend** (Python/FastAPI)
  - Canonization engine (core logic)
  - Data models (Pydantic)
  - API endpoints
  - Database setup (SQLite)
  - Example data source connectors

- **Frontend** (Next.js/React)
  - Basic dashboard
  - Asset list view
  - Assurance judgment display

- **Documentation**
  - README.md
  - QUICK_START.md
  - API documentation (in code)

## Next Steps After Copying

1. **Fix imports** (if needed):
   - Backend imports are relative - may need adjustment based on your Python path setup
   - Consider using `PYTHONPATH` or installing as a package

2. **Set up environment**:
   ```bash
   # Backend
   cd backend
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   
   # Frontend
   cd frontend
   npm install
   ```

3. **Test it**:
   ```bash
   # Terminal 1: Backend
   cd backend
   uvicorn api.main:app --reload
   
   # Terminal 2: Frontend
   cd frontend
   npm run dev
   ```

4. **Customize**:
   - Add real data source connectors
   - Enhance matching logic
   - Build out UI
   - Add authentication
   - Deploy to production

## File Structure

```
assurance-twin/
├── backend/
│   ├── api/
│   │   └── main.py          # FastAPI app
│   ├── canonization/
│   │   ├── engine.py         # Core canonization logic
│   │   └── models.py         # Data models
│   ├── database/
│   │   ├── db.py             # Database setup
│   │   └── init_db.py        # Initialize DB
│   ├── data_sources/
│   │   └── example.py        # Example connectors
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   ├── page.tsx          # Main dashboard
│   │   └── layout.tsx        # Layout
│   └── package.json
├── README.md
├── QUICK_START.md
└── .gitignore
```

## Notes

- Backend uses FastAPI (Python)
- Frontend uses Next.js (React/TypeScript)
- Database is SQLite by default (easy to switch to PostgreSQL)
- All imports are relative - adjust as needed for your setup
- This is a **prototype** - production would need:
  - Authentication/authorization
  - Better error handling
  - Real data source connectors
  - Enhanced UI
  - Testing
  - Deployment configuration








