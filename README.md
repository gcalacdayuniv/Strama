# Strama Plotter: Modular Strategy Matrix Application

## Overview
Strama Plotter is a modular web-based tool designed to plot, visualize, and export strategic management matrices. We intend to do a modular monolith in our developments, keeping the architecture straightforward and eliminating the need for complex build steps. The application runs entirely on the client side using standard web technologies while interfacing with a backend API for project management and user authentication.

## Features
*   **Multiple Strategic Matrices:**
    *   GE McKinsey Matrix
    *   Grand Strategy (GS) Matrix
    *   SPACE Matrix
    *   Strategy Map
    *   Porter's Five Forces (with standard and radar chart views)
*   **Customization:** Adjust bubble sizes, axis positions, theme colors, and matrix labels in real time. Labels for GE, GS, and SPACE matrices automatically inherit their corresponding bubble color at 70% opacity with a white text shadow for improved readability.
*   **Image Export:** Download any active matrix directly as a high-quality JPEG using the `html-to-image` library.
*   **Project Management:** Save, load, and manage different strategic analysis projects through a unified dashboard.
*   **Serverless Edge Ready:** Designed with a "No Build Step" philosophy to ensure rapid deployment on edge networks.

## Technology Stack
*   **Frontend Structure:** HTML5
*   **Styling:** Custom CSS3 and Tailwind CSS (via CDN with production warning suppression)
*   **Logic:** Vanilla JavaScript (ES6 Modules)
*   **Image Generation:** `html-to-image` library

## Directory Structure
```text
/
├── index.html          # Main entry point and user interface views
└── js/
    ├── api.js          # API request handler and authentication logic
    ├── auth.js         # Login and registration flow management
    ├── main.js         # Application initialization and view routing
    ├── plotter.js      # Core logic for rendering matrices and charts
    └── projects.js     # Project state management and dashboard rendering
