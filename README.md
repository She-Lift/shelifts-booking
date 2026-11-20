# SHE LIFTS Booking

Ett webbaserat, mobile-first bokningssystem för SHE LIFTS. Systemet gör det möjligt för kunder att boka träningspass med hjälp av klippkort och för administratören att hantera kunder, träningspass och bokningar.

**Status:** Under utveckling – MVP

## Tech Stack

| Del | Teknik |
|---|---|
| Frontend | React, TypeScript, React Router, Bulma, Vite |
| Backend | Node.js, Express.js |
| Authentication | express-session, PostgreSQL session store |
| Authorization | JSON-baserad ACL-middleware |
| Database | PostgreSQL 17 |
| Development | Docker Compose |
| CI | GitHub Actions, Gitleaks, npm audit |

## Project Structure

```text
shelifts-booking/
├── .github/workflows/
├── client/             # React frontend
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── db/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── utils/
│   └── public/         # Built React application
├── database/
│   ├── init/           # Database schema and seed data
│   └── compose.yaml
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 24+
- npm
- Docker Desktop eller Docker Engine med Compose

### 1. Clone Repository

```bash
git clone <repository-url>
cd shelifts-booking
```

### 2. Environment Variables

Skapa följande filer utifrån respektive `.env.example`:

```text
server/.env
database/.env
```

Konfigurera databasanslutning, sessionshemlighet och övriga miljövariabler.

### 3. Start Database

```bash
cd database
docker compose up -d
```

Vid första uppstart skapas databastabellerna och seed-data läggs in automatiskt.

### 4. Start Backend

Öppna en ny terminal:

```bash
cd server
npm ci
npm run dev
```

Backend körs som standard på:

`http://localhost:3000`

### 5. Start Frontend

Öppna ytterligare en terminal:

```bash
cd client
npm ci
npm run dev
```

Frontend körs som standard på:

`http://localhost:5173`

## Build Frontend

För att bygga React-applikationen:

```bash
cd client
npm run build
```

Den färdiga applikationen placeras i `server/public/` och kan serveras direkt av Express.

## API

Alla API-endpoints använder prefixet `/api`.

Exempel:

```http
GET /api/health
```

## Development Workflow

Vi använder GitHub med `main`, `dev` och separata feature branches.

```text
feature/* → dev → main
```

- Skapa en feature branch för nya funktioner.
- Öppna en Pull Request mot `dev`.
- GitHub Actions kör säkerhetskontroller.
- Mergning till `main` sker via Pull Request.

## Security

- Sessionshantering med `express-session` och PostgreSQL.
- Rollbaserad åtkomst via ACL.
- Lösenord och API-nycklar lagras inte i Git.
- Gitleaks kontrollerar potentiellt exponerade hemligheter.
- `npm audit` kontrollerar kända sårbarheter i beroenden.

## Planned Features

- Inloggning för administratör och kunder.
- Administrativ hantering av kundkonton.
- Skapa och hantera återkommande träningspass.
- Tilldela klippkort till kunder.
- Boka och avboka träningspass.
- Hantera klippsaldo och giltighetsperioder.

## License

Private project. All rights reserved.
