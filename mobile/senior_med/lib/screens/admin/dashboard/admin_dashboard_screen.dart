import 'package:flutter/material.dart';

import '../../../services/api_service.dart';

class AdminDashboardScreen extends StatefulWidget {
  const AdminDashboardScreen({super.key});

  @override
  State<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends State<AdminDashboardScreen> {
  bool loading = true;
  String? error;

  int? totalMedicines;
  int? lowStockCount;
  int? expiringSoonCount;
  int? totalSeniors;

  @override
  void initState() {
    super.initState();
    _load();
  }

  int? _asInt(dynamic v) {
    if (v == null) return null;
    if (v is int) return v;
    return int.tryParse(v.toString());
  }

  Future<void> _load() async {
    setState(() {
      loading = true;
      error = null;
    });

    try {
      // Source 1: /dashboard/summary (your current controller returns camelCase keys)
      final s1 = await ApiService.instance.dio.get("/dashboard/summary");
      if (s1.statusCode != 200) throw Exception("summary ${s1.statusCode}: ${s1.data}");
      final summary = (s1.data is Map) ? Map<String, dynamic>.from(s1.data as Map) : <String, dynamic>{};

      // Source 2: /analytics/dashboard (overview has snake_case: total_medicines, low_stock_count, expired_count)
      final s2 = await ApiService.instance.dio.get("/analytics/dashboard");
      Map<String, dynamic> overview = {};
      if (s2.statusCode == 200 && s2.data is Map) {
        final data = Map<String, dynamic>.from(s2.data as Map);
        if (data["overview"] is Map) {
          overview = Map<String, dynamic>.from(data["overview"] as Map);
        }
      }

      setState(() {
        totalSeniors = _asInt(summary["totalSeniors"] ?? overview["total_seniors"]);
        totalMedicines = _asInt(summary["medicines"] ?? overview["total_medicines"]);
        lowStockCount = _asInt(overview["low_stock_count"]);
        // Analytics uses expired_count (expired batches with stock). We'll label it "Expiring/Expired" for now.
        expiringSoonCount = _asInt(overview["expired_count"]);
      });
    } catch (e) {
      setState(() => error = e.toString());
    } finally {
      setState(() => loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (loading) {
      return Scaffold(
        appBar: AppBar(title: Text("Dashboard")),
        body: Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text("Dashboard"),
        actions: [
          IconButton(onPressed: _load, icon: const Icon(Icons.refresh)),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: error != null
            ? Text(error!, style: const TextStyle(color: Colors.red))
            : ListView(
                children: [
                  _StatCard(title: "Total Medicines", value: totalMedicines, icon: Icons.medication),
                  _StatCard(title: "Low Stock", value: lowStockCount, icon: Icons.warning_amber),
                  _StatCard(title: "Expiring / Expired", value: expiringSoonCount, icon: Icons.schedule),
                  _StatCard(title: "Total Seniors", value: totalSeniors, icon: Icons.elderly),
                  const SizedBox(height: 12),
                  const Text(
                    "Note: These numbers come from /dashboard/summary and /analytics/dashboard (overview). "
                    "If your backend uses different thresholds, adjust in AnalyticsController.",
                  ),
                ],
              ),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String title;
  final int? value;
  final IconData icon;

  const _StatCard({required this.title, required this.value, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Row(
          children: [
            Icon(icon, size: 28),
            const SizedBox(width: 12),
            Expanded(
              child: Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
            ),
            Text(value == null ? "-" : value.toString(),
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
          ],
        ),
      ),
    );
  }
}
