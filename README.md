Multi-Tenant Feature Flag Management System



A small SaaS-style feature-flag system with a Node.js/Express backend, MongoDB storage, custom JWT authentication, and a unified static frontend with separate Super Admin, Organization Admin, and End User workflows.

Live Demo

Open the live application

Architecture

feature-flag-system/
├── backend/                  Express + MongoDB API
│   └── src/
│       ├── models/           Organization, User, FeatureFlag
│       ├── routes/           auth, organizations, flags
│       ├── middleware/       JWT auth + role guards
│       ├── config/db.js      MongoDB connection
│       └── utils/jwt.js      JWT sign/verify helpers
└── frontend/
    ├── index.html            Unified application entry point
    ├── super-admin/
    │   └── index.html        Super Admin workflow
    ├── org-admin/
    │   └── index.html        Organization Admin workflow
    └── user/
        └── index.html        Public feature-check workflow

The frontend provides one entry point and lets users select the workflow they need.

Features

Super Admin can create and view organizations.

Organization Admins can sign up under an organization and log in.

Organization Admins can create, enable/disable, list, and delete feature flags.

End Users can publicly check whether a feature flag is enabled.

JWT-based authentication with role-based authorization.

Organization scoping is taken from the authenticated JWT rather than a client-supplied organization ID.

Feature flags use a compound unique index on (organization, key).

Duplicate organizations and duplicate flag keys return appropriate conflict responses.

Backend health-check integration test using Jest and Supertest.

GitHub Actions automatically installs dependencies, runs tests, and builds the Docker image.

Backend is Dockerized and deployed on Render.

Frontend is deployed as a static site on Render.

Data Model

Organization: { name (unique) }

User: { email, passwordHash, role, organization }

FeatureFlag: { key, enabled, organization }

The FeatureFlag model uses a compound unique index on (organization, key). This allows the same flag key to exist in different organizations while preventing duplicate keys within the same organization.

The Super Admin is not stored as a database record. Its credentials are configured through environment variables, as required by the assignment.

Authentication & Authorization

Custom JWT authentication using jsonwebtoken.

Password hashing using bcryptjs.

A shared authentication middleware verifies JWTs.

Role-specific middleware restricts Super Admin and Organization Admin routes.

Organization Admin JWTs contain the organization identifier.

Organization-scoped routes derive req.orgId from the authenticated token instead of trusting a client-supplied organization ID.

The End User feature-check endpoint is intentionally public and does not require login.

Key Trade-offs

Plain HTML/JavaScript Frontend

The frontend uses plain HTML, CSS, and JavaScript instead of React. This kept the implementation focused on backend architecture, API design, authentication, multi-tenancy, and data modeling while still providing the required workflows.

No Refresh Tokens

Access tokens are valid for 8 hours, which is sufficient for the demo. A production system would normally use shorter-lived access tokens together with refresh tokens.

Public Feature Check

The End User endpoint identifies the organization by name so that users do not need to authenticate. This keeps the assignment flow simple, but organization names are guessable. A production implementation could use a public API key or another non-guessable identifier.

Testing Scope

The current automated test suite covers the backend health endpoint using Jest and Supertest. The GitHub Actions workflow runs the test suite automatically on pushes and pull requests to main.

Further tests could cover the complete Super Admin, Organization Admin, and End User flows, including 401, 403, and 409 cases.

Performance & Scalability

Feature flag lookups are scoped by organization.

The (organization, key) compound index supports efficient feature-key lookups and enforces uniqueness.

There is currently no caching layer.

Organization and feature-flag list endpoints currently return full result sets; pagination would be appropriate as the number of organizations and flags grows.

The public feature-check endpoint currently has no rate limiting.

Readability & Maintainability

Backend routes are separated by resource: authentication, organizations, and feature flags.

Authentication and role checks are handled through reusable middleware.

Database models are separated from route handlers.

The frontend is intentionally small and page-specific for this assignment.

A larger production application would benefit from shared frontend components and modular JavaScript.

Running Locally

Backend

cd backend
npm install
cp .env.example .env

Fill in your own environment variables in .env, including your MongoDB connection string and authentication credentials.

Then start the development server:

npm run dev

The backend runs at:

http://localhost:5000

Frontend

From the frontend directory, serve the static files with any local static server.

For example:

cd frontend
python -m http.server 5500

Then open:

http://localhost:5500

The landing page provides links to the Super Admin, Organization Admin, and End User workflows.

End-to-End Test Flow

Open the Super Admin workflow.

Log in using the Super Admin credentials configured in the backend environment.

Create an organization.

Open the Organization Admin workflow.

Sign up using the organization created in the previous step.

Log in as the Organization Admin.

Create a feature flag.

Enable, disable, or delete the feature flag.

Open the End User workflow.

Enter the organization name and feature key to check the current flag status.

Testing

Run the backend tests with:

cd backend
npm test

The GitHub Actions CI workflow also runs the tests automatically.

Deployment

Backend

The Express backend is containerized using Docker and deployed on Render.

The backend exposes:

GET /health

which returns:

{
  "status": "ok"
}

Frontend

The frontend is deployed as a Render Static Site with a single entry point.

The deployed application is available from the Live Demo link at the top of this README.

CI

GitHub Actions runs the following checks for pushes and pull requests targeting main:

Checkout repository.

Set up Node.js 20.

Install backend dependencies.

Run Jest tests.

Run the optional build command when available.

Build the backend Docker image.

Render handles the deployed backend/frontend hosting separately.

Known Limitations

No refresh-token flow.

No pagination on list endpoints.

No caching layer.

No rate limiting on the public feature-check endpoint.

Limited automated integration-test coverage.

Basic input validation and sanitization could be strengthened.

Frontend JavaScript is intentionally simple and page-specific.

Tech Stack

Backend: Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs

Frontend: HTML5, CSS3, JavaScript

Testing: Jest, Supertest

DevOps: Docker, GitHub Actions, Render

Database: MongoDB Atlas
