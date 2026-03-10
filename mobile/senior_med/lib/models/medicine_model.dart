class MedicineModel {
  final int id;
  final String genericName;
  final String? brandName;
  final String? form;
  final String? strength;
  final String? category;
  final int? availableQty;
  final bool? isExpired;
  final bool? isLowStock;

  MedicineModel({
    required this.id,
    required this.genericName,
    this.brandName,
    this.form,
    this.strength,
    this.category,
    this.availableQty,
    this.isExpired,
    this.isLowStock,
  });

  factory MedicineModel.fromJson(Map<String, dynamic> json) {
    // Total quantity from batches or direct field
    int? qty;
    if (json["quantity"] != null) {
      qty = int.tryParse(json["quantity"].toString());
    } else if (json["available_qty"] != null) {
      qty = int.tryParse(json["available_qty"].toString());
    } else if (json["batches"] is List) {
      qty = (json["batches"] as List).fold<int>(
        0,
        (sum, b) => sum + ((b is Map ? (b["quantity"] ?? 0) : 0) as int),
      );
    }

    return MedicineModel(
      id:          (json["id"] ?? 0) as int,
      genericName: (json["generic_name"] ?? json["name"] ?? "").toString(),
      brandName:   json["brand_name"]?.toString(),
      form:        json["dosage_form"]?.toString(),
      strength:    json["strength"]?.toString(),
      category:    (json["category"] is Map ? json["category"]["name"] : json["category"])?.toString(),
      availableQty: qty,
      isExpired:   json["is_expired"] is bool ? json["is_expired"] as bool : null,
      isLowStock:  json["is_low_stock"] is bool ? json["is_low_stock"] as bool : null,
    );
  }
}
