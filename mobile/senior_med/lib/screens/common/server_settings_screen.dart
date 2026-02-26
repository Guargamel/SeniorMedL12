import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../config/api_config.dart';
import '../../services/api_service.dart';

class ServerSettingsScreen extends StatefulWidget {
  const ServerSettingsScreen({super.key});

  @override
  State<ServerSettingsScreen> createState() => _ServerSettingsScreenState();
}

class _ServerSettingsScreenState extends State<ServerSettingsScreen> {
  final _url = TextEditingController();
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final current = await ApiConfig.getBaseUrl();
      _url.text = current;
    } catch (e) {
      _error = e.toString();
    } finally {
      if (!mounted) return;
      setState(() {
        _loading = false;
      });
    }
  }

  String? _validate(String url) {
    final u = url.trim();
    if (u.isEmpty) return 'Please enter a URL.';
    final parsed = Uri.tryParse(u);
    if (parsed == null || !parsed.hasScheme || !parsed.hasAuthority) {
      return 'Invalid URL. Example: http://192.168.1.10:8000';
    }
    if (parsed.scheme != 'http' && parsed.scheme != 'https') {
      return 'URL must start with http:// or https://';
    }
    return null;
  }

  Future<void> _save() async {
    final validationError = _validate(_url.text);
    if (validationError != null) {
      setState(() => _error = validationError);
      return;
    }

    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      await ApiService.instance.setBaseUrl(_url.text);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Server URL saved.')),
      );
      context.pop();
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      if (!mounted) return;
      setState(() => _loading = false);
    }
  }

  @override
  void dispose() {
    _url.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Server Settings'),
      ),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 520),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Text(
                    'API Base URL',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'This is the server your mobile app will use for login and all API requests.',
                  ),
                  const SizedBox(height: 14),
                  TextField(
                    controller: _url,
                    enabled: !_loading,
                    keyboardType: TextInputType.url,
                    decoration: const InputDecoration(
                      labelText: 'Base URL',
                      hintText: 'http://192.168.1.10:8000',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 12),
                  if (_error != null) ...[
                    Text(_error!, style: const TextStyle(color: Colors.red)),
                    const SizedBox(height: 10),
                  ],
                  SizedBox(
                    height: 48,
                    child: ElevatedButton.icon(
                      onPressed: _loading ? null : _save,
                      icon: _loading
                          ? const SizedBox(
                              width: 18,
                              height: 18,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : const Icon(Icons.save),
                      label: const Text('Save URL'),
                    ),
                  ),
                  const SizedBox(height: 10),
                  TextButton.icon(
                    onPressed: _loading
                        ? null
                        : () async {
                            await ApiService.instance.setBaseUrl(ApiConfig.defaultBaseUrl);
                            if (!mounted) return;
                            await _load();
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Reset to default URL.')),
                            );
                          },
                    icon: const Icon(Icons.restore),
                    label: const Text('Reset to default'),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
