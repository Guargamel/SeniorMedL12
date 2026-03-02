import 'dart:async';
import 'package:flutter/material.dart';
import '../../../services/api_service.dart';     // ✅ correct path
import '../../../core/request_events.dart';     // ✅ correct path
import 'create_request_screen.dart';

class MyRequestsScreen extends StatefulWidget {
  const MyRequestsScreen({super.key});

  @override
  State<MyRequestsScreen> createState() => _MyRequestsScreenState();
}

class _MyRequestsScreenState extends State<MyRequestsScreen> {
  bool loading = true;
  String? error;
  List<dynamic> items = [];
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _load();

    // ✅ Auto refresh when a request is created anywhere in the app
    RequestEvents.tick.addListener(_onRequestCreated);

    // Auto refresh every 60 seconds while this screen is open
    _timer = Timer.periodic(const Duration(seconds: 60), (_) => _load());
  }

  void _onRequestCreated() {
    // If you want to avoid reloading while already loading:
    // if (loading) return;
    _load();
  }

  @override
  void dispose() {
    _timer?.cancel();
    RequestEvents.tick.removeListener(_onRequestCreated);
    super.dispose();
  }

  Future<void> _load() async {
    if (!mounted) return;

    setState(() {
      loading = true;
      error = null;
    });

    try {
      final res = await ApiService.instance.dio.get("/medicine-requests");
      if (res.statusCode != 200) {
        throw Exception("${res.statusCode}: ${res.data}");
      }

      final data = res.data;
      final list = (data is Map && data["data"] is List)
          ? data["data"] as List
          : (data is List ? data : []);

      if (!mounted) return;
      setState(() => items = list);
    } catch (e) {
      if (!mounted) return;
      setState(() => error = e.toString());
    } finally {
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
          // ✅ when you create from inside My Requests, refresh on return too
          final created = await Navigator.of(context).push<bool>(
            MaterialPageRoute(builder: (_) => const CreateRequestScreen()),
          );

          if (created == true) {
            _load();
          }
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
              Text(error!, style: const TextStyle(color: Colors.red)),
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
            final med = r["medicine"] is Map ? r["medicine"] as Map : null;

            final statusRaw = (r["status"] ?? "-").toString();
            final status = statusRaw.toLowerCase();
            final bool approved = status.contains('approved');
            final bool rejected = status.contains('rejected') || status.contains('declined');
            final Color statusColor = approved
                ? Colors.green
                : (rejected ? Colors.red : Colors.red);
            final String statusLabel = approved ? 'APPROVED' : (rejected ? 'REJECTED' : 'UNAPPROVED');

            return Card(
              child: ListTile(
                leading: const Icon(Icons.assignment_turned_in),
                title: Text(med?["generic_name"]?.toString() ?? "Request #${r["id"]}"),
                subtitle: Wrap(
                  crossAxisAlignment: WrapCrossAlignment.center,
                  spacing: 8,
                  runSpacing: 6,
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
                  ],
                ),
                trailing: Text(
                  r["created_at"]?.toString() ?? "",
                  style: const TextStyle(fontSize: 12),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
