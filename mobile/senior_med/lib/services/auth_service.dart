import '../models/user_model.dart';
import 'api_service.dart';

class AuthService {
  final _api = ApiService.instance;

  /// Token login endpoint you added: POST /api/login -> {token, user}
  Future<String> login({
    required String email,
    required String password,
    String deviceName = "android_emulator",
  }) async {
    final res = await _api.dio.post("/login", data: {
      "email": email,
      "password": password,
      "device_name": deviceName,
    });

    if (res.statusCode != 200) {
      throw Exception("Login failed (${res.statusCode}): ${res.data}");
    }

    final token = (res.data is Map ? res.data["token"] : null)?.toString();
    if (token == null || token.isEmpty) {
      throw Exception("Login did not return a token. Response: ${res.data}");
    }

    await _api.setToken(token);
    return token;
  }

  Future<void> logout() async {
    // If you kept /api/logout as session logout, and added /api/token-logout for mobile tokens:
    // We'll try token-logout first, then clear token regardless.
    try {
      await _api.dio.post("/token-logout");
    } catch (_) {}
    await _api.clearToken();
  }

  Future<UserModel> me() async {
    final res = await _api.dio.get("/me");
    if (res.statusCode != 200) {
      throw Exception("Failed /me (${res.statusCode}): ${res.data}");
    }
    final data = res.data;
    if (data is Map<String, dynamic>) {
      return UserModel.fromJson(data);
    }
    if (data is Map) {
      return UserModel.fromJson(Map<String, dynamic>.from(data));
    }
    throw Exception("Unexpected /me response: $data");
  }
}
