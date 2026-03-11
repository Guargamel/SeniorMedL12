import 'package:flutter/material.dart';

import '../../../services/api_service.dart';
import '../../../services/notification_badge_service.dart';
import '../../../services/tts_service.dart';

class SeniorNotificationsScreen extends StatefulWidget {
  const SeniorNotificationsScreen({super.key, this.onSeenLatest});

  final VoidCallback? onSeenLatest;

  @override
  State<SeniorNotificationsScreen> createState() =>
      _SeniorNotificationsScreenState();
}

class _SeniorNotificationsScreenState
    extends State<SeniorNotificationsScreen> {
  bool loading = true;
  String? error;
  List<dynamic> items = [];
  int? _speakingIndex; // tracks which card is currently being read aloud

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    TtsService.instance.stop();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      loading = true;
      error = null;
    });

    try {
      final res = await ApiService.instance.dio.get("/notifications");
      if (res.statusCode != 200)
        throw Exception("${res.statusCode}: ${res.data}");

      final data = res.data;
      final list = (data is Map && data["data"] is List)
          ? data["data"] as List
          : (data is List ? data : []);

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

  // ─── TTS helpers ──────────────────────────────────────────────────────────

  /// Builds a natural spoken sentence from a notification map.
  /// Reads: title → main message → note/reason (if any).
  String _buildSpokenText(Map n) {
    final title   = n["title"]?.toString() ?? "Abiso";
    final message = n["message"]?.toString() ?? "";
    final type    = (n["type"] ?? "").toString();

    String mainMessage = message;
    String? note;

    if (message.contains(' Note: ')) {
      final parts = message.split(' Note: ');
      mainMessage = parts[0];
      note = 'Tandaan: ${parts[1]}';
    } else if (message.contains(' Reason: ')) {
      final parts = message.split(' Reason: ');
      mainMessage = parts[0];
      note = 'Dahilan: ${parts[1]}';
    }

    // Strip emoji from title for cleaner TTS
    final spokenTitle = title
        .replaceAll('✅', '')
        .replaceAll('❌', '')
        .replaceAll('–', '-')
        .trim();

    final buffer = StringBuffer();
    buffer.write('$spokenTitle. ');
    buffer.write('$mainMessage ');
    if (note != null) {
      buffer.write('$note');
    }

    return buffer.toString().trim();
  }

  Future<void> _readNotifAloud(Map n, int index) async {
    // If already speaking this card — stop
    if (_speakingIndex == index) {
      await TtsService.instance.stop();
      if (mounted) setState(() => _speakingIndex = null);
      return;
    }

    // Stop any ongoing speech first
    await TtsService.instance.stop();

    setState(() => _speakingIndex = index);
    final text = _buildSpokenText(n);
    await TtsService.instance.speakTagalog(text);

    // Reset speaking indicator when done
    if (mounted) setState(() => _speakingIndex = null);
  }

  Future<void> _readAllAloud() async {
    if (items.isEmpty) {
      await TtsService.instance.speakTagalog('Wala pang abiso.');
      return;
    }

    await TtsService.instance.stop();

    // Build one long string: count intro + each notification
    final buffer = StringBuffer();
    buffer.write('Mayroon kang ${items.length} na abiso. ');

    for (int i = 0; i < items.length; i++) {
      final n = items[i] as Map;
      buffer.write('Abiso ${i + 1}. ');
      buffer.write(_buildSpokenText(n));
      buffer.write('. ');
    }

    setState(() => _speakingIndex = -1); // -1 = reading all
    await TtsService.instance.speakTagalog(buffer.toString());
    if (mounted) setState(() => _speakingIndex = null);
  }

  // ─── UI helpers ───────────────────────────────────────────────────────────

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

  Widget _buildMessageWithNote(String message, String type) {
    String mainMessage = message;
    String? note;

    if (message.contains(' Note: ')) {
      final parts = message.split(' Note: ');
      mainMessage = parts[0];
      note = parts[1];
    } else if (message.contains(' Reason: ')) {
      final parts = message.split(' Reason: ');
      mainMessage = parts[0];
      note = parts[1];
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(mainMessage, style: const TextStyle(fontSize: 16)),
        if (note != null) ...[
          const SizedBox(height: 8),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: Colors.red.shade50,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: Colors.red.shade300),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(Icons.info_outline, color: Colors.red, size: 18),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    type.contains('approved') ? 'Note: $note' : 'Reason: $note',
                    style: const TextStyle(
                      fontSize: 15,
                      color: Colors.red,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }

  // ─── Build ────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    final isReadingAll = _speakingIndex == -1;

    return Scaffold(
      appBar: AppBar(
        title: const Text("Mga Abiso / Notifications"),
        actions: [
          // "Read all" button — shows stop icon while reading all
          IconButton(
            icon: Icon(isReadingAll ? Icons.stop_circle : Icons.volume_up),
            tooltip: isReadingAll ? "Ihinto" : "Pakinggan ang lahat",
            onPressed: isReadingAll
                ? () async {
                    await TtsService.instance.stop();
                    if (mounted) setState(() => _speakingIndex = null);
                  }
                : _readAllAloud,
          ),
          IconButton(onPressed: _load, icon: const Icon(Icons.refresh)),
        ],
      ),
      body: loading
          ? const Center(child: CircularProgressIndicator())
          : error != null
              ? Center(
                  child: Text(error!,
                      style:
                          const TextStyle(color: Colors.red, fontSize: 16)))
              : items.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.notifications_off,
                              size: 64, color: Colors.grey),
                          const SizedBox(height: 12),
                          const Text("Wala pang abiso.",
                              style: TextStyle(fontSize: 18)),
                          const SizedBox(height: 8),
                          const Text("No notifications yet.",
                              style: TextStyle(
                                  fontSize: 16, color: Colors.grey)),
                          const SizedBox(height: 16),
                          ElevatedButton.icon(
                            onPressed: _load,
                            icon: const Icon(Icons.refresh),
                            label: const Text("I-refresh",
                                style: TextStyle(fontSize: 16)),
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
                          final isRead =
                              (n["read_at"] != null) || (n["is_read"] == true);
                          final color = _notifColor(n);
                          final isSpeaking = _speakingIndex == i;

                          return Card(
                            margin:
                                const EdgeInsets.symmetric(vertical: 6),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                              side: BorderSide(
                                  color: isSpeaking
                                      ? Colors.blue
                                      : color.withOpacity(0.4),
                                  width: isSpeaking ? 2.5 : 1.5),
                            ),
                            color: isSpeaking
                                ? Colors.blue.shade50
                                : (isRead
                                    ? null
                                    : color.withOpacity(0.07)),
                            child: Padding(
                              padding: const EdgeInsets.all(14),
                              child: Row(
                                crossAxisAlignment:
                                    CrossAxisAlignment.start,
                                children: [
                                  Icon(_notifIcon(n),
                                      color: color, size: 32),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          n["title"]?.toString() ?? "Abiso",
                                          style: TextStyle(
                                            fontSize: 18,
                                            fontWeight: isRead
                                                ? FontWeight.normal
                                                : FontWeight.bold,
                                            color: color,
                                          ),
                                        ),
                                        const SizedBox(height: 6),
                                        _buildMessageWithNote(
                                            n["message"]?.toString() ?? "",
                                            n["type"]?.toString() ?? ""),
                                        const SizedBox(height: 6),
                                        Text(
                                          n["created_at"]?.toString() ?? "",
                                          style: const TextStyle(
                                              fontSize: 13,
                                              color: Colors.grey),
                                        ),
                                      ],
                                    ),
                                  ),
                                  // Per-card TTS button — toggles speak/stop
                                  IconButton(
                                    icon: Icon(
                                      isSpeaking
                                          ? Icons.stop_circle
                                          : Icons.volume_up,
                                      color: isSpeaking
                                          ? Colors.blue
                                          : Colors.blue,
                                      size: 28,
                                    ),
                                    tooltip: isSpeaking
                                        ? "Ihinto / Stop"
                                        : "Pakinggan / Listen",
                                    onPressed: () =>
                                        _readNotifAloud(n, i),
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
