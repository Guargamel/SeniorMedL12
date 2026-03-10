import 'dart:async';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import '../../../services/api_service.dart';
import '../../../services/tts_service.dart';
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
      _cancelToken?.cancel("App in background");
    }
  }

  void _onRequestCreated() => _load();

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _stopTimer();
    _cancelToken?.cancel("Disposed");
    RequestEvents.tick.removeListener(_onRequestCreated);
    super.dispose();
  }

  Future<void> _load() async {
    if (!mounted) return;
    if (_fetching) return;
    _fetching = true;

    _cancelToken?.cancel("New refresh");
    _cancelToken = CancelToken();

    setState(() { loading = true; error = null; });

    try {
      final res = await ApiService.instance.dio.get(
        "/medicine-requests",
        cancelToken: _cancelToken,
        options: Options(responseType: ResponseType.json, headers: {"Accept": "application/json"}),
      );

      if (res.statusCode != 200) throw Exception("${res.statusCode}: ${res.data}");

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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Aking mga Kahilingan"),
        actions: [
          IconButton(
            icon: const Icon(Icons.volume_up),
            tooltip: "Pakinggan",
            onPressed: () => TtsService.instance.speakTagalog(
              "Mga Kahilingan ng Gamot. Dito makikita ang lahat ng inyong mga kahilingan. "
              "Pindutin ang speaker icon sa tabi ng bawat kahilingan para marinig ang detalye.",
            ),
          ),
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
        label: const Text("Bagong Kahilingan", style: TextStyle(fontSize: 16)),
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
                        Text(error!, style: const TextStyle(color: Colors.red, fontSize: 16)),
                        const SizedBox(height: 12),
                        ElevatedButton.icon(onPressed: _load, icon: const Icon(Icons.refresh), label: const Text("I-reload")),
                      ],
                    ),
                  ),
                )
              : items.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.assignment, size: 64, color: Colors.grey),
                          const SizedBox(height: 12),
                          const Text("Wala pang kahilingan.", style: TextStyle(fontSize: 18)),
                          const SizedBox(height: 8),
                          ElevatedButton.icon(onPressed: _load, icon: const Icon(Icons.refresh), label: const Text("I-refresh")),
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
                              : (rejected ? Colors.red : Colors.orange);
                          final String statusLabel = approved ? 'NAAPRUBAHAN' : (rejected ? 'TINANGGIHAN' : 'NAKABINBIN');

                          final notes = (r["notes"] ?? "").toString().trim();
                          final medicineName = med?["generic_name"]?.toString() ?? "Gamot";

                          // Build TTS text
                          final String ttsText = approved
                              ? "$medicineName ay NAAPRUBAHAN. "
                                "Pumunta sa Barangay Health Center, Lunes hanggang Sabado, "
                                "alas otso ng umaga hanggang alas singko ng hapon. "
                                "Magdala ng valid ID."
                              : rejected
                                  ? "$medicineName ay TINANGGIHAN. ${notes.isNotEmpty ? 'Dahilan: $notes' : ''}"
                                  : "$medicineName ay NAKABINBIN pa. Hintayin ang pagproseso.";

                          return Card(
                            margin: const EdgeInsets.symmetric(vertical: 6),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                              side: BorderSide(color: statusColor.withOpacity(0.35), width: 1.5),
                            ),
                            child: Padding(
                              padding: const EdgeInsets.all(14),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  // Medicine name + audio
                                  Row(
                                    children: [
                                      Icon(Icons.medication, color: statusColor, size: 26),
                                      const SizedBox(width: 8),
                                      Expanded(
                                        child: Text(
                                          medicineName,
                                          style: const TextStyle(fontSize: 19, fontWeight: FontWeight.bold),
                                        ),
                                      ),
                                      IconButton(
                                        icon: const Icon(Icons.volume_up, color: Colors.blue, size: 26),
                                        tooltip: "Pakinggan / Listen",
                                        onPressed: () => TtsService.instance.speakTagalog(ttsText),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 8),
                                  // Status badge
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                    decoration: BoxDecoration(
                                      color: statusColor.withOpacity(0.12),
                                      borderRadius: BorderRadius.circular(20),
                                      border: Border.all(color: statusColor.withOpacity(0.45)),
                                    ),
                                    child: Text(
                                      statusLabel,
                                      style: TextStyle(color: statusColor, fontWeight: FontWeight.w700, fontSize: 15),
                                    ),
                                  ),
                                  // Notes
                                  if (notes.isNotEmpty) ...[
                                    const SizedBox(height: 8),
                                    Text(
                                      "Tala: $notes",
                                      style: TextStyle(
                                        fontSize: 15,
                                        color: rejected ? Colors.red.shade700 : Colors.green.shade700,
                                      ),
                                    ),
                                  ],
                                  // Approved pickup schedule box (Fix 3)
                                  if (approved) ...[
                                    const SizedBox(height: 10),
                                    Container(
                                      padding: const EdgeInsets.all(12),
                                      decoration: BoxDecoration(
                                        color: Colors.green.shade50,
                                        borderRadius: BorderRadius.circular(10),
                                        border: Border.all(color: Colors.green.shade400),
                                      ),
                                      child: const Row(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Icon(Icons.access_time_filled, color: Colors.green, size: 22),
                                          SizedBox(width: 8),
                                          Expanded(
                                            child: Column(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: [
                                                Text(
                                                  "Kumuha ng gamot sa Barangay Health Center:",
                                                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.green),
                                                ),
                                                SizedBox(height: 4),
                                                Text(
                                                  "📅  Lunes – Sabado\n🕗  8:00 AM – 5:00 PM\n🪪  Magdala ng valid ID",
                                                  style: TextStyle(fontSize: 14, color: Colors.green),
                                                ),
                                              ],
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                  const SizedBox(height: 6),
                                  Text(
                                    r["created_at"]?.toString() ?? "",
                                    style: const TextStyle(fontSize: 13, color: Colors.grey),
                                  ),
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
