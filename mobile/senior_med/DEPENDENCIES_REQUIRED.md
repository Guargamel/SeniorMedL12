# SeniorMed — No New Dependencies Required

All fixes (1–6) now compile with your **existing** pubspec.yaml.
No new packages were added.

## How TTS Works (Fix 5)
Text-to-speech uses Flutter's `MethodChannel('com.seniormed.tts')`.

The 🔊 audio buttons in Browse, Requests, Notifications, and Profile are
wired up and will work once you add the native side. Steps:

### Android (kotlin) — android/app/src/main/kotlin/.../MainActivity.kt
```kotlin
import android.speech.tts.TextToSpeech
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel
import java.util.Locale

class MainActivity : FlutterActivity() {
    private lateinit var tts: TextToSpeech
    private val TTS_CHANNEL = "com.seniormed.tts"

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        tts = TextToSpeech(this) {}

        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, TTS_CHANNEL)
            .setMethodCallHandler { call, result ->
                when (call.method) {
                    "speak" -> {
                        val text = call.argument<String>("text") ?: ""
                        val lang = call.argument<String>("lang") ?: "en-PH"
                        val rate = call.argument<Double>("rate")?.toFloat() ?: 0.45f
                        tts.language = Locale.forLanguageTag(lang)
                        tts.setSpeechRate(rate)
                        tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, null)
                        result.success(null)
                    }
                    "stop" -> { tts.stop(); result.success(null) }
                    else -> result.notImplemented()
                }
            }
    }
}
```

### iOS (Swift) — ios/Runner/AppDelegate.swift
```swift
import Flutter
import AVFoundation
import UIKit

@UIApplicationMain
@objc class AppDelegate: FlutterAppDelegate {
    let synth = AVSpeechSynthesizer()

    override func application(_ application: UIApplication,
        didFinishLaunchingWithOptions opts: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        let controller = window?.rootViewController as! FlutterViewController
        let ch = FlutterMethodChannel(name: "com.seniormed.tts",
                                      binaryMessenger: controller.binaryMessenger)
        ch.setMethodCallHandler { call, result in
            if call.method == "speak", let args = call.arguments as? [String: Any] {
                let text = args["text"] as? String ?? ""
                let lang = args["lang"] as? String ?? "fil-PH"
                let rate = Float(args["rate"] as? Double ?? 0.45)
                let utter = AVSpeechUtterance(string: text)
                utter.voice = AVSpeechSynthesisVoice(language: lang)
                    ?? AVSpeechSynthesisVoice(language: "en-PH")
                utter.rate = rate
                self.synth.speak(utter)
                result(nil)
            } else if call.method == "stop" {
                self.synth.stopSpeaking(at: .immediate); result(nil)
            } else {
                result(FlutterMethodNotImplemented)
            }
        }
        return super.application(application, didFinishLaunchingWithOptions: opts)
    }
}
```

## How Push Notifications Work (Fix 4)
The `PushNotificationService` polls `/notifications` every 30 seconds.
When a new approved/declined notification arrives it shows a **green/red
SnackBar banner** inside the app immediately.

For true system-tray notifications (visible when app is closed), the
notification channel `com.seniormed.notifications` is also called via
`MethodChannel`. Wire it up in `MainActivity.kt` like the TTS example above,
calling `NotificationManager` / `NotificationCompat`.

Alternatively, add `flutter_local_notifications: ^17.0.0` to pubspec.yaml
for a one-line integration — the service is already structured to support it.
