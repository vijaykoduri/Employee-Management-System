# Enterprise Employee Management System (EMS Suite)

An enterprise-grade, responsive, and secure Employee Management System built using Java 21, Spring Boot 3.x, Spring Security, JWT Authentication, Hibernate, MySQL, React.js (Vite), Bootstrap 5, and Docker.

---

## Technical Stack Overview

- **Backend**: Java 21, Spring Boot 3.2.5, Spring Security, JWT (jjwt), Spring Data JPA, Hibernate, MySQL, Maven, Lombok, Apache POI (Excel), OpenPDF (PDF reports).
- **Frontend**: React.js 18, Vite, Bootstrap 5, Axios, Chart.js, Bootstrap Icons.
- **Orchestration**: Docker, Docker Compose.
- **Documentation**: Swagger OpenAPI v3.

---

## Core Features

1. **Strict Role-Based Access Control (RBAC)**: Support for 5 roles: `SUPER_ADMIN`, `HR_MANAGER`, `DEPARTMENT_MANAGER`, `TEAM_LEAD`, and `EMPLOYEE`.
2. **Dynamic UI Customization**: Every role gets a completely unique dashboard with separate widgets, colors, sidebar links, and actions.
3. **Strict Login Role Match**: Login only succeeds if credentials AND the selected dropdown role match.
4. **Two-Factor Authentication (2FA)**: Simulates 2-step verification. An option in the Profile page prints a 6-digit code to the backend console on next login.
5. **Comprehensive Modules**:
   - **Employee directory**: CRUD, filter, paginate, sort, and headshot uploads.
   - **Department portal**: CRUD, manager allocation, division metrics.
   - **Attendance punch card**: Check-in, check-out, monthly calendars, and late/overtime indices.
   - **Leave workflow**: Request filings, manager reviews, and remaining balance adjusters.
   - **Payroll compiler**: Run salary slips, apply tax (12%), and download OpenPDF payslips.
   - **Projects & Kanban tasks**: Timelines, progress meters, and task board state transitions.
   - **Performance appraisals**: Numerical ratings (1-5), qualitative reports, and KPI targets.
   - **Memos notice board**: Corporate announcement broadcast logs.
   - **Notification logs**: Unread badges with 15s polling.
   - **Audit Trail logs**: Logs of all transaction events (logins, creates, updates, deletes).
6. **Detailed Reports**: Exporter for Employee, Attendance, Salary, Department, Performance, and Leaves tables as Excel sheets or PDF tables.

---

## Folder Structure

```
/
├── backend/
│   ├── src/main/java/com/ems/
│   │   ├── config/           # Security configurations, startup initializers
│   │   ├── controller/       # REST Endpoints
│   │   ├── dto/              # Request/Response data models
│   │   ├── entity/           # JPA Entities & Enums
│   │   ├── exception/        # Exception handlers
│   │   ├── repository/       # JPA Database access
│   │   ├── security/         # JWT filter, Custom UserDetails
│   │   └── service/          # Business logic layers
│   ├── src/main/resources/   # Application properties, static folders
│   ├── src/test/             # Unit and integration test suites
│   ├── pom.xml
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable Navbar, Sidebar
│   │   ├── context/          # State auth store
│   │   ├── pages/            # Login, Register, Support pages
│   │   │   └── dashboards/   # 5 Custom dashboards
│   │   ├── services/         # Axios wrapper
│   │   ├── App.jsx           # State layout coordinator
│   │   ├── index.css         # Theme stylesheet
│   │   └── main.jsx          # Entry imports
│   ├── package.json
│   ├── nginx.conf
│   └── Dockerfile
└── docker-compose.yml
```

---

## Installation & Setup

### Database Seed Credentials
When the application starts, it automatically seeds default accounts. Use these to log in (password is **`Password@123`** for all):

| Username | Selected Role | Account Holder |
| :--- | :--- | :--- |
| **`admin`** | **`Super Admin`** | System Owner |
| **`hr_manager`** | **`HR Manager`** | Hannah HR Manager |
| **`dept_manager`** | **`Department Manager`** | Donald Dept Manager |
| **`team_lead`** | **`Team Lead`** | Tanya Team Lead |
| **`employee`** | **`Employee`** | Edward Employee |

---

### Run Natively (Local Machine)

#### 1. Database Setup
Create a MySQL database named `employee_management_system`:
```sql
CREATE DATABASE employee_management_system;
```

#### 2. Start Backend
Update JDBC details in `backend/src/main/resources/application.properties` if your MySQL username or password differs from `root`.
```bash
cd backend
mvn clean spring-boot:run
```
The server starts on `http://localhost:8080`.
Open OpenAPI docs at: `http://localhost:8080/swagger-ui.html`.

#### 3. Start Frontend
```bash
cd frontend
npm install
npm run dev
```
The React portal starts on `http://localhost:5173` (or similar).

---

### Run in Docker (Recommended)

Requires Docker Desktop installed. Build and launch all services with a single command from the root folder:

```bash
docker-compose up --build
```

- **MySQL Database** starts on port `3306`.
- **Spring Boot API** starts on port `8080`.
- **React Frontend (via Nginx)** starts on port `3000`. Navigate to `http://localhost:3000` in your browser.

---

## API Endpoints List

- **Auth**:
  - `POST /api/auth/register` (Register profile)
  - `POST /api/auth/login` (Login with role check)
  - `POST /api/auth/verify-2fa` (Submit code)
  - `POST /api/auth/forgot-password` (Forgot password)
- **Employees**:
  - `GET /api/employees` (Search/Paginate list)
  - `POST /api/employees` (Create)
  - `PUT /api/employees/{id}` (Update)
  - `DELETE /api/employees/{id}` (Delete)
  - `POST /api/employees/{id}/photo` (Upload headshot)
- **Departments**:
  - `GET /api/departments` (List all)
  - `POST /api/departments` (Create)
  - `POST /api/departments/{id}/assign-manager` (Set head)
- **Attendance**:
  - `POST /api/attendance/check-in` (Clock-in)
  - `POST /api/attendance/check-out` (Clock-out)
  - `GET /api/attendance/monthly` (Get calendar logs)
- **Leaves**:
  - `POST /api/leaves/apply` (Request time-off)
  - `POST /api/leaves/{id}/review` (Approve/Reject request)
- **Payroll**:
  - `POST /api/payroll/generate` (Compile pay stub)
  - `GET /api/payroll/{id}/pdf` (Download PDF slip)
- **Projects & Tasks**:
  - `POST /api/projects` (Create project board)
  - `PATCH /api/tasks/{id}/status` (Transition Kanban state)
- **Reports Exporter**:
  - `GET /api/reports/{category}/excel` (Spreadsheet download)
  - `GET /api/reports/{category}/pdf` (PDF print download)
  - *Supported categories: `employees`, `attendance`, `salary`, `departments`, `performance`, `leaves`.*
