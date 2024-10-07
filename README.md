# Accommodation Booking Platform - PlaceToStay website

## Overview

This project is a PlaceToStay website, Accommodation Booking Platform for managing accommodations and bookings. It includes user and admin functionalities for searching, booking, and managing accommodations. The application is built with Next.js, Firebase.

## Prerequisites

- Node.js (v14+)
- Firebase account with Firestore and Authentication enabled

## Setup Instructions

1. **Clone the repository**:

   ```bash
   git clone https://github.com/Didi11111/PlaceToStay.git
Install dependencies:

```bash
npm install
Add Firebase Configuration:
```

Create a .env.local file in the root directory.

Add the Firebase configuration values:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=the-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=the-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=the-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=the-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=the-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=the-app-id
```

Note: You will receive the Firebase configuration separately in the Report 2.

Run the development server:

```bash
npm run dev
```
Access the app at http://localhost:3000.

Admin Functionality:

If checking admin features, use the provided admin credentials: admin@gmail.com / password: 123456

Admin features include managing accommodations and user bookings.

Firebase Functions:

To deploy Firebase functions (if required):

```bash
cd functions
firebase deploy --only functions
```
Important Notes
Environment Variables: Make sure to add the environment variables in the .env.local file for Firebase to work.
Admin Account: Use the provided admin login credentials for testing admin features.
Security: Firebase configuration is not included in this repository for security reasons.
That's it! For further details, please refer to the provided report.