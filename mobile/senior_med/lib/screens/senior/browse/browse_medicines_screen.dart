import 'package:flutter/material.dart';
import '../../../models/medicine_model.dart';
import '../../../services/api_service.dart';
import '../requests/create_request_screen.dart';

class BrowseMedicinesScreen extends StatefulWidget {
  const BrowseMedicinesScreen({super.key});

  @override
  State<BrowseMedicinesScreen> createState() => _BrowseMedicinesScreenState();
}

class _BrowseMedicinesScreenState extends State<BrowseMedicinesScreen> {
  List<MedicineModel> items = [];
  bool loading = true;
  String? error;
  String q = "";

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
      final res = await ApiService.instance.dio.get("/medicines");
      if (res.statusCode != 200) throw Exception("${res.statusCode}: ${res.data}");
      final data = res.data;
      final list = (data is Map && data["data"] is List) ? data["data"] as List : (data is List ? data : []);
      setState(() {
        items = list.map((e) => MedicineModel.fromJson(Map<String, dynamic>.from(e))).toList();
      });
    } catch (e) {
      setState(() => error = e.toString());
    } finally {
      setState(() => loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final filtered = q.isEmpty
        ? items
        : items.where((m) => (m.genericName + (m.brandName ?? "")).toLowerCase().contains(q.toLowerCase())).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text("Browse Medicines"),
        actions: [IconButton(onPressed: _load, icon: const Icon(Icons.refresh))],
      ),
      body: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          children: [
            TextField(
              decoration: const InputDecoration(
                hintText: "Search...",
                prefixIcon: Icon(Icons.search),
                border: OutlineInputBorder(),
              ),
              onChanged: (v) => setState(() => q = v),
            ),
            const SizedBox(height: 10),
            Expanded(
              child: loading
                  ? const Center(child: CircularProgressIndicator())
                  : error != null
                      ? Center(child: Text(error!, style: const TextStyle(color: Colors.red)))
                      : ListView.builder(
                          itemCount: filtered.length,
                          itemBuilder: (_, i) {
                            final m = filtered[i];
                            return Card(
                              child: ListTile(
                                title: Text(m.genericName),
                                subtitle: Text((m.brandName ?? "").isEmpty ? "Generic" : m.brandName!),
                                trailing: FilledButton(
                                  onPressed: () {
                                    Navigator.of(context).push(
                                      MaterialPageRoute(
                                        builder: (_) => CreateRequestScreen(medicineId: m.id, medicineLabel: m.genericName),
                                      ),
                                    );
                                  },
                                  child: const Text("Request"),
                                ),
                              ),
                            );
                          },
                        ),
            ),
          ],
        ),
      ),
    );
  }
}
