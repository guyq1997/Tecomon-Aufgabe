## 📦 Projektstruktur

```txt
/project-root
├── frontend/         → Next.js Frontend (Dashboard)
│   ├── pages/
├── backend/          → Node.js Backend (Express oder Fastify)
│   ├─src/   
│     ├── routes/
│     ├── controllers/
│     ├── models/
│     ├── services/     → Wetterdaten-Logik inkl. Caching
│     └── cache/        → optional: In-Memory oder File-basierter Cache
└── README.md
```

---

## 🧭 Systemarchitektur

![Systemarchitektur](./PKF.png)

### Datenflüsse
1) Widget anlegen
   - FE → BE: `POST /widgets { location }` → Mongo speichert → `201 Created`
2) Wetter je Widget (mit Cache)
   - FE → BE: `GET /widgets/:id/weather` → Widget lesen → Cache‑Hit: direkt; Miss: Geocode → Forecast → Cache → `200 OK`
3) Direkte Ortssuche
   - FE → BE: `GET /weather?location=Berlin` → Read‑Through wie oben → `200 OK`

### Ports & Umgebungen
- Frontend `3000`, Backend `5050`, Mongo `27017`, Mongo‑Express `8081`
- Frontend: `NEXT_PUBLIC_API_BASE` (lokal `http://localhost:5050`, Compose `/api`)
- Backend: `MONGODB_URI` (lokal `mongodb://localhost:27017/widgets`, Compose `mongodb://mongo:27017/widgets`)


## 🚀 Setup-Anleitung

### Voraussetzungen:
- Node.js (v18+ empfohlen)
- MongoDB (lokal oder über MongoDB Atlas)
- NPM oder Yarn

> Falls `npm`/`yarn` lokal nicht verfügbar ist, können Sie die Apps auch in Docker starten (siehe unten).

### 1. Backend starten

```bash
# Ins Backend wechseln
cd backend

# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm run dev
```

> 💡 Beispiel `.env`-Datei:
```env
MONGODB_URI=mongodb://localhost:27017/widgets
PORT=5000
```

> Alternativ: Docker (Backend)
```bash
docker run --rm -p 27017:27017 --name mongo mongo:7
# neues Terminal
cd backend
cp .env.example .env  # stellen Sie sicher, dass MONGODB_URI auf localhost:27017 zeigt
npm install && npm run dev
```

---

### 2. Frontend starten

```bash
# Ins Frontend wechseln
cd frontend

# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm run dev
```

> 💡 Standardmäßig läuft das Frontend unter `http://localhost:3000`  
> 💡 Das Backend sollte unter `http://localhost:5050` erreichbar sein

> Optional per Docker (Frontend)
```bash
cd frontend
npm install
npm run build && npm start
```

### 3. Datenbank (MongoDB)

Sie können MongoDB lokal installieren oder per Docker Compose starten:

```bash
# Docker Compose (MongoDB + mongo-express UI)
docker compose up -d mongo mongo-express

# mongo-express UI
# http://localhost:8081
```

Verbindung vom Backend (Standard):

```env
MONGODB_URI=mongodb://localhost:27017/widgets
```

Falls Sie das Backend innerhalb von Docker laufen lassen, verwenden Sie:

```env
MONGODB_URI=mongodb://mongo:27017/widgets
```

---

## 🐳 Docker: Schnellstart

```bash
cd /Users/guyuqiang/PKF/Tecomon-Aufgabe-fork
docker compose up -d --build

# Dienste:
# Frontend: http://localhost:3000
# Backend:  http://localhost:5050/health
# Mongo:    localhost:27017
# UI:       http://localhost:8081
```

Compose baut und startet MongoDB, Backend, Frontend und mongo-express. 
Das Frontend greift über `NEXT_PUBLIC_API_BASE=/api` (Rewrite) auf das Backend zu. 
Das Backend verbindet sich über `MONGODB_URI=mongodb://mongo:27017/widgets` mit der Datenbank.
