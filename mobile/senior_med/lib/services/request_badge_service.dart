import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import 'api_service.dart';

/// Badge logic WITHOUT a notifications table.
///
/// We treat "reviewed" requests (approved/rejected/declined) as updates:
/// - Fetch /medicine-requests
/// - Count requests where reviewed_at > lastSeenReviewAt AND status is approved/rejected/declined
/// - When the senior opens My Requests, we set lastSeenReviewAt = latest reviewed_at
class RequestBadgeService {
  static const _storage = FlutterSecureStorage();
  static const _lastSeenKey = 'last_seen_reviewed_at';

  static Future<DateTime?> _getLastSeen() async {
    final raw = await _storage.read(key: _lastSeenKey);
    if (raw == null || raw.isEmpty) return null;
    return DateTime.tryParse(raw);
  }

  static Future<void> setLastSeen(DateTime dt) async {
    await _storage.write(key: _lastSeenKey, value: dt.toUtc().toIso8601String());
  }

  static bool _isReviewedStatus(String status) {
    final s = status.toLowerCase();
    return s.contains('approved') || s.contains('rejected') || s.contains('declined');
  }

  /// Returns (count, latestReviewedAt)
  static Future<({int count, DateTime? latestReviewedAt})> getNewCount() async {
    final res = await ApiService.instance.dio.get('/medicine-requests');
    if (res.statusCode != 200) {
      throw Exception('${res.statusCode}: ${res.data}');
    }

    final data = res.data;
    final list = (data is Map && data['data'] is List)
        ? data['data'] as List
        : (data is List ? data : <dynamic>[]);

    DateTime? latest;
    final lastSeen = await _getLastSeen();

    int count = 0;

    for (final item in list) {
      if (item is! Map) continue;

      final status = (item['status'] ?? '').toString();
      if (!_isReviewedStatus(status)) continue;

      final reviewedRaw = item['reviewed_at']?.toString();
      if (reviewedRaw == null || reviewedRaw.isEmpty) continue;

      final reviewedAt = DateTime.tryParse(reviewedRaw);
      if (reviewedAt == null) continue;

      if (latest == null || reviewedAt.isAfter(latest)) {
        latest = reviewedAt;
      }

      if (lastSeen == null) {
        // If we've never seen anything, don't spam a badge on old data.
        // We treat first run as "seen".
        continue;
      }

      if (reviewedAt.isAfter(lastSeen)) {
        count += 1;
      }
    }

    // First run: set last seen to latest so badge starts clean.
    if (lastSeen == null && latest != null) {
      await setLastSeen(latest);
      count = 0;
    }

    return (count: count, latestReviewedAt: latest);
  }
}
