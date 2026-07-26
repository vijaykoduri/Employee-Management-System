# Employee Management System (EMS)

An enterprise-grade, full-stack Employee Management System designed to handle modern organizational needs. The platform supports robust role-based workflows for tracking attendance, leaves, projects, tasks, announcements, payroll processing, performance reviews, and detailed audit logs.

---

## 🚀 Key Features

*   **Role-Based Access Control (RBAC):** Five distinct roles (Super Admin, HR Manager, Department Manager, Team Lead, Employee) with customized dashboards and action privileges.
*   **Employee & Department Directory:** Structured organization chart tracking reporting hierarchies, designations, salaries, and department structures.
*   **Attendance Tracking:** Record daily clock-in/clock-out times, track check-in status (Present, Late, Absent), and automatically compute daily working hours.
*   **Leave Management Workflow:** Simple interface for employees to request leaves, with complete tracking status and automated approval/rejection workflows for managers and HR.
*   **Payroll & Salary Slips:** Dynamic generation of pay slips, automatic calculation of net salary based on allowances and deductions, and payment status updates.
*   **Performance Appraisals:** Performance rating reviews with feedback loops to encourage employee growth.
*   **Project & Task Allocation:** Manage projects and breakdown tasks with progress tracking (Not Started, In Progress, Completed) and assignee links.
*   **Reports & Export Modules:** On-demand export of employee lists, attendance logs, and payroll registers to Excel sheets and PDF documents.
*   **Security & Logs:** JWT-based secure authentication, password encryption, and automated audit logging of critical actions for transparency.

---

## 🛠️ Technology Stack

### Backend
*   **Core Framework:** Java 21, Spring Boot 3.2.5
*   **Security:** Spring Security & Stateless JWT Authentication
*   **Database Access:** Spring Data JPA, Hibernate, MySQL Driver
*   **Documentation:** Springdoc OpenAPI (Swagger UI)
*   **Reporting Libraries:** 
    *   **Apache POI:** Excel generation and data export
    *   **OpenPDF:** PDF document compilation
*   **Utilities:** Project Lombok

### Frontend
*   **Core UI Library:** React 19, Vite
*   **Styling:** Bootstrap 5.3 & Bootstrap Icons (responsive layout design)
*   **Charts:** Chart.js & React-Chartjs-2
*   **HTTP Client:** Axios with Interceptors for JWT inclusion and auth state validation

### Containerization & Devops
*   [docker-compose.yml](file:///c:/projects/Employee%20Management%20System/docker-compose.yml) configures a multi-container environment for MySQL database, Backend REST API, and Frontend web server (Nginx).

---

## 📁 Repository Structure

```text
Employee Management System/
├── backend/
│   ├── src/main/java/com/ems/                  # Spring Boot Java source code
│   │   ├── config/                             # Core configuration (Cors, DatabaseInitializer)
│   │   ├── controller/                         # REST API endpoints
│   │   ├── dto/                                # Data Transfer Objects
│   │   ├── entity/                             # JPA Entity models
│   │   ├── repository/                         # Spring Data JPA Repository interfaces
│   │   ├── security/                           # JWT filters & Security configuration
│   │   └── service/                            # Service interface and business logic
│   ├── pom.xml                                 # Maven backend dependencies config
│   └── Dockerfile                              # Backend multi-stage build configuration
│
├── frontend/
│   ├── src/
│   │   ├── components/                         # Common UI elements (Navbar, Sidebar)
│   │   ├── context/                            # AuthContext state provider
│   │   ├── pages/                              # Screen components (Announcements, Attendance, Employees, etc.)
│   │   ├── services/                           # Axios instance and API call services
│   │   ├── App.jsx                             # React router & page switch logic
│   │   └── main.jsx                            # Application entry point
│   ├── package.json                            # Node.js dependencies & scripts
│   ├── nginx.conf                              # Production web server configuration
│   └── Dockerfile                              # Frontend build & Nginx deployment config
│
├── docker-compose.yml                          # Multi-container orchestrator
└── index.html                                  # Built frontend bundle page
```

---

## 🏃 Getting Started

### Method 1: Using Docker Compose (Recommended)

To run the entire ecosystem (Database, Backend, and Frontend) in single-command mode:

1.  Make sure you have **Docker Desktop** installed and running on your system.
2.  Navigate to the project root and run:
    ```bash
    docker compose up --build -d
    ```
3.  Once the build completes and containers start:
    *   **Frontend UI:** http://localhost:3000
    *   **Backend REST API:** http://localhost:8080/api
    *   **Swagger API Docs:** http://localhost:8080/swagger-ui.html

---

### Method 2: Running Locally (Individual Startup)

#### 1. Setup MySQL Database
*   Install MySQL and run it on port `3306`.
*   Create a schema/database named `employee_management_system`:
    ```sql
    CREATE DATABASE employee_management_system;
    ```

#### 2. Run the Spring Boot Backend
*   Make sure you have **Java 21** and **Maven** installed.
*   Configure the database credentials in [application.properties](file:///c:/projects/Employee%20Management%20System/backend/src/main/resources/application.properties) or set appropriate environment variables (`DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASSWORD`).
*   Navigate to the `backend` folder and start the application:
    ```bash
    cd backend
    mvn spring-boot:run
    ```

#### 3. Run the React Frontend
*   Make sure you have **Node.js 18+** installed.
*   Navigate to the `frontend` folder, install dependencies, and start the development server:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```
*   The frontend dev server typically launches at http://localhost:5173.

---

## 🔑 Initial Seed Data & Credentials

Upon database creation and startup, [DatabaseInitializer.java](file:///c:/projects/Employee%20Management%20System/backend/src/main/java/com/ems/config/DatabaseInitializer.java) seeds default departments and testing users. 

**Default Password for all seed users:** `Password@123`

| User Role | Username | Seed Email | Description |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin` | `admin@ems.com` | Has full access to manage employees, departments, and view audit logs. |
| **HR Manager** | `hr_manager` | `hr@ems.com` | Manages employee profiles, leave requests, and processes payroll/payslips. |
| **Department Manager** | `dept_manager` | `dept@ems.com` | Manages IT department, approves leaves for members, monitors projects and tasks. |
| **Team Lead** | `team_lead` | `lead@ems.com` | Coordinates tasks and tracks performance for assigned team members. |
| **Employee** | `employee` | `emp@ems.com` | Views profile, marks daily attendance, requests leaves, and updates task statuses. |

---

## 📄 API Documentation
With the backend running, swagger documentation is auto-generated and interactive. Visit:
*   **OpenAPI specification:** http://localhost:8080/v3/api-docs
*   **Swagger UI playground:** http://localhost:8080/swagger-ui.html
