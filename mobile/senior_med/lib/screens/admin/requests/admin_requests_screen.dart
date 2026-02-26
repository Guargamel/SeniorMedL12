import 'package:flutter/material.dart';
import '../../../services/api_service.dart';

class AdminRequestsScreen extends StatefulWidget {
  const AdminRequestsScreen({super.key});

  @override
  State<AdminRequestsScreen> createState() => _AdminRequestsScreenState();
}

class _AdminRequestsScreenState extends State<AdminRequestsScreen> {
  bool loading = true;
  String? error;
  List<dynamic> items = [];
  String filter = "all"; // all | pending | approved | declined

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
      final res = await ApiService.instance.dio.get("/medicine-requests");
      if (res.statusCode != 200) throw Exception("${res.statusCode}: ${res.data}");
      final data = res.data;
      final list = (data is Map && data["data"] is List) ? data["data"] as List : (data is List ? data : []);
      setState(() => items = list);
    } catch (e) {
      setState(() => error = e.toString());
    } finally {
      setState(() => loading = false);
    }
  }

  List<dynamic> get _filtered {
    if (filter == "all") return items;
    return items.where((e) => (e is Map ? (e["status"]?.toString() ?? "") : "").toLowerCase() == filter).toList();
  }

  Future<void> _review({
    required int id,
    required String status, // approved | declined
  }) async {
    final notesCtrl = TextEditingController();
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(status == "approved" ? "Approve request?" : "Decline request?"),
        content: TextField(
          controller: notesCtrl,
          maxLines: 3,
          decoration: const InputDecoration(
            labelText: "Review notes (optional)",
            border: OutlineInputBorder(),
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text("Cancel")),
          FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text("Confirm")),
        ],
      ),
    );

    if (ok != true) return;

    try {
      final res = await ApiService.instance.dio.put("/medicine-requests/$id/review", data: {
        "status": status,
        "review_notes": notesCtrl.text.trim().isEmpty ? null : notesCtrl.text.trim(),
      });

      if (res.statusCode != 200) {
        throw Exception("Review failed (${res.statusCode}): ${res.data}");
      }

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Request $status.")));
      await _load();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Error: $e")));
    }
  }

  @override
  Widget build(BuildContext context) {
    final list = _filtered;

    return Scaffold(
      appBar: AppBar(
        title: const Text("Requests"),
        actions: [IconButton(onPressed: _load, icon: const Icon(Icons.refresh))],
      ),
      body: loading
          ? const Center(child: CircularProgressIndicator())
          : error != null
              ? Center(child: Text(error!, style: const TextStyle(color: Colors.red)))
              : Column(
                  children: [
                    Padding(
                      padding: const EdgeInsets.fromLTRB(12, 10, 12, 0),
                      child: SegmentedButton<String>(
                        segments: const [
                          ButtonSegment(value: "all", label: Text("All")),
                          ButtonSegment(value: "pending", label: Text("Pending")),
                          ButtonSegment(value: "approved", label: Text("Approved")),
                          ButtonSegment(value: "declined", label: Text("Declined")),
                        ],
                        selected: {filter},
                        onSelectionChanged: (s) => setState(() => filter = s.first),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Expanded(
                      child: ListView.builder(
                        padding: const EdgeInsets.all(12),
                        itemCount: list.length,
                        itemBuilder: (_, i) {
                          final r = list[i] as Map;
                          final med = r["medicine"] is Map ? r["medicine"] as Map : null;
                          final user = r["user"] is Map ? r["user"] as Map : null;
                          final status = (r["status"] ?? "-").toString();
                          final id = (r["id"] ?? 0) as int;

                          final prescriptionUrl = r["prescription_url"]?.toString() ??
                              (r["prescription_path"] != null ? "storage/${r["prescription_path"]}" : null);

                          return Card(
                            child: Padding(
                              padding: const EdgeInsets.symmetric(vertical: 6),
                              child: ListTile(
                                leading: const Icon(Icons.assignment),
                                title: Text(med?["generic_name"]?.toString() ?? "Request #$id"),
                                subtitle: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const SizedBox(height: 2),
                                    Text("Requested by: ${user?["name"] ?? "-"}"),
                                    Text("Qty: ${r["quantity"] ?? "-"} • Status: $status"),
                                    if ((r["reason"] ?? "").toString().isNotEmpty) Text("Reason: ${r["reason"]}"),
                                    if (prescriptionUrl != null) Text("Proof: $prescriptionUrl"),
                                  ],
                                ),
                                isThreeLine: true,
                                trailing: status == "pending"
                                    ? Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          IconButton(
                                            tooltip: "Approve",
                                            onPressed: () => _review(id: id, status: "approved"),
                                            icon: const Icon(Icons.check_circle_outline),
                                          ),
                                          IconButton(
                                            tooltip: "Decline",
                                            onPressed: () => _review(id: id, status: "declined"),
                                            icon: const Icon(Icons.cancel_outlined),
                                          ),
                                        ],
                                      )
                                    : Chip(label: Text(status)),
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                  ],
                ),
    );
  }
}
