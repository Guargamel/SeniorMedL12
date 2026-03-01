import 'package:flutter/foundation.dart';

class RequestEvents {
  static final ValueNotifier<int> tick = ValueNotifier<int>(0);

  static void notifyCreated() {
    tick.value++;
  }
}
