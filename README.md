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
<img width="1222" height="667" alt="image" src="https://github.com/user-attachments/assets/5295af9a-4d5f-4e4b-b6f8-976c42566185" />
<img width="1163" height="535" alt="image" src="https://github.com/user-attachments/assets/ad6adb1d-76c8-4ab0-90e6-6ad946eff3b3" />
<img width="1064" height="498" alt="image" src="https://github.com/user-attachments/assets/6151f3a1-dd56-4e24-b269-242ef01f0ba4" />
<img width="1109" height="528" alt="image" src="https://github.com/user-attachments/assets/8ad705e3-1d90-4332-891d-417908319a5a" />
<img width="1255" height="621" alt="image" src="https://github.com/user-attachments/assets/76b37966-5c71-42c2-8a5a-a55e91bf752f" />
<img width="983" height="580" alt="image" src="https://github.com/user-attachments/assets/b2cdaf05-60dd-4c41-943a-7672a781d4ed" />
<img width="710" height="558" alt="image" src="https://github.com/user-attachments/assets/1765b9c5-36a0-45cd-b763-f2b462082434" />



