import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiConfig {
  static const _key = 'api_base_url';
  static const defaultBaseUrl = 'http://192.168.1.10:8000'; // change later

  static const FlutterSecureStorage _storage = FlutterSecureStorage();

  static String _normalize(String url) {
    var u = url.trim();
    // Remove a trailing slash to avoid double-slash issues with endpoints.
    while (u.endsWith('/')) {
      u = u.substring(0, u.length - 1);
    }
    return u;
  }

  static Future<String> getBaseUrl() async {
    final saved = await _storage.read(key: _key);
    final url = (saved == null || saved.trim().isEmpty) ? defaultBaseUrl : saved;
    return _normalize(url);
  }

  static Future<void> setBaseUrl(String url) async {
    final normalized = _normalize(url);
    await _storage.write(key: _key, value: normalized);
  }
}
