import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../screens/splash/splash_screen.dart';
import '../screens/auth/login_screen.dart';
import '../screens/common/unauthorized_screen.dart';
import '../screens/admin/admin_shell.dart';
import '../screens/senior/senior_shell.dart';

class AppRouter {
  static final GoRouter router = GoRouter(
    initialLocation: "/",
    routes: [
      GoRoute(
        path: "/",
        builder: (_, __) => const SplashScreen(),
      ),
      GoRoute(
        path: "/login",
        builder: (_, __) => const LoginScreen(),
      ),
      GoRoute(
        path: "/unauthorized",
        builder: (_, __) => const UnauthorizedScreen(),
      ),
      GoRoute(
        path: "/admin",
        builder: (_, __) => const AdminShell(),
      ),
      GoRoute(
        path: "/senior",
        builder: (_, __) => const SeniorShell(),
      ),
    ],
  );
}
