class MedicineModel {
  final int id;
  final String genericName;
  final String? brandName;
  final String? form;
  final String? strength;
  final String? category;
  final int? availableQty;

  MedicineModel({
    required this.id,
    required this.genericName,
    this.brandName,
    this.form,
    this.strength,
    this.category,
    this.availableQty,
  });

  factory MedicineModel.fromJson(Map<String, dynamic> json) {
    return MedicineModel(
      id: (json["id"] ?? 0) as int,
      genericName: (json["generic_name"] ?? json["name"] ?? "").toString(),
      brandName: json["brand_name"]?.toString(),
      form: json["dosage_form"]?.toString(),
      strength: json["strength"]?.toString(),
      category: (json["category"] is Map ? json["category"]["name"] : json["category"])?.toString(),
      availableQty: json["available_qty"] is int ? json["available_qty"] as int : (json["available_qty"] == null ? null : int.tryParse(json["available_qty"].toString())),
    );
  }
}
