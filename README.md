# Ruby on Rails + React App

## Setup

This project consists of a Rails API backend and a React frontend.

### Backend (Rails)

1.  Install dependencies:
    ```bash
    bundle install
    ```
2.  Setup database:
    ```bash
    bin/rails db:create db:migrate
    ```
3.  Start the server:
    ```bash
    bin/rails s
    ```
    The API will be available at `http://localhost:3000`.

### Frontend (React)

1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
    The frontend will be available at `http://localhost:5173`.

## Features

*   **Rails API**: Serves data to the frontend.
*   **React Frontend**: Consumes the API.
*   **SQLite Database**: Stores data.
*   **CORS**: Configured to allow requests from `localhost:5173`.
*   **Authentication**: `bcrypt` gem is installed for password hashing.

