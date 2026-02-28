# rails_test

rails_test was built in order to learn the basics of managing a Ruby on Rails + React stack, and get introduced to Ruby.

Users can create accounts (no confirmation email is sent), log in, and click a button. The click count and last time are stored in a sqlite database, and used to track day/month/year streaks.

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

Refresh token flow
1. After a successful login the response contains `refresh_token` (60-day lifetime) and `token` (1-hour lifetime).
2. The frontend should keep the `refresh_token` securely (e.g. in an HttpOnly cookie or secure storage).
3. When the access token expires (or is about to expire), call `POST /auth/refresh` with JSON `{ refresh_token: "..." }` to receive a new access token and a rotated refresh token.

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
