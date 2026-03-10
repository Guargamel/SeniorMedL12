import 'dart:io';

import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

import '../../../services/api_service.dart';
import '../../../services/tts_service.dart';
import '../../../core/request_events.dart';

class CreateRequestScreen extends StatefulWidget {
  final int? medicineId;
  final String? medicineLabel;

  const CreateRequestScreen({super.key, this.medicineId, this.medicineLabel});

  @override
  State<CreateRequestScreen> createState() => _CreateRequestScreenState();
}

class _CreateRequestScreenState extends State<CreateRequestScreen> {
  int? medicineId;
  final qtyCtrl    = TextEditingController(text: "1");
  final reasonCtrl = TextEditingController();

  bool loading = false;
  String? error;

  List<dynamic> medicines = [];
  XFile? proofImage;

  @override
  void initState() {
    super.initState();
    medicineId = widget.medicineId;
    _loadMedicines();
    // Speak instructions when screen opens (Fix 5)
    Future.delayed(const Duration(milliseconds: 600), () {
      TtsService.instance.speakTagalog(
        "Humiling ng Gamot. "
        "Pumili ng gamot, ilagay ang dami, at mag-upload ng litrato ng inyong reseta. "
        "Kailangan ang larawan ng reseta bago makapagsumite.",
      );
    });
  }

  Future<void> _loadMedicines() async {
    try {
      final res = await ApiService.instance.dio.get("/medicines");
      if (res.statusCode != 200) throw Exception("${res.statusCode}: ${res.data}");
      final data = res.data;
      medicines = (data is Map && data["data"] is List)
          ? data["data"] as List
          : (data is List ? data : []);
      if (mounted) setState(() {});
    } catch (e) {
      if (mounted) setState(() => error = e.toString());
    }
  }

  Future<void> _pickImage() async {
    try {
      final picker = ImagePicker();
      final img = await picker.pickImage(source: ImageSource.gallery, maxWidth: 1600, imageQuality: 85);
      if (img != null) {
        setState(() => proofImage = img);
        TtsService.instance.speakTagalog("Napili ang larawan ng reseta.");
      }
    } catch (e) {
      if (mounted) setState(() => error = "Hindi ma-upload ang larawan: $e");
    }
  }

  Future<void> _pickImageCamera() async {
    try {
      final picker = ImagePicker();
      final img = await picker.pickImage(source: ImageSource.camera, maxWidth: 1600, imageQuality: 85);
      if (img != null) {
        setState(() => proofImage = img);
        TtsService.instance.speakTagalog("Nakuha ang larawan ng reseta mula sa camera.");
      }
    } catch (e) {
      if (mounted) setState(() => error = "Hindi magamit ang camera: $e");
    }
  }

  Future<void> _submit() async {
    if (!mounted) return;

    // Fix 2: Require prescription image
    if (proofImage == null) {
      setState(() => error = "Kailangan ng larawan ng reseta bago makapagsumite. / Prescription image is required.");
      TtsService.instance.speakTagalog(
        "Hindi pa na-upload ang larawan ng reseta. Pakiuload muna ang larawan ng inyong reseta.",
      );
      return;
    }

    if (medicineId == null) {
      setState(() => error = "Pumili muna ng gamot. / Please select a medicine.");
      TtsService.instance.speakTagalog("Pumili muna ng gamot sa listahan.");
      return;
    }

    setState(() { loading = true; error = null; });

    try {
      final qty = int.tryParse(qtyCtrl.text.trim()) ?? 1;

      final form = FormData.fromMap({
        "medicine_id": medicineId,
        "quantity":    qty,
        "reason":      reasonCtrl.text.trim().isEmpty ? null : reasonCtrl.text.trim(),
        "prescription_path": await MultipartFile.fromFile(proofImage!.path, filename: proofImage!.name),
      });

      final res = await ApiService.instance.dio.post(
        "/medicine-requests",
        data: form,
        options: Options(contentType: "multipart/form-data"),
      );

      if (res.statusCode != 200 && res.statusCode != 201) {
        throw Exception("Create failed (${res.statusCode}): ${res.data}");
      }

      if (!mounted) return;

      TtsService.instance.speakTagalog(
        "Matagumpay na naisumite ang inyong kahilingan. "
        "Hintayin ang abiso kung ito ay naaprubahan o tinanggihan.",
      );

      RequestEvents.notifyCreated();
      Navigator.pop(context, true);
      return;
    } catch (e) {
      if (!mounted) return;
      setState(() => error = e.toString());
      TtsService.instance.speakTagalog("May nagkamali. Pakisubukan muli.");
    } finally {
      if (!mounted) return;
      setState(() => loading = false);
    }
  }

  @override
  void dispose() {
    qtyCtrl.dispose();
    reasonCtrl.dispose();
    TtsService.instance.stop();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final preview = proofImage != null ? File(proofImage!.path) : null;

    return Scaffold(
      appBar: AppBar(
        title: const Text("Humiling ng Gamot"),
        actions: [
          IconButton(
            icon: const Icon(Icons.volume_up),
            tooltip: "Pakinggan ang tagubilin",
            onPressed: () => TtsService.instance.speakTagalog(
              "Pumili ng gamot, ilagay ang dami, at mag-upload ng litrato ng inyong reseta. Kailangan ang reseta.",
            ),
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(18),
        child: ListView(
          children: [
            // Medicine selector
            const Text("Pumili ng Gamot / Select Medicine", style: TextStyle(fontSize: 17, fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            DropdownButtonFormField<int>(
              value: medicineId,
              style: const TextStyle(fontSize: 17, color: Colors.black87),
              decoration: const InputDecoration(
                labelText: "Gamot *",
                border: OutlineInputBorder(),
                contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 16),
              ),
              items: medicines.map((m) {
                final mm = m as Map;
                return DropdownMenuItem<int>(
                  value: (mm["id"] ?? 0) as int,
                  child: Text(mm["generic_name"]?.toString() ?? "Medicine", style: const TextStyle(fontSize: 17)),
                );
              }).toList(),
              onChanged: loading ? null : (v) => setState(() => medicineId = v),
            ),
            const SizedBox(height: 16),

            // Quantity
            const Text("Dami / Quantity", style: TextStyle(fontSize: 17, fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            TextField(
              controller: qtyCtrl,
              keyboardType: TextInputType.number,
              style: const TextStyle(fontSize: 17),
              decoration: const InputDecoration(
                labelText: "Dami *",
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),

            // Reason
            const Text("Dahilan (opsyonal) / Reason (optional)", style: TextStyle(fontSize: 17, fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            TextField(
              controller: reasonCtrl,
              maxLines: 3,
              style: const TextStyle(fontSize: 17),
              decoration: const InputDecoration(
                labelText: "Dahilan",
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),

            // Prescription image - REQUIRED
            Container(
              decoration: BoxDecoration(
                border: Border.all(
                  color: proofImage == null ? Colors.red.shade300 : Colors.green,
                  width: 2,
                ),
                borderRadius: BorderRadius.circular(12),
                color: proofImage == null ? Colors.red.shade50 : Colors.green.shade50,
              ),
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Row(
                    children: [
                      Icon(Icons.medical_services, color: proofImage == null ? Colors.red : Colors.green, size: 28),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              "Larawan ng Reseta *",
                              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                            ),
                            Text(
                              proofImage == null
                                  ? "KAILANGAN – Mag-upload ng larawan ng reseta bago makapagsumite"
                                  : "✓ Na-upload na ang reseta",
                              style: TextStyle(
                                fontSize: 14,
                                color: proofImage == null ? Colors.red.shade700 : Colors.green.shade700,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  if (preview != null) ...[
                    const SizedBox(height: 10),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(10),
                      child: Image.file(preview, height: 180, fit: BoxFit.cover),
                    ),
                  ],
                  const SizedBox(height: 12),
                  // Two buttons: gallery + camera
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: loading ? null : _pickImage,
                          icon: const Icon(Icons.photo_library, size: 24),
                          label: const Text("Gallery", style: TextStyle(fontSize: 16)),
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 14),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: loading ? null : _pickImageCamera,
                          icon: const Icon(Icons.camera_alt, size: 24),
                          label: const Text("Camera", style: TextStyle(fontSize: 16)),
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 14),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),

            // Error display
            if (error != null) ...[
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: Colors.red.shade50, borderRadius: BorderRadius.circular(8), border: Border.all(color: Colors.red.shade200)),
                child: Row(
                  children: [
                    const Icon(Icons.error_outline, color: Colors.red, size: 24),
                    const SizedBox(width: 8),
                    Expanded(child: Text(error!, style: const TextStyle(color: Colors.red, fontSize: 15))),
                  ],
                ),
              ),
              const SizedBox(height: 12),
            ],

            // Submit button
            SizedBox(
              height: 58,
              child: ElevatedButton.icon(
                onPressed: loading ? null : _submit,
                icon: loading ? const SizedBox.shrink() : const Icon(Icons.send, size: 24),
                label: loading
                    ? const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)),
                          SizedBox(width: 10),
                          Text("Isinusumite...", style: TextStyle(fontSize: 18)),
                        ],
                      )
                    : const Text("Isumite ang Kahilingan", style: TextStyle(fontSize: 18)),
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}
