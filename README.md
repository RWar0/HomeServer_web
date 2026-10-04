# Home Server Frontend

Frontend application for managing a private home server. The application provides a practical dashboard for managing and monitoring everyday home-related areas.

Its main modules include:

- aquariums,
- vehicles,
- calendar,
- activity tracking,
- user management.

This repository is part of the larger Home Server system.

It demonstrates modern Angular development, authentication, protected routing, REST API communication, reactive state management, and a reusable UI component system.

## Key Features

- Dashboard with system summary, attention items, upcoming events, recent activity, and daily status.
- Aquarium management:
  - aquarium list,
  - aquarium details,
  - photos,
  - water change history,
  - water parameter measurements.
- Vehicle management:
  - vehicle list,
  - fueling history,
  - service history,
  - vehicle details.
- Calendar for home events and activities.
- API-backed photo previews.
- Administration panel for system management.
- Authentication flow including login, logout, session initialization, and token refresh.
- Protected routes using authentication and role guards.
- Dynamic sidebar with role-aware sections and navigation items.
- Reusable components for tables, pagination, forms, dialogs, date pickers, selects, and error messages.

## Tech Stack

- Angular 21
- TypeScript 5
- Angular Router
- Angular Signals
- RxJS
- Angular `HttpClient` with HTTP interceptors
- Tailwind CSS
- Spartan UI / HLM
- Angular CDK
- ng-icons with Lucide and Tabler icon sets
- Luxon
- Vitest
- Docker + Nginx

## Application Architecture

The application is built using standalone Angular components with a clear separation of responsibilities:

- `pages/` – routed views such as the dashboard, calendar, aquariums, vehicles, and administration panel.
- `components/` – domain-specific and shared components such as data tables, CRUD dialogs, forms, and dashboard cards.
- `layouts/` – application layouts and entity detail layouts, such as aquarium and vehicle details.
- `core/services/` – API communication services and application/domain logic.
- `core/models/` – data models and types used when communicating with the backend.
- `core/guards/` – route protection for authenticated users, guests, and role-based access.
- `core/interceptors/` – automatic JWT attachment and session refresh handling.
- `core/helpers/` – utilities for query parameter synchronization, enum translation, and error handling.
- `core/stores/` – local signal-based stores, for example pagination and sorting state.
- `libs/ui/` – local UI component library based on Spartan/HLM.

## Requirements

- Node.js 22 or newer
- npm 10 or newer
- A running Home Server backend available under the API URL configured in the environment files

The project uses npm as its package manager.

## Local Setup

1. Go to the project directory

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

4. Open the application in your browser:

```text
http://localhost:4200
```

By default, the frontend communicates with the backend at:

```text
http://localhost:5092/api
```

## Environment Configuration

API configuration is stored in:

```text
src/environments/
```

Environment files:

- `environment.ts` – local development configuration.
- `environment.prod.ts` – production configuration.

Example configuration:

```ts
// development
apiUrl: 'http://localhost:5092/api';

// production
apiUrl: '/api';
```

In production, the application expects the API to be available under the relative `/api` path, for example when the frontend is served behind a reverse proxy.

## Available Commands

### `npm start`

Starts the Angular development server.

### `npm run build`

Builds the application for production into the `dist/` directory.

### `npm run watch`

Builds the application in watch mode and rebuilds automatically when source files change.

## Docker

The project includes a multi-stage `Dockerfile`:

1. The Node.js stage installs dependencies and builds the Angular application.
2. The Nginx stage serves the generated static files.

Build the Docker image:

```bash
docker build -t home-server-web .
```

Run the container:

```bash
docker run --rm -p 8080:80 home-server-web
```

After startup, the application is available at:

```text
http://localhost:8080
```

The included `nginx.conf` supports Angular SPA routing through a fallback to `index.html` and enables long-term caching for static assets.

## Project Status

The project is actively developed as the frontend of a larger Home Server system.

The current version focuses on home data management, administration, and providing a modern interface for interacting with the backend REST API.
