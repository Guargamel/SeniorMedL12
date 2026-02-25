import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class TokenStore {
  static const _kTokenKey = "token";
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  Future<void> save(String token) => _storage.write(key: _kTokenKey, value: token);
  Future<String?> read() => _storage.read(key: _kTokenKey);
  Future<void> clear() => _storage.delete(key: _kTokenKey);
}
