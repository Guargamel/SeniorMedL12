SeniorMed Mobile (Flutter)
=========================

This Flutter app re-creates your React pages (resources/js) as mobile-friendly Flutter screens.
It connects to your existing Laravel API (routes/api.php) using Sanctum personal access tokens.

Quick start
----------
1) Open this folder in Android Studio or VS Code
2) Run:
   flutter pub get
3) Start your Laravel backend:
   php artisan serve
4) Start Android emulator, then run:
   flutter run

API base URL
-----------
Edit lib/core/app_config.dart
- Android emulator uses: http://10.0.2.2:8000/api
- Real phone uses your PC LAN IP: http://192.168.x.x:8000/api

Authentication
--------------
This app expects a token login endpoint:
POST /api/login -> { token: "...", user: {...} }

If your Laravel has Breeze for web, keep it.
For mobile tokens you already added a controller/route (recommended):
- POST /api/login (token)
- POST /api/token-logout (delete token)

Notes
-----
Some request payload keys (medicine_id, quantity, notes) may need to match your MedicineRequestController::store.
Adjust in: lib/screens/senior/requests/create_request_screen.dart
