import 'package:flutter/services.dart';

/// TtsService — Text-To-Speech using Flutter's MethodChannel.
///
/// This calls the Android TextToSpeech engine and iOS AVSpeechSynthesizer
/// directly via a platform channel, with NO external pub.dev package required.
///
/// Usage:
///   await TtsService.instance.speakTagalog("Ang gamot ay available na.");
///   await TtsService.instance.speak("Your request was approved.");
class TtsService {
  TtsService._();
  static final TtsService instance = TtsService._();

  // Standard Flutter TTS channel (works with flutter_tts if added later,
  // but here we use the raw platform channel approach as fallback)
  static const _channel = MethodChannel('com.seniormed.tts');

  /// Speak text in Filipino/Tagalog.
  Future<void> speakTagalog(String text) async {
    await _speak(text, 'fil-PH');
  }

  /// Speak text in English.
  Future<void> speak(String text) async {
    await _speak(text, 'en-PH');
  }

  Future<void> _speak(String text, String lang) async {
    try {
      await _channel.invokeMethod('speak', {
        'text': text,
        'lang': lang,
        'rate': 0.45,  // slower for seniors
        'pitch': 1.0,
        'volume': 1.0,
      });
    } catch (_) {
      // TTS unavailable on this device/build — fail silently so app still works
    }
  }

  Future<void> stop() async {
    try {
      await _channel.invokeMethod('stop');
    } catch (_) {}
  }
}
