# Garage Log
 
A personal web app for tracking maintenance on family vehicles.
 
**Live demo:** https://nezkos-garage.com
 
![Garage Log screenshot](docs/screenshot.png)
 
## Features
- Google sign-in with Firebase Authentication
- Vehicle records: name, make, model, year, mileage, color, plus optional trim, VIN, and license plate
- Per-owner access: each vehicle can only be read or changed by the users listed as its owners
**Roadmap:** per-vehicle maintenance history (service type, date, mileage, cost, details) with add, edit, and delete.
 
## Tech stack
- **Frontend:** React, TypeScript, Vite, TanStack Query
- **Auth and data:** Firebase Authentication (Google sign-in) and Firestore
- **Hosting:** AWS Amplify Hosting
- **DNS and domain:** Amazon Route 53 (domain registration and hosted zone)
- **HTTPS:** Amplify-managed certificate (AWS Certificate Manager)
- **CI/CD:** Amplify builds and deploys automatically on every push to `main`

## Architecture
The browser talks directly to Firebase. There is no backend server of my own, and
access is enforced by Firestore security rules: each vehicle document has an
`owners` list, and only those users can read or change it.
 
```
Browser (React app on AWS Amplify)
   |-- Google sign-in --> Firebase Authentication
   |-- reads/writes   --> Firestore (checked by security rules)
```
 
## Run locally
```bash
cd ui
npm install
npm run dev
```
 
You'll need a Firebase project with Google sign-in and Firestore enabled. The
Firebase web app config is set up in `ui/src/lib/firebase.ts`.
 
## Deployment
Pushes to `main` trigger an Amplify build (`amplify.yml`). The site started as a
static site on S3 deployed with GitHub Actions, then moved to Amplify for managed
HTTPS, custom domain support, and simpler CI/CD.
 
The custom domain (`nezkos-garage.com`) is registered in Route 53. Amplify
manages the DNS records and certificate in the domain's hosted zone.
 
## Lessons learned
- Adding a custom domain in Amplify before registering it created a second hosted
  zone that conflicted with the one the Route 53 registrar made. Registering the
  domain first, then letting Amplify write its records into the registrar's zone,
  fixed certificate validation.
- Every new domain a site is served from has to be added to Firebase's authorized
  domains list, or Google sign-in fails.