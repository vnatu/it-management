# IT Asset Management and Ticketing System

A comprehensive IT Asset Management and Ticketing System built for Cognologix. This application allows managing IT assets, categories, and attributes, alongside a robust ticketing system for support requests.

## Tech Stack

- **Backend**: Java 17, Spring Boot 3, Spring Data JPA, Spring Security
- **Frontend**: Next.js 14, React, Tailwind CSS, Lucide React (Icons)
- **Database**: PostgreSQL 15 (Docker)
- **Containerization**: Docker, Docker Compose

## Prerequisites

- **Java**: JDK 17
- **Node.js**: v18 or later
- **Docker & Docker Compose**: For running the database
- **Maven**: For building the backend

## Getting Started

### 1. Database Setup

The application uses PostgreSQL. You can start the database using Docker Compose:

```bash
docker-compose up -d
```

> [!TIP]
> If you encounter permission errors with Docker, ensure your user is in the `docker` group or run the command with `sudo`.

This will start a PostgreSQL instance on `localhost:5432` with the following credentials:
- **Username**: `postgres`
- **Password**: `postgres`
- **Database**: `it_management`

### 2. Backend Setup

Navigate to the `backend` directory and run the application using Maven:

```bash
cd backend
mvn spring-boot:run
```

The backend API will be available at `http://localhost:8080`.

### 3. Frontend Setup

Navigate to the `frontend` directory, install dependencies, and start the development server:

```bash
cd frontend
npm install
npm run dev
```

The frontend application will be available at `http://localhost:3000`.

## Project Structure

```text
.
├── backend/            # Spring Boot application
│   ├── src/
│   │   ├── main/java/  # Java source code
│   │   └── main/resources/ # Configuration and static resources
│   └── pom.xml         # Maven configuration
├── frontend/           # Next.js application
│   ├── src/
│   │   ├── app/        # Pages and routes
│   │   ├── components/ # Reusable UI components
│   │   └── lib/        # Utility functions
│   └── package.json    # Node.js dependencies
├── docker-compose.yml  # Docker services configuration
└── README.md           # Project documentation
```

## Features

- **Asset Inventory**: Track and manage IT assets with dynamic attributes based on category.
- **Ticketing System**: Help desk for support tickets with status and priority tracking.
- **Categorization**: Define categories for assets and tickets.
- **User Management**: Manage system users and their roles.

## Planned Improvements

- Role-Based Access Control (RBAC)
- Microsoft 365 / Azure AD Integration
- Excel/CSV import/export for assets
- Enhanced branding and QR code integration
