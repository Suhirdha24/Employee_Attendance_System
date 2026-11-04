# StaffTrack HRMS — Workforce Attendance & Timesheet System

[![Live Demo](https://img.shields.io/badge/Demo-Live%20on%20Vercel-4f46e5?style=for-the-badge&logo=vercel&logoColor=white)](https://employee-attendance-system-d4r7.vercel.app/)
[![Build & Tests](https://img.shields.io/badge/Tests-26%20Passed-10b981?style=for-the-badge&logo=node.js&logoColor=white)](#-comprehensive-automated-test-suite)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

An enterprise-grade, full-stack HRMS platform designed for modern on-site and remote workforces. Features biometric-style workstation punch-in tracking (In-Office vs. Remote WFH), live active shift timers, a real-time manager roster, an attendance history archive with date filtering and pagination, interactive monthly timesheet heatmaps, and payroll-ready CSV exports.

👉 **Live Application**: [https://employee-attendance-system-d4r7.vercel.app/](https://employee-attendance-system-d4r7.vercel.app/)

---

## 🌟 Key Capabilities

### 🔐 1. Modern Corporate Authentication (Stripe / Workday Style)
- **High-Trust Enterprise Card**: Clean, unified corporate card without informal emojis or cluttered marketing text.
- **Segmented Role Switcher**: Instant toggle between **`💼 Employee Portal`** and **`🛡️ Manager Console`**.
- **1-Click Demo Access**: Direct sign-in buttons for instant evaluation without typing credentials.
- **Corporate Single Sign-On (SSO)**: SAML / Okta simulated enterprise identity authentication.
- **Security & Compliance**: TLS 1.3 encryption, SOC 2 Type II assurance, GDPR compliance markers, and password visibility toggle.

### 👨‍💼 2. Employee Workstation
- **Verified Workstation Punch Clock**: Digital clock with instant **Check-In** and **Check-Out** actions.
- **Dynamic Work Mode Toggle**: Switch between `🏢 In-Office` and `🌐 Remote (WFH)` before or during active shifts.
- **Live Elapsed Shift Timer**: Real-time timer with pulsing green indicator for active work shifts (`🟢 02h 45m`).
- **Shift Remarks & Notes**: Attach optional comments to shifts (e.g., client meetings, doctor visits, transit delays).
- **Automated Compliance Engine**: Auto-computes total hours and classifies shifts (*Present*, *Late (>09:30 AM)*, *Half-Day (<4.5 hrs)*, *Absent*).
- **Personal Timesheet Audit**:
  - **Tabular History**: Chronological log with search, work mode badges, and shift status.
  - **Interactive Calendar Heatmap**: Monthly view with color-coded daily status indicators and daily inspector.
- **Profile Management**: Update full name, view department, and change password securely.

### 👩‍💼 3. Manager & HR Console
- **Workforce KPI Overview**: Live metrics for total workforce, present count, absent count, late arrivals, and office vs. remote ratio.
- **Separated Master Attendance Architecture**:
  - **`📅 Today's Attendance (12 Staff)`**: Live roster showing today's 12 employees, real-time check-ins, live elapsed shift timers, and today's quick filter chips (`Present (10)`, `Late (3)`, `Absent (2)`, `Remote (3)`, `In-Office (7)`).
  - **`📁 History Archive (120 Logs)`**: Historical shift records across past working days, featuring a **Filter Date** dropdown and clean pagination (**15 logs per page**, `← Previous  Page 1 of 8  Next →`).
- **Real-Time Active Duration**: Live elapsed counter for all team members currently clocked in.
- **Audit Rectification & Adjustments**: Managers can adjust shift status, hours, work mode, and record justification notes.
- **Employee Drill-Down Inspector**: Deep inspection of individual team member attendance compliance and performance.
- **Payroll-Ready CSV Export**: Instant download of timestamped, filtered audit logs including Work Mode, Hours, and Remarks.

### ⚡ 4. Client-Side Interactive Demo Engine
- Powered by a seamless client-side mock adapter (`mockData.js` & `mockHandler.js`).
- When deployed on platforms like Vercel or when a backend server is offline, the application automatically provides a 100% responsive, functional demo experience with pre-seeded staff records and mock JWT tokens.

---

## 🔑 Default Demo Credentials

Pre-seeded accounts are ready for 1-click evaluation:

| Persona | Role | Corporate Email | Password | Access Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Alex Johnson** | Employee | `alex@company.com` | `password123` | Workstation Punch, Active Timers, History, Profile |
| **Eleanor Vance** | Manager | `manager@company.com` | `manager123` | Master Roster, Historical Archive, Rectifications, CSV Export |

*Note: On the login page, you can also click the **1-Click Sign In →** button under the role switcher for instant zero-typing access.*

---

## 🚀 Tech Stack

### **Frontend**
- **React.js 18** (Functional components, custom hooks)
- **Redux Toolkit & React-Redux** (Centralized authentication & state)
- **React Router v6** (Protected routes with Role-Based Access Control)
- **React Calendar** (Monthly attendance heatmaps)
- **Chart.js, react-chartjs-2 & Recharts** (Analytics & trend visualization)
- **Vanilla CSS (Design Tokens)** (Corporate enterprise design system, responsive breakpoints)

### **Backend**
- **Node.js & Express.js** (RESTful API architecture)
- **MongoDB & Mongoose** (Dual-mode support: MongoDB Atlas + Local MongoDB fallback)
- **JWT (JSON Web Tokens)** (Stateless authorization with Bearer tokens)
- **bcryptjs** (Enterprise-grade password hashing)
- **CORS & dotenv** (Security & environment variable handling)

---

## 📦 Local Setup & Installation

### **Prerequisites**
- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/) (Local Community Server on `mongodb://127.0.0.1:27017` or a MongoDB Atlas URI)

---

### **1. Clone Repository**
```bash
git clone https://github.com/Suhirdha24/Employee_Attendance_System.git
cd Employee_Attendance_System
```

---

### **2. Backend Setup**
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/attendanceDB
JWT_SECRET=supersecretattendancejwtkey_2026_dev_env
```
*(If MongoDB Atlas connection times out, the backend automatically falls back to your local MongoDB server on port 27017.)*

Seed sample workforce data:
```bash
npm run seed
```

Start the backend server:
```bash
npm start
# Server listens on http://localhost:5000
```

Run the backend test suite:
```bash
npm test
```

---

### **3. Frontend Setup**
Open a new terminal window:
```bash
cd frontend
npm install
npm start
# Application opens on http://localhost:3000
```

To create an optimized production build:
```bash
npm run build
```

---

## 🧪 Comprehensive Automated Test Suite

StaffTrack HRMS includes a built-in automated test suite covering health, authentication, RBAC boundaries, punch-in/out logic, manager analytics, and CSV exports:

```bash
cd backend
npm test
```

### Test Suite Results:
```text
====================================================
🧪 RUNNING COMPREHENSIVE ATTENDANCE SYSTEM TEST SUITE
====================================================

--- 1. SYSTEM HEALTH CHECKS ---
✅ [PASS] GET /api/health responds with 200 OK

--- 2. AUTHENTICATION & SECURITY ---
✅ [PASS] Employee login (alex@company.com) returns JWT token
✅ [PASS] Manager login returns JWT with role "manager"
✅ [PASS] Invalid password correctly rejected with 400 Bad Request
✅ [PASS] GET /api/auth/me returns authenticated employee profile
✅ [PASS] POST /api/auth/request-reset verifies email and returns user ID
✅ [PASS] POST /api/auth/register provisions user with generated employeeId
✅ [PASS] PUT /api/auth/profile updates user display name

--- 3. EMPLOYEE ATTENDANCE OPERATIONS ---
✅ [PASS] POST /api/attendance/checkin records valid punch time with Remote workMode
✅ [PASS] POST /api/attendance/checkin prevents double check-in on the same day
✅ [PASS] POST /api/attendance/checkout records check-out time and totalHours
✅ [PASS] POST /api/attendance/checkout prevents double check-out on the same day
✅ [PASS] GET /api/attendance/today returns today attendance object
✅ [PASS] GET /api/attendance/my-history returns attendance history array
✅ [PASS] GET /api/attendance/my-summary returns compliance metrics
✅ [PASS] GET /api/dashboard/employee returns live workstation data

--- 4. ROLE-BASED ACCESS CONTROL (RBAC) ---
✅ [PASS] Employee token accessing manager route GET /api/attendance/all is blocked with 403 Forbidden

--- 5. MANAGER WORKFORCE OPERATIONS ---
✅ [PASS] GET /api/attendance/all returns attendance logs
✅ [PASS] GET /api/attendance/all?department=Engineering filters correctly
✅ [PASS] GET /api/attendance/all?status=present filters correctly
✅ [PASS] GET /api/attendance/all-today returns status for team members
✅ [PASS] GET /api/attendance/employee/:id returns comprehensive drilldown for Alex Johnson
✅ [PASS] PUT /api/attendance/:id rectifies record and sets modifiedByManager flag
✅ [PASS] GET /api/attendance/summary returns metrics for workforce
✅ [PASS] GET /api/dashboard/manager returns KPI overview and 7-day trend series
✅ [PASS] GET /api/attendance/export generates valid CSV with Work Mode & Remarks columns

====================================================
📊 TEST SUITE SUMMARY: 26 PASSED | 0 FAILED
====================================================
🎉 ALL SYSTEM FUNCTIONS ARE WORKING PROPERLY!
```

---

## 📁 Repository Structure

```text
Employee_Attendance_System/
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration & local MongoDB fallback
│   │   ├── controllers/     # Authentication, Attendance, Dashboard controllers
│   │   ├── middleware/      # JWT verification & RBAC role guards
│   │   ├── models/          # User, Attendance, Department Mongoose schemas
│   │   ├── routes/          # API route definitions (/auth, /attendance, /dashboard)
│   │   └── server.js        # Express app entrypoint & middleware setup
│   ├── seed.js              # Database seeder with sample workforce records
│   ├── test-suite.js        # Comprehensive 26-endpoint automated test suite
│   └── package.json
├── frontend/
│   ├── public/              # Static HTML & assets
│   ├── src/
│   │   ├── api/             # Axios instance & Vercel client-side mock adapter
│   │   ├── components/      # Navbar, Toast notifications, Error boundaries
│   │   ├── features/        # Redux Toolkit auth slice & actions
│   │   ├── pages/           # Employee/Manager Dashboards, Punch Clock, Login, Reports
│   │   ├── styles/          # Design tokens, typography & CSS stylesheets
│   │   ├── App.js           # Route configuration & role protection
│   │   └── index.js         # React root mounting
│   └── package.json
└── README.md
```

---

## 📄 License

This project is licensed under the **MIT License**. Free for open-source and commercial use.
