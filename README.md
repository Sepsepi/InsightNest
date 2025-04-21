# AI-Powered Customer Insights Dashboard

This is a full-stack web application designed as a portfolio project to showcase the integration of Django, React, TailwindCSS, and AI (Google Gemini) for analyzing customer transaction data.

The application allows users to register, log in, upload customer transaction data via CSV, view an automatically generated RFM (Recency, Frequency, Monetary) analysis with charts and tables, and generate AI-powered business insights based on the data.

## Features

*   **User Authentication:** Secure user registration and login using Django REST Framework's Token Authentication.
*   **File Upload:** Easily upload customer transaction data via CSV or Excel (`.xlsx`, `.xls`). **Requires columns named exactly:** `customer_id`, `purchase_date`, `amount`.
*   **RFM Analysis:** Automatic calculation of Recency, Frequency, and Monetary values for each customer.
*   **Customer Segmentation:** Dynamic segmentation of customers into categories like 'Champions', 'Loyal Customers', 'At Risk', 'Hibernating', etc., based on RFM scores (using quantiles).
*   **Interactive Dashboard:**
    *   Bar chart visualizing the distribution of customers across different RFM segments (using Recharts).
    *   Table displaying detailed RFM metrics for each customer.
*   **AI-Powered Insights:** Generate actionable business insights and tips using the Google Gemini API based on the aggregated RFM data.
*   **(Bonus - Not Implemented Yet):** Sidebar chatbot for querying RFM data using natural language.

## Tech Stack

*   **Backend:** Django, Django REST Framework
*   **Frontend:** React (Vite), TailwindCSS, React Router
*   **Database:** SQLite (default for development), PostgreSQL compatible
*   **Charting:** Recharts
*   **AI:** Google Gemini API
*   **API Communication:** Axios

## Project Structure

```
/ai-customer-insights-dashboard
├── backend/
│   ├── backend_project/  # Django project settings
│   ├── users/          # User authentication app
│   ├── rfm/            # RFM logic, CSV upload, models app
│   ├── ai_insights/    # AI integration app
│   ├── manage.py
│   ├── requirements.txt
│   └── .env.example    # Backend environment variables template
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/ # React components (UploadForm, RFMChart, etc.)
│   │   ├── context/    # React context (AuthContext)
│   │   ├── pages/      # Page components (Login, Register, Dashboard)
│   │   ├── services/   # API service (apiService.js)
│   │   ├── App.jsx
│   │   ├── index.css   # Tailwind directives
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── .env.example    # Frontend environment variables template
├── sample_transactions.csv # Sample data for upload
└── README.md
```

## Setup and Installation

### Prerequisites

*   Python (3.8+ recommended)
*   Node.js and npm (or yarn)
*   Git

### Backend Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd ai-customer-insights-dashboard/backend
    ```
2.  **Create and activate a virtual environment:**
    ```bash
    python -m venv venv
    # Windows
    .\venv\Scripts\activate
    # macOS/Linux
    source venv/bin/activate
    ```
3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
4.  **Set up environment variables:**
    *   Copy `.env.example` to `.env`: `copy .env.example .env` (Windows) or `cp .env.example .env` (macOS/Linux).
    *   Edit the `.env` file:
        *   Generate a strong `SECRET_KEY` (e.g., using [djecrety.ir](https://djecrety.ir/)).
        *   Obtain a `GEMINI_API_KEY` from [Google AI Studio](https://aistudio.google.com/app/apikey).
        *   Adjust `DEBUG`, `ALLOWED_HOSTS`, and `CORS_ALLOWED_ORIGINS` if needed (defaults are suitable for local development).
5.  **Apply database migrations:**
    ```bash
    python manage.py migrate
    ```
6.  **(Optional) Create a superuser for admin access:**
    ```bash
    python manage.py createsuperuser
    ```

### Frontend Setup

1.  **Navigate to the frontend directory:**
    ```bash
    cd ../frontend
    # (If you are in the backend directory)
    # Or from the root: cd ai-customer-insights-dashboard/frontend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Set up environment variables:**
    *   Copy `.env.example` to `.env`: `copy .env.example .env` (Windows) or `cp .env.example .env` (macOS/Linux).
    *   Edit the `.env` file if your backend API will run on a different URL than the default (`http://127.0.0.1:8000/api`).

## Running the Application Locally

1.  **Run the Backend (Django):**
    *   Make sure you are in the `backend` directory with your virtual environment activated.
    *   Start the Django development server:
        ```bash
        python manage.py runserver
        ```
    *   The backend API will typically be available at `http://127.0.0.1:8000/api`.

2.  **Run the Frontend (React):**
    *   Open a **new terminal**.
    *   Navigate to the `frontend` directory.
    *   Start the Vite development server:
        ```bash
        npm run dev
        ```
    *   The frontend application will typically be available at `http://localhost:5173`.

3.  **Access the Application:**
    *   Open your web browser and go to `http://localhost:5173`.
    *   You should see the login page. You can register a new user or use the login credentials if you create a test user (see below).

## Creating a Test User

You can create a test user in two ways:

1.  **Via Registration:** Use the registration form on the frontend (`http://localhost:5173/register`).
2.  **Via Django Admin (if superuser created):**
    *   Access the admin panel (usually `http://127.0.0.1:8000/admin/`).
    *   Log in with your superuser credentials.
    *   Navigate to the "Users" section and add a new user.
    *   *Note:* You might need to manually create an Auth Token for this user in the "Tokens" section of the admin panel if you want to log in via the API directly for testing. The frontend login flow handles token generation automatically.

## Deployment (Basic Guidelines)

### Backend (e.g., Render, Railway)

1.  **Database:** Switch from SQLite to PostgreSQL (recommended). Update `DATABASES` in `settings.py` (consider using `dj-database-url` package to parse `DATABASE_URL` from env).
2.  **Dependencies:** Add `gunicorn` and `psycopg2-binary` (for PostgreSQL) to `requirements.txt`.
3.  **Procfile:** Create a `Procfile` in the `backend` directory:
    ```
    web: gunicorn backend_project.wsgi:application
    ```
4.  **Static Files:** Configure static file handling for production (e.g., using WhiteNoise or a cloud storage service). Add `whitenoise` to `requirements.txt` and configure middleware in `settings.py`.
5.  **Environment Variables:** Set production environment variables on your hosting platform (`SECRET_KEY`, `DEBUG=False`, `DATABASE_URL`, `GEMINI_API_KEY`, `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS` pointing to your deployed frontend URL).
6.  **Collect Static Files:** Run `python manage.py collectstatic` as part of your deployment process.

### Frontend (e.g., Vercel, Netlify)

1.  **Build Command:** Set the build command to `npm run build`.
2.  **Publish Directory:** Set the publish directory to `dist`.
3.  **Environment Variables:** Set the `VITE_API_BASE_URL` environment variable to your deployed backend API URL.

## TODO / Future Enhancements

*   Implement seed script for test user and sample transactions.
*   Add loading indicators to more components (e.g., AI Insights card).
*   Implement table sorting and pagination for `CustomerTable`.
*   Refine UI/UX, improve responsiveness.
*   Add more robust error handling and user feedback.
*   Implement the bonus Chatbot feature.
*   Write unit and integration tests.
*   Add detailed comments throughout the code.
* OYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY