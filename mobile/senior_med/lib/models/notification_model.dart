class NotificationModel {
  final int id;
  final String title;
  final String message;
  final bool isRead;
  final String? createdAt;

  NotificationModel({
    required this.id,
    required this.title,
    required this.message,
    required this.isRead,
    this.createdAt,
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    return NotificationModel(
      id: (json["id"] ?? 0) as int,
      title: (json["title"] ?? json["type"] ?? "Notification").toString(),
      message: (json["message"] ?? json["data"] ?? "").toString(),
      isRead: (json["read_at"] != null) || (json["is_read"] == true),
      createdAt: json["created_at"]?.toString(),
    );
  }
}
