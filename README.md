# Strategic Management (Strama) Graph Maker

A modular monolith web application designed to generate, customize, and save strategic management matrices. Built entirely on the Cloudflare edge network, this project utilizes a strict serverless architecture without any local build steps.

## Architecture & Tech Stack

This project is physically separated by domain but unified in its deployment context across Cloudflare's ecosystem:

*   **Frontend (Cloudflare Pages):** A static Single-Page Application (SPA) utilizing Vanilla JavaScript (ES Modules), TailwindCSS (via CDN), and FontAwesome. All logic is strictly modularized inside the `js/` directory.
*   **Backend API (Cloudflare Workers):** A centralized edge controller (`worker/worker.js`) handling all incoming HTTP requests, session validation, and strict CORS policies.
*   **Database (Cloudflare D1):** A serverless SQLite layer storing users, session tokens, and JSON-stringified matrix project data. Primary keys rely exclusively on natively generated UUIDs (`crypto.randomUUID()`).

## Core Features

*   **Role-Based Authentication:** Flexible login accepting a username, email, or phone number. New registrations default to an `inactive` state and require an `admin` to activate them before login is permitted.
*   **Project Management:** Authenticated users can create, save, open, and delete multiple matrix projects.
*   **Matrix Plotters:** 
    *   GE McKinsey Matrix
    *   Grand Strategy Matrix
    *   Strategy Map
    *   Porter's 5 Forces
*   **Export Capabilities:** High-resolution PNG downloading for all charts utilizing `html-to-image` while preserving layout constraints.

## Directory Structure

```text
/
├── index.html              # Main static shell, inline CSS, and layout views
├── schema.sql              # Cloudflare D1 SQLite database schema
├── worker/
│   └── worker.js           # Cloudflare Worker edge API controller
└── js/
    ├── main.js             # Entry point and UI routing
    ├── api.js              # Fetch wrapper and authorization header injection
    ├── auth.js             # Login/Registration form handling and toggle logic
    ├── projects.js         # Project CRUD operations and dashboard rendering
    └── plotter.js          # Core matrix rendering, form bindings, and canvas logic
