import 'package:flutter/material.dart';

import '../senior/browse/browse_medicines_screen.dart';
import '../senior/requests/my_requests_screen.dart';
import '../common/profile_screen.dart';

import 'dart:async';
import '../../services/request_badge_service.dart';

class SeniorShell extends StatefulWidget {
  const SeniorShell({super.key});

  @override
  State<SeniorShell> createState() => _SeniorShellState();
}

class _SeniorShellState extends State<SeniorShell> {
  int index = 0;

  int _badgeCount = 0;
  Timer? _timer;

  Future<void> _refreshBadge() async {
    try {
      final res = await RequestBadgeService.getNewCount();
      if (!mounted) return;
      setState(() => _badgeCount = res.count);
    } catch (_) {
      // Don't block UI if notifications fail.
    }
  }

  late final List<Widget> pages = [
    const BrowseMedicinesScreen(),
    const MyRequestsScreen(),
    const ProfileScreen(),
  ];

  @override
  void initState() {
    super.initState();
    _refreshBadge();

    // Refresh badge every 60 seconds (and also when the shell loads).
    _timer = Timer.periodic(const Duration(seconds: 60), (_) => _refreshBadge());
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  Widget _navIconWithBadge(IconData icon, int count) {
    if (count <= 0) return Icon(icon);

    return Stack(
      clipBehavior: Clip.none,
      children: [
        Icon(icon),
        Positioned(
          right: -6,
          top: -6,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            decoration: BoxDecoration(
              color: Colors.red,
              borderRadius: BorderRadius.circular(999),
            ),
            child: Text(
              count > 99 ? '99+' : '$count',
              style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w700),
            ),
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(child: pages[index]),
      bottomNavigationBar: NavigationBar(
        selectedIndex: index,
        onDestinationSelected: (i) async {
          setState(() => index = i);

          // When the senior opens "My Requests", expire the badge by marking the latest reviewed_at as seen.
          if (i == 1) {
            try {
              final res = await RequestBadgeService.getNewCount();
              final latest = res.latestReviewedAt;
              if (latest != null) {
                await RequestBadgeService.setLastSeen(latest);
              }
            } catch (_) {}
          }

          await _refreshBadge();
        },
        destinations: [
          const NavigationDestination(icon: Icon(Icons.search), label: "Browse"),
          NavigationDestination(icon: _navIconWithBadge(Icons.assignment_turned_in, _badgeCount), label: "My Requests"),
          const NavigationDestination(icon: Icon(Icons.person), label: "Profile"),
        ],
      ),
    );
  }
}
