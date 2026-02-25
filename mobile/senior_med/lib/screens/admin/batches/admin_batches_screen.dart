import 'package:flutter/material.dart';
import '../../../services/api_service.dart';

class AdminBatchesScreen extends StatefulWidget {
  const AdminBatchesScreen({super.key});

  @override
  State<AdminBatchesScreen> createState() => _AdminBatchesScreenState();
}

class _AdminBatchesScreenState extends State<AdminBatchesScreen> {
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
      final res = await ApiService.instance.dio.get("/medicine-batches");
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Medicine Batches"),
        actions: [IconButton(onPressed: _load, icon: const Icon(Icons.refresh))],
      ),
      body: loading
          ? const Center(child: CircularProgressIndicator())
          : error != null
              ? Center(child: Text(error!, style: const TextStyle(color: Colors.red)))
              : ListView.builder(
                  padding: const EdgeInsets.all(12),
                  itemCount: items.length,
                  itemBuilder: (_, i) {
                    final b = items[i] as Map;
                    final medicine = b["medicine"] is Map ? b["medicine"] as Map : null;
                    return Card(
                      child: ListTile(
                        leading: const Icon(Icons.inventory_2),
                        title: Text(medicine?["generic_name"]?.toString() ?? "Batch #${b["id"]}"),
                        subtitle: Text("Batch: ${b["batch_no"] ?? "-"} • Exp: ${b["expiry_date"] ?? "-"}"),
                        trailing: Text("${b["quantity"] ?? "-"}", style: const TextStyle(fontWeight: FontWeight.w800)),
                      ),
                    );
                  },
                ),
    );
  }
}
