class UserModel {
  final int id;
  final String name;
  final String email;
  final List<String> roles;
  final String? avatarUrl;

  UserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.roles,
    this.avatarUrl,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    // Your API /me returns {id,name,email,roles: [...]} in our earlier controller,
    // but your current /me in api.php might return a richer object.
    final rolesRaw = json["roles"];
    List<String> roles = [];
    if (rolesRaw is List) {
      roles = rolesRaw.map((e) => e.toString()).toList();
    } else if (json["user"] is Map && (json["user"]["roles"] is List)) {
      roles = (json["user"]["roles"] as List)
          .map((e) => (e is Map ? e["name"] : e).toString())
          .toList();
    }

    return UserModel(
      id: (json["id"] ?? json["user"]?["id"] ?? 0) as int,
      name: (json["name"] ?? json["user"]?["name"] ?? "") as String,
      email: (json["email"] ?? json["user"]?["email"] ?? "") as String,
      roles: roles,
      avatarUrl: (json["avatar_url"] ?? json["user"]?["avatar_url"])?.toString(),
    );
  }
}
