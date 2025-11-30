# Employee Attendance System  
A full-stack MERN application that enables Employees to mark attendance (Check-In / Check-Out) and Managers to view, filter, and manage team attendance.  
This project is part of the Tap Academy SDE Internship Drive Task.

---

## 🚀 Tech Stack

### **Frontend**
- React.js  
- Zustand (state management)  
- React Router  
- Axios  

### **Backend**
- Node.js  
- Express.js  
- MongoDB (Local or Atlas)  
- Mongoose  
- JWT Authentication  

---

## 👤 User Roles & Features

### **Employee**
- Register / Login  
- Mark Check-In  
- Mark Check-Out  
- View Attendance History  
- Monthly Summary  
- Employee Dashboard with statistics  

### **Manager**
- Login  
- View all employees attendance  
- Filter by employee, date, status  
- View daily attendance  
- Export attendance as CSV  
- Manager Dashboard with statistics  

---

## 📌 Required Pages

### **Employee**
- Login / Register  
- Dashboard  
- Mark Attendance  
- Attendance History  
- Profile  

### **Manager**
- Login  
- Dashboard  
- All Employees Attendance  
- Team Calendar View  
- Reports Page  

---

## 🗄 Database Schema

### **Users**
| Field        | Type     | Description |
|--------------|----------|-------------|
| name         | String   | Employee name |
| email        | String   | Unique email |
| password     | String   | Hashed |
| role         | String   | employee / manager |
| employeeId   | String   | Auto-generated (e.g., EMP1023) |
| department   | String   | Department name |
| createdAt    | Date     | Timestamp |

### **Attendance**
| Field        | Type     | Description |
|--------------|----------|-------------|
| userId       | ObjectId | Reference to User |
| date         | String   | YYYY-MM-DD |
| checkInTime  | String   | HH:mm:ss |
| checkOutTime | String   | HH:mm:ss |
| status       | String   | present / absent / late / half-day |
| totalHours   | Number   | Duration |
| createdAt    | Date     | Timestamp |

---

## 🔗 API Endpoints

### **Auth Routes**
| Method | Endpoint            | Description |
|--------|----------------------|-------------|
| POST   | /api/auth/register   | Register new user |
| POST   | /api/auth/login      | Login user |
| GET    | /api/auth/me         | Get logged-in user |

---

### **Employee Attendance**
| Method | Endpoint                       | Description |
|--------|----------------------------------|-------------|
| POST   | /api/attendance/checkin          | Check-In |
| POST   | /api/attendance/checkout         | Check-Out |
| GET    | /api/attendance/my-history       | Employee history |
| GET    | /api/attendance/my-summary       | Monthly summary |
| GET    | /api/attendance/today            | Today's status |

---

### **Manager Attendance**
| Method | Endpoint                           | Description |
|--------|--------------------------------------|-------------|
| GET    | /api/attendance/all                 | All employees attendance |
| GET    | /api/attendance/employee/:id        | Specific employee |
| GET    | /api/attendance/summary             | Team summary |
| GET    | /api/attendance/export              | Export CSV |
| GET    | /api/attendance/today-status        | Present/Absent today |

---

### **Dashboard**
| Method | Endpoint                 | Description |
|--------|----------------------------|-------------|
| GET    | /api/dashboard/employee   | Employee statistics |
| GET    | /api/dashboard/manager    | Manager statistics |

---

## 📁 Project Structure

