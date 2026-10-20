# StaffTrack HRMS — Workforce Attendance & Timesheet System

An enterprise-grade, full-stack MERN application for modern workforce management. Enables employees to record verified biometric-style punch times (Check-In / Check-Out) and provides managers with real-time attendance telemetry, compliance auditing, department filtering, and CSV timesheet exports.

---

## 🚀 Tech Stack

### **Frontend**
- **React.js 18** (Functional components, Hooks)
- **Redux Toolkit & React-Redux** (Centralized state management)
- **React Router v6** (Protected routes with Role-Based Access Control)
- **React Calendar** (Interactive monthly attendance heatmaps)
- **Chart.js & react-chartjs-2** (Attendance analytics & weekly trends)
- **Vanilla CSS (Design Tokens)** (Corporate HRMS theme, crisp typography, responsive layout)

### **Backend**
- **Node.js & Express.js** (RESTful API architecture)
- **MongoDB & Mongoose** (Dual-mode support: MongoDB Atlas + Local MongoDB fallback)
- **JWT (JSON Web Tokens)** (Stateless authorization with `Bearer` tokens)
- **bcryptjs** (Enterprise password hashing)
- **CORS & dotenv** (Cross-origin resource sharing & environment configuration)

---

## 👥 User Roles & Features

### 👨‍💼 **Employee Portal**
- **Secure Authentication**: Register with automated Employee ID generation (`EMP10xx`), sign in with password visibility toggle.
- **Live Workstation Punching**: Real-time digital clock with single-click Check-In and Check-Out.
- **Shift Duration Tracking**: Automated computation of total hours logged and compliance classification (*Present*, *Late (>09:30)*, *Half-Day (<4.5h)*, *Absent*).
- **Personal Timesheet Audit**:
  - **Tabular View**: Chronological log with search and status badges.
  - **Calendar Heatmap**: Interactive calendar with color-coded day tiles and detailed daily shift inspector.
- **Personal Summary Statistics**: Present days, late marks, half days, average working hours.

### 👩‍💼 **Manager & HR Portal**
- **Workforce KPI Dashboard**: Real-time metrics for total workforce, present count, absent count, and late arrivals.
- **7-Day Attendance Trend**: Interactive bar and line charts visualizing presence rates across departments.
- **Workforce Audit Table**: Comprehensive master timesheet with multi-parameter filtering:
  - Filter by Department (Engineering, Marketing, HR, Finance, Operations)
  - Filter by Status (Present, Late, Half-Day, Absent)
  - Search by employee name or ID
- **Employee Drill-Down**: Direct inspection of individual employee historical logs.
- **CSV Data Export**: Instant download of formatted, timestamped attendance audit logs for payroll integration.

---

## 🔑 Default Demo Credentials

For quick evaluation, pre-seeded accounts are ready to use:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Employee** | `alex@company.com` | `password123` | Personal Dashboard, Punches, History |
| **Manager** | `manager@company.com` | `manager123` | Master Audit, Team Analytics, CSV Export |

---

## 📦 Getting Started & Local Setup

### **Prerequisites**
- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/) (Local Community Server running on `mongodb://127.0.0.1:27017` or a MongoDB Atlas URI)

---

### **1. Clone the Repository**
```bash
git clone https://github.com/Suhirdha24/Employee_Attendance_System.git
cd Employee_Attendance_System
```

---

### **2. Backend Configuration & Setup**
Navigate to the `backend` folder:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/attendanceDB
JWT_SECRET=supersecretattendancejwtkey_2026_dev_env
```
*(Note: If using MongoDB Atlas, replace `MONGO_URI` with your Atlas connection string and ensure your IP is whitelisted under Network Access in the Atlas dashboard.)*

Seed the database with sample employees and attendance records:
```bash
npm run seed
# or: node seed.js
```

Start the backend server:
```bash
npm start
# Server runs on: http://localhost:5000
```

---

### **3. Frontend Configuration & Setup**
Open a new terminal and navigate to the `frontend` folder:
```bash
cd frontend
npm install
npm start
# Client application runs on: http://localhost:3000
```

---

### **4. Running Automated Tests**
The backend includes a comprehensive 24-point end-to-end integration test suite verifying health checks, authentication, employee operations, RBAC security, and manager analytics:
```bash
cd backend
npm test
```
**Expected Result**: `24 PASSED | 0 FAILED`

---

## 🗄 Database Schema

### **Users Collection (`User.js`)**
| Field | Type | Description |
| :--- | :--- | :--- |
| `name` | String | Full employee legal name |
| `email` | String | Corporate email address (unique) |
| `password` | String | Hashed using bcryptjs |
| `role` | String | Access level: `employee` or `manager` |
| `employeeId` | String | Auto-generated identifier (`EMP1001`...) |
| `department` | String | `Engineering`, `Marketing`, `HR`, `Finance`, `Operations` |
| `createdAt` | Date | Record timestamp |

### **Attendances Collection (`Attendance.js`)**
| Field | Type | Description |
| :--- | :--- | :--- |
| `userId` | ObjectId | Reference to `User` model |
| `date` | String | Date string (`YYYY-MM-DD`) |
| `checkInTime` | String | Punch-in time (`HH:mm:ss`) |
| `checkOutTime`| String | Punch-out time (`HH:mm:ss`) |
| `status` | String | `present`, `late`, `half-day`, `absent` |
| `totalHours` | Number | Computed shift length in hours |
| `createdAt` | Date | Record timestamp |

---

## 🔗 REST API Reference

### **Authentication (`/api/auth`)**
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new employee profile | Public |
| `POST` | `/api/auth/login` | Authenticate credentials & return JWT | Public |
| `GET` | `/api/auth/me` | Fetch currently logged-in user | Authenticated |
| `POST` | `/api/auth/request-reset` | Validate email for password recovery | Public |
| `POST` | `/api/auth/reset` | Set new account password | Public |

### **Employee Attendance (`/api/attendance`)**
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/attendance/checkin` | Record Check-In punch for today | Employee |
| `POST` | `/api/attendance/checkout` | Record Check-Out punch & compute duration | Employee |
| `GET` | `/api/attendance/today` | Fetch today's punch state | Employee |
| `GET` | `/api/attendance/my-history` | Fetch employee's complete punch history | Employee |
| `GET` | `/api/attendance/my-summary` | Fetch employee's attendance metrics | Employee |

### **Manager Operations (`/api/attendance` & `/api/dashboard`)**
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/attendance/all` | Query all records (supports `?department=`, `?status=`) | Manager |
| `GET` | `/api/attendance/all-today` | Summary of today's team presence | Manager |
| `GET` | `/api/attendance/summary` | Aggregated workforce attendance metrics | Manager |
| `GET` | `/api/attendance/employee/:id` | Drilldown history for a specific employee | Manager |
| `GET` | `/api/attendance/export` | Stream CSV file of verified timesheets | Manager |
| `GET` | `/api/dashboard/manager` | Live metrics & 7-day trend statistics | Manager |

---

## 📁 UI Screenshots

<img width="1222" height="667" alt="StaffTrack Dashboard" src="https://github.com/user-attachments/assets/5295af9a-4d5f-4e4b-b6f8-976c42566185" />
<img width="1163" height="535" alt="Mark Attendance Page" src="https://github.com/user-attachments/assets/ad6adb1d-76c8-4ab0-90e6-6ad946eff3b3" />
<img width="1064" height="498" alt="Attendance History Log" src="https://github.com/user-attachments/assets/6151f3a1-dd56-4e24-b269-242ef01f0ba4" />
<img width="1109" height="528" alt="Team Timesheet Heatmap" src="https://github.com/user-attachments/assets/8ad705e3-1d90-4332-891d-417908319a5a" />
<img width="1255" height="621" alt="Manager Workforce Audit" src="https://github.com/user-attachments/assets/76b37966-5c71-42c2-8a5a-a55e91bf752f" />
<img width="983" height="580" alt="Attendance Reports & Trends" src="https://github.com/user-attachments/assets/b2cdaf05-60dd-4c41-943a-7672a781d4ed" />
<img width="710" height="558" alt="Sign In Page" src="https://github.com/user-attachments/assets/1765b9c5-36a0-45cd-b763-f2b462082434" />

---

## 📄 License
This project is licensed under the MIT License.
