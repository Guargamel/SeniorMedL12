import 'package:flutter/material.dart';
import '../../services/api_service.dart';

class ApiUrlScreen extends StatefulWidget {
  const ApiUrlScreen({super.key});

  @override
  State<ApiUrlScreen> createState() => _ApiUrlScreenState();
}

class _ApiUrlScreenState extends State<ApiUrlScreen> {
  final _controller = TextEditingController();
  bool _saving = false;
  String? _msg;

  @override
  void initState() {
    super.initState();
    _controller.text = ApiService.instance.dio.options.baseUrl;
  }

  String _normalize(String input) {
    var url = input.trim();
    if (url.endsWith('/')) url = url.substring(0, url.length - 1);
    return url;
  }

  Future<void> _save() async {
    final url = _normalize(_controller.text);
    if (url.isEmpty) {
      setState(() => _msg = "Please enter a URL.");
      return;
    }

    setState(() {
      _saving = true;
      _msg = null;
    });

    try {
      await ApiService.instance.setBaseUrl(url);

      // Optional: quick “reachability” test (even 404 means server is reachable)
      final res = await ApiService.instance.dio.get('/');
      setState(() => _msg = "Saved! Server responded: ${res.statusCode}");
    } catch (e) {
      setState(() => _msg = "Saved, but test failed: $e");
    } finally {
      setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Server Settings")),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            const Text(
              "Set the API Base URL (your Laravel server). Example:\n"
                  "http://192.168.1.50:8000",
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _controller,
              decoration: const InputDecoration(
                labelText: "API Base URL",
                border: OutlineInputBorder(),
              ),
              keyboardType: TextInputType.url,
            ),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _saving ? null : _save,
                child: Text(_saving ? "Saving..." : "Save & Test"),
              ),
            ),
            if (_msg != null) ...[
              const SizedBox(height: 12),
              Text(_msg!),
            ],
          ],
        ),
      ),
    );
  }
}
