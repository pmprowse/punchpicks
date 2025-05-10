# Punch Picks

Punch Picks is a web application for predicting and tracking MMA fight outcomes. Users can make predictions for upcoming fights and track their prediction accuracy over time.

## Features

- User authentication and account management
- Browse upcoming UFC events and fight cards
- Make fight predictions (winner and method of victory)
- Track prediction accuracy and statistics
- View fight results and outcomes
- Separate main card and preliminary card views

## Tech Stack

### Backend
- FastAPI (Python web framework)
- SQLAlchemy (ORM)
- SQLite (Database)
- Pydantic (Data validation)

### Frontend
- React/TypeScript
- Vite (Build tool)
- Modern UI components

## Project Structure

```
punchpicks/
├── backend/
│   ├── routers/         # API endpoints
│   ├── models.py        # Database models
│   ├── database.py      # Database configuration
│   └── main.py         # FastAPI application
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── services/    # API services
│   │   └── types/       # TypeScript types
│   └── public/         # Static assets
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Events
- `GET /api/events` - List all events
- `GET /api/events/{id}` - Get event details
- `POST /api/events` - Create new event

### Fights
- `GET /api/fights` - List all fights
- `GET /api/fights/{id}` - Get fight details
- `GET /api/fights/event/{event_id}` - Get fights for an event
- `POST /api/fights` - Create new fight

### Results
- `POST /api/results` - Create fight result
- `GET /api/results/fight/{fight_id}` - Get fight result
- `GET /api/results` - List all results

### User Picks
- `POST /api/picks` - Submit fight predictions
- `GET /api/picks` - Get user's predictions

## Setup and Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Start the backend server:
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Development

### Database

The application uses SQLite as its database. The database file is automatically created when you first run the application.

### API Documentation

FastAPI automatically generates API documentation. You can access it at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
