# Diet Engine

Diet Engine is a full-stack, clinically-aligned dietary AI assistant designed to bridge the gap between user cravings, health objectives, and strict medical constraints. 

By leveraging a Retrieval-Augmented Generation (RAG) backend service and an interactive React frontend, the engine instantly cross-references dietary requests against personal health goals to generate safe, customized meal plans with real-time macro calculations.

---

## Project Showcase
<img width="1917" height="902" alt="image" src="https://github.com/user-attachments/assets/23390dd8-ed42-488c-9ad8-28898d249b80" />
Main dashboard generating a personalized meal plan based on specific health objectives

---

## Key Features

* Clinical AI Chatbot: An interactive assistant that understands natural language dietary requests (e.g., "High-protein breakfast").
* Primary Health Objectives: Direct the AI's focus using predefined goals including General Wellness, Heart Health, Gut Microbiome, and Athletic Recovery.
* Dynamic Macro Calculator: A real-time sidebar tracking Calories, Protein, Net Carbs, and Fat.
* Interactive Ingredient Checklist: Toggle individual ingredients to instantly recalculate the meal's nutritional impact.
* Responsive UI: Optimized for Mobile, Tablet, and Desktop with built-in Dark and Light modes.

---

## Technology Stack

* Frontend: React (Vite), TypeScript, Custom Responsive CSS
* Backend: Python (FastAPI), Docker, Groq API (LLM)
* Database: PostgreSQL (Neon)
* Hosting: Vercel (Frontend), Render (Backend)

---

## Local Installation and Setup

Ensure you have Node.js, Python 3.8+, and Docker installed on your machine.

### Step 1: Clone the Repository
```bash
git clone [https://github.com/Onkar97/Diet-Engine.git](https://github.com/Onkar97/Diet-Engine.git)
cd Diet-Engine
```
## Step 2: Backend Configuration

1.  **Navigate to the directory:**
    ```bash
    cd backend
    ```
2.  **Create a virtual environment:**
    ```bash
    python -m venv venv
    ```
3.  **Activate the environment:**
    * **Windows:** `venv\Scripts\activate`
    * **Mac/Linux:** `source venv/bin/activate`
4.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
5.  **Create a .env file in the /backend folder and add your credentials:**
    ```env
    DATABASE_URL=postgres://user:password@localhost:5432/dietenginedb
    GROQ_API_KEY=your_groq_api_key_here
    ```
6.  **Run the server:**
    ```bash
    uvicorn main:app --reload
    ```

## Step 3: Frontend Configuration

1.  **Open a new terminal and navigate to the frontend folder:**
    ```bash
    cd frontend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be accessible at `http://localhost:5173`.

---

## Global Deployment Guide

Follow these phases to host your project online for free.

### Phase 1: Database Setup (Neon.tech)
* Sign up at [Neon.tech](https://neon.tech) and create a new project named `diet-engine-db`.
* Select your preferred region and Postgres version.
* Copy the **Connection String** (Postgres URL) provided in the dashboard.

### Phase 2: Backend Deployment (Render.com)
* Sign up at [Render.com](https://render.com) and connect your GitHub account.
* Click **New > Web Service** and select the `Diet-Engine` repository.
* Configure the following settings:
    * **Root Directory:** `backend`
    * **Runtime:** `Docker`
    * **Instance Type:** `Free`
* Add the following **Environment Variables**:
    * `DATABASE_URL`: (Paste your Neon Connection String)
    * `GROQ_API_KEY`: (Paste your Groq API Key)
* Click **Deploy**. Once the build is complete, copy your live Render URL (e.g., `https://diet-engine-api.onrender.com`).

### Phase 3: Frontend Deployment (Vercel.com)
* In your local `frontend/src/App.tsx` file, update the fetch URL from `http://localhost:8000` to your new **Render URL**.
* Commit and push this change to GitHub: 
    ```bash
    git commit -am "Update API URL for production" && git push
    ```
* Sign up at [Vercel.com](https://vercel.com) and import your repository.
* Configure the settings:
    * **Root Directory:** `frontend`
    * **Framework Preset:** `Vite`
* Click **Deploy**. Your Diet Engine application is now live globally.

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss the proposed adjustments.

## License

This project is licensed under the MIT License.
