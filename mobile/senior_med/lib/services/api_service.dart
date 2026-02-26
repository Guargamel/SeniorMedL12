import 'package:dio/dio.dart';
import '../config/api_config.dart';
import 'token_store.dart';

class ApiService {
  ApiService._() {
    dio = Dio(
      BaseOptions(
        baseUrl: "http://127.0.0.1:8000", // temporary default
        connectTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 25),
        headers: const {"Accept": "application/json"},
        validateStatus: (status) => status != null && status < 600,
      ),
    );

    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _tokenStore.read();
          if (token != null && token.isNotEmpty) {
            options.headers["Authorization"] = "Bearer $token";
          } else {
            options.headers.remove("Authorization");
          }
          return handler.next(options);
        },
      ),
    );
  }

  static final ApiService instance = ApiService._();

  final TokenStore _tokenStore = TokenStore();

  late final Dio dio;

  Future<void> loadBaseUrlFromStorage() async {
    final url = await ApiConfig.getBaseUrl();
    dio.options.baseUrl = url;
  }

  Future<void> setBaseUrl(String url) async {
    await ApiConfig.setBaseUrl(url);
    dio.options.baseUrl = url;
  }

  Future<String?> getToken() => _tokenStore.read();
  Future<void> setToken(String token) => _tokenStore.save(token);
  Future<void> clearToken() => _tokenStore.clear();
}
