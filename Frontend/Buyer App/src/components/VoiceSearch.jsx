import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Languages, X, Edit2, Search, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const VoiceSearch = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [language, setLanguage] = useState("en-US");
    const [showLanguageMenu, setShowLanguageMenu] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [searchHistory, setSearchHistory] = useState([]);
    const [showModal, setShowModal] = useState(false);

    const recognitionRef = useRef(null);
    const navigate = useNavigate();

    const languages = [
        { code: "en-US", name: "English", flag: "🇺🇸" },
        { code: "hi-IN", name: "हिंदी", flag: "🇮🇳" },
        { code: "mr-IN", name: "मराठी", flag: "🇮🇳" },
        { code: "pa-IN", name: "ਪੰਜਾਬੀ", flag: "🇮🇳" },
        { code: "ta-IN", name: "தமிழ்", flag: "🇮🇳" },
        { code: "te-IN", name: "తెలుగు", flag: "🇮🇳" },
        { code: "bn-IN", name: "বাংলা", flag: "🇮🇳" },
    ];

    useEffect(() => {
        const history = JSON.parse(localStorage.getItem("voiceSearchHistory") || "[]");
        setSearchHistory(history);

        if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;

            recognitionRef.current.onresult = (event) => {
                const current = event.resultIndex;
                const transcriptText = event.results[current][0].transcript;
                setTranscript(transcriptText);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
                if (transcript) {
                    processVoiceCommand(transcript);
                }
            };

            recognitionRef.current.onerror = (event) => {
                console.error("Speech recognition error:", event.error);
                setIsListening(false);
            };
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert("Voice search is not supported in your browser. Please use Chrome, Edge, or Safari.");
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            setTranscript("");
            recognitionRef.current.lang = language;
            recognitionRef.current.start();
            setIsListening(true);
            setShowModal(true);
        }
    };

    const processVoiceCommand = (text) => {
        const lowerText = text.toLowerCase();
        const newHistory = [text, ...searchHistory.slice(0, 9)];
        setSearchHistory(newHistory);
        localStorage.setItem("voiceSearchHistory", JSON.stringify(newHistory));

        if (lowerText.includes("order") || lowerText.includes("my orders") || lowerText.includes("purchase")) {
            navigate("/orders");
            setTimeout(() => setShowModal(false), 800);
            return;
        }

        if (lowerText.includes("home") || lowerText.includes("back") || lowerText.includes("market") || lowerText.includes("main page")) {
            navigate("/");
            setTimeout(() => setShowModal(false), 800);
            return;
        }

        if (lowerText.includes("show") || lowerText.includes("search") || lowerText.includes("find")) {
            const productMatch = text.match(/(?:show|search|find)\s+(.+?)(?:\s+under|\s+below|\s+less than|$)/i);
            if (productMatch) {
                const product = productMatch[1].trim();
                const priceMatch = text.match(/(?:under|below|less than)\s+(\d+)/i);
                if (priceMatch) {
                    const maxPrice = priceMatch[1];
                    navigate(`/?search=${encodeURIComponent(product)}&maxPrice=${maxPrice}`);
                } else {
                    navigate(`/?search=${encodeURIComponent(product)}`);
                }
            }
        } else if (lowerText.includes("filter") || lowerText.includes("sort")) {
            if (lowerText.includes("organic")) {
                navigate("/?filter=organic");
            } else if (lowerText.includes("price") && (lowerText.includes("low") || lowerText.includes("cheap"))) {
                navigate("/?sort=price_asc");
            } else if (lowerText.includes("price") && lowerText.includes("high")) {
                navigate("/?sort=price_desc");
            }
        } else {
            navigate(`/?search=${encodeURIComponent(text)}`);
        }

        setTimeout(() => setShowModal(false), 500);
    };

    const handleManualSearch = () => {
        if (transcript.trim()) {
            processVoiceCommand(transcript);
        }
    };

    const currentLanguage = languages.find(l => l.code === language);

    return (
        <>
            {/* Premium Voice Search Button */}
            <div className="relative group">
                <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={toggleListening}
                    className={`relative flex h-11 w-11 items-center justify-center rounded-full overflow-hidden transition-all duration-500 ${isListening
                        ? "bg-gradient-to-br from-red-500 via-pink-500 to-red-600 shadow-xl shadow-red-500/40"
                        : "bg-gradient-to-br from-emerald-400 via-green-500 to-teal-500 shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40"
                        }`}
                >
                    {/* Animated gradient background */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        animate={{
                            x: ["-100%", "200%"],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                    />

                    {isListening ? (
                        <MicOff className="h-5 w-5 text-white relative z-10 drop-shadow-lg" />
                    ) : (
                        <Mic className="h-5 w-5 text-white relative z-10 drop-shadow-lg" />
                    )}

                    {/* Multiple pulse rings when listening */}
                    {isListening && (
                        <>
                            {[...Array(4)].map((_, i) => (
                                <motion.span
                                    key={i}
                                    className="absolute inset-0 rounded-full bg-gradient-to-br from-red-400 to-pink-500"
                                    animate={{
                                        scale: [1, 2, 2],
                                        opacity: [0.6, 0.3, 0],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        delay: i * 0.4,
                                        ease: "easeOut",
                                    }}
                                />
                            ))}
                        </>
                    )}
                </motion.button>

                {/* Enhanced Language selector */}
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                    className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-white to-gray-50 border-2 border-white text-sm shadow-lg hover:shadow-xl transition-all duration-300"
                    title="Change language"
                >
                    {currentLanguage?.flag}
                </motion.button>

                {/* Premium Language dropdown */}
                <AnimatePresence>
                    {showLanguageMenu && (
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ type: "spring", duration: 0.3 }}
                            className="absolute right-0 top-14 z-50 w-52 rounded-2xl border border-white/60 bg-white/95 backdrop-blur-xl shadow-2xl overflow-hidden"
                        >
                            <div className="p-3">
                                <div className="mb-3 px-3 py-2 text-xs font-bold bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg uppercase tracking-wide">
                                    Select Language
                                </div>
                                {languages.map((lang) => (
                                    <motion.button
                                        key={lang.code}
                                        whileHover={{ x: 4 }}
                                        onClick={() => {
                                            setLanguage(lang.code);
                                            setShowLanguageMenu(false);
                                        }}
                                        className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${language === lang.code
                                            ? "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 shadow-sm"
                                            : "text-gray-700 hover:bg-gray-50"
                                            }`}
                                    >
                                        <span className="text-xl">{lang.flag}</span>
                                        <span className="font-semibold">{lang.name}</span>
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Premium Voice Search Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-br from-black/60 via-black/50 to-black/60 backdrop-blur-md"
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.85, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.85, opacity: 0, y: 20 }}
                            transition={{ type: "spring", duration: 0.5 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-xl rounded-3xl border border-white/30 bg-gradient-to-br from-white via-gray-50 to-white backdrop-blur-2xl p-8 shadow-2xl overflow-hidden"
                        >
                            {/* Decorative gradient orbs */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-200/30 to-emerald-300/30 rounded-full blur-3xl -z-10" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-200/30 to-cyan-300/30 rounded-full blur-3xl -z-10" />

                            {/* Premium Close button */}
                            <motion.button
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setShowModal(false)}
                                className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 shadow-lg transition-all duration-300"
                            >
                                <X className="h-4 w-4" />
                            </motion.button>

                            {/* Header with premium design */}
                            <div className="mb-8 text-center">
                                <motion.div
                                    className="mb-4 flex justify-center"
                                    animate={isListening ? { scale: [1, 1.05, 1] } : {}}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    <div className={`relative flex h-24 w-24 items-center justify-center rounded-full shadow-2xl transition-all duration-500 ${isListening
                                        ? "bg-gradient-to-br from-red-500 via-pink-500 to-red-600"
                                        : "bg-gradient-to-br from-emerald-400 via-green-500 to-teal-500"
                                        }`}>
                                        {/* Inner glow */}
                                        <div className="absolute inset-2 rounded-full bg-white/20 backdrop-blur-sm" />

                                        {isListening ? (
                                            <MicOff className="h-11 w-11 text-white relative z-10 drop-shadow-2xl" />
                                        ) : (
                                            <Mic className="h-11 w-11 text-white relative z-10 drop-shadow-2xl" />
                                        )}

                                        {/* Premium waveform animation */}
                                        {isListening && (
                                            <>
                                                {[...Array(5)].map((_, i) => (
                                                    <motion.span
                                                        key={i}
                                                        className="absolute inset-0 rounded-full border-2 border-red-400"
                                                        animate={{
                                                            scale: [1, 2.2 + i * 0.2, 2.2 + i * 0.2],
                                                            opacity: [0.8, 0.4, 0],
                                                        }}
                                                        transition={{
                                                            duration: 2.5,
                                                            repeat: Infinity,
                                                            delay: i * 0.25,
                                                            ease: "easeOut",
                                                        }}
                                                    />
                                                ))}
                                            </>
                                        )}
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <h3 className="text-3xl font-extrabold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent flex items-center justify-center gap-2">
                                        {isListening ? (
                                            <>
                                                Listening
                                                <motion.span
                                                    animate={{ opacity: [1, 0.3, 1] }}
                                                    transition={{ duration: 1.5, repeat: Infinity }}
                                                >
                                                    ...
                                                </motion.span>
                                            </>
                                        ) : (
                                            <>
                                                Voice Search
                                                <Sparkles className="h-6 w-6 text-green-500" />
                                            </>
                                        )}
                                    </h3>
                                    <p className="mt-3 text-sm font-medium text-gray-600">
                                        {isListening
                                            ? "🎤 Speak now. Try: 'Show tomatoes under 50 rupees'"
                                            : "Click the microphone to start searching"}
                                    </p>
                                </motion.div>
                            </div>

                            {/* Premium Transcript display */}
                            {transcript && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-6"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="text-sm font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
                                            Your search:
                                        </label>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setIsEditing(!isEditing)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-all"
                                        >
                                            <Edit2 className="h-3 w-3" />
                                            Edit
                                        </motion.button>
                                    </div>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={transcript}
                                            onChange={(e) => setTranscript(e.target.value)}
                                            className="w-full rounded-xl border-2 border-green-200 bg-white px-4 py-3.5 text-sm font-medium text-gray-900 shadow-sm focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/20 transition-all"
                                            autoFocus
                                        />
                                    ) : (
                                        <div className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 px-4 py-3.5 text-sm font-medium text-gray-900 shadow-inner">
                                            "{transcript}"
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* Premium Action buttons */}
                            <div className="flex gap-3 mb-6">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={toggleListening}
                                    className={`flex-1 rounded-xl px-6 py-3.5 font-bold text-white shadow-xl transition-all duration-300 relative overflow-hidden ${isListening
                                        ? "bg-gradient-to-r from-red-500 via-pink-500 to-red-600 shadow-red-500/40 hover:shadow-red-500/60"
                                        : "bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 shadow-green-500/40 hover:shadow-green-500/60"
                                        }`}
                                >
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                        animate={{ x: ["-100%", "200%"] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    />
                                    <span className="relative z-10">{isListening ? "Stop Listening" : "Start Listening"}</span>
                                </motion.button>

                                {transcript && (
                                    <motion.button
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0, opacity: 0 }}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleManualSearch}
                                        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 px-6 py-3.5 font-bold text-white shadow-xl shadow-blue-500/40 hover:shadow-blue-500/60 transition-all duration-300 relative overflow-hidden"
                                    >
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                            animate={{ x: ["-100%", "200%"] }}
                                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                        />
                                        <Search className="h-4 w-4 relative z-10" />
                                        <span className="relative z-10">Search</span>
                                    </motion.button>
                                )}
                            </div>

                            {/* Premium Search history */}
                            {searchHistory.length > 0 && !isListening && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="mb-6 pt-6 border-t border-gray-200"
                                >
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <div className="h-1 w-1 rounded-full bg-green-500" />
                                        Recent Searches
                                    </h4>
                                    <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
                                        {searchHistory.slice(0, 5).map((item, index) => (
                                            <motion.button
                                                key={index}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                whileHover={{ x: 4, scale: 1.01 }}
                                                onClick={() => {
                                                    setTranscript(item);
                                                    setIsEditing(false);
                                                }}
                                                className="w-full text-left rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 hover:from-green-50 hover:to-emerald-50 px-4 py-2.5 text-xs font-medium text-gray-700 hover:text-green-700 transition-all shadow-sm hover:shadow-md border border-gray-200 hover:border-green-200"
                                            >
                                                {item}
                                            </motion.button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Premium Voice command examples */}
                            {!transcript && !isListening && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="pt-6 border-t border-gray-200"
                                >
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <Sparkles className="h-3 w-3 text-green-500" />
                                        Try saying:
                                    </h4>
                                    <div className="space-y-2 text-xs font-medium">
                                        {[
                                            { text: "Show tomatoes under 50 rupees", color: "from-blue-500 to-cyan-500" },
                                            { text: "Find organic vegetables", color: "from-green-500 to-emerald-500" },
                                            { text: "Sort by price low to high", color: "from-purple-500 to-pink-500" }
                                        ].map((example, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.5 + index * 0.1 }}
                                                className={`rounded-xl bg-gradient-to-r ${example.color} p-[1px] shadow-md`}
                                            >
                                                <div className="rounded-xl bg-white px-4 py-2.5 text-gray-700">
                                                    "{example.text}"
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </>
    );
};

export default VoiceSearch;
