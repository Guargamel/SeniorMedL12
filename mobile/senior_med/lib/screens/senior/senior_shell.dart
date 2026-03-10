import 'dart:async';
import 'package:flutter/material.dart';

import '../senior/browse/browse_medicines_screen.dart';
import '../senior/requests/my_requests_screen.dart';
import '../senior/notifications/senior_notifications_screen.dart';
import '../common/profile_screen.dart';
import '../../services/request_badge_service.dart';
import '../../services/notification_badge_service.dart';

class SeniorShell extends StatefulWidget {
  const SeniorShell({super.key});

  @override
  State<SeniorShell> createState() => _SeniorShellState();
}

class _SeniorShellState extends State<SeniorShell> {
  int index = 0;
  int _requestBadge = 0;
  int _notifBadge   = 0;
  Timer? _timer;

  Future<void> _refreshBadges() async {
    try {
      final req = await RequestBadgeService.getNewCount();
      if (!mounted) return;
      setState(() => _requestBadge = req.count);
    } catch (_) {}

    try {
      final notif = await NotificationBadgeService.getNewCount();
      if (!mounted) return;
      setState(() => _notifBadge = notif.count);
    } catch (_) {}
  }

  late final List<Widget> pages = [
    const BrowseMedicinesScreen(),
    const MyRequestsScreen(),
    SeniorNotificationsScreen(
      onSeenLatest: () {
        if (mounted) setState(() => _notifBadge = 0);
      },
    ),
    const ProfileScreen(),
  ];

  @override
  void initState() {
    super.initState();
    _refreshBadges();
    // Poll every 30 s to keep in-app badge counts fresh
    _timer = Timer.periodic(const Duration(seconds: 30), (_) => _refreshBadges());
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
              style: const TextStyle(
                color: Colors.white,
                fontSize: 10,
                fontWeight: FontWeight.w700,
              ),
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
          if (i == 1) {
            try {
              final res = await RequestBadgeService.getNewCount();
              if (res.latestReviewedAt != null) {
                await RequestBadgeService.setLastSeen(res.latestReviewedAt!);
              }
            } catch (_) {}
          }
          await _refreshBadges();
        },
        destinations: [
          const NavigationDestination(icon: Icon(Icons.search), label: "Browse"),
          NavigationDestination(
            icon: _navIconWithBadge(Icons.assignment_turned_in, _requestBadge),
            label: "My Requests",
          ),
          NavigationDestination(
            icon: _navIconWithBadge(Icons.notifications, _notifBadge),
            label: "Notifications",
          ),
          const NavigationDestination(icon: Icon(Icons.person), label: "Profile"),
        ],
      ),
    );
  }
}
