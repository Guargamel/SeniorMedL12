import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/roles.dart';
import '../../services/auth_service.dart';
import '../../config/api_config.dart';
import '../../services/api_service.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _auth = AuthService();
  final _email = TextEditingController();
  final _password = TextEditingController();

  String _baseUrl = ApiConfig.defaultBaseUrl;
  bool _loadingUrl = true;

  bool _loading = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadBaseUrl();
  }

  Future<void> _loadBaseUrl() async {
    try {
      await ApiService.instance.loadBaseUrlFromStorage();
      final url = await ApiConfig.getBaseUrl();
      if (!mounted) return;
      setState(() {
        _baseUrl = url;
        _loadingUrl = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _baseUrl = ApiConfig.defaultBaseUrl;
        _loadingUrl = false;
      });
    }
  }

  Future<void> _submit() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      await _auth.login(
        email: _email.text.trim(),
        password: _password.text,
        deviceName: "android_emulator",
      );

      final me = await _auth.me();
      if (!mounted) return;

      if (Roles.isAdminLike(me.roles)) {
        context.go("/admin");
      } else if (Roles.isSenior(me.roles)) {
        context.go("/senior");
      } else {
        context.go("/unauthorized");
      }
    } catch (e) {
      setState(() {
        _error = e.toString();
      });
    } finally {
      setState(() {
        _loading = false;
      });
    }
  }

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 420),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const SizedBox(height: 18),
                  const Text(
                    "SeniorMed",
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 34, fontWeight: FontWeight.w800),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    "Sign in to continue",
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 16),
                  ),
                  const SizedBox(height: 24),

                  // ✅ Cleaner UI: hide technical server URL, keep a clear settings button.
                  Align(
                    alignment: Alignment.center,
                    child: TextButton.icon(
                      onPressed: () async {
                        await context.push('/server');
                        await _loadBaseUrl();
                      },
                      icon: const Icon(Icons.settings),
                      label: Text(_loadingUrl ? 'Configure settings…' : 'Configure settings'),
                    ),
                  ),

                  const SizedBox(height: 10),
                  TextField(
                    controller: _email,
                    keyboardType: TextInputType.emailAddress,
                    decoration: const InputDecoration(
                      labelText: "Email",
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _password,
                    obscureText: true,
                    decoration: const InputDecoration(
                      labelText: "Password",
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 14),
                  if (_error != null) ...[
                    Text(
                      _error!,
                      style: const TextStyle(color: Colors.red),
                    ),
                    const SizedBox(height: 10),
                  ],
                  SizedBox(
                    height: 48,
                    child: ElevatedButton(
                      onPressed: _loading ? null : _submit,
                      child: _loading
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : const Text("Login"),
                    ),
                  ),

                  const SizedBox(height: 10),
                  if (!_loadingUrl)
                    Text(
                      // Keep this subtle so it doesn't confuse seniors.
                      "Server is configured",
                      textAlign: TextAlign.center,
                      style: TextStyle(color: Colors.grey.shade600, fontSize: 12),
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
