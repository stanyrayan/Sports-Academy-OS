# CricAcademy-OS

A placement-ready MERN stack SaaS project for cricket academies. It manages academy operations, player documents, age-group eligibility, fee tracking, and multidimensional skill evaluation through radar charts.

## Demo Accounts

| Role | Email | Password |
| --- | --- | --- |
| Admin | admin@cric.test | admin123 |
| Coach | coach@cric.test | coach123 |
| Player / Parent | player@cric.test | player123 |

## Run Locally

```bash
npm install
npm run dev
```

The React preview app runs on `http://127.0.0.1:4173` and the API runs on `http://127.0.0.1:5000`.

On Windows PowerShell, if `npm` is blocked by the local execution policy, use:

```bash
npm.cmd install
npm.cmd run dev
```

If `MONGO_URI` is not set, the API uses seeded in-memory data so the project can be demoed immediately. Add MongoDB Atlas and Cloudinary credentials in `.env` when you want persistent data and real uploads.

## Core Features

- Role-based JWT authentication for Admin, Coach, and Player users.
- Multi-tenant academy data model using `academyId` across records.
- Fee and revenue dashboard for academy owners.
- Age-fraud eligibility validator for Under-14, Under-16, and Under-19 trial pipelines.
- Document vault flow for birth certificates, mark sheets, Aadhaar, and admin verification.
- Coach-entered Skill-DNA assessments with Recharts radar visualizations.

## Privacy Note

Use mock Aadhaar and sample documents for demos. Real identity documents should be stored only with user consent, private storage, signed URLs, retention rules, and compliance review.
