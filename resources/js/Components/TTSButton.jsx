/**
 * TTSButton – Text-To-Speech accessibility button for senior citizens
 *
 * Usage:
 *   <TTSButton text="Ang gamot ay available na." />
 *   <TTSButton text="Your medicine request was approved." lang="en-PH" />
 */
import React, { useCallback } from "react";

const TTSButton = ({ text, lang = "fil-PH", size = "sm", className = "" }) => {
    const speak = useCallback(() => {
        if (!window.speechSynthesis) {
            alert("Hindi sinusuportahan ng inyong browser ang audio. / Your browser does not support audio.");
            return;
        }
        window.speechSynthesis.cancel(); // Stop any previous
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang  = lang;
        utter.rate  = 0.85; // Slower for seniors
        utter.pitch = 1.0;
        utter.volume = 1.0;
        window.speechSynthesis.speak(utter);
    }, [text, lang]);

    return (
        <button
            type="button"
            onClick={speak}
            title="Pakinggan / Listen"
            aria-label="Read aloud"
            className={`btn btn-outline-info btn-${size} ${className}`}
            style={{ padding: "4px 8px", borderRadius: 999 }}
        >
            🔊
        </button>
    );
};

export default TTSButton;
