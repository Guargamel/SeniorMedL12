class RequestModel {
  final int id;
  final String status;
  final String? remarks;
  final String? createdAt;
  final Map<String, dynamic>? medicine; // keep flexible

  RequestModel({
    required this.id,
    required this.status,
    this.remarks,
    this.createdAt,
    this.medicine,
  });

  factory RequestModel.fromJson(Map<String, dynamic> json) {
    return RequestModel(
      id: (json["id"] ?? 0) as int,
      status: (json["status"] ?? "unknown").toString(),
      remarks: json["remarks"]?.toString(),
      createdAt: json["created_at"]?.toString(),
      medicine: json["medicine"] is Map ? Map<String, dynamic>.from(json["medicine"]) : null,
    );
  }
}
