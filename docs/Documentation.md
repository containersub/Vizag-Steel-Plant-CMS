# Contract Management System Documentation

---

## 1. Project Overview and Architecture

The Contract Management System is a web-based application designed to manage assets, complaints, preventive maintenance tasks, and user authentication within an organization. The system consists of a Java backend server and a React frontend client, communicating via RESTful APIs secured with JWT authentication.

### Key Features:
- User registration and login with role-based access control.
- Asset management: add, view, filter, and manage assets.
- Complaint management: log and track complaints related to assets.
- Preventive maintenance task management.
- Role-based dashboards and UI components.

---

## 2. Backend Design

### 2.1 Server Setup and Routing

The backend is implemented in Java using the built-in `com.sun.net.httpserver.HttpServer` class. The server listens on port 8080 and registers multiple context paths for different API endpoints under the base path `/ContractManagementSystem/`.

The `Main.java` class initializes the server, sets up CORS headers to allow communication with the frontend (running on `http://localhost:5173`), and registers controllers for authentication, assets, complaints, and preventive maintenance tasks.

### 2.2 Controllers and Responsibilities

- **AuthController**: Handles user registration and login, issuing JWT tokens.
- **AssetController**: Manages asset-related operations such as adding assets, retrieving user-specific assets, fetching all assets, and getting total asset counts.
- **ComplaintController**: Manages complaints including adding, updating status, and retrieving complaints by user or department.
- **PmTaskController**: Handles preventive maintenance tasks including creation, retrieval, and status updates.

Each controller implements HTTP handlers for specific endpoints, performing authentication, authorization, input validation, database operations, and JSON serialization/deserialization.

### 2.3 Database Schema and Relationships

The backend uses a MySQL database named `etl_contract_db`. The schema includes the following tables:

- **users**: Stores user information including id, name, email, password hash, contact number, role, and department.
- **assets**: Stores asset details such as id, name, type, location, status, department, user who added the asset, and timestamps.
- **complaints**: Stores complaints related to assets, including asset details, complaint category, description, status, timestamps, and user information.
- **pm_tasks**: Stores preventive maintenance tasks with asset references, quarter, status, user references for various approval stages, and timestamps.

Foreign key constraints enforce relationships between users, assets, complaints, and maintenance tasks.

### 2.4 Authentication and JWT Usage

Authentication is handled via JWT tokens. Upon successful login, the backend issues a JWT containing user email and role. Subsequent API requests require the token in the `Authorization` header as a Bearer token. The backend validates tokens and extracts user information to enforce access control.

---

## 3. Frontend Design

### 3.1 Component Structure and Routing

The frontend is built with React and organized into feature-based directories such as Authentication, Dashboard, Assets, Complaints, PM Tasks, Profile, and Reports.

Routing is managed using `react-router-dom`, with role-based redirects implemented in the login component to navigate users to appropriate dashboards.

### 3.2 Authentication Flow

The `LoginPage.jsx` component handles user login by sending credentials to the backend login endpoint. On success, it stores the JWT token and user data in localStorage and updates the authentication context. Users are redirected based on their roles.

### 3.3 Asset Management UI and Features

The `Assets.jsx` component provides a rich UI for managing assets:

- Fetches user-specific assets from the backend using JWT authentication.
- Supports searching, filtering by department and asset type, sorting by columns, and pagination.
- Displays assets in a table with clickable rows to view detailed information in a modal.
- Allows adding new assets via a modal form with client-side validation and backend POST request.
- Uses third-party libraries such as `react-toastify` for notifications and `lucide-react` for icons.

---

## 4. API Endpoints

| Endpoint                                | Method | Description                                  | Authentication Required |
|----------------------------------------|--------|----------------------------------------------|-------------------------|
| /ContractManagementSystem/register      | POST   | Register a new user                          | No                      |
| /ContractManagementSystem/login         | POST   | User login, returns JWT token                | No                      |
| /ContractManagementSystem/assets        | POST   | Add a new asset                              | Yes                     |
| /ContractManagementSystem/assets/all    | GET    | Get all assets                               | Yes                     |
| /ContractManagementSystem/user-assets   | GET    | Get assets specific to authenticated user   | Yes                     |
| /ContractManagementSystem/assets/total  | GET    | Get total count of assets                     | Yes (Admin/Engineer)    |
| /ContractManagementSystem/complaints    | GET/POST/PUT | Manage complaints                          | Yes                     |
| /ContractManagementSystem/user-complaints | GET  | Get complaints specific to user              | Yes                     |
| /ContractManagementSystem/complaints/department/{department} | GET | Get complaints by department | Yes                     |
| /ContractManagementSystem/pm-tasks      | GET/POST | Manage preventive maintenance tasks          | Yes                     |

---

## 5. Build, Run, and Deployment Instructions

### Backend

- Requires Java 11+ and MySQL database.
- Configure database credentials in `DatabaseUtil.java`.
- Run `DatabaseUtil.main()` once to create tables.
- Build with Maven: `mvn clean package`.
- Run the backend server: `java -jar target/contract-management-backend-1.0-SNAPSHOT.jar`.

### Frontend

- Requires Node.js and npm.
- Install dependencies: `npm install`.
- Run development server: `npm run dev`.
- Access frontend at `http://localhost:5173`.

---

## 6. Technologies and Dependencies

- Backend:
  - Java 11+
  - com.sun.net.httpserver.HttpServer
  - MySQL
  - Jackson for JSON processing
  - Maven for build management

- Frontend:
  - React 18+
  - react-router-dom
  - react-hot-toast
  - react-toastify
  - lucide-react icons
  - Vite build tool

---

## 7. Additional Notes and Future Enhancements

- Role-based access control is implemented but can be extended with finer permissions.
- UI can be enhanced with more responsive design and accessibility improvements.
- Add unit and integration tests for backend and frontend.
- Implement logging and monitoring for backend services.
- Support deployment with Docker and CI/CD pipelines.

---

# Appendix

- Database schema SQL scripts.
- Sample API request and response payloads.
- Frontend component hierarchy diagram.

---

*End of Documentation*
