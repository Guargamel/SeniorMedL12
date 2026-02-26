import 'package:flutter/material.dart';
import '../../../services/api_service.dart';
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("My Requests"),
        actions: [IconButton(onPressed: _load, icon: const Icon(Icons.refresh))],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          Navigator.of(context).push(MaterialPageRoute(builder: (_) => const CreateRequestScreen()));
        },
        label: const Text("New Request"),
        icon: const Icon(Icons.add),
      ),
      body: loading
          ? const Center(child: CircularProgressIndicator())
          : error != null
              ? Center(child: Text(error!, style: const TextStyle(color: Colors.red)))
              : ListView.builder(
                  padding: const EdgeInsets.all(12),
                  itemCount: items.length,
                  itemBuilder: (_, i) {
                    final r = items[i] as Map;
                    final med = r["medicine"] is Map ? r["medicine"] as Map : null;
                    return Card(
                      child: ListTile(
                        leading: const Icon(Icons.assignment_turned_in),
                        title: Text(med?["generic_name"]?.toString() ?? "Request #${r["id"]}"),
                        subtitle: Text("Status: ${r["status"] ?? "-"}"),
                        trailing: Text(r["created_at"]?.toString() ?? "", style: const TextStyle(fontSize: 12)),
                      ),
                    );
                  },
                ),
    );
  }
}
