import { useState, useRef, useCallback, useEffect } from "react";

// Maps our chat language codes to the BCP-47 locale codes the Web Speech
// API expects, so voice input/output follows whatever language the user has
// selected for the UI.
const SPEECH_LANG_MAP = {
  en: "en-IN",
  hi: "hi-IN",
  mr: "mr-IN",
};

/**
 * Wraps the browser's native Web Speech API (SpeechRecognition +
 * SpeechSynthesis). Free, no API key, no backend involvement -- this is
 * built into Chrome and most modern browsers. Firefox/Safari support for
 * SpeechRecognition is inconsistent, so we feature-detect and expose
 * `isSupported` so the UI can hide the mic button gracefully where it
 * isn't available, rather than showing a broken control.
 */
export function useSpeech(language = "en") {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);

  const SpeechRecognition = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
  const isRecognitionSupported = !!SpeechRecognition;
  const isSynthesisSupported = typeof window !== "undefined" && "speechSynthesis" in window;

  const startListening = useCallback(
    (onResult, onError) => {
      if (!isRecognitionSupported) {
        onError?.("Voice input isn't supported in this browser. Try Chrome.");
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = SPEECH_LANG_MAP[language] || "en-IN";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (event) => {
        setIsListening(false);
        onError?.(event.error);
      };
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
      };

      recognitionRef.current = recognition;
      recognition.start();
    },
    [language, isRecognitionSupported, SpeechRecognition]
  );

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  // Common female-voice name patterns across Chrome/Edge/Android TTS engines.
  // The Web Speech API has no reliable standardized "gender" field, so this
  // is a best-effort name match -- falls back to the first voice matching
  // the language if nothing matches (still functional, just not guaranteed female).
  const FEMALE_VOICE_HINTS = ["female", "zira", "susan", "samantha", "victoria", "google हिन्दी", "google mar", "heera", "kalpana"];

  function pickVoice(langPrefix) {
    if (!isSynthesisSupported) return null;
    const voices = window.speechSynthesis.getVoices();
    const matchingLang = voices.filter((v) => v.lang.toLowerCase().startsWith(langPrefix.toLowerCase()));
    const female = matchingLang.find((v) => FEMALE_VOICE_HINTS.some((hint) => v.name.toLowerCase().includes(hint)));
    return female || matchingLang[0] || voices.find((v) => v.lang.toLowerCase().startsWith("en")) || voices[0] || null;
  }

  const speak = useCallback(
    (text) => {
      if (!isSynthesisSupported) return;
      window.speechSynthesis.cancel(); // stop any current speech before starting new
      const utterance = new SpeechSynthesisUtterance(text);
      const langCode = SPEECH_LANG_MAP[language] || "en-IN";
      utterance.lang = langCode;
      const voice = pickVoice(langCode.split("-")[0]);
      if (voice) utterance.voice = voice;
      utterance.pitch = 1.05; // very slightly higher -- reads a touch warmer/softer
      utterance.rate = 1;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    },
    [language, isSynthesisSupported]
  );

  const stopSpeaking = useCallback(() => {
    if (isSynthesisSupported) window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSynthesisSupported]);

  // Clean up any in-flight speech when the component unmounts
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      if (isSynthesisSupported) window.speechSynthesis.cancel();
    };
  }, [isSynthesisSupported]);

  return {
    isListening,
    isSpeaking,
    isRecognitionSupported,
    isSynthesisSupported,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  };
}
