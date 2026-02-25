import 'package:flutter/material.dart';
import '../services/api_service.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  String result = "Loading...";

  @override
  void initState() {
    super.initState();
    loadMe();
  }

  Future<void> loadMe() async {
    try {
      final res = await ApiService.instance.dio.get("/me");
      setState(() {
        result = "Logged in!\n\n${res.data}";
      });
    } catch (e) {
      setState(() {
        result = "Failed calling /api/me.\nMost likely token/auth mismatch.\n\n$e";
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("SeniorMed")),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: SingleChildScrollView(child: Text(result)),
      ),
    );
  }
}
