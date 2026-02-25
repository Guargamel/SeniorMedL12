import 'package:dio/dio.dart';
import '../core/app_config.dart';
import 'token_store.dart';

class ApiService {
  ApiService._();

  static final ApiService instance = ApiService._();

  final TokenStore _tokenStore = TokenStore();

  late final Dio dio = Dio(
    BaseOptions(
      baseUrl: AppConfig.apiBaseUrl,
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 25),
      headers: const {
        "Accept": "application/json",
      },
      // don't throw on 4xx so we can show readable messages
      validateStatus: (status) => status != null && status < 600,
    ),
  )..interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _tokenStore.read();
          if (token != null && token.isNotEmpty) {
            options.headers["Authorization"] = "Bearer $token";
          }
          return handler.next(options);
        },
      ),
    );

  Future<String?> getToken() => _tokenStore.read();
  Future<void> setToken(String token) => _tokenStore.save(token);
  Future<void> clearToken() => _tokenStore.clear();
}
