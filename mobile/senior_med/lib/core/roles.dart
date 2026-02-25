class Roles {
  static const superAdmin = "super-admin";
  static const staff = "staff";
  static const senior = "senior-citizen";

  static bool isAdminLike(Iterable<String> roles) =>
      roles.contains(superAdmin) || roles.contains(staff);

  static bool isSenior(Iterable<String> roles) => roles.contains(senior);
}
