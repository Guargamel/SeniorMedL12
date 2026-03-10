import 'package:flutter/material.dart';
import '../../../models/medicine_model.dart';
import '../../../services/api_service.dart';
import '../../../services/tts_service.dart';
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
    setState(() { loading = true; error = null; });
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

  String _getStatusLabel(MedicineModel m) {
    if (m.isExpired == true) return "Expired";
    if ((m.availableQty ?? 0) == 0) return "Out of Stock";
    if ((m.availableQty ?? 0) < 10) return "Low Stock";
    return "Available";
  }

  Color _getStatusColor(MedicineModel m) {
    switch (_getStatusLabel(m)) {
      case "Available":  return Colors.green;
      case "Low Stock":  return Colors.orange;
      case "Expired":    return Colors.deepOrange;
      case "Out of Stock": return Colors.red;
      default:           return Colors.grey;
    }
  }

  void _readMedicineAloud(MedicineModel m) {
    final status = _getStatusLabel(m);
    final qty = m.availableQty ?? 0;
    final tagalog =
        "${m.genericName}. "
        "${m.brandName != null && m.brandName!.isNotEmpty ? 'Brand: ${m.brandName}. ' : ''}"
        "Katayuan: ${_statusTagalog(status)}. "
        "${qty > 0 && status == 'Available' ? 'Mayroon $qty piraso na available.' : ''}";
    TtsService.instance.speakTagalog(tagalog);
  }

  String _statusTagalog(String s) {
    switch (s) {
      case "Available":    return "Available — maaaring i-request";
      case "Low Stock":    return "Mababa ang stock — kaunti na lang";
      case "Out of Stock": return "Wala nang stock — out of stock";
      case "Expired":      return "Expired — hindi na magagamit";
      default:             return s;
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
        actions: [
          // Audio help button
          Tooltip(
            message: "Pakinggan ang paliwanag",
            child: IconButton(
              icon: const Icon(Icons.volume_up),
              onPressed: () => TtsService.instance.speakTagalog(
                "Ito ang listahan ng mga gamot. Pindutin ang mikropono sa tabi ng gamot para marinig ang detalye. "
                "Pindutin ang Request button para humiling ng gamot.",
              ),
            ),
          ),
          IconButton(onPressed: _load, icon: const Icon(Icons.refresh)),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          children: [
            // Search bar
            TextField(
              style: const TextStyle(fontSize: 18),
              decoration: const InputDecoration(
                hintText: "Hanapin ang gamot... / Search medicine...",
                prefixIcon: Icon(Icons.search, size: 28),
                border: OutlineInputBorder(),
              ),
              onChanged: (v) => setState(() => q = v),
            ),
            const SizedBox(height: 10),
            Expanded(
              child: loading
                  ? const Center(child: CircularProgressIndicator())
                  : error != null
                      ? Center(child: Text(error!, style: const TextStyle(color: Colors.red, fontSize: 16)))
                      : RefreshIndicator(
                          onRefresh: _load,
                          child: ListView.builder(
                            itemCount: filtered.length,
                            itemBuilder: (_, i) {
                              final m = filtered[i];
                              final status = _getStatusLabel(m);
                              final statusColor = _getStatusColor(m);
                              final canRequest = status == "Available" || status == "Low Stock";

                              return Card(
                                margin: const EdgeInsets.symmetric(vertical: 6),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                  side: BorderSide(color: statusColor.withOpacity(0.4), width: 1.5),
                                ),
                                child: Padding(
                                  padding: const EdgeInsets.all(14),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        children: [
                                          Expanded(
                                            child: Text(
                                              m.genericName,
                                              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                                            ),
                                          ),
                                          // Audio read button for accessibility
                                          IconButton(
                                            icon: const Icon(Icons.volume_up, size: 28, color: Colors.blue),
                                            tooltip: "Pakinggan / Listen",
                                            onPressed: () => _readMedicineAloud(m),
                                          ),
                                        ],
                                      ),
                                      if (m.brandName != null && m.brandName!.isNotEmpty)
                                        Text(m.brandName!, style: const TextStyle(fontSize: 16, color: Colors.grey)),
                                      if (m.form != null)
                                        Text("Form: ${m.form}", style: const TextStyle(fontSize: 15)),
                                      if (m.strength != null)
                                        Text("Strength: ${m.strength}", style: const TextStyle(fontSize: 15)),
                                      const SizedBox(height: 10),
                                      Row(
                                        children: [
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                            decoration: BoxDecoration(
                                              color: statusColor.withOpacity(0.15),
                                              borderRadius: BorderRadius.circular(20),
                                              border: Border.all(color: statusColor),
                                            ),
                                            child: Text(
                                              status,
                                              style: TextStyle(color: statusColor, fontWeight: FontWeight.bold, fontSize: 15),
                                            ),
                                          ),
                                          if ((m.availableQty ?? 0) > 0)
                                            Padding(
                                              padding: const EdgeInsets.only(left: 10),
                                              child: Text("${m.availableQty} available", style: const TextStyle(fontSize: 14, color: Colors.grey)),
                                            ),
                                          const Spacer(),
                                          if (canRequest)
                                            FilledButton.icon(
                                              style: FilledButton.styleFrom(
                                                padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
                                                textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                                              ),
                                              onPressed: () {
                                                Navigator.of(context).push(
                                                  MaterialPageRoute(
                                                    builder: (_) => CreateRequestScreen(
                                                      medicineId: m.id,
                                                      medicineLabel: m.genericName,
                                                    ),
                                                  ),
                                                );
                                              },
                                              icon: const Icon(Icons.add),
                                              label: const Text("I-Request"),
                                            ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                              );
                            },
                          ),
                        ),
            ),
          ],
        ),
      ),
    );
  }
}
