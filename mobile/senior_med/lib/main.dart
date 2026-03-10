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
        // Fix 5: Larger default font sizes for senior citizens
        textTheme: const TextTheme(
          bodyLarge:   TextStyle(fontSize: 18),
          bodyMedium:  TextStyle(fontSize: 16),
          bodySmall:   TextStyle(fontSize: 14),
          titleLarge:  TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
          titleMedium: TextStyle(fontSize: 20, fontWeight: FontWeight.w600),
          titleSmall:  TextStyle(fontSize: 18, fontWeight: FontWeight.w500),
          labelLarge:  TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
          labelMedium: TextStyle(fontSize: 16),
          labelSmall:  TextStyle(fontSize: 14),
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.green,
          foregroundColor: Colors.white,
          titleTextStyle: TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.green,
            foregroundColor: Colors.white,
            textStyle: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
            minimumSize: const Size(double.infinity, 52),
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          ),
        ),
        inputDecorationTheme: const InputDecorationTheme(
          labelStyle: TextStyle(fontSize: 16),
          hintStyle:  TextStyle(fontSize: 16),
          contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        ),
        useMaterial3: true,
      ),
      routerConfig: AppRouter.router,
    );
  }
}
