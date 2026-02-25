import 'dart:io';

import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

import '../../../services/api_service.dart';

class CreateRequestScreen extends StatefulWidget {
  final int? medicineId;
  final String? medicineLabel;

  const CreateRequestScreen({super.key, this.medicineId, this.medicineLabel});

  @override
  State<CreateRequestScreen> createState() => _CreateRequestScreenState();
}

class _CreateRequestScreenState extends State<CreateRequestScreen> {
  int? medicineId;
  final qtyCtrl = TextEditingController(text: "1");
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
  }

  Future<void> _loadMedicines() async {
    try {
      final res = await ApiService.instance.dio.get("/medicines");
      if (res.statusCode != 200) throw Exception("${res.statusCode}: ${res.data}");
      final data = res.data;
      medicines = (data is Map && data["data"] is List) ? data["data"] as List : (data is List ? data : []);
      if (mounted) setState(() {});
    } catch (e) {
      if (mounted) setState(() => error = e.toString());
    }
  }

  Future<void> _pickImage() async {
    try {
      final picker = ImagePicker();
      final img = await picker.pickImage(
        source: ImageSource.gallery,
        maxWidth: 1600,
        imageQuality: 85,
      );
      if (img != null) {
        setState(() => proofImage = img);
      }
    } catch (e) {
      setState(() => error = "Failed to pick image: $e");
    }
  }

  Future<void> _submit() async {
    setState(() {
      loading = true;
      error = null;
    });

    try {
      if (medicineId == null) throw Exception("Please select a medicine.");

      final qty = int.tryParse(qtyCtrl.text.trim()) ?? 1;

      // Backend expects:
      // - medicine_id (int)
      // - quantity (int)
      // - reason (string, optional)
      // - prescription_path (image file, optional)
      final form = FormData.fromMap({
        "medicine_id": medicineId,
        "quantity": qty,
        "reason": reasonCtrl.text.trim().isEmpty ? null : reasonCtrl.text.trim(),
        if (proofImage != null)
          "prescription_path": await MultipartFile.fromFile(
            proofImage!.path,
            filename: proofImage!.name,
          ),
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
      Navigator.pop(context, true);
    } catch (e) {
      setState(() => error = e.toString());
    } finally {
      setState(() => loading = false);
    }
  }

  @override
  void dispose() {
    qtyCtrl.dispose();
    reasonCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final preview = proofImage != null ? File(proofImage!.path) : null;

    return Scaffold(
      appBar: AppBar(title: const Text("New Request")),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: ListView(
          children: [
            DropdownButtonFormField<int>(
              value: medicineId,
              decoration: const InputDecoration(
                labelText: "Medicine",
                border: OutlineInputBorder(),
              ),
              items: medicines.map((m) {
                final mm = m as Map;
                return DropdownMenuItem(
                  value: (mm["id"] ?? 0) as int,
                  child: Text(mm["generic_name"]?.toString() ?? "Medicine"),
                );
              }).toList(),
              onChanged: (v) => setState(() => medicineId = v),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: qtyCtrl,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: "Quantity",
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: reasonCtrl,
              maxLines: 3,
              decoration: const InputDecoration(
                labelText: "Reason (optional)",
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 12),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const Text("Proof of receipt (image)", style: TextStyle(fontWeight: FontWeight.w700)),
                    const SizedBox(height: 8),
                    if (preview != null)
                      ClipRRect(
                        borderRadius: BorderRadius.circular(10),
                        child: Image.file(preview, height: 180, fit: BoxFit.cover),
                      )
                    else
                      const Text("No image selected."),
                    const SizedBox(height: 10),
                    OutlinedButton.icon(
                      onPressed: loading ? null : _pickImage,
                      icon: const Icon(Icons.upload_file),
                      label: Text(preview == null ? "Choose Image" : "Change Image"),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 12),
            if (error != null) ...[
              Text(error!, style: const TextStyle(color: Colors.red)),
              const SizedBox(height: 10),
            ],
            SizedBox(
              height: 48,
              child: ElevatedButton(
                onPressed: loading ? null : _submit,
                child: loading
                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                    : const Text("Submit Request"),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
