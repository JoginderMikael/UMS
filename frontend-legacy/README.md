# Aura Heights University Management System Frontend

Frontend for the University Management System.

## Backend

Backend repository:

`https://github.com/JoginderMikael/University-Management-System.git`

Backend stack:
- Java
- Spring Boot
- REST API
- PostgreSQL

## Local Development

This project is currently run and tested using **VS Code Live Server**.

### Steps

1. Open this project folder in VS Code.
2. Install/use the Live Server extension.
3. Start Live Server from `index.html` (or `login.html`).
4. Ensure backend is running at:
   - `http://localhost:8081`

Current API base URL is set in:
- `scripts/models/apiConfig.js`

```js
export const API_BASE_URL = "http://localhost:8081/api/v1";
```

## Current Frontend Structure

Main pages:
- `index.html` (public page)
- `login.html`
- `admin/admin.html`
- `student/student.html`
- `faculty/faculty.html`

Admin modules wired in code:
- User Management
- School Management
- Department Management
- Program Management
- Course Management
- Enrollment Management
- Academic Year Management
- Fee Management

## Fee Management (Current)

Implemented admin fee features:
- Configure program semester fee
- View program fee records (separate tab)
- Record student fee payment
- View fee payment records
- Clear student fee

Student search for fee operations uses registration number query endpoint:
- `GET /api/v1/students/registration/details?registrationNumber=...`

## Tested So Far (Manual)

Tested via browser + backend API:
- Login page loads and submits
- Admin page loads and sidebar navigation works
- Fee management tabs render
- Program fee configuration request sends to backend
- Program fee records view loads records by selected school/program
- Student search by registration number (query endpoint)
- Record fee payment flow
- Clear fee flow (load status + clear)
- View fee payment records table rendering from backend response list

## JSDoc Documentation (Docdash)

Generate modern HTML docs for the frontend JavaScript using JSDoc + Docdash.

### Steps

1. Install dependencies:
   - `npm install`
2. Generate docs:
   - `npm run docs`
3. Open generated docs:
   - `docs/jsdoc/index.html`

Notes:
- JSDoc configuration is in `conf.json`.
- Generated files are excluded from git using `.gitignore` (`docs/jsdoc/`).

## Testing and Coverage

The project uses Jasmine for unit testing and Karma with Istanbul for test execution and code coverage, running silently in a headless Chrome browser.

### Running Tests

To run the unit tests once:
```bash
npm run test
```

### Checking Test Coverage

To generate an HTML test coverage report and view it:
1. Run the coverage script:
   ```bash
   npm run test:coverage
   ```
2. The coverage report will be output to the `coverage/report-html` directory.
3. Open `coverage/report-html/index.html` in your browser to view the detailed report interactively.

## Notes

- This repository is frontend only.
- API authorization depends on backend JWT/session behavior.
- If UI changes are not visible, perform a hard refresh (`Ctrl+F5`) while Live Server is running.
