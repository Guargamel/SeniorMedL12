import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'api_service.dart';

/// PushNotificationService
/// ─────────────────────────────────────────────────────────────────────
/// Shows in-app banner notifications for approved/declined requests.
/// Also tries to show a system notification via platform channel.
///
/// NO external notification package required — uses:
///   • flutter_secure_storage (already in pubspec) for last-seen tracking
///   • A platform MethodChannel for the native toast/notification
///   • An overlay SnackBar / banner for foreground in-app notifications
///
/// For true background push, you would add firebase_messaging to pubspec.
/// This implementation covers the foreground + polling case robustly.
class PushNotificationService {
  PushNotificationService._();
  static final PushNotificationService instance = PushNotificationService._();

  static const _storage = FlutterSecureStorage();
  static const _lastNotifKey = 'last_pushed_notification_id';
  static const _channel = MethodChannel('com.seniormed.notifications');

  Timer? _timer;

  // Callback so UI can show a SnackBar / banner when foregrounded
  void Function(String title, String body, bool approved)? onNotification;

  /// Call once after login. Pass a [BuildContext] to show in-app banners.
  void startPolling({BuildContext? context}) {
    _timer?.cancel();
    _pollNow(context: context);
    _timer = Timer.periodic(const Duration(seconds: 30), (_) => _pollNow(context: context));
  }

  void stopPolling() {
    _timer?.cancel();
    _timer = null;
  }

  Future<void> _pollNow({BuildContext? context}) async {
    try {
      final res = await ApiService.instance.dio.get('/notifications');
      if (res.statusCode != 200) return;

      final data = res.data;
      final list = (data is Map && data['data'] is List)
          ? data['data'] as List
          : (data is List ? data : <dynamic>[]);

      final lastIdRaw = await _storage.read(key: _lastNotifKey);
      final lastId = int.tryParse(lastIdRaw ?? '') ?? 0;

      int newLastId = lastId;
      final toShow = <Map>[];

      for (final item in list) {
        if (item is! Map) continue;
        final id = (item['id'] is int)
            ? item['id'] as int
            : int.tryParse(item['id']?.toString() ?? '') ?? 0;
        if (id <= lastId) continue;

        final type = (item['type'] ?? '').toString();
        if (type.contains('approved') || type.contains('declined')) {
          toShow.add(item as Map);
        }
        if (id > newLastId) newLastId = id;
      }

      if (newLastId > lastId) {
        await _storage.write(key: _lastNotifKey, value: newLastId.toString());
      }

      for (final n in toShow) {
        final title = (n['title'] ?? 'Medicine Request Update').toString();
        final body  = (n['message'] ?? '').toString();
        final isApproved = (n['type'] ?? '').toString().contains('approved');

        // 1. Try native system notification via platform channel
        await _showNative(title, body);

        // 2. Show in-app overlay if context is available
        if (context != null && context.mounted) {
          _showInAppBanner(context, title, body, isApproved);
        }

        // 3. Call optional callback
        onNotification?.call(title, body, isApproved);
      }
    } catch (_) {
      // Silent — never disrupt app
    }
  }

  Future<void> _showNative(String title, String body) async {
    try {
      await _channel.invokeMethod('showNotification', {
        'title': title,
        'body':  body,
        'channelId': 'medicine_requests',
        'channelName': 'Medicine Requests',
      });
    } catch (_) {
      // Platform channel not wired up — in-app banner still shows
    }
  }

  void _showInAppBanner(BuildContext context, String title, String body, bool approved) {
    if (!context.mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        duration: const Duration(seconds: 6),
        backgroundColor: approved ? Colors.green.shade700 : Colors.red.shade700,
        behavior: SnackBarBehavior.floating,
        margin: const EdgeInsets.all(12),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        content: Row(
          children: [
            Icon(
              approved ? Icons.check_circle : Icons.cancel,
              color: Colors.white,
              size: 28,
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Colors.white)),
                  const SizedBox(height: 2),
                  Text(body, style: const TextStyle(fontSize: 13, color: Colors.white70), maxLines: 3, overflow: TextOverflow.ellipsis),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> resetLastSeen() async {
    await _storage.delete(key: _lastNotifKey);
  }
}
