# *THIS PROJECT IS UNDER WORK*
# Placement Management System

Campus Connect

A comprehensive web application for managing student placements, job opportunities, and career services.

## Project Structure

```
/
├── assets/
│   ├── css/
│   ├── images/
│   └── js/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── database/
│   ├── middleware/
│   ├── migrations/
│   ├── models/
│   ├── node_modules/
│   ├── routes/
│   ├── .env
│   ├── company_profile.json
│   ├── job.json
│   ├── package-lock.json
│   ├── package.json
│   ├── server.js
│   └── setup-db.sql
├── career-counseling.html
├── clear-users.html
├── dashboard-student.html
├── database.sql
├── event-registration.html
├── frontend/
├── index.html
├── job-listings.html
├── login.html
├── package-lock.json
├── package.json
├── placement-management.html
├── profile-student.html
├── register.html
└── student-verification.html
```

## Features

- User authentication (login/register)
- Student dashboard
- Job listings and applications
- Career counseling services
- Event registration
- Student profile management
- Placement management for administrators
- Dark mode support

## Technologies Used

- HTML, CSS, JavaScript (Frontend)
- Node.js (Backend)
- Local Storage for data persistence
- SQL for database (setup with setup-db.sql)

## Setup Instructions

1. Clone the repository
2. Install dependencies: `npm install`
3. Configure backend environment variables in `.env`
4. Set up the database using `setup-db.sql`
5. Start the backend server: `cd backend && node server.js`
6. Open `index.html` in a browser or set up a local web server

## Development

- Frontend: Edit HTML files and assets directly
- Backend: Modify Node.js files in the backend directory

## Administration

Use `clear-users.html` to clear all registered users from localStorage during development or testing.


