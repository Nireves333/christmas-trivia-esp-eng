"use client";

import React, { useState } from "react";

interface LanguageTrivia {
    Question: string;
    Answer: string;
}

interface CombinedTriviaItem {
    Category: string;
    en: LanguageTrivia;
    es: LanguageTrivia;
}

interface TriviaPopupProps {
    category: string;
    currentTrivia: CombinedTriviaItem;
    onClose: () => void;
    onNextQuestion: () => void;
}

const TriviaPopup: React.FC<TriviaPopupProps> = ({
    category,
    currentTrivia,
    onClose,
    onNextQuestion,
}) => {
    const [showAnswer, setShowAnswer] = useState(false);

    const handleCheckAnswer = () => {
        setShowAnswer(true);
    };

    const handleClose = () => {
        setShowAnswer(false);
        onClose();
    };

    const handleNext = () => {
        setShowAnswer(false);
        onNextQuestion();
    };

    // Extract English and Spanish categories
    const [spanishCategory, englishCategory] = currentTrivia.Category.split("/").map((part) => part.trim());

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 px-4">
            <div
                className="bg-white text-black rounded-lg p-6 w-full max-w-md shadow-lg relative sm:p-8 border-4 border-dashed border-red-500"
                role="dialog"
                aria-modal="true"
                aria-labelledby="trivia-popup-title"
            >
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-2 right-2 text-black hover:text-red-600 text-xl sm:text-2xl"
                    aria-label="Close Trivia Popup"
                >
                    ✖
                </button>

                {/* Category Title */}
                <h2 id="trivia-popup-title" className="text-2xl sm:text-3xl font-bold mb-4 text-center text-red-500">
                    {englishCategory} Trivia / {spanishCategory} Trivia
                </h2>

                {/* English Trivia Section */}
                <div className="mb-4">
                    <h3 className="font-semibold mb-2 text-lg sm:text-xl">English:</h3>
                    <p className="text-base sm:text-lg">{currentTrivia.en.Question}</p>
                    {showAnswer && (
                        <p className="text-blue-600 font-bold mt-2 text-base sm:text-lg">{currentTrivia.en.Answer}</p>
                    )}
                </div>

                {/* Spanish Trivia Section */}
                <div className="mb-4">
                    <h3 className="font-semibold mb-2 text-lg sm:text-xl">Español:</h3>
                    <p className="text-base sm:text-lg">{currentTrivia.es.Question}</p>
                    {showAnswer && (
                        <p className="text-blue-600 font-bold mt-2 text-base sm:text-lg">{currentTrivia.es.Answer}</p>
                    )}
                </div>

                {/* Action Buttons */}
                {!showAnswer ? (
                    <button
                        onClick={handleCheckAnswer}
                        className="bg-green-700 hover:bg-green-800 text-white font-bold py-2 px-4 sm:px-5 rounded-lg w-full transition duration-300 text-sm sm:text-base"
                        aria-label="Check Answers"
                    >
                        Verificar Respuestas / Check Answers
                    </button>
                ) : (
                    <button
                        onClick={handleNext}
                        className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 sm:px-5 rounded-lg w-full transition duration-300 text-sm sm:text-base"
                        aria-label="Next Question"
                    >
                        Siguiente Pregunta / Next Question
                    </button>
                )}
            </div>
        </div>
    );
};

export default React.memo(TriviaPopup);
