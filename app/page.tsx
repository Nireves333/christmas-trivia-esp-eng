"use client";

import { useEffect, useState, useCallback } from "react";
import AnimatedBeam from "@/components/animata/background/animated-beam";
import TriviaPopup from "@/components/trivia-popup";
import { cn } from "@/lib/utils";

interface LanguageTrivia {
  Question: string;
  Answer: string;
}

interface CombinedTriviaItem {
  Category: string;
  en: LanguageTrivia;
  es: LanguageTrivia;
}

interface Category {
  en: string;
  es: string;
}

export default function Home() {
  // State to map English categories to their trivia questions
  const [triviaMap, setTriviaMap] = useState<{ [categoryEn: string]: CombinedTriviaItem[] }>({});

  // List of unique categories with both English and Spanish names
  const [categories, setCategories] = useState<Category[]>([]);

  // Selected category and current trivia question
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentTrivia, setCurrentTrivia] = useState<CombinedTriviaItem | null>(null);

  // Loading state
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Utility function to shuffle an array and return a new shuffled array
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Fetch and organize trivia data on component mount
  useEffect(() => {
    const fetchTrivia = async () => {
      try {
        const res = await fetch("/merged_trivia_feed.json");
        const data: CombinedTriviaItem[] = await res.json();

        // Extract unique categories with both English and Spanish names
        const categoryMap = new Map<string, string>();

        data.forEach((item) => {
          if (!item.Category) {
            console.warn("Trivia item missing Category:", item);
            return;
          }
          const parts = item.Category.split("/");
          if (parts.length === 2) {
            const spanishCategory = parts[0].trim();
            const englishCategory = parts[1].trim();
            if (englishCategory && spanishCategory) {
              categoryMap.set(englishCategory, spanishCategory);
            } else {
              console.warn(`Empty category parts in item: "${item.Category}"`);
            }
          } else if (parts.length === 1) {
            const category = parts[0].trim();
            if (category) {
              categoryMap.set(category, category);
            } else {
              console.warn(`Empty category in item: "${item.Category}"`);
            }
          } else {
            console.warn(`Invalid Category format for item: "${item.Category}"`);
          }
        });

        // Convert categoryMap to an array of Category objects
        const categoriesEn = Array.from(categoryMap.keys());
        const categoriesArray: Category[] = categoriesEn.map((en) => ({
          en,
          es: categoryMap.get(en) || en,
        }));

        setCategories(categoriesArray);

        // Organize trivia by English categories and shuffle each category's trivia
        const categorizedTrivia: { [categoryEn: string]: CombinedTriviaItem[] } = {};

        categoriesEn.forEach((enCategory) => {
          const filteredTrivia = data.filter((item) => {
            if (!item.Category) return false;
            const parts = item.Category.split("/");
            if (parts.length === 2) {
              return parts[1].trim() === enCategory;
            } else if (parts.length === 1) {
              return parts[0].trim() === enCategory;
            }
            return false;
          });
          categorizedTrivia[enCategory] = shuffleArray(filteredTrivia);
        });

        setTriviaMap(categorizedTrivia);
        console.log("Trivia Map:", categorizedTrivia);
      } catch (error) {
        console.error("Error fetching trivia data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrivia();
  }, []);

  // Save triviaMap to localStorage whenever it changes
  useEffect(() => {
    if (Object.keys(triviaMap).length > 0) {
      localStorage.setItem("triviaMap", JSON.stringify(triviaMap));
    }
  }, [triviaMap]);

  // Handle category selection
  const handleSelectCategory = useCallback(
    (categoryEn: string) => {
      const triviaList = triviaMap[categoryEn] || [];
      if (triviaList.length > 0) {
        setSelectedCategory(categoryEn);
        const [firstTrivia, ...restTrivia] = triviaList;
        setCurrentTrivia(firstTrivia);

        // Update the triviaMap by removing the first trivia to prevent repetition
        setTriviaMap((prev) => ({
          ...prev,
          [categoryEn]: restTrivia,
        }));
      }
    },
    [triviaMap]
  );

  // Handle next question within the selected category
  const handleNextQuestion = useCallback(() => {
    if (!selectedCategory) return;

    const triviaList = triviaMap[selectedCategory] || [];
    if (triviaList.length > 0) {
      const [nextTrivia, ...restTrivia] = triviaList;
      setCurrentTrivia(nextTrivia);

      setTriviaMap((prev) => ({
        ...prev,
        [selectedCategory]: restTrivia,
      }));
    } else {
      // Close the popup if no more questions
      setSelectedCategory(null);
      setCurrentTrivia(null);
    }
  }, [selectedCategory, triviaMap]);

  // Handle closing the trivia popup
  const handleClosePopup = useCallback(() => {
    setSelectedCategory(null);
    setCurrentTrivia(null);
  }, []);

  // Handle Reset Game
  const handleResetGame = useCallback(() => {
    localStorage.removeItem("triviaMap");
    window.location.reload();
  }, []);

  return (
    <AnimatedBeam>
      <div className="min-h-screen text-white flex flex-col items-center justify-center p-4">
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            <p className="ml-4 text-xl">Loading trivia...</p>
          </div>
        ) : (
          <>
            <h1 className="text-4xl sm:text-4xl md:text-5xl lg:text-6xl font-bold pb-2 mb-2 text-center bg-gradient-to-r from-red-600 via-green-600 to-blue-600 bg-clip-text text-transparent drop-shadow-lg animate-bounce leading-tight sm:leading-snug md:leading-none lg:leading-tight overflow-visible">
              🎄Feliz Navidad!
            </h1>
            <p className="text-2xl sm:text-2xl md:text-3xl lg:text-4xl mb-6 text-center text-white font-medium drop-shadow">
              Elige una Categoría! 🎅
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              {categories.map((category) => {
                const isExhausted = !(triviaMap[category.en]?.length > 0);
                return (
                  <button
                    key={category.en}
                    onClick={() => handleSelectCategory(category.en)}
                    disabled={isExhausted}
                    className={cn(
                      "text-white font-bold py-2 px-4 md:px-5 rounded-lg shadow-lg transition duration-300 text-sm md:text-base",
                      {
                        // Active state
                        "bg-green-700 hover:bg-green-800 cursor-pointer": !isExhausted,
                        // Disabled state (Candy Cane)
                        "candy-cane cursor-not-allowed opacity-30": isExhausted,
                      }
                    )}
                  >
                    {category.es} / {category.en}
                  </button>
                );
              })}
            </div>

            {/* Reset Game Button */}
            <button
              onClick={handleResetGame}
              className="mt-8 bg-red-700 hover:bg-red-800 text-white font-bold py-2 px-4 md:px-5 rounded-lg shadow-lg transition duration-300 text-sm md:text-base"
            >
              Reiniciar / Reset
            </button>
          </>
        )}

        {/* Render a single popup when a category is selected and trivia is available */}
        {selectedCategory && currentTrivia && (
          <TriviaPopup
            category={selectedCategory}
            currentTrivia={currentTrivia}
            onClose={handleClosePopup}
            onNextQuestion={handleNextQuestion}
          />
        )}
      </div>
    </AnimatedBeam>
  );
}
