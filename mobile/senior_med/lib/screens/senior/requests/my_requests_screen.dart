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
    // Stop polling when app is not active (prevents cut-off/empty responses)
    if (state == AppLifecycleState.resumed) {
      _startTimer();
      _load(); // refresh when returning
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
    // Works for "2026-03-02T17:47:26.000000Z" or "2026-03-02 17:47:26"
    if (s.length >= 16) return s.substring(0, 16).replaceAll('T', ' ');
    return s;
  }

  Future<void> _load() async {
    if (!mounted) return;

    // prevent overlap
    if (_fetching) return;
    _fetching = true;

    // cancel previous in-flight request
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

      // ✅ backend now returns { data: [...] }
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

  @override
  Widget build(BuildContext context) {
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
          ? Center(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                error!,
                style: const TextStyle(color: Colors.red),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 12),
              ElevatedButton.icon(
                onPressed: _load,
                icon: const Icon(Icons.refresh),
                label: const Text("Reload"),
              ),
            ],
          ),
        ),
      )
          : items.isEmpty
          ? Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text("No requests yet."),
            const SizedBox(height: 12),
            ElevatedButton.icon(
              onPressed: _load,
              icon: const Icon(Icons.refresh),
              label: const Text("Reload"),
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
            final r = items[i] as Map;
            final med =
            r["medicine"] is Map ? r["medicine"] as Map : null;

            final statusRaw = (r["status"] ?? "pending").toString();
            final status = statusRaw.toLowerCase();

            final bool approved = status == "approved";
            final bool declined = status == "declined";
            final bool pending = status == "pending";

            final Color statusColor = approved
                ? Colors.green
                : (declined ? Colors.red : Colors.orange);

            final String statusLabel =
            approved ? "APPROVED" : (declined ? "DECLINED" : "PENDING");

            final notes = (r["notes"] ?? "").toString().trim();

            final createdAt = _shortTs(r["created_at"]);
            final reviewedAt = _shortTs(r["reviewed_at"]);

            return Card(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.assignment_turned_in),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            med?["generic_name"]?.toString() ??
                                "Request #${r["id"]}",
                            style: const TextStyle(
                              fontWeight: FontWeight.w700,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          createdAt,
                          style: const TextStyle(fontSize: 11),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),

                    Row(
                      children: [
                        const Text("Status: "),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: statusColor.withOpacity(0.12),
                            borderRadius: BorderRadius.circular(999),
                            border: Border.all(color: statusColor.withOpacity(0.45)),
                          ),
                          child: Text(
                            statusLabel,
                            style: TextStyle(
                              color: statusColor,
                              fontWeight: FontWeight.w700,
                              fontSize: 12,
                            ),
                          ),
                        ),
                        if (!pending && reviewedAt.isNotEmpty) ...[
                          const SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              "Reviewed: $reviewedAt",
                              style: const TextStyle(fontSize: 11),
                              overflow: TextOverflow.ellipsis,
                            ),
                          )
                        ],
                      ],
                    ),

                    // ✅ Show reason so senior knows WHY
                    if (!pending) ...[
                      const SizedBox(height: 8),
                      Text(
                        notes.isNotEmpty ? "Reason: $notes" : "Reason: (no reason provided)",
                        style: TextStyle(
                          color: declined ? Colors.red : Colors.green,
                          fontSize: 13,
                        ),
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
