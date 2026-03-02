import 'package:flutter/material.dart';

import '../../../services/api_service.dart';
import '../../../services/notification_badge_service.dart';

class SeniorNotificationsScreen extends StatefulWidget {
  const SeniorNotificationsScreen({super.key, this.onSeenLatest});

  /// Callback so the shell can refresh the badge immediately.
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
    setState(() {
      loading = true;
      error = null;
    });

    try {
      final res = await ApiService.instance.dio.get("/notifications");
      if (res.statusCode != 200) throw Exception("${res.statusCode}: ${res.data}");

      final data = res.data;
      final list = (data is Map && data["data"] is List)
          ? data["data"] as List
          : (data is List ? data : []);

      // Mark "seen" locally so badge expires after opening.
      int latestId = 0;
      for (final n in list) {
        if (n is Map) {
          final id = (n['id'] is int)
              ? n['id'] as int
              : int.tryParse(n['id']?.toString() ?? '') ?? 0;
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Notifications"),
        actions: [IconButton(onPressed: _load, icon: const Icon(Icons.refresh))],
      ),
      body: loading
          ? const Center(child: CircularProgressIndicator())
          : error != null
              ? Center(child: Text(error!, style: const TextStyle(color: Colors.red)))
              : items.isEmpty
                  ? const Center(child: Text('No notifications yet.'))
                  : RefreshIndicator(
                      onRefresh: _load,
                      child: ListView.builder(
                        padding: const EdgeInsets.all(12),
                        itemCount: items.length,
                        itemBuilder: (_, i) {
                          final n = items[i] as Map;
                          final isRead = (n["read_at"] != null) || (n["is_read"] == true);
                          return Card(
                            child: ListTile(
                              leading: Icon(isRead ? Icons.notifications : Icons.notifications_active),
                              title: Text(n["title"]?.toString() ?? "Notification"),
                              subtitle: Text(n["message"]?.toString() ?? n["data"]?.toString() ?? ""),
                              trailing: Text(n["created_at"]?.toString() ?? "", style: const TextStyle(fontSize: 12)),
                            ),
                          );
                        },
                      ),
                    ),
    );
  }
}
