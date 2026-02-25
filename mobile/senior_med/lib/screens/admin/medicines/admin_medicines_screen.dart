import 'package:flutter/material.dart';
import '../../../models/medicine_model.dart';
import '../../../services/api_service.dart';

class AdminMedicinesScreen extends StatefulWidget {
  const AdminMedicinesScreen({super.key});

  @override
  State<AdminMedicinesScreen> createState() => _AdminMedicinesScreenState();
}

class _AdminMedicinesScreenState extends State<AdminMedicinesScreen> {
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
      final res = await ApiService.instance.dio.get("/medicines", queryParameters: q.isEmpty ? null : {"q": q});
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
        title: const Text("Medicines"),
        actions: [IconButton(onPressed: _load, icon: const Icon(Icons.refresh))],
      ),
      body: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          children: [
            TextField(
              decoration: const InputDecoration(
                hintText: "Search medicines...",
                prefixIcon: Icon(Icons.search),
                border: OutlineInputBorder(),
              ),
              onChanged: (v) {
                setState(() => q = v);
              },
              onSubmitted: (_) => _load(),
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
                                leading: const Icon(Icons.medication),
                                title: Text(m.genericName),
                                subtitle: Text([
                                  if ((m.brandName ?? "").isNotEmpty) m.brandName!,
                                  if ((m.form ?? "").isNotEmpty) m.form!,
                                  if ((m.strength ?? "").isNotEmpty) m.strength!,
                                ].join(" • ")),
                                trailing: m.availableQty == null
                                    ? null
                                    : Column(
                                        mainAxisAlignment: MainAxisAlignment.center,
                                        children: [
                                          const Text("Available", style: TextStyle(fontSize: 12)),
                                          Text("${m.availableQty}", style: const TextStyle(fontWeight: FontWeight.w800)),
                                        ],
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
