# 🔔 SeniorMed — Background Push Notifications Setup Guide

Push notifications use **Firebase Cloud Messaging (FCM)**.
This requires a one-time Firebase project setup. Follow every step.

---

## PART 1 — Create Firebase Project (5 minutes)

1. Go to **https://console.firebase.google.com**
2. Click **"Add project"** → name it `SeniorMed` → Continue
3. Disable Google Analytics (not needed) → **Create project**

---

## PART 2 — Add Android App to Firebase

1. In Firebase Console, click the **Android icon** (⚙ Add app)
2. **Android package name**: must match your `AndroidManifest.xml`
   - Open `android/app/src/main/AndroidManifest.xml`
   - Look for `package="com.example.seniormed_mobile"` (or similar)
   - Copy that exact package name into Firebase
3. App nickname: `SeniorMed Mobile` → **Register app**
4. **Download `google-services.json`**
5. Place it here: `android/app/google-services.json`

---

## PART 3 — Configure Android build files

### File: `android/build.gradle` (project-level)
Add inside `buildscript > dependencies`:
```gradle
classpath 'com.google.gms:google-services:4.4.2'
```

### File: `android/app/build.gradle` (app-level)
At the very **bottom** of the file, add:
```gradle
apply plugin: 'com.google.gms.google-services'
```

---

## PART 4 — Laravel Backend Setup

### Step 1: Get Firebase Service Account Key
1. Firebase Console → **Project Settings** (gear icon) → **Service Accounts** tab
2. Click **"Generate new private key"** → **Generate key**
3. A JSON file downloads (e.g. `seniormed-firebase-adminsdk-xxxxx.json`)
4. Rename it to `firebase-service-account.json`
5. Place it here in your Laravel project: `storage/app/firebase-service-account.json`

### Step 2: Add to Laravel `.env`
```env
FIREBASE_PROJECT_ID=your-project-id-here
FIREBASE_CREDENTIALS=storage/app/firebase-service-account.json
```
> Your project ID is visible in Firebase Console → Project Settings → General
> Example: `seniormed-12345`

### Step 3: Run the migration
```bash
php artisan migrate
```
This adds the `fcm_token` column to the `users` table.

---

## PART 5 — How It Works (End to End)

```
Senior logs in on phone
   ↓
Flutter gets FCM device token from Firebase
   ↓
Flutter sends token to Laravel POST /api/device-token
   ↓
Laravel saves token in users.fcm_token
   ↓
Staff approves/declines request in web panel
   ↓
Laravel calls Firebase FCM API with the senior's token
   ↓
Firebase delivers push to the phone — even if app is CLOSED
   ↓
Notification appears in phone notification tray (like Facebook)
```

---

## PART 6 — Testing

1. Login on the phone — check Laravel logs for `[FCM] Token registered`
2. Approve a request from the web panel
3. Check Laravel logs for `[FCM] Push delivery` — should say success
4. Notification should appear on phone within 1–3 seconds

### If not working, check:
- `storage/app/firebase-service-account.json` exists
- `.env` has correct `FIREBASE_PROJECT_ID`
- `google-services.json` is in `android/app/`
- Run `php artisan config:cache` after changing `.env`

---

## PART 7 — iOS (if needed later)

For iOS push notifications, additional steps are required:
- Apple Developer account
- APNs certificate or key uploaded to Firebase
- `GoogleService-Info.plist` placed in `ios/Runner/`

iOS setup is more complex. Focus on Android first.
