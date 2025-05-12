import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  Globe,
  ArrowRight,
  Loader2,
  BookOpen,
  Columns,
  Table,
  Clipboard,
  Sparkles,
  Clock,
  Zap,
  Check,
  AlertCircle,
  Info,
  Book,
  MessageCircle,
  ArrowUpDown,
  Lightbulb,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

const Translator = () => {
  // Main states for the application
  const [inputText, setInputText] = useState("");
  const [translationMode, setTranslationMode] = useState("simultaneous"); // simultaneous or sequential
  const [translationView, setTranslationView] = useState("single"); // single or multi
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("translate"); // translate, tense, about



  // States for single language translation
  const [singleLanguage, setSingleLanguage] = useState("fr");
  const [customLanguage, setCustomLanguage] = useState("");
  const [useCustomLanguage, setUseCustomLanguage] = useState(false);
  const [singleTranslation, setSingleTranslation] = useState("");
  const [wordAnalysis, setWordAnalysis] = useState([]);
  const [isScreenSmall, setIsScreenSmall] = useState(false);
  const [isSearchBarFocused, setIsSearchBarFocused] = useState(false);
  // States for multi-language translation
  const [languages, setLanguages] = useState(["fr", "es", "de"]);
  const [customLanguages, setCustomLanguages] = useState(["", "", ""]);
  const [useCustomLanguages, setUseCustomLanguages] = useState([
    false,
    false,
    false,
  ]);
  const [translations, setTranslations] = useState({});

  // States for tense comparison
  const [verbInput, setVerbInput] = useState("analyze");
  const [tenseLanguages, setTenseLanguages] = useState([
    "english",
    "french",
    "korean",
  ]);
  const [tenseTableData, setTenseTableData] = useState([
    {
      tense: "Present",
      english: "I analyze",
      french: "J'analyse",
      korean: "나는 분석한다",
    },
    {
      tense: "Past",
      english: "I analyzed",
      french: "J'ai analysé",
      korean: "나는 분석했다",
    },
    {
      tense: "Future",
      english: "I will analyze",
      french: "J'analyserai",
      korean: "나는 분석 할 것이다",
    },
    {
      tense: "Conditional",
      english: "I would analyze",
      french: "J'analyserais",
      korean: "나는 분석할 것이다 (가정법)",
    },
  ]);

  // Translation step indicators for sequential mode
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [translationProgress, setTranslationProgress] = useState([]);

  // Available languages for translation
  const availableLanguages = [
    { code: "fr", name: "French" },
    { code: "es", name: "Spanish" },
    { code: "de", name: "German" },
    { code: "it", name: "Italian" },
    { code: "pt", name: "Portuguese" },
    { code: "ru", name: "Russian" },
    { code: "zh", name: "Chinese" },
    { code: "ja", name: "Japanese" },
    { code: "ko", name: "Korean" },
  ];

  // Extract significant words from text for analysis
  const extractSignificantWords = (text) => {
    // Split the text by spaces and punctuation
    const words = text.split(/[\s.,;!?()[\]{}"':]+/).filter(Boolean);

    // Filter out common words (a simple stopwords implementation)
    const stopwords = [
      "the",
      "a",
      "an",
      "in",
      "on",
      "at",
      "for",
      "to",
      "of",
      "and",
      "or",
      "is",
      "are",
      "was",
      "were",
    ];
    const filteredWords = words.filter(
      (word) => word.length > 2 && !stopwords.includes(word.toLowerCase())
    );

    // Get unique words and limit to 5 to avoid overwhelming the API
    const uniqueWords = [...new Set(filteredWords)].slice(0, 5);

    return uniqueWords;
  };

  // Handle word analysis
  const analyzeWords = async (text) => {
    if (!text.trim()) return;

    try {
      // Extract significant words for analysis
      const words = extractSignificantWords(text);
      console.log("text", text);
      if (words.length === 0) return;

      const res = await fetch(
        "http://localhost:8000/api/translate/analyze/words/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ words, text }),
        }
      );

      const data = await res.json();
      console.log("Word analysis response:", data);
      if (data.results) {
        setWordAnalysis(data.results);
      } else {
        // Mock data if API fails
        const mockAnalysis = words.map((word) => ({
          original: word,
          translated: word + " (translated)",
          synonyms: ["synonym1", "synonym2", "synonym3"],
          antonyms: ["antonym1", "antonym2"],
        }));
        setWordAnalysis(mockAnalysis);
      }
    } catch (error) {
      console.error("Word analysis error:", error);
      // Fallback to mock data
      const mockAnalysis = [
        {
          original: "language",
          translated: "langue",
          synonyms: ["tongue", "speech", "dialect"],
          antonyms: ["silence", "muteness"],
        },
        {
          original: "learning",
          translated: "apprentissage",
          synonyms: ["studying", "education", "training"],
          antonyms: ["ignorance", "illiteracy"],
        },
      ];
      setWordAnalysis(mockAnalysis);
    }
  };

  // Handle single language translation
  const handleSingleTranslate = async () => {
    if (!inputText.trim()) return;

    setLoading(true);
    try {
      // Get the actual language code to use
      const langCode = useCustomLanguage ? customLanguage : singleLanguage;

      const res = await fetch("http://localhost:8000/api/translate/text/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: inputText,
          language: langCode,
          sequential: false,
        }),
      });
      console.log("data is ", res);
      const data = await res.json();

      if (data.translated_text) {
        setSingleTranslation(data.translated_text);

        // Analyze words after translation
        await analyzeWords(inputText);
      } else {
        // Mock response for demo purposes
        setSingleTranslation(
          `This is a mock translation to ${langCode.toUpperCase()} for: "${inputText}"`
        );
        await analyzeWords(inputText);
      }
    } catch (error) {
      console.error("Translation error:", error);
      setSingleTranslation(`Mock translation for: "${inputText}"`);
      await analyzeWords(inputText);
    } finally {
      setLoading(false);
    }
  };

  // Reset translation progress state
  const resetTranslationProgress = (langCount) => {
    setCurrentStep(0);
    setTotalSteps(langCount);
    setTranslationProgress(
      Array(langCount)
        .fill()
        .map(() => ({ status: "pending", text: "" }))
    );
  };

  // Handle multi-language translation with visual progress for sequential mode
  const handleMultiTranslate = async () => {
    if (!inputText.trim()) return;

    setLoading(true);

    // Get actual language codes (either from selection or custom input)
    const actualLanguages = languages.map((lang, index) =>
      useCustomLanguages[index] ? customLanguages[index] : lang
    );

    // Reset translation results
    setTranslations({});

    // Reset progress tracking for sequential mode
    resetTranslationProgress(actualLanguages.length);

    try {
      const splitIntoSentences = (text) => {
        if (!text || typeof text !== "string" || !text.trim()) {
          return [];
        }

        // Step 1: Preprocessing - protect specific patterns
        let processedText = text;

        // Store replacements to restore later
        const replacements = [];
        let replacementIndex = 0;

        // Handle decimal numbers (e.g., 3.14)
        processedText = processedText.replace(/\b\d+\.\d+/g, (match) => {
          const placeholder = `__NUMBER_DECIMAL_${replacementIndex}__`;
          replacements[replacementIndex] = match;
          replacementIndex++;
          return placeholder;
        });

        // Handle abbreviated titles with periods (multi-word match)
        const multiWordTitles = [
          /(?:Mr|Mrs|Ms|Dr|Prof|Gen|Rep|Sen|St|Hon|Rev)\.\s+[A-Z][a-z]+/g,
          /(?:Ph|M|B|D)\.D\./g, // Ph.D., M.D., etc.
        ];

        multiWordTitles.forEach((pattern) => {
          processedText = processedText.replace(pattern, (match) => {
            const placeholder = `__TITLE_${replacementIndex}__`;
            replacements[replacementIndex] = match;
            replacementIndex++;
            return placeholder;
          });
        });

        // Handle common abbreviations
        const abbreviations = [
          // Common abbreviations
          /\b(?:U\.S\.A|U\.S|U\.K|U\.N|E\.U|a\.m|p\.m|i\.e|e\.g|etc|vs|Fig|Vol|p|pp|Jr|Sr|Inc|Ltd|Co)\./gi,

          // State abbreviations
          /\b(?:Ala|Ariz|Ark|Calif|Colo|Conn|Del|Fla|Ga|Ill|Ind|Kan|Ky|La|Md|Mass|Mich|Minn|Miss|Mo|Mont|Neb|Nev|N\.H|N\.J|N\.M|N\.Y|N\.C|N\.D|Okla|Ore|Pa|R\.I|S\.C|S\.D|Tenn|Tex|Vt|Va|Wash|W\.Va|Wis|Wyo)\./gi,

          // Measurements and units
          /\b(?:mm|cm|m|km|in|ft|yd|mi|oz|lb|mg|g|kg|ml|l|gal|mph)\./gi,

          // Acronyms with periods (like N.A.S.A.)
          /\b(?:[A-Z]\.){2,}/g,

          // Time abbreviations
          /\d{1,2}:\d{2}(?:\s*[ap]\.m\.)/gi,

          // Website and email domains (.com, .org, etc.)
          /\b[\w.-]+@[\w.-]+\.[a-z]{2,6}\b/gi,
          /\bwww\.[\w.-]+\.[a-z]{2,6}\b/gi,
        ];

        abbreviations.forEach((pattern) => {
          processedText = processedText.replace(pattern, (match) => {
            const placeholder = `__ABBR_${replacementIndex}__`;
            replacements[replacementIndex] = match;
            replacementIndex++;
            return placeholder;
          });
        });

        // Handle ellipsis (...)
        processedText = processedText.replace(/\.{3,}/g, (match) => {
          const placeholder = `__ELLIPSIS_${replacementIndex}__`;
          replacements[replacementIndex] = match;
          replacementIndex++;
          return placeholder;
        });

        // Handle quoted sentences
        const quotedSentencePattern = /"[^"]*?[.!?].*?"/g;
        processedText = processedText.replace(
          quotedSentencePattern,
          (match) => {
            const placeholder = `__QUOTED_${replacementIndex}__`;
            replacements[replacementIndex] = match;
            replacementIndex++;
            return placeholder;
          }
        );

        // Step 2: Split into sentences using a more comprehensive pattern
        // Look for sentence boundaries: .!? followed by space and capital letter or end of string
        const sentencePattern = /[^.!?]+[.!?]+(?=\s+[A-Z0-9]|\s*$)/g;
        let sentences = processedText.match(sentencePattern) || [];

        // If the pattern didn't match anything, return the original text as one sentence
        if (sentences.length === 0 && processedText.trim()) {
          sentences = [processedText];
        }

        // Step 3: Restore all protected text
        sentences = sentences.map((sentence) => {
          // Restore all placeholders
          let restoredSentence = sentence;

          // Handle all types of replacements
          for (let i = 0; i < replacementIndex; i++) {
            const numberPattern = new RegExp(`__NUMBER_DECIMAL_${i}__`, "g");
            const titlePattern = new RegExp(`__TITLE_${i}__`, "g");
            const abbrPattern = new RegExp(`__ABBR_${i}__`, "g");
            const ellipsisPattern = new RegExp(`__ELLIPSIS_${i}__`, "g");
            const quotedPattern = new RegExp(`__QUOTED_${i}__`, "g");

            restoredSentence = restoredSentence
              .replace(numberPattern, replacements[i])
              .replace(titlePattern, replacements[i])
              .replace(abbrPattern, replacements[i])
              .replace(ellipsisPattern, replacements[i])
              .replace(quotedPattern, replacements[i]);
          }

          return restoredSentence.trim();
        });

        // Filter out empty sentences
        return sentences.filter((s) => s.trim().length > 0);
      };
      if (translationMode === "sequential") {
        // Sequential translation - one language at a time with visible progress
        for (let i = 0; i < actualLanguages.length; i++) {
          // Update current step
          setCurrentStep(i + 1);

          // Update status to "in progress"
          setTranslationProgress((prev) => {
            const updated = [...prev];
            updated[i] = { ...updated[i], status: "translating" };
            return updated;
          });

          try {
            // Make API call with sequential flag
            const res = await fetch(
              "http://localhost:8000/api/translate/text/",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  text: inputText,
                  language: actualLanguages[i],
                  sequential: true,
                }),
              }
            );

            const data = await res.json();
            console.log("multi data is ", data);
            if (data.translated_text) {
              // Analyze words after translation
              await analyzeWords(inputText);
            }
            const translatedText =
              data.translated_text ||
              `Mock sequential translation to ${actualLanguages[
                i
              ].toUpperCase()} for: "${inputText}"`;

            // Split original text and translated text into sentences
            const originalSentences = splitIntoSentences(inputText);
            const translatedSentences = splitIntoSentences(translatedText);

            // Create paired sentences array
            const pairedSentences = [];

            // Match original sentences with their translations
            // If lengths don't match, we'll handle as many as we can
            const minLength = Math.min(
              originalSentences.length,
              translatedSentences.length
            );

            for (let j = 0; j < minLength; j++) {
              pairedSentences.push({
                original: originalSentences[j].trim(),
                translated: translatedSentences[j].trim(),
              });
            }

            // Store the paired sentences
            setTranslations((prev) => ({
              ...prev,
              [actualLanguages[i]]: {
                fullText: translatedText,
                pairedSentences: pairedSentences,
              },
            }));

            // Update progress status to "completed"
            setTranslationProgress((prev) => {
              const updated = [...prev];
              updated[i] = {
                status: "completed",
                text: translatedText,
                pairedSentences: pairedSentences,
              };
              return updated;
            });
          } catch (error) {
            console.error(
              `Translation error for ${actualLanguages[i]}:`,
              error
            );
            const mockText = `Mock sequential translation to ${actualLanguages[
              i
            ].toUpperCase()} for: "${inputText}"`;

            // Update translations state with mock data
            setTranslations((prev) => ({
              ...prev,
              [actualLanguages[i]]: mockText,
            }));

            // Update progress status to "completed" with mock data
            setTranslationProgress((prev) => {
              const updated = [...prev];
              updated[i] = { status: "completed", text: mockText };
              return updated;
            });
          }

          // Add a small delay for visual effect in sequential mode
          if (i < actualLanguages.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }
      } else {
        // Simultaneous translation - all languages at once
        const translationPromises = actualLanguages.map(async (lang, index) => {
          // Update status to "in progress" for all languages
          setTranslationProgress((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], status: "translating" };
            return updated;
          });

          try {
            const res = await fetch(
              "http://localhost:8000/api/translate/text/",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  text: inputText,
                  language: lang,
                  sequential: false,
                }),
              }
            );

            const data = await res.json();
            return {
              lang,
              translation:
                data.translated_text ||
                `Mock simultaneous translation to ${lang.toUpperCase()} for: "${inputText}"`,
            };
          } catch (error) {
            console.error(`Translation error for ${lang}:`, error);
            return {
              lang,
              translation: `Mock simultaneous translation to ${lang.toUpperCase()} for: "${inputText}"`,
            };
          }
        });

        // Wait for all translations to complete
        const results = await Promise.all(translationPromises);

        // Update the translations state
        const translationResults = {};
        results.forEach((result, index) => {
          translationResults[result.lang] = result.translation;

          // Update progress status to "completed"
          setTranslationProgress((prev) => {
            const updated = [...prev];
            updated[index] = { status: "completed", text: result.translation };
            return updated;
          });
        });

        setTranslations(translationResults);
        setCurrentStep(actualLanguages.length); // All steps completed
      }
    } catch (error) {
      console.error("Translation error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle tense comparison table generation
  const handleTenseComparison = async () => {
    if (!verbInput.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(
        "http://localhost:8000/api/translate/tense/comparison/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            verb: verbInput,
            languages: tenseLanguages,
          }),
        }
      );

      const data = await res.json();
      if (data.table) {
        setTenseTableData(data.table);
      } else {
        // Use mock data if API fails
        const mockTable = [
          {
            tense: "Present",
            english: `I ${verbInput}`,
            french: `Je ${verbInput}`,
            korean: `나는 ${verbInput}한다`,
          },
          {
            tense: "Past",
            english: `I ${verbInput}d`,
            french: `J'ai ${verbInput}é`,
            korean: `나는 ${verbInput}했다`,
          },
          {
            tense: "Future",
            english: `I will ${verbInput}`,
            french: `Je ${verbInput}rai`,
            korean: `나는 ${verbInput} 할 것이다`,
          },
          {
            tense: "Conditional",
            english: `I would ${verbInput}`,
            french: `Je ${verbInput}rais`,
            korean: `나는 ${verbInput}할 것이다 (가정법)`,
          },
        ];
        setTenseTableData(mockTable);
      }
    } catch (error) {
      console.error("Tense comparison error:", error);
      // Use mock data if API fails
      const mockTable = [
        {
          tense: "Present",
          english: `I ${verbInput}`,
          french: `Je ${verbInput}`,
          korean: `나는 ${verbInput}한다`,
        },
        {
          tense: "Past",
          english: `I ${verbInput}d`,
          french: `J'ai ${verbInput}é`,
          korean: `나는 ${verbInput}했다`,
        },
        {
          tense: "Future",
          english: `I will ${verbInput}`,
          french: `Je ${verbInput}rai`,
          korean: `나는 ${verbInput} 할 것이다`,
        },
        {
          tense: "Conditional",
          english: `I would ${verbInput}`,
          french: `Je ${verbInput}rais`,
          korean: `나는 ${verbInput}할 것이다 (가정법)`,
        },
      ];
      setTenseTableData(mockTable);
    } finally {
      setLoading(false);
    }
  };

  // Handle translation based on view mode
  const handleTranslate = () => {
    if (translationView === "single") {
      handleSingleTranslate();
    } else {
      handleMultiTranslate();
    }
  };

  // Handle language selection for multi-language mode
  const toggleLanguage = (langCode) => {
    if (languages.includes(langCode)) {
      if (languages.length > 1) {
        setLanguages(languages.filter((l) => l !== langCode));
      }
    } else {
      if (languages.length < 3) {
        setLanguages([...languages, langCode]);
      }
    }
  };

  // Toggle custom language input for single language mode
  const toggleCustomLanguage = () => {
    setUseCustomLanguage(!useCustomLanguage);
  };

  // Toggle custom language input for multi-language mode
  const toggleCustomLanguageAtIndex = (index) => {
    const newUseCustomLanguages = [...useCustomLanguages];
    newUseCustomLanguages[index] = !newUseCustomLanguages[index];
    setUseCustomLanguages(newUseCustomLanguages);
  };

  // Update custom language input for multi-language mode
  const updateCustomLanguage = (index, value) => {
    const newCustomLanguages = [...customLanguages];
    newCustomLanguages[index] = value;
    setCustomLanguages(newCustomLanguages);
  };

  // Load tense comparison data when the tab is selected
  useEffect(() => {
    if (activeTab === "tense" && verbInput) {
      handleTenseComparison();
    }
  }, [activeTab]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  const fadeVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.4 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link to="/">
            <div className="flex items-center space-x-2 cursor-pointer">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: 360 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                <Globe className="h-8 w-8 text-indigo-600" />
              </motion.div>
              <motion.span
                className="text-2xl font-bold text-indigo-700"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                MultiLingo
              </motion.span>
            </div>
          </Link>

          {/* Mobile menu button */}
          {isScreenSmall && (
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md bg-white shadow-sm"
            >
              <motion.div
                animate={{ rotate: isMenuOpen ? 90 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {isMenuOpen ? (
                  <svg
                    className="h-6 w-6 text-indigo-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-6 w-6 text-indigo-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </motion.div>
            </button>
          )}

          {/* Desktop menu */}
          {!isScreenSmall && (
            <div className="flex space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab("translate")}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-300 ${
                  activeTab === "translate"
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "bg-white text-gray-600 hover:bg-gray-100 shadow-sm"
                }`}
              >
                <Globe className="h-5 w-5" />
                <span>Translator</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab("tense")}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-300 ${
                  activeTab === "tense"
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "bg-white text-gray-600 hover:bg-gray-100 shadow-sm"
                }`}
              >
                <Table className="h-5 w-5" />
                <span>Tense Table</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab("about")}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-300 ${
                  activeTab === "about"
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "bg-white text-gray-600 hover:bg-gray-100 shadow-sm"
                }`}
              >
                <BookOpen className="h-5 w-5" />
                <span>About</span>
              </motion.button>
            </div>
          )}
        </motion.div>

        {/* Mobile menu dropdown */}
        <AnimatePresence>
          {isScreenSmall && isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="bg-white rounded-lg shadow-md flex flex-col p-2 space-y-2">
                <button
                  onClick={() => {
                    setActiveTab("translate");
                    setIsMenuOpen(false);
                  }}
                  className={`px-4 py-3 rounded-lg flex items-center space-x-2 ${
                    activeTab === "translate"
                      ? "bg-indigo-100 text-indigo-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Globe className="h-5 w-5" />
                  <span>Translator</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab("tense");
                    setIsMenuOpen(false);
                  }}
                  className={`px-4 py-3 rounded-lg flex items-center space-x-2 ${
                    activeTab === "tense"
                      ? "bg-indigo-100 text-indigo-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Table className="h-5 w-5" />
                  <span>Tense Table</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab("about");
                    setIsMenuOpen(false);
                  }}
                  className={`px-4 py-3 rounded-lg flex items-center space-x-2 ${
                    activeTab === "about"
                      ? "bg-indigo-100 text-indigo-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <BookOpen className="h-5 w-5" />
                  <span>About</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Translation Section */}
        <AnimatePresence mode="wait">
          {activeTab === "translate" && (
            <motion.div
              key="translate"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="space-y-6"
            >
              {/* Translation Mode and View Switcher */}
              <motion.div
                variants={itemVariants}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-lg shadow-md"
              >
                <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                  <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-lg">
                    <motion.button
                      onClick={() => setTranslationView("single")}
                      className={`px-3 py-1.5 rounded-md flex items-center space-x-1 transition-all duration-300 ${
                        translationView === "single"
                          ? "bg-indigo-100 text-indigo-700 shadow-sm"
                          : "text-gray-600 hover:bg-gray-200"
                      }`}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <ArrowRight className="h-4 w-4" />
                      <span>Single</span>
                    </motion.button>
                    <motion.button
                      onClick={() => setTranslationView("multi")}
                      className={`px-3 py-1.5 rounded-md flex items-center space-x-1 transition-all duration-300 ${
                        translationView === "multi"
                          ? "bg-indigo-100 text-indigo-700 shadow-sm"
                          : "text-gray-600 hover:bg-gray-200"
                      }`}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Columns className="h-4 w-4" />
                      <span>Multi</span>
                    </motion.button>
                  </div>
                </div>

                <AnimatePresence>
                  {translationView === "multi" && (
                    <motion.div
                      className="flex flex-col xs:flex-row items-center space-y-2 xs:space-y-0 xs:space-x-4"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <span className="text-sm text-gray-600">
                        Translation Mode:
                      </span>
                      <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-lg">
                        <motion.button
                          onClick={() => setTranslationMode("simultaneous")}
                          className={`px-3 py-1.5 rounded-md text-sm transition-all duration-300 ${
                            translationMode === "simultaneous"
                              ? "bg-indigo-100 text-indigo-700 shadow-sm"
                              : "text-gray-600 hover:bg-gray-200"
                          }`}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          Simultaneous
                        </motion.button>
                        <motion.button
                          onClick={() => setTranslationMode("sequential")}
                          className={`px-3 py-1.5 rounded-md text-sm transition-all duration-300 ${
                            translationMode === "sequential"
                              ? "bg-indigo-100 text-indigo-700 shadow-sm"
                              : "text-gray-600 hover:bg-gray-200"
                          }`}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          Sequential
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Input Area */}
              <motion.div
                variants={itemVariants}
                className="bg-white p-6 rounded-lg shadow-md"
              >
                <div className="mb-4">
                  <label
                    htmlFor="input-text"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Enter Text to Translate
                  </label>
                  <div
                    className={`relative transition-all duration-300 ${
                      isSearchBarFocused
                        ? "ring-2 ring-indigo-500 ring-opacity-50"
                        : ""
                    }`}
                  >
                    <textarea
                      id="input-text"
                      value={inputText}
                      onChange={(e) => Text(e.target.value)}
                      onFocus={() => setIsSearchBarFocused(true)}
                      onBlur={() => setIsSearchBarFocused(false)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 transition-all duration-300"
                      rows="5"
                      placeholder="Type or paste your text here..."
                    ></textarea>
                    {inputText && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        className="absolute top-2 right-2 p-1 rounded-full bg-gray-200 text-gray-500 hover:bg-gray-300"
                        onClick={() => setInputText("")}
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </motion.button>
                    )}
                  </div>
                </div>

                {/* Language Selection */}
                <AnimatePresence mode="wait">
                  {translationView === "single" ? (
                    <motion.div
                      key="single-lang"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="mb-4"
                    >
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Target Language
                      </label>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
                        <div className="relative flex-grow w-full sm:w-auto">
                          <select
                            value={
                              useCustomLanguage ? "custom" : singleLanguage
                            }
                            onChange={(e) => {
                              if (e.target.value === "custom") {
                                toggleCustomLanguage();
                              } else {
                                setSingleLanguage(e.target.value);
                                if (useCustomLanguage) toggleCustomLanguage();
                              }
                            }}
                            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md shadow-sm appearance-none bg-white"
                          >
                            {availableLanguages.map((lang) => (
                              <option key={lang.code} value={lang.code}>
                                {lang.name}
                              </option>
                            ))}
                            <option value="custom">
                              Custom language code...
                            </option>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>

                        <AnimatePresence>
                          {useCustomLanguage && (
                            <motion.div
                              initial={{ opacity: 0, width: 0 }}
                              animate={{ opacity: 1, width: "100%" }}
                              exit={{ opacity: 0, width: 0 }}
                              className="flex-grow w-full sm:w-auto"
                            >
                              <input
                                type="text"
                                value={customLanguage}
                                onChange={(e) =>
                                  setCustomLanguage(e.target.value)
                                }
                                placeholder="Enter language code (e.g., ar, he, hi)"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="multi-lang"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="mb-4"
                    >
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Target Languages (Up to 3)
                      </label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {availableLanguages.map((lang) => (
                          <motion.button
                            key={lang.code}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => toggleLanguage(lang.code)}
                            className={`px-3 py-1.5 rounded-md text-sm transition-all duration-300 ${
                              languages.includes(lang.code)
                                ? "bg-indigo-600 text-white shadow-md"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-sm"
                            }`}
                          >
                            {lang.name}
                            {languages.includes(lang.code) && (
                              <span className="ml-2 inline-flex items-center justify-center">
                                <svg
                                  className="h-3 w-3"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              </span>
                            )}
                          </motion.button>
                        ))}
                      </div>

                      {/* Custom Language Inputs for Multi View */}
                      <div className="space-y-3 mt-4">
                        <AnimatePresence>
                          {languages.map((lang, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-center space-x-3"
                            >
                              <div className="flex-grow">
                                <div className="flex items-center justify-between bg-gray-50 p-2 rounded-md shadow-sm border border-gray-200">
                                  <span className="text-sm font-medium">
                                    {availableLanguages.find(
                                      (l) => l.code === lang
                                    )?.name || lang}
                                  </span>
                                  <button
                                    onClick={() =>
                                      toggleCustomLanguageAtIndex(index)
                                    }
                                    className="text-xs text-indigo-600 hover:text-indigo-800 underline"
                                  >
                                    {useCustomLanguages[index]
                                      ? "Use standard"
                                      : "Customize"}
                                  </button>
                                </div>
                              </div>

                              <AnimatePresence>
                                {useCustomLanguages[index] && (
                                  <motion.div
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: "auto" }}
                                    exit={{ opacity: 0, width: 0 }}
                                    className="flex-grow"
                                  >
                                    <input
                                      type="text"
                                      value={customLanguages[index]}
                                      onChange={(e) =>
                                        updateCustomLanguage(
                                          index,
                                          e.target.value
                                        )
                                      }
                                      placeholder="Enter language code"
                                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                                    />
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Translate Button */}
                <motion.div
                  className="flex justify-center"
                  variants={itemVariants}
                >
                  <motion.button
                    onClick={handleTranslate}
                    disabled={loading || !inputText.trim()}
                    className={`px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-all duration-300 ${
                      loading || !inputText.trim()
                        ? "bg-gray-300 cursor-not-allowed text-gray-500"
                        : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
                    }`}
                    whileHover={
                      !loading && inputText.trim() ? { scale: 1.05 } : {}
                    }
                    whileTap={
                      !loading && inputText.trim() ? { scale: 0.95 } : {}
                    }
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Translating...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5" />
                        <span>Translate</span>
                      </>
                    )}
                  </motion.button>
                </motion.div>
              </motion.div>

              {/* Results Area */}
              <AnimatePresence>
                {translationView === "single" ? (
                  // Single Language Translation Results
                  singleTranslation && (
                    <motion.div
                      key="single-result"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="bg-white p-6 rounded-lg shadow-lg"
                    >
                      <motion.h3
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-lg font-medium text-gray-800 mb-4 flex items-center"
                      >
                        <span>Translation Result</span>
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1, rotate: 360 }}
                          transition={{ delay: 0.3 }}
                          className="ml-2 bg-green-100 p-1 rounded-full"
                        >
                          <Check className="h-4 w-4 text-green-600" />
                        </motion.div>
                      </motion.h3>
                      <motion.div
                        className="p-4 bg-gray-50 rounded-md mb-6 shadow-sm border border-gray-100"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <p className="text-gray-800">{singleTranslation}</p>
                        <div className="flex justify-end mt-2">
                          <motion.button
                            onClick={() => {
                              navigator.clipboard.writeText(singleTranslation);
                              // Add toast notification here if desired
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 text-sm"
                          >
                            <Clipboard className="h-4 w-4" />
                            <span>Copy</span>
                          </motion.button>
                        </div>
                      </motion.div>
                      
                      {/* Word Analysis */}
                      <AnimatePresence>
                        {wordAnalysis.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                          >
                            <h4 className="text-md font-medium text-gray-700 mb-3 flex items-center">
                              <span>Word Analysis</span>
                              <span className="ml-2 px-2 py-0.5 text-xs bg-indigo-100 text-indigo-800 rounded-full">
                                {wordAnalysis.length} words
                              </span>
                            </h4>
                            <div className="space-y-4">
                              {wordAnalysis.map((word, index) => (
                                <motion.div
                                  key={index}
                                  className="p-4 border border-gray-200 rounded-md shadow-sm hover:shadow-md transition-shadow duration-300 bg-white"
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.5 + index * 0.1 }}
                                >
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center space-x-2">
                                      <span className="font-medium text-gray-800">
                                        {word.word}
                                      </span>
                                      <ArrowRight className="h-4 w-4 text-gray-400" />
                                      <span className="font-medium text-indigo-600">
                                        {word.translated}
                                      </span>
                                    </div>
                                    <motion.button
                                      onClick={() =>
                                        navigator.clipboard.writeText(
                                          word.translated
                                        )
                                      }
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      className="text-gray-400 hover:text-indigo-600"
                                    >
                                      <Clipboard className="h-4 w-4" />
                                    </motion.button>
                                  </div>
                                  
                                  {/* Definition section */}
                                  {word.definition && (
                                    <div className="mb-3">
                                      <p className="text-xs text-gray-500 mb-1">
                                        Definition
                                      </p>
                                      <p className="text-sm text-gray-700">
                                        {word.definition}
                                      </p>
                                    </div>
                                  )}

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                    {/* Synonyms section */}
                                    <div>
                                      <p className="text-xs text-gray-500 mb-1">
                                        Synonyms
                                      </p>
                                      <p className="text-sm text-gray-700">
                                        {word.synonyms &&
                                        word.synonyms.length > 0
                                          ? word.synonyms.join(", ")
                                          : "No synonyms found"}
                                      </p>
                                    </div>

                                    {/* Antonyms section */}
                                    <div>
                                      <p className="text-xs text-gray-500 mb-1">
                                        Antonyms
                                      </p>
                                      <p className="text-sm text-gray-700">
                                        {word.antonyms &&
                                        word.antonyms.length > 0
                                          ? word.antonyms.join(", ")
                                          : "No antonyms found"}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Idioms section */}
                                    <div>
                                      <p className="text-xs text-gray-500 mb-1">
                                        Idioms
                                      </p>
                                      {word.idioms && word.idioms.length > 0 ? (
                                        <ul className="text-sm text-gray-700 list-disc pl-4">
                                          {word.idioms.map((idiom, i) => (
                                            <li key={i} className="mb-1">
                                              {idiom}
                                            </li>
                                          ))}
                                        </ul>
                                      ) : (
                                        <p className="text-sm text-gray-700">
                                          No idioms found
                                        </p>
                                      )}
                                    </div>

                                    {/* Expressions section */}
                                    <div>
                                      <p className="text-xs text-gray-500 mb-1">
                                        Expressions
                                      </p>
                                      {word.expressions &&
                                      word.expressions.length > 0 ? (
                                        <ul className="text-sm text-gray-700 list-disc pl-4">
                                          {word.expressions.map(
                                            (expression, i) => (
                                              <li key={i} className="mb-1">
                                                {expression}
                                              </li>
                                            )
                                          )}
                                        </ul>
                                      ) : (
                                        <p className="text-sm text-gray-700">
                                          No expressions found
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                ) : (
                  // Multi-Language Translation Results with Progress for Sequential Mode
                  <div>
                    {/* Progress indicators for sequential translation */}
                    <AnimatePresence>
                      {translationMode === "sequential" &&
                        translationProgress.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-white p-4 rounded-lg shadow-md mb-4"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-sm font-medium text-gray-700">
                                Translation Progress
                              </h4>
                              <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                                {currentStep} of {totalSteps}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                              <motion.div
                                className="bg-indigo-600 h-2.5 rounded-full"
                                initial={{ width: "0%" }}
                                animate={{
                                  width: `${(currentStep / totalSteps) * 100}%`,
                                }}
                                transition={{ duration: 0.5 }}
                              ></motion.div>
                            </div>

                            <div className="mt-4 space-y-2">
                              {translationProgress.map((progress, index) => (
                                <motion.div
                                  key={index}
                                  className="flex items-center space-x-3"
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                >
                                  <div className="w-6 h-6 flex items-center justify-center">
                                    {progress.status === "pending" && (
                                      <Clock className="h-4 w-4 text-gray-400" />
                                    )}
                                    {progress.status === "translating" && (
                                      <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{
                                          duration: 1,
                                          repeat: Infinity,
                                          ease: "linear",
                                        }}
                                      >
                                        <Loader2 className="h-4 w-4 text-indigo-600" />
                                      </motion.div>
                                    )}
                                    {progress.status === "completed" && (
                                      <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{
                                          type: "spring",
                                          stiffness: 300,
                                          damping: 20,
                                        }}
                                      >
                                        <Check className="h-4 w-4 text-green-500" />
                                      </motion.div>
                                    )}
                                  </div>
                                  <span className="text-sm text-gray-700">
                                    {availableLanguages.find(
                                      (l) => l.code === languages[index]
                                    )?.name || languages[index]}
                                  </span>
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                    </AnimatePresence>
                    {/* Word Analysis Results */}

                    {/* </div> */}

                    {/* Results Grid */}
                    <AnimatePresence>
                      {Object.keys(translations).length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 20 }}
                          className="bg-white p-6 rounded-lg shadow-lg"
                        >
                          <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                            <span>
                              {translationMode === "simultaneous"
                                ? "Simultaneous"
                                : "Sequential"}{" "}
                              Translation Results
                            </span>
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1, rotate: 360 }}
                              transition={{ delay: 0.3 }}
                              className="ml-2 bg-green-100 p-1 rounded-full"
                            >
                              <Check className="h-4 w-4 text-green-600" />
                            </motion.div>
                          </h3>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {languages.map((lang, idx) => (
                              <motion.div
                                key={lang}
                                className="p-4 bg-gray-50 rounded-md border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + idx * 0.1 }}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center space-x-2">
                                    <span className="w-6 h-6 flex items-center justify-center bg-indigo-100 rounded-full">
                                      <span className="text-xs font-medium text-indigo-700">
                                        {idx + 1}
                                      </span>
                                    </span>
                                    <h4 className="text-sm font-medium text-gray-600">
                                      {availableLanguages.find(
                                        (l) => l.code === lang
                                      )?.name || lang}
                                    </h4>
                                  </div>
                                  <motion.button
                                    onClick={() => {
                                      // Copy the full translated text
                                      const textToCopy =
                                        translations[lang]?.fullText ||
                                        translations[lang] ||
                                        "";
                                      navigator.clipboard.writeText(textToCopy);
                                    }}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="text-gray-400 hover:text-indigo-600"
                                  >
                                    <Clipboard className="h-4 w-4" />
                                  </motion.button>
                                </div>

                                {/* Updated rendering for paired sentences */}
                                <div className="text-gray-800 space-y-3">
                                  {translations[lang] ? (
                                    translationMode === "sequential" &&
                                    translations[lang].pairedSentences ? (
                                      // Display paired sentences for sequential translation
                                      translations[lang].pairedSentences.map(
                                        (pair, sentIdx) => (
                                          <div
                                            key={sentIdx}
                                            className="border-b border-gray-100 pb-2 mb-2 last:border-b-0"
                                          >
                                            <p className="text-gray-600 mb-1">
                                              {pair.original}
                                            </p>
                                            <p className="text-gray-800 font-medium">
                                              {pair.translated}
                                            </p>
                                          </div>
                                        )
                                      )
                                    ) : translationMode === "sequential" &&
                                      typeof translations[lang] === "string" ? (
                                      // Fallback for older format where translations[lang] is just a string
                                      translations[lang]
                                        .split(".")
                                        .map((sentence, sentIdx) =>
                                          sentence.trim() ? (
                                            <p key={sentIdx}>
                                              {sentence.trim()}.
                                            </p>
                                          ) : null
                                        )
                                    ) : (
                                      // For simultaneous translation or if no pairedSentences property
                                      <p>
                                        {typeof translations[lang] === "string"
                                          ? translations[lang]
                                          : translations[lang].fullText}
                                      </p>
                                    )
                                  ) : (
                                    <span className="text-gray-400 flex items-center">
                                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                      Waiting for translation...
                                    </span>
                                  )}
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {wordAnalysis.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-6"
                      >
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                          Analysis Results
                        </h2>

                        <div className="grid grid-cols-1 gap-4">
                          {wordAnalysis.map((word, index) => (
                            <motion.div
                              key={index}
                              className="bg-white p-4 rounded-lg shadow-md"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.1 * index }}
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium text-gray-800">
                                    {word.word}
                                  </span>
                                  <ArrowRight className="h-4 w-4 text-gray-400" />
                                  <span className="font-medium text-indigo-600">
                                    {word.translated}
                                  </span>
                                </div>
                                <motion.button
                                  onClick={() =>
                                    navigator.clipboard.writeText(
                                      word.translated
                                    )
                                  }
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="text-gray-400 hover:text-indigo-600"
                                >
                                  <Clipboard className="h-4 w-4" />
                                </motion.button>
                              </div>

                              {/* Definition section with animation */}
                              {word.definition && (
                                <motion.div
                                  className="mb-4"
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  transition={{ delay: 0.2 + index * 0.1 }}
                                >
                                  <div className="flex items-center space-x-2 mb-1">
                                    <Book className="h-4 w-4 text-indigo-500" />
                                    <p className="text-xs text-gray-500">
                                      Definition
                                    </p>
                                  </div>
                                  <p className="text-sm text-gray-700 ml-6">
                                    {word.definition}
                                  </p>
                                </motion.div>
                              )}

                              {/* Categories with icons and animations */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Synonyms section */}
                                <motion.div
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.3 + index * 0.1 }}
                                >
                                  <div className="flex items-center space-x-2 mb-1">
                                    <MessageCircle className="h-4 w-4 text-green-500" />
                                    <p className="text-xs text-gray-500">
                                      Synonyms
                                    </p>
                                  </div>
                                  <p className="text-sm text-gray-700 ml-6">
                                    {word.synonyms && word.synonyms.length > 0
                                      ? word.synonyms.join(", ")
                                      : "No synonyms found"}
                                  </p>
                                </motion.div>

                                {/* Antonyms section */}
                                <motion.div
                                  initial={{ opacity: 0, x: 20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.3 + index * 0.1 }}
                                >
                                  <div className="flex items-center space-x-2 mb-1">
                                    <ArrowUpDown className="h-4 w-4 text-red-500" />
                                    <p className="text-xs text-gray-500">
                                      Antonyms
                                    </p>
                                  </div>
                                  <p className="text-sm text-gray-700 ml-6">
                                    {word.antonyms && word.antonyms.length > 0
                                      ? word.antonyms.join(", ")
                                      : "No antonyms found"}
                                  </p>
                                </motion.div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                {/* Idioms section */}
                                <motion.div
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.4 + index * 0.1 }}
                                >
                                  <div className="flex items-center space-x-2 mb-1">
                                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                                    <p className="text-xs text-gray-500">
                                      Idioms
                                    </p>
                                  </div>
                                  {word.idioms && word.idioms.length > 0 ? (
                                    <ul className="text-sm text-gray-700 list-disc pl-10">
                                      {word.idioms.map((idiom, i) => (
                                        <motion.li
                                          key={i}
                                          className="mb-1"
                                          initial={{ opacity: 0 }}
                                          animate={{ opacity: 1 }}
                                          transition={{
                                            delay: 0.5 + index * 0.1 + i * 0.05,
                                          }}
                                        >
                                          {idiom}
                                        </motion.li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <p className="text-sm text-gray-700 ml-6">
                                      No idioms found
                                    </p>
                                  )}
                                </motion.div>

                                {/* Expressions section */}
                                <motion.div
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.4 + index * 0.1 }}
                                >
                                  <div className="flex items-center space-x-2 mb-1">
                                    <MessageCircle className="h-4 w-4 text-purple-500" />
                                    <p className="text-xs text-gray-500">
                                      Expressions
                                    </p>
                                  </div>
                                  {word.expressions &&
                                  word.expressions.length > 0 ? (
                                    <ul className="text-sm text-gray-700 list-disc pl-10">
                                      {word.expressions.map((expression, i) => (
                                        <motion.li
                                          key={i}
                                          className="mb-1"
                                          initial={{ opacity: 0 }}
                                          animate={{ opacity: 1 }}
                                          transition={{
                                            delay: 0.5 + index * 0.1 + i * 0.05,
                                          }}
                                        >
                                          {expression}
                                        </motion.li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <p className="text-sm text-gray-700 ml-6">
                                      No expressions found
                                    </p>
                                  )}
                                </motion.div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tense Table Section */}
        <AnimatePresence mode="wait">
          {activeTab === "tense" && (
            <motion.div
              key="tense"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="bg-white p-6 rounded-lg shadow-lg"
            >
              <motion.h2
                variants={itemVariants}
                className="text-xl font-bold text-gray-800 mb-6 flex items-center"
              >
                <span>Multilingual Tense Comparison</span>
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="ml-3 bg-indigo-100 px-2 py-0.5 rounded-full"
                >
                  <span className="text-xs font-medium text-indigo-800">
                    Beta
                  </span>
                </motion.div>
              </motion.h2>

              <motion.div variants={itemVariants} className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-end space-y-4 sm:space-y-0 sm:space-x-4">
                  <div className="flex-grow">
                    <label
                      htmlFor="verb-input"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Enter Verb to Analyze
                    </label>
                    <div
                      className={`relative transition-all duration-300 ${
                        isSearchBarFocused
                          ? "ring-2 ring-indigo-500 ring-opacity-50"
                          : ""
                      }`}
                    >
                      <input
                        id="verb-input"
                        type="text"
                        value={verbInput}
                        onChange={(e) => setVerbInput(e.target.value)}
                        onFocus={() => setIsSearchBarFocused(true)}
                        onBlur={() => setIsSearchBarFocused(false)}
                        placeholder="e.g., run, read, write"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500 transition-all duration-300"
                      />
                      {verbInput && (
                        <motion.button
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0 }}
                          className="absolute top-2 right-2 p-1 rounded-full bg-gray-200 text-gray-500 hover:bg-gray-300"
                          onClick={() => setVerbInput("")}
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </motion.button>
                      )}
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleTenseComparison}
                    disabled={loading || !verbInput.trim()}
                    className={`px-6 py-2 rounded-lg flex items-center space-x-2 ${
                      loading || !verbInput.trim()
                        ? "bg-gray-300 cursor-not-allowed text-gray-500"
                        : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
                    }`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="h-5 w-5" />
                        <span>Analyze</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="overflow-x-auto rounded-lg shadow-md border border-gray-200"
              >
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                        Tense
                      </th>
                      {tenseLanguages.map((lang, index) => (
                        <th
                          key={index}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200"
                        >
                          {lang.charAt(0).toUpperCase() + lang.slice(1)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tenseTableData.length > 0 ? (
                      tenseTableData.map((row, index) => (
                        <motion.tr
                          key={index}
                          className={
                            index % 2 === 0
                              ? "bg-white hover:bg-gray-50"
                              : "bg-gray-50 hover:bg-gray-100"
                          }
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 + index * 0.05 }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-100">
                            {row.tense}
                          </td>
                          {tenseLanguages.map((lang, langIndex) => (
                            <td
                              key={langIndex}
                              className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                            >
                              {row[lang.toLowerCase()]}
                            </td>
                          ))}
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={tenseLanguages.length + 1}
                          className="px-6 py-8 text-center text-sm text-gray-500"
                        >
                          {loading ? (
                            <div className="flex items-center justify-center space-x-2">
                              <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
                              <span>Analyzing verb tenses...</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center">
                              <Zap className="h-8 w-8 text-gray-300 mb-2" />
                              <span>
                                Enter a verb and click "Analyze" to see tense
                                comparisons
                              </span>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* About Section */}
        <AnimatePresence mode="wait">
          {activeTab === "about" && (
            <motion.div
              key="about"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="bg-white p-6 rounded-lg shadow-lg"
            >
              <motion.h2
                variants={itemVariants}
                className="text-xl font-bold text-gray-800 mb-4"
              >
                About This Application
              </motion.h2>

              <motion.div
                variants={itemVariants}
                className="bg-indigo-50 border-l-4 border-indigo-500 p-4 mb-6 rounded-r-lg shadow-sm"
              >
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Info className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-indigo-700">
                      This application helps language learners by providing
                      translation in multiple languages simultaneously, with
                      word analysis and grammar comparison tools.
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="prose max-w-none">
                <p>
                  This Multilingual Learning Web Application was developed to
                  facilitate efficient language learning through simultaneous
                  translation across multiple languages. Born from personal
                  experience with language acquisition challenges, this tool
                  aims to streamline the process of studying multiple languages
                  concurrently.
                </p>

                <motion.h3
                  variants={itemVariants}
                  className="text-lg font-medium text-gray-800 mt-6 mb-2"
                >
                  Key Features:
                </motion.h3>
                <ul className="list-disc pl-6 space-y-2">
                  <motion.li
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <strong>Single & Multi-language Translation:</strong>{" "}
                    Translate text to one or multiple languages simultaneously,
                    enabling comparative linguistic analysis.
                  </motion.li>
                  <motion.li
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <strong>Word Analysis:</strong> Get detailed information
                    about translated words, including synonyms, antonyms, and
                    usage examples.
                  </motion.li>
                  <motion.li
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <strong>Tense Comparison:</strong> Compare verb conjugations
                    across multiple languages for better understanding of
                    grammatical structures.
                  </motion.li>
                  <motion.li
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <strong>Simultaneous & Sequential Translation:</strong>{" "}
                    Choose between immediate parallel translation or
                    step-by-step translation for different learning approaches.
                  </motion.li>
                </ul>

                <motion.h3
                  variants={itemVariants}
                  className="text-lg font-medium text-gray-800 mt-6 mb-2"
                >
                  Technology Stack:
                </motion.h3>
                <p>
                  This application leverages modern web technologies and AI
                  services to provide an intuitive and powerful language
                  learning experience:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                  {[
                    { name: "Frontend", tech: "React.js with TailwindCSS" },
                    { name: "Backend", tech: "Django (Python)" },
                    {
                      name: "AI Services",
                      tech: "MyMomory API",
                    },
                    { name: "Dictionary", tech: "Free Dictionary API, Datamuse API" },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="flex items-center p-3 bg-gray-50 rounded-lg shadow-sm border border-gray-200"
                    >
                      <div className="bg-indigo-100 rounded-full p-2 mr-3">
                        <span className="text-indigo-600 font-bold">
                          {item.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {item.name}
                        </h4>
                        <p className="text-sm text-gray-600">{item.tech}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Translator;
