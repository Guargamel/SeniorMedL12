import 'dart:convert';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

import 'api_service.dart';

// ─────────────────────────────────────────────────────────────────────────────
// TOP-LEVEL background message handler
// MUST be a top-level function (not a class method) — FCM requirement.
// Flutter runs this in a separate isolate when the app is terminated/background.
// ─────────────────────────────────────────────────────────────────────────────
@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  // Firebase must be initialized in the background isolate too
  await Firebase.initializeApp();
  // Show a local notification so it appears in the system tray
  await PushNotificationService._showLocalNotification(
    id:    message.hashCode,
    title: message.notification?.title ?? message.data['title'] ?? 'SeniorMed',
    body:  message.notification?.body  ?? message.data['body']  ?? '',
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PushNotificationService
//
// HOW IT WORKS END-TO-END:
//   1. On login, Flutter gets the FCM device token and sends it to Laravel
//      via POST /api/device-token
//   2. When staff approves/declines a request, Laravel calls the FCM HTTP v1 API
//      which sends a push to THAT specific device token
//   3. FCM delivers the push to the phone — even when the app is fully closed
//   4. flutter_local_notifications shows it in the Android/iOS notification tray
//
// SETUP REQUIRED (see SETUP_PUSH_NOTIFICATIONS.md in the zip):
//   - Create a Firebase project, download google-services.json (Android) /
//     GoogleService-Info.plist (iOS) and place them in the correct folders
//   - Add the Firebase service account JSON key to Laravel .env
// ─────────────────────────────────────────────────────────────────────────────
class PushNotificationService {
  PushNotificationService._();
  static final PushNotificationService instance = PushNotificationService._();

  static const _androidChannel = AndroidNotificationChannel(
    'seniormed_requests',           // channel ID
    'Medicine Request Updates',     // channel name shown in Settings
    description: 'Notified when your medicine request is approved or declined.',
    importance: Importance.max,
    playSound: true,
    enableVibration: true,
  );

  static final _localPlugin = FlutterLocalNotificationsPlugin();

  bool _initialized = false;

  // ── Initialize ─────────────────────────────────────────────────────────────
  Future<void> init() async {
    if (_initialized) return;
    _initialized = true;

    // 1. Register background handler (must be set before Firebase.initializeApp)
    FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);

    // 2. Init local notifications plugin (for foreground + background display)
    await _localPlugin.initialize(
      const InitializationSettings(
        android: AndroidInitializationSettings('@mipmap/ic_launcher'),
        iOS: DarwinInitializationSettings(
          requestAlertPermission: true,
          requestBadgePermission: true,
          requestSoundPermission: true,
        ),
      ),
    );

    // 3. Create the Android high-importance channel
    await _localPlugin
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(_androidChannel);

    // 4. Ask for permission (Android 13+ / iOS)
    final messaging = FirebaseMessaging.instance;
    await messaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    // 5. Foreground: FCM by default doesn't show a heads-up on Android when
    //    the app is open — we manually show a local notification instead.
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      final notification = message.notification;
      if (notification != null) {
        _showLocalNotification(
          id:    message.hashCode,
          title: notification.title ?? message.data['title'] ?? 'SeniorMed',
          body:  notification.body  ?? message.data['body']  ?? '',
        );
      }
    });

    // 6. Tapped from background (app was in background, user taps notification)
    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      // Navigate to My Requests — handled via navigatorKey if needed
      debugPrint('[FCM] Notification tapped from background: ${message.data}');
    });
  }

  // ── Register FCM token with Laravel after login ─────────────────────────────
  Future<void> registerToken() async {
    try {
      final token = await FirebaseMessaging.instance.getToken();
      if (token == null || token.isEmpty) {
        debugPrint('[FCM] No token returned from Firebase - check google-services.json');
        return;
      }
      debugPrint('[FCM] Got device token: ${token.substring(0, 30)}...');
      debugPrint('[FCM] Sending to: ${ApiService.instance.currentBaseUrl}/device-token');

      final res = await ApiService.instance.dio.post(
        '/device-token',
        data: {'fcm_token': token},
      );
      debugPrint('[FCM] Server response: \${res.statusCode} \${res.data}');
    } catch (e) {
      // Non-fatal — app works without push if this fails
      debugPrint('[FCM] Token registration failed: \$e');
    }

    // Refresh token if FCM rotates it
    FirebaseMessaging.instance.onTokenRefresh.listen((newToken) async {
      try {
        await ApiService.instance.dio.post(
          '/device-token',
          data: {'fcm_token': newToken},
        );
      } catch (_) {}
    });
  }

  // ── Show a heads-up local notification ─────────────────────────────────────
  static Future<void> _showLocalNotification({
    required int id,
    required String title,
    required String body,
  }) async {
    await _localPlugin.show(
      id,
      title,
      body,
      NotificationDetails(
        android: AndroidNotificationDetails(
          _androidChannel.id,
          _androidChannel.name,
          channelDescription: _androidChannel.description,
          importance: Importance.max,
          priority: Priority.high,
          ticker: 'Medicine Request Update',
          icon: '@mipmap/ic_launcher',
          styleInformation: BigTextStyleInformation(body),
        ),
        iOS: const DarwinNotificationDetails(
          presentAlert: true,
          presentBadge: true,
          presentSound: true,
        ),
      ),
    );
  }
}
