# Disaster Relief Coordination Portal

## 1. Project Overview

The **Disaster Relief Coordination Portal** is a web-based system designed for coordinating disaster relief requests between victims, administrators, and relief workers.

### Core Workflow
```
Victim Submits Request
  ↓
Admin Reviews Request
  ↓
Admin Assigns Relief Worker
  ↓
Worker Handles Request & Logs Progress
  ↓
Worker Completes Request
  ↓
Victim and Admin View Updated Status
```

---

## 2. Key Features

### Victim
- Register public account and log in
- Submit disaster relief requests
- View personal requests list
- View detailed status of submitted requests
- Track live request status updates (`PENDING` → `ASSIGNED` → `IN_PROGRESS` → `COMPLETED`)

### Admin
- Log in to administration dashboard
- Monitor real-time system statistics (`Total`, `Pending`, `Assigned`, `In Progress`, `Completed`)
- View all relief requests submitted across the system
- Inspect complete request details including victim information
- Create field relief worker accounts
- Assign relief workers to pending requests
- Oversee progress and completion status

### Relief Worker
- Log in to relief worker dashboard
- View personal work summary statistics (`Assigned`, `In Progress`, `Completed`)
- View requests specifically assigned to them
- Inspect victim contact details and relief location
- Transition assigned requests from `ASSIGNED` to `IN_PROGRESS`
- Add time-stamped progress update notes to the timeline
- Mark completed requests as `COMPLETED`

### Security
- JWT authentication (`Bearer <token>`)
- Role-based authorization (`VICTIM`, `WORKER`, `ADMIN`)
- Password hashing using `bcryptjs`
- Strict victim request ownership validation
- Worker assignment and request ownership protection
- Protected Admin & Worker API endpoints
- Controlled and validated status state transitions

---

## 3. Request Workflow

```
PENDING  ──(Admin Assigns Worker)──►  ASSIGNED  ──(Worker Starts Task)──►  IN_PROGRESS  ──(Worker Completes Task)──►  COMPLETED
```

- **PENDING**: Automatically set when a Victim submits a new relief request.
- **ASSIGNED**: Transitioned by an Administrator upon selecting and assigning a Relief Worker.
- **IN_PROGRESS**: Transitioned by the assigned Relief Worker when initiating field operations.
- **COMPLETED**: Transitioned by the assigned Relief Worker after finalizing assistance.

---

## 4. Request Types

- `FOOD`: Essential food and nutrition supplies
- `WATER`: Drinking water and sanitation supplies
- `MEDICAL`: Emergency medical attention and supplies
- `SHELTER`: Temporary housing and bedding
- `RESCUE`: Evacuation and rescue assistance
- `OTHER`: Miscellaneous emergency assistance

---

## 5. Priority Levels

- `LOW`: Standard non-urgent requests
- `MEDIUM`: Important requests needing timely response
- `HIGH`: Critical emergency requests requiring immediate attention

---

## 6. User Roles

| Role | Responsibilities |
| :--- | :--- |
| **Victim** | Submits relief requests, views personal request history, and tracks resolution status. |
| **Admin** | Oversees system statistics, manages all requests, creates worker accounts, and assigns workers. |
| **Relief Worker** | Manages assigned field requests, initiates work, logs progress updates, and completes requests. |

---

## 7. Technology Stack

### Frontend
- **Framework**: React (v18) + Vite
- **Routing**: React Router (v6)
- **HTTP Client**: Axios
- **Styling**: Custom responsive CSS

### Backend
- **Runtime**: Node.js (v22)
- **Framework**: Express.js
- **Authentication**: JSON Web Tokens (`jsonwebtoken`)
- **Security**: Password hashing (`bcryptjs`), CORS, `dotenv`

### Database
- **Engine**: SQLite 3 (`sqlite3`)

### Development & Build
- **Package Manager**: npm
- **Version Control**: Git

---

## 8. Project Structure

```
Disaster-Relief-Portal/
├── backend/
│   ├── database/
│   │   └── disaster_relief.db (Git-ignored)
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── controllers/
│   │   │   ├── adminController.js
│   │   │   ├── authController.js
│   │   │   ├── requestController.js
│   │   │   └── workerController.js
│   │   ├── middleware/
│   │   │   └── authMiddleware.js
│   │   ├── routes/
│   │   │   ├── adminRoutes.js
│   │   │   ├── authRoutes.js
│   │   │   ├── healthRoutes.js
│   │   │   └── workerRoutes.js
│   │   ├── utils/
│   │   │   └── auth.js
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminRequestDetails.jsx
│   │   │   ├── AdminRequests.jsx
│   │   │   ├── AdminWorkers.jsx
│   │   │   ├── Landing.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── MyRequests.jsx
│   │   │   ├── NewRequest.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── RequestDetails.jsx
│   │   │   ├── VictimDashboard.jsx
│   │   │   ├── WorkerDashboard.jsx
│   │   │   ├── WorkerRequestDetails.jsx
│   │   │   └── WorkerRequests.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── .gitignore
└── README.md
```

---

## 9. Local Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd Disaster-Relief-Portal
```

### 2. Backend Setup
```bash
cd backend
npm install
```

### 3. Configure Environment
Copy `.env.example` to create `.env`:
```bash
cp .env.example .env
```
Inside `backend/.env`, set:
```env
PORT=5000
JWT_SECRET=replace_with_a_secure_secret
```

### 4. Start Backend Server
```bash
npm run dev
```
The backend API server will start on `http://localhost:5000`.

### 5. Frontend Setup
Open a new terminal window:
```bash
cd Disaster-Relief-Portal/frontend
npm install
npm run dev
```
The frontend application will start on `http://localhost:3000`.

---

## 10. Authentication & Credentials

- **Victims**: Register via the public `/register` form. Public registration strictly forces `role = 'VICTIM'`.
- **Relief Workers**: Created by Administrators through the `/admin/workers` interface. Role is automatically set to `WORKER`.
- **Administrator**: An initial development admin account (`admin@disasterrelief.local` / `Admin@12345`) is automatically seeded upon database startup for local testing.
- **Security**: JWT tokens are issued upon login and stored locally. All passwords are saved as salted `bcryptjs` hashes.

---

## 11. API Overview

### Health
- `GET /api/health` — Public health check & DB status

### Authentication
- `POST /api/auth/register` — Public victim registration
- `POST /api/auth/login` — Account login & JWT issuance

### Victim (`VICTIM` Role)
- `POST /api/requests` — Submit new relief request
- `GET /api/requests/my` — Get logged-in victim's requests
- `GET /api/requests/:id` — Get single request details (ownership enforced)

### Administrator (`ADMIN` Role)
- `GET /api/admin/stats` — Get real-time system statistics
- `GET /api/admin/requests` — Get all system requests with victim/worker details
- `GET /api/admin/requests/:id` — Get request details by ID
- `GET /api/admin/workers` — Get list of all relief workers
- `POST /api/admin/workers` — Create a new relief worker account
- `PATCH /api/admin/requests/:id/assign` — Assign a worker to a request (`PENDING` → `ASSIGNED`)

### Relief Worker (`WORKER` Role)
- `GET /api/worker/stats` — Get worker dashboard statistics
- `GET /api/worker/requests` — Get assigned requests list
- `GET /api/worker/requests/:id` — Get assigned request details (ownership enforced)
- `PATCH /api/worker/requests/:id/start` — Start request (`ASSIGNED` → `IN_PROGRESS`)
- `POST /api/worker/requests/:id/updates` — Log a progress update message
- `GET /api/worker/requests/:id/updates` — Get timeline of progress updates
- `PATCH /api/worker/requests/:id/complete` — Complete request (`IN_PROGRESS` → `COMPLETED`)

---

## 12. Security Model

- **Token Authentication**: Secure HTTP header token verification (`Authorization: Bearer <token>`).
- **Role-Based Authorization**: Endpoints guarded by role checks (`VICTIM`, `WORKER`, `ADMIN`).
- **Data Isolation**: Victims can only view their own requests; workers can only view and update assigned requests.
- **Strict State Transitions**: Enforces valid status transitions (`PENDING` → `ASSIGNED` → `IN_PROGRESS` → `COMPLETED`).
- **Parameterization**: Prepared statements prevent SQL injection in SQLite queries.
- **Password Safety**: Salted bcrypt hashing prevents plain-text credential storage.

---

## 13. Testing & Build Verification

The application has undergone end-to-end verification:
- Victim request creation and personal request listing
- Admin live statistics, request inspection, worker account creation, and worker assignment
- Worker task reception, status transition (`ASSIGNED` → `IN_PROGRESS` → `COMPLETED`), and progress timeline logging
- Cross-user and cross-role security isolation checks
- Production frontend build check (`npm run build`) completed successfully with 0 errors.

---

## 14. Current Limitations & Future Scope

### Implemented Scope
This project is purposefully focused as a clean, lightweight academic coordination portal.

### Future Scope (Not Currently Implemented)
- Real-time WebSockets / Push Notifications
- GPS & Live Maps API integration
- Resource & Inventory management
- External NGO & Government agency integrations
- Chat & Messaging features
- Payment processing

---

## 15. License

This project was developed for academic and educational purposes.
