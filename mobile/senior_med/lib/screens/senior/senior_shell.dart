import 'package:flutter/material.dart';

import '../senior/browse/browse_medicines_screen.dart';
import '../senior/requests/my_requests_screen.dart';
import '../common/profile_screen.dart';

class SeniorShell extends StatefulWidget {
  const SeniorShell({super.key});

  @override
  State<SeniorShell> createState() => _SeniorShellState();
}

class _SeniorShellState extends State<SeniorShell> {
  int index = 0;

  final pages = const [
    BrowseMedicinesScreen(),
    MyRequestsScreen(),
    ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(child: pages[index]),
      bottomNavigationBar: NavigationBar(
        selectedIndex: index,
        onDestinationSelected: (i) => setState(() => index = i),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.search), label: "Browse"),
          NavigationDestination(icon: Icon(Icons.assignment_turned_in), label: "My Requests"),
          NavigationDestination(icon: Icon(Icons.person), label: "Profile"),
        ],
      ),
    );
  }
}
