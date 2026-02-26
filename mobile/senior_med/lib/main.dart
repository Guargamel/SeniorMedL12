import 'package:flutter/material.dart';
import 'services/api_service.dart';
import 'router/app_router.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Load saved base URL into Dio before any API calls
  await ApiService.instance.loadBaseUrlFromStorage();

  runApp(const SeniorMedApp());
}

class SeniorMedApp extends StatelessWidget {
  const SeniorMedApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: "SeniorMed",
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.green,
          brightness: Brightness.light,
        ),
        primaryColor: Colors.green,
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.green,
          foregroundColor: Colors.white,
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.green,
            foregroundColor: Colors.white,
          ),
        ),
        useMaterial3: true,
      ),
      routerConfig: AppRouter.router,
    );
  }
}
