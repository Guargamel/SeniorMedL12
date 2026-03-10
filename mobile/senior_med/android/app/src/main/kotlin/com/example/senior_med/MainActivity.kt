package com.example.senior_med

import android.speech.tts.TextToSpeech
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel
import java.util.Locale

class MainActivity : FlutterActivity() {

    private val TTS_CHANNEL = "com.seniormed.tts"
    private var tts: TextToSpeech? = null
    private var ttsReady = false

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)

        // Initialize Android TextToSpeech engine
        tts = TextToSpeech(this) { status ->
            ttsReady = (status == TextToSpeech.SUCCESS)
            if (ttsReady) {
                // Try Filipino first, fall back to English if not available
                val filipino = Locale("fil", "PH")
                val result = tts?.setLanguage(filipino)
                if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) {
                    tts?.setLanguage(Locale.ENGLISH)
                }
                tts?.setSpeechRate(0.85f)  // Slightly slower for seniors
                tts?.setPitch(1.0f)
            }
        }

        // Wire up the MethodChannel so Flutter can call speak/stop
        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, TTS_CHANNEL)
            .setMethodCallHandler { call, result ->
                when (call.method) {
                    "speak" -> {
                        val text = call.argument<String>("text") ?: ""
                        val lang = call.argument<String>("lang") ?: "en"
                        if (ttsReady && text.isNotBlank()) {
                            // Switch language per call if needed
                            if (lang.startsWith("fil") || lang.startsWith("tl")) {
                                val filipino = Locale("fil", "PH")
                                val langResult = tts?.setLanguage(filipino)
                                if (langResult == TextToSpeech.LANG_MISSING_DATA ||
                                    langResult == TextToSpeech.LANG_NOT_SUPPORTED) {
                                    tts?.setLanguage(Locale.ENGLISH)
                                }
                            } else {
                                tts?.setLanguage(Locale.ENGLISH)
                            }
                            tts?.speak(text, TextToSpeech.QUEUE_FLUSH, null, "seniormed_tts")
                            result.success(true)
                        } else {
                            result.success(false)
                        }
                    }
                    "stop" -> {
                        tts?.stop()
                        result.success(true)
                    }
                    "isLanguageAvailable" -> {
                        val filipino = Locale("fil", "PH")
                        val available = tts?.isLanguageAvailable(filipino)
                        result.success(
                            available != TextToSpeech.LANG_MISSING_DATA &&
                                available != TextToSpeech.LANG_NOT_SUPPORTED
                        )
                    }
                    else -> result.notImplemented()
                }
            }
    }

    override fun onDestroy() {
        tts?.stop()
        tts?.shutdown()
        super.onDestroy()
    }
}
