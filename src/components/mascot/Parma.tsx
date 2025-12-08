import React, { useRef, useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useParmaContext } from "./ParmaProvider";
import type { ParmaState } from "./ParmaProvider";
import { X, Settings } from "lucide-react";
import { speechService } from "../../services/speechService";

// Random phrases when clicking on mascot (ru/en)
const CLICK_PHRASES_RU = [
  "Гав-гав!",
  "Давайте ребятки, учитесь!",
  "Солнце ещё высоко!",
  "За дело, ублюдок!",
  "Давайте ребятки, работайте!",
  "Хочу есть...",
  "Гав!",
];

const CLICK_PHRASES_EN = [
  "Woof-woof!",
  "Come on guys, study!",
  "The sun is still high!",
  "Get to work!",
  "Come on guys, let's work!",
  "I'm hungry...",
  "Woof!",
];

// Импорт видео (webm с прозрачным фоном)
import idleVideo from "../../assets/mascot/idle.webm";
import greetingVideo from "../../assets/mascot/greeting.webm";
import thinkingVideo from "../../assets/mascot/thinking.webm";
import pointingVideo from "../../assets/mascot/pointing.webm";
import celebrationVideo from "../../assets/mascot/celebration.webm";
import sleepingVideo from "../../assets/mascot/sleeping.webm";

// Маппинг состояний на видео
const videoMap: Record<ParmaState, string> = {
  idle: idleVideo,
  greeting: greetingVideo,
  thinking: thinkingVideo,
  pointing: pointingVideo,
  celebration: celebrationVideo,
  sleeping: sleepingVideo,
};

// Размеры маскота
const sizeMap = {
  sm: { container: "w-24 h-24", video: "w-24 h-24", pixels: 96 },
  md: { container: "w-32 h-32", video: "w-32 h-32", pixels: 128 },
  lg: { container: "w-40 h-40", video: "w-40 h-40", pixels: 160 },
};

// Ключ для localStorage (кастомная позиция)
const POSITION_STORAGE_KEY = "parma_custom_position";

interface ParmaProps {
  className?: string;
}

// Загрузка позиции из localStorage
const loadCustomPosition = (): { x: number; y: number } | null => {
  try {
    const saved = localStorage.getItem(POSITION_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Error loading Parma position:", e);
  }
  return null;
};

// Сохранение позиции в localStorage
const saveCustomPosition = (position: { x: number; y: number } | null) => {
  try {
    if (position) {
      localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify(position));
    } else {
      localStorage.removeItem(POSITION_STORAGE_KEY);
    }
  } catch (e) {
    console.error("Error saving Parma position:", e);
  }
};

export const Parma: React.FC<ParmaProps> = ({ className = "" }) => {
  const { state, message, isVisible, settings, hide, updateSettings } =
    useParmaContext();
  const { i18n } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isRu = i18n.language === 'ru';

  // Function to play random phrase via Yandex SpeechKit
  const playRandomPhrase = useCallback(() => {
    const phrases = isRu ? CLICK_PHRASES_RU : CLICK_PHRASES_EN;
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    speechService
      .speak({
        text: phrase,
        voice: isRu ? "alena" : "jane",
        emotion: phrase.includes("ублюдок") ? "evil" : "good",
        speed: 1.2,
        lang: isRu ? "ru-RU" : "en-US",
      })
      .catch(console.error);
  }, [isRu]);

  // Drag-and-drop состояние
  const [isDragging, setIsDragging] = useState(false);
  const [customPosition, setCustomPosition] = useState<{
    x: number;
    y: number;
  } | null>(loadCustomPosition);
  const dragStartRef = useRef<{
    mouseX: number;
    mouseY: number;
    elemX: number;
    elemY: number;
  } | null>(null);

  // Для различения клика и drag
  const hasDraggedRef = useRef(false);

  // Перезапуск видео при смене состояния
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {
        // Автоплей может быть заблокирован браузером
      });
    }
  }, [state]);

  // Обработчик начала перетаскивания
  const handleDragStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();

      dragStartRef.current = {
        mouseX: clientX,
        mouseY: clientY,
        elemX: rect.left,
        elemY: rect.top,
      };

      // Сбрасываем флаг перетаскивания
      hasDraggedRef.current = false;

      setIsDragging(true);
    },
    []
  );

  // Обработчик движения при перетаскивании
  const handleDragMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isDragging || !dragStartRef.current) return;

      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      const deltaX = clientX - dragStartRef.current.mouseX;
      const deltaY = clientY - dragStartRef.current.mouseY;

      // Если сдвинули больше 5px - это drag, не клик
      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        hasDraggedRef.current = true;
      }

      let newX = dragStartRef.current.elemX + deltaX;
      let newY = dragStartRef.current.elemY + deltaY;

      // Ограничение в пределах экрана
      const mascotSize = sizeMap[settings.size].pixels;
      const maxX = window.innerWidth - mascotSize;
      const maxY = window.innerHeight - mascotSize;

      newX = Math.max(0, Math.min(newX, maxX));
      newY = Math.max(0, Math.min(newY, maxY));

      setCustomPosition({ x: newX, y: newY });
    },
    [isDragging, settings.size]
  );

  // Обработчик окончания перетаскивания
  const handleDragEnd = useCallback(() => {
    if (isDragging) {
      // Если не было реального перетаскивания - это клик, говорим рандомную фразу!
      if (!hasDraggedRef.current) {
        playRandomPhrase();
      } else if (customPosition) {
        // Было перетаскивание - сохраняем позицию
        saveCustomPosition(customPosition);
      }
    }
    setIsDragging(false);
    dragStartRef.current = null;
  }, [isDragging, customPosition]);

  // Сброс позиции к дефолтной
  const resetPosition = useCallback(() => {
    setCustomPosition(null);
    saveCustomPosition(null);
  }, []);

  // Подписка на события мыши/тача
  useEffect(() => {
    if (isDragging) {
      const handleMove = (e: MouseEvent | TouchEvent) => handleDragMove(e);
      const handleEnd = () => handleDragEnd();

      window.addEventListener("mousemove", handleMove);
      window.addEventListener("mouseup", handleEnd);
      window.addEventListener("touchmove", handleMove);
      window.addEventListener("touchend", handleEnd);

      return () => {
        window.removeEventListener("mousemove", handleMove);
        window.removeEventListener("mouseup", handleEnd);
        window.removeEventListener("touchmove", handleMove);
        window.removeEventListener("touchend", handleEnd);
      };
    }
  }, [isDragging, handleDragMove, handleDragEnd]);

  if (!isVisible || !settings.enabled) return null;

  const { position, size } = settings;

  // Если pointing - Парма должна быть слева (чтобы указывать на контент справа)
  // При pointing игнорируем customPosition и всегда показываем слева
  const isPointing = state === "pointing";
  const effectivePosition = isPointing ? "bottom-left" : position;

  // Определяем стиль позиционирования
  // При pointing всегда слева, игнорируем customPosition
  const positionStyle: React.CSSProperties = (customPosition && !isPointing)
    ? {
        position: "fixed",
        left: customPosition.x,
        top: customPosition.y,
        right: "auto",
        bottom: "auto",
      }
    : {
        position: "fixed",
        bottom: 16,
        left: effectivePosition === "bottom-left" ? 16 : "auto",
        right: effectivePosition === "bottom-right" ? 16 : "auto",
      };

  // Определяем позицию сообщения (левее или правее центра экрана)
  const isOnLeftSide = isPointing
    ? true
    : customPosition
      ? customPosition.x < window.innerWidth / 2
      : effectivePosition === "bottom-left";

  return (
    <div
      ref={containerRef}
      style={positionStyle}
      className={`z-50 ${className} ${isDragging ? "cursor-grabbing" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Основной контейнер */}
      <div className="relative">
        {/* Кнопки управления (появляются при наведении) */}
        {isHovered && !isDragging && (
          <div className="absolute -top-2 -right-2 flex gap-1 z-10">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-1 bg-gray-800/80 hover:bg-gray-700 rounded-full text-white transition-colors"
              title="Настройки"
            >
              <Settings size={14} />
            </button>
            <button
              onClick={hide}
              className="p-1 bg-gray-800/80 hover:bg-red-600 rounded-full text-white transition-colors"
              title="Скрыть Парму"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Облачко с сообщением */}
        {message && settings.showTips && (
          <div
            className={`absolute bottom-full mb-2 min-w-max max-w-xs animate-fade-in ${
              isOnLeftSide ? "left-0" : "right-0"
            }`}
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl px-4 py-2 shadow-lg border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {message.text}
              </p>
              {/* Хвостик облачка */}
              <div
                className={`absolute -bottom-2 w-0 h-0
                           border-l-[8px] border-r-[8px] border-t-[8px]
                           border-transparent border-t-white dark:border-t-gray-800
                           ${isOnLeftSide ? "left-6" : "right-6"}`}
              />
            </div>
          </div>
        )}

        {/* Видео маскота (перетаскивается зажатием) */}
        <div
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
          className={`
            ${sizeMap[size].container}
            transition-transform duration-300
            ${isDragging ? "cursor-grabbing scale-105" : "cursor-grab"}
            ${isHovered && !isDragging ? "scale-110" : ""}
            select-none
          `}
        >
          <video
            ref={videoRef}
            src={videoMap[state]}
            autoPlay
            loop
            muted
            playsInline
            className={`${sizeMap[size].video} object-contain pointer-events-none`}
          />
        </div>

        {/* Панель настроек */}
        {showSettings && (
          <div
            className={`absolute bottom-full mb-12 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 animate-fade-in ${
              isOnLeftSide ? "left-0" : "right-0"
            }`}
          >
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
              Настройки Пармы
            </h4>

            {/* Размер */}
            <div className="mb-3">
              <label className="text-sm text-gray-600 dark:text-gray-400 block mb-1">
                Размер
              </label>
              <div className="flex gap-2">
                {(["sm", "md", "lg"] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => updateSettings({ size: s })}
                    className={`px-3 py-1 rounded text-sm ${
                      size === s
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {s === "sm" ? "S" : s === "md" ? "M" : "L"}
                  </button>
                ))}
              </div>
            </div>

            {/* Позиция по умолчанию */}
            <div className="mb-3">
              <label className="text-sm text-gray-600 dark:text-gray-400 block mb-1">
                Позиция по умолчанию
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    updateSettings({ position: "bottom-left" });
                    resetPosition();
                  }}
                  className={`px-3 py-1 rounded text-sm ${
                    position === "bottom-left" && !customPosition
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  Слева
                </button>
                <button
                  onClick={() => {
                    updateSettings({ position: "bottom-right" });
                    resetPosition();
                  }}
                  className={`px-3 py-1 rounded text-sm ${
                    position === "bottom-right" && !customPosition
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  Справа
                </button>
              </div>
              {/* Кнопка сброса позиции */}
              {customPosition && (
                <button
                  onClick={resetPosition}
                  className="mt-2 w-full py-1.5 text-xs text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors border border-blue-200 dark:border-blue-800"
                >
                  Сбросить позицию
                </button>
              )}
            </div>

            {/* Показывать подсказки */}
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-600 dark:text-gray-400">
                Подсказки
              </label>
              <button
                onClick={() => updateSettings({ showTips: !settings.showTips })}
                className={`w-10 h-6 rounded-full transition-colors ${
                  settings.showTips
                    ? "bg-blue-600"
                    : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    settings.showTips ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Отключить */}
            <button
              onClick={() => {
                updateSettings({ enabled: false });
                setShowSettings(false);
              }}
              className="mt-4 w-full py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
            >
              Отключить Парму
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Parma;
