import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import 'api_service.dart';

/// Simple badge logic for seniors:
/// - Fetch /notifications
/// - Show a badge if there are notifications newer than the last one the user has "seen".
/// - When the user opens the Notifications screen, we update lastSeenId to the latest.
///
/// This avoids needing a backend "mark as read" endpoint while still letting the badge expire.
class NotificationBadgeService {
  static const _storage = FlutterSecureStorage();
  static const _lastSeenKey = 'last_seen_notification_id';

  static Future<int> _getLastSeenId() async {
    final raw = await _storage.read(key: _lastSeenKey);
    return int.tryParse(raw ?? '') ?? 0;
  }

  static Future<void> setLastSeenId(int id) async {
    await _storage.write(key: _lastSeenKey, value: id.toString());
  }

  /// Returns (count, latestId)
  static Future<({int count, int latestId})> getNewCount() async {
    final res = await ApiService.instance.dio.get('/notifications');
    if (res.statusCode != 200) {
      throw Exception('${res.statusCode}: ${res.data}');
    }

    final data = res.data;
    final list = (data is Map && data['data'] is List)
        ? data['data'] as List
        : (data is List ? data : <dynamic>[]);

    int latestId = 0;
    for (final item in list) {
      if (item is Map) {
        final id = (item['id'] is int)
            ? item['id'] as int
            : int.tryParse(item['id']?.toString() ?? '') ?? 0;
        if (id > latestId) latestId = id;
      }
    }

    final lastSeen = await _getLastSeenId();
    final count = list.where((e) {
      if (e is! Map) return false;
      final id = (e['id'] is int)
          ? e['id'] as int
          : int.tryParse(e['id']?.toString() ?? '') ?? 0;
      return id > lastSeen;
    }).length;

    return (count: count, latestId: latestId);
  }
}
