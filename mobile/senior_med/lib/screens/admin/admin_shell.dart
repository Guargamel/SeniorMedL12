import 'package:flutter/material.dart';

import '../admin/dashboard/admin_dashboard_screen.dart';
import '../admin/medicines/admin_medicines_screen.dart';
import '../admin/batches/admin_batches_screen.dart';
import '../admin/requests/admin_requests_screen.dart';
import '../admin/notifications/admin_notifications_screen.dart';
import '../common/profile_screen.dart';

class AdminShell extends StatefulWidget {
  const AdminShell({super.key});

  @override
  State<AdminShell> createState() => _AdminShellState();
}

class _AdminShellState extends State<AdminShell> {
  int index = 0;

  final pages = const [
    AdminDashboardScreen(),
    AdminMedicinesScreen(),
    AdminBatchesScreen(),
    AdminRequestsScreen(),
    AdminNotificationsScreen(),
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
          NavigationDestination(icon: Icon(Icons.dashboard), label: "Dashboard"),
          NavigationDestination(icon: Icon(Icons.medication), label: "Medicines"),
          NavigationDestination(icon: Icon(Icons.inventory_2), label: "Batches"),
          NavigationDestination(icon: Icon(Icons.assignment), label: "Requests"),
          NavigationDestination(icon: Icon(Icons.notifications), label: "Alerts"),
          NavigationDestination(icon: Icon(Icons.person), label: "Profile"),
        ],
      ),
    );
  }
}
