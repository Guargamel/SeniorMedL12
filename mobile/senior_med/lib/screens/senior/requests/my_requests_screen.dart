import 'dart:async';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import '../../../services/api_service.dart';
import '../../../core/request_events.dart';
import 'create_request_screen.dart';

class MyRequestsScreen extends StatefulWidget {
  const MyRequestsScreen({super.key});

  @override
  State<MyRequestsScreen> createState() => _MyRequestsScreenState();
}

class _MyRequestsScreenState extends State<MyRequestsScreen>
    with WidgetsBindingObserver {
  bool loading = true;
  String? error;
  List<dynamic> items = [];

  Timer? _timer;
  bool _fetching = false;
  CancelToken? _cancelToken;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);

    _load();
    RequestEvents.tick.addListener(_onRequestCreated);
    _startTimer();
  }

  void _onRequestCreated() => _load();

  void _startTimer() {
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 60), (_) => _load());
  }

  void _stopTimer() {
    _timer?.cancel();
    _timer = null;
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      _startTimer();
      _load();
    } else {
      _stopTimer();
      _cancelToken?.cancel("App backgrounded");
    }
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _stopTimer();
    _cancelToken?.cancel("Disposed");
    RequestEvents.tick.removeListener(_onRequestCreated);
    super.dispose();
  }

  String _shortTs(dynamic v) {
    final s = (v ?? "").toString();
    if (s.isEmpty) return "";
    if (s.length >= 16) return s.substring(0, 16).replaceAll('T', ' ');
    return s;
  }

  Future<void> _load() async {
    if (!mounted) return;

    if (_fetching) return;
    _fetching = true;

    _cancelToken?.cancel("New refresh");
    _cancelToken = CancelToken();

    setState(() {
      loading = true;
      error = null;
    });

    try {
      final res = await ApiService.instance.dio.get(
        "/medicine-requests",
        cancelToken: _cancelToken,
        options: Options(
          responseType: ResponseType.json,
          headers: {"Accept": "application/json"},
        ),
      );

      if (res.statusCode != 200) {
        throw Exception("${res.statusCode}: ${res.data}");
      }

      final data = res.data;
      final list = (data is Map && data["data"] is List)
          ? data["data"] as List
          : (data is List ? data : const []);

      if (!mounted) return;
      setState(() => items = list);
    } on DioException catch (e) {
      if (CancelToken.isCancel(e)) return;
      if (!mounted) return;
      setState(() => error = e.message ?? e.toString());
    } catch (e) {
      if (!mounted) return;
      setState(() => error = e.toString());
    } finally {
      _fetching = false;
      if (!mounted) return;
      setState(() => loading = false);
    }
  }

  // UX: consistent status mapping
  ({String label, Color color, IconData icon}) _statusMeta(String raw) {
    final s = raw.toLowerCase();
    if (s == "approved") {
      return (label: "APPROVED", color: Colors.green, icon: Icons.check_circle);
    }
    if (s == "declined") {
      return (label: "DECLINED", color: Colors.red, icon: Icons.cancel);
    }
    return (label: "PENDING", color: Colors.orange, icon: Icons.hourglass_top);
  }

  // UX: small helper widget for nice info boxes
  Widget _infoBox({
    required Color color,
    required IconData icon,
    required String text,
  }) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withOpacity(0.10),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.35)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              text,
              style: TextStyle(
                color: color,
                fontSize: 13,
                height: 1.25,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _emptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.inbox_outlined, size: 54),
            const SizedBox(height: 10),
            const Text(
              "No requests yet.",
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 6),
            Text(
              "Tap “New Request” to create one.",
              style: TextStyle(color: Colors.grey.shade700),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 14),
            ElevatedButton.icon(
              onPressed: _load,
              icon: const Icon(Icons.refresh),
              label: const Text("Reload"),
            ),
          ],
        ),
      ),
    );
  }

  Widget _errorState(String msg) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.wifi_off, size: 54, color: Colors.red),
            const SizedBox(height: 10),
            Text(
              msg,
              style: const TextStyle(color: Colors.red, fontSize: 13),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 14),
            ElevatedButton.icon(
              onPressed: _load,
              icon: const Icon(Icons.refresh),
              label: const Text("Try again"),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final bool showList = !loading && error == null && items.isNotEmpty;

    return Scaffold(
      appBar: AppBar(
        title: const Text("My Requests"),
        actions: [
          IconButton(onPressed: _load, icon: const Icon(Icons.refresh)),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () async {
          final created = await Navigator.of(context).push<bool>(
            MaterialPageRoute(builder: (_) => const CreateRequestScreen()),
          );
          if (created == true) _load();
        },
        label: const Text("New Request"),
        icon: const Icon(Icons.add),
      ),
      body: loading
          ? const Center(child: CircularProgressIndicator())
          : error != null
              ? _errorState(error!)
              : items.isEmpty
                  ? _emptyState()
                  : RefreshIndicator(
                      onRefresh: _load,
                      child: ListView.separated(
                        padding: const EdgeInsets.all(12),
                        itemCount: items.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 10),
                        itemBuilder: (_, i) {
                          final r = (items[i] as Map);
                          final med = r["medicine"] is Map
                              ? r["medicine"] as Map
                              : null;

                          final createdAt = _shortTs(r["created_at"]);
                          final reviewedAt = _shortTs(r["reviewed_at"]);

                          final statusRaw =
                              (r["status"] ?? "pending").toString();
                          final meta = _statusMeta(statusRaw);

                          // notes may be notes/review_notes depending on backend
                          final notes = ((r["notes"] ?? r["review_notes"] ?? "")
                                  .toString())
                              .trim();

                          final title = med?["generic_name"]?.toString().trim();
                          final subtitle =
                              med?["brand_name"]?.toString().trim();

                          final displayTitle =
                              (title != null && title.isNotEmpty)
                                  ? title
                                  : "Request #${r["id"]}";

                          final displaySubtitle =
                              (subtitle != null && subtitle.isNotEmpty)
                                  ? subtitle
                                  : (med?["dosage"]?.toString() ?? "").trim();

                          return Card(
                            elevation: 1,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(14),
                            ),
                            child: Padding(
                              padding:
                                  const EdgeInsets.fromLTRB(12, 12, 12, 12),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  // Header row
                                  Row(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.center,
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.all(8),
                                        decoration: BoxDecoration(
                                          color: meta.color.withOpacity(0.10),
                                          borderRadius:
                                              BorderRadius.circular(12),
                                          border: Border.all(
                                            color: meta.color.withOpacity(0.25),
                                          ),
                                        ),
                                        child: Icon(
                                          meta.icon,
                                          color: meta.color,
                                        ),
                                      ),
                                      const SizedBox(width: 10),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              displayTitle,
                                              style: const TextStyle(
                                                fontWeight: FontWeight.w800,
                                                fontSize: 15,
                                              ),
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                            if (displaySubtitle.isNotEmpty) ...[
                                              const SizedBox(height: 2),
                                              Text(
                                                displaySubtitle,
                                                style: TextStyle(
                                                  fontSize: 12,
                                                  color: Colors.grey.shade700,
                                                ),
                                                maxLines: 1,
                                                overflow: TextOverflow.ellipsis,
                                              ),
                                            ],
                                          ],
                                        ),
                                      ),
                                      const SizedBox(width: 10),
                                      Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.end,
                                        children: [
                                          Text(
                                            createdAt,
                                            style:
                                                const TextStyle(fontSize: 11),
                                          ),
                                          const SizedBox(height: 6),
                                          Container(
                                            padding: const EdgeInsets.symmetric(
                                                horizontal: 10, vertical: 4),
                                            decoration: BoxDecoration(
                                              color:
                                                  meta.color.withOpacity(0.12),
                                              borderRadius:
                                                  BorderRadius.circular(999),
                                              border: Border.all(
                                                color: meta.color
                                                    .withOpacity(0.45),
                                              ),
                                            ),
                                            child: Text(
                                              meta.label,
                                              style: TextStyle(
                                                color: meta.color,
                                                fontWeight: FontWeight.w800,
                                                fontSize: 12,
                                                letterSpacing: 0.3,
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),

                                  // Reviewed info (only if reviewed)
                                  if (meta.label != "PENDING" &&
                                      reviewedAt.isNotEmpty) ...[
                                    const SizedBox(height: 10),
                                    Row(
                                      children: [
                                        Icon(Icons.event_available,
                                            size: 18,
                                            color: Colors.grey.shade700),
                                        const SizedBox(width: 6),
                                        Expanded(
                                          child: Text(
                                            "Reviewed: $reviewedAt",
                                            style: TextStyle(
                                              fontSize: 12,
                                              color: Colors.grey.shade700,
                                            ),
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],

                                  const SizedBox(height: 12),

                                  // ✅ Status messages (UX improvement)
                                  if (statusRaw.toLowerCase() ==
                                      "approved") ...[
                                    _infoBox(
                                      color: Colors.green,
                                      icon: Icons.location_on,
                                      text:
                                          "Your request has been approved. Please visit the barangay for distribution.",
                                    ),
                                  ] else if (statusRaw.toLowerCase() ==
                                      "declined") ...[
                                    _infoBox(
                                      color: Colors.red,
                                      icon: Icons.info_outline,
                                      text: notes.isNotEmpty
                                          ? "Reason: $notes"
                                          : "Reason: (no reason provided)",
                                    ),
                                  ] else ...[
                                    _infoBox(
                                      color: Colors.orange,
                                      icon: Icons.schedule,
                                      text:
                                          "Your request is pending. Please wait for the barangay staff to review it.",
                                    ),
                                  ],
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
