import 'package:flutter/material.dart';

import '../../../services/api_service.dart';
import '../../../services/notification_badge_service.dart';
import '../../../services/tts_service.dart';

class SeniorNotificationsScreen extends StatefulWidget {
  const SeniorNotificationsScreen({super.key, this.onSeenLatest});

  final VoidCallback? onSeenLatest;

  @override
  State<SeniorNotificationsScreen> createState() => _SeniorNotificationsScreenState();
}

class _SeniorNotificationsScreenState extends State<SeniorNotificationsScreen> {
  bool loading = true;
  String? error;
  List<dynamic> items = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() { loading = true; error = null; });

    try {
      final res = await ApiService.instance.dio.get("/notifications");
      if (res.statusCode != 200) throw Exception("${res.statusCode}: ${res.data}");

      final data = res.data;
      final list = (data is Map && data["data"] is List)
          ? data["data"] as List
          : (data is List ? data : []);

      int latestId = 0;
      for (final n in list) {
        if (n is Map) {
          final id = (n['id'] is int) ? n['id'] as int : int.tryParse(n['id']?.toString() ?? '') ?? 0;
          if (id > latestId) latestId = id;
        }
      }
      if (latestId > 0) {
        await NotificationBadgeService.setLastSeenId(latestId);
        widget.onSeenLatest?.call();
      }

      setState(() => items = list);
    } catch (e) {
      setState(() => error = e.toString());
    } finally {
      setState(() => loading = false);
    }
  }

  void _readNotifAloud(Map n) {
    final title   = n["title"]?.toString() ?? "Abiso";
    final message = n["message"]?.toString() ?? "";
    TtsService.instance.speakTagalog("$title. $message");
  }

  Color _notifColor(Map n) {
    final type = (n["type"] ?? "").toString();
    if (type.contains("approved")) return Colors.green;
    if (type.contains("declined")) return Colors.red;
    return Colors.blue;
  }

  IconData _notifIcon(Map n) {
    final type = (n["type"] ?? "").toString();
    if (type.contains("approved")) return Icons.check_circle;
    if (type.contains("declined")) return Icons.cancel;
    return Icons.notifications;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Mga Abiso / Notifications"),
        actions: [
          IconButton(
            icon: const Icon(Icons.volume_up),
            tooltip: "Pakinggan ang lahat",
            onPressed: () {
              if (items.isEmpty) {
                TtsService.instance.speakTagalog("Wala pang abiso.");
              } else {
                TtsService.instance.speakTagalog(
                  "Mayroon kang ${items.length} na abiso. Pindutin ang mikropono sa tabi ng bawat abiso para marinig ito.",
                );
              }
            },
          ),
          IconButton(onPressed: _load, icon: const Icon(Icons.refresh)),
        ],
      ),
      body: loading
          ? const Center(child: CircularProgressIndicator())
          : error != null
              ? Center(child: Text(error!, style: const TextStyle(color: Colors.red, fontSize: 16)))
              : items.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.notifications_off, size: 64, color: Colors.grey),
                          const SizedBox(height: 12),
                          const Text("Wala pang abiso.", style: TextStyle(fontSize: 18)),
                          const SizedBox(height: 8),
                          const Text("No notifications yet.", style: TextStyle(fontSize: 16, color: Colors.grey)),
                          const SizedBox(height: 16),
                          ElevatedButton.icon(
                            onPressed: _load,
                            icon: const Icon(Icons.refresh),
                            label: const Text("I-refresh", style: TextStyle(fontSize: 16)),
                          ),
                        ],
                      ),
                    )
                  : RefreshIndicator(
                      onRefresh: _load,
                      child: ListView.builder(
                        padding: const EdgeInsets.all(12),
                        itemCount: items.length,
                        itemBuilder: (_, i) {
                          final n = items[i] as Map;
                          final isRead = (n["read_at"] != null) || (n["is_read"] == true);
                          final color = _notifColor(n);

                          return Card(
                            margin: const EdgeInsets.symmetric(vertical: 6),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                              side: BorderSide(color: color.withOpacity(0.4), width: 1.5),
                            ),
                            color: isRead ? null : color.withOpacity(0.07),
                            child: Padding(
                              padding: const EdgeInsets.all(14),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Icon(_notifIcon(n), color: color, size: 32),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          n["title"]?.toString() ?? "Abiso",
                                          style: TextStyle(
                                            fontSize: 18,
                                            fontWeight: isRead ? FontWeight.normal : FontWeight.bold,
                                            color: color,
                                          ),
                                        ),
                                        const SizedBox(height: 6),
                                        Text(
                                          n["message"]?.toString() ?? "",
                                          style: const TextStyle(fontSize: 16),
                                        ),
                                        const SizedBox(height: 6),
                                        Text(
                                          n["created_at"]?.toString() ?? "",
                                          style: const TextStyle(fontSize: 13, color: Colors.grey),
                                        ),
                                      ],
                                    ),
                                  ),
                                  // Audio button per notification
                                  IconButton(
                                    icon: const Icon(Icons.volume_up, color: Colors.blue, size: 26),
                                    tooltip: "Pakinggan / Listen",
                                    onPressed: () => _readNotifAloud(n),
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                    ),
    );
  }
}
