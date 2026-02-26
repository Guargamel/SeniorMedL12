import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/roles.dart';
import '../../services/api_service.dart';
import '../../services/auth_service.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  final _auth = AuthService();

  @override
  void initState() {
    super.initState();
    _boot();
  }

  Future<void> _boot() async {
    // Ensure the app uses the persisted base URL before any requests.
    await ApiService.instance.loadBaseUrlFromStorage();

    final token = await ApiService.instance.getToken();

    if (token == null || token.isEmpty) {
      if (!mounted) return;
      context.go("/login");
      return;
    }

    try {
      final me = await _auth.me();
      if (!mounted) return;

      if (Roles.isAdminLike(me.roles)) {
        context.go("/admin");
      } else if (Roles.isSenior(me.roles)) {
        context.go("/senior");
      } else {
        context.go("/unauthorized");
      }
    } catch (_) {
      // Token expired or invalid
      await ApiService.instance.clearToken();
      if (!mounted) return;
      context.go("/login");
    }
  }

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: SafeArea(
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.local_hospital, size: 64),
              SizedBox(height: 12),
              Text("SeniorMed", style: TextStyle(fontSize: 28, fontWeight: FontWeight.w800)),
              SizedBox(height: 16),
              CircularProgressIndicator(),
            ],
          ),
        ),
      ),
    );
  }
}
