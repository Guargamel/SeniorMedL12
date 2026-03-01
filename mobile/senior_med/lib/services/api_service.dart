import 'package:dio/dio.dart';
import '../config/api_config.dart';
import 'token_store.dart';

class ApiService {
  ApiService._() {
    dio = Dio(
      BaseOptions(
        // Safe fallback only. This WILL be overwritten by stored baseUrl.
        baseUrl: _fallbackBaseUrl,
        connectTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 25),
        headers: const {"Accept": "application/json"},
        validateStatus: (status) => status != null && status < 600,
      ),
    );

    // Attach auth token automatically
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          // Ensure baseUrl is loaded at least once before any request
          await _ensureBaseUrlLoaded();

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

  static const String _fallbackBaseUrl = "http://192.168.1.10:8000";
  // ^ change this to YOUR laptop LAN IP, not 127.0.0.1

  final TokenStore _tokenStore = TokenStore();

  late final Dio dio;

  bool _baseUrlLoaded = false;

  /// Loads stored baseUrl once. Automatically called before requests via interceptor.
  Future<void> _ensureBaseUrlLoaded() async {
    if (_baseUrlLoaded) return;

    final stored = await ApiConfig.getBaseUrl();
    final url = (stored ?? "").trim();

    if (url.isNotEmpty) {
      dio.options.baseUrl = _normalizeBaseUrl(url);
    } else {
      dio.options.baseUrl = _fallbackBaseUrl;
    }

    _baseUrlLoaded = true;
  }

  /// Manually load (optional): you can still call this in main() if you want.
  Future<void> loadBaseUrlFromStorage() async {
    _baseUrlLoaded = false;
    await _ensureBaseUrlLoaded();
  }

  /// Called by your "Edit URL" screen.
  Future<void> setBaseUrl(String url) async {
    final normalized = _normalizeBaseUrl(url);
    await ApiConfig.setBaseUrl(normalized);
    dio.options.baseUrl = normalized;
    _baseUrlLoaded = true;
  }

  /// Optional helper if you want to show current url in UI.
  String get currentBaseUrl => dio.options.baseUrl;

  Future<String?> getToken() => _tokenStore.read();
  Future<void> setToken(String token) => _tokenStore.save(token);
  Future<void> clearToken() => _tokenStore.clear();

  String _normalizeBaseUrl(String url) {
    var u = url.trim();

    // Remove trailing slash to prevent double slashes when calling endpoints.
    while (u.endsWith('/')) {
      u = u.substring(0, u.length - 1);
    }

    return u;
  }
}
