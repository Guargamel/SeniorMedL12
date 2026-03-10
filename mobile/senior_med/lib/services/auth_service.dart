import '../models/user_model.dart';
import 'api_service.dart';
import 'push_notification_service.dart';

class AuthService {
  final _api = ApiService.instance;

  Future<String> login({
    required String email,
    required String password,
    String deviceName = "android",
  }) async {
    final res = await _api.dio.post("/mobile/login", data: {
      "email": email,
      "password": password,
      "device_name": deviceName,
    });

    if (res.statusCode != 200) {
      throw Exception("Login failed (${res.statusCode}): ${res.data}");
    }

    final token = res.data["token"]?.toString();

    if (token == null || token.isEmpty) {
      throw Exception("Login did not return a token.");
    }

    await _api.setToken(token);

    // Register FCM device token with the server so Laravel can send push
    // notifications to this specific device when a request is reviewed.
    await PushNotificationService.instance.registerToken();

    return token;
  }

  Future<void> logout() async {
    try {
      await _api.dio.post("/mobile/logout");
    } catch (_) {}
    await _api.clearToken();
  }

  Future<UserModel> me() async {
    final res = await _api.dio.get("/me");

    if (res.statusCode != 200) {
      throw Exception("Failed /me (${res.statusCode}): ${res.data}");
    }

    return UserModel.fromJson(Map<String, dynamic>.from(res.data));
  }
}
