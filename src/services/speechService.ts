/**
 * Сервис синтеза речи через Yandex SpeechKit
 * Голос: alena (женский, дружелюбный) - подходит для маскота-собаки
 */

interface SpeechOptions {
  text: string;
  voice?: 'alena' | 'jane' | 'omazh' | 'zahar' | 'ermil' | 'marina';
  emotion?: 'neutral' | 'good' | 'evil';
  speed?: number; // 0.1 - 3.0, default 1.0
  lang?: 'ru-RU' | 'en-US';
}

class SpeechService {
  private apiKey: string | null = null;
  private folderId: string | null = null;
  private audioContext: AudioContext | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private audioCache: Map<string, string> = new Map();

  constructor() {
    this.apiKey = import.meta.env.VITE_YANDEX_SPEECHKIT_API_KEY || null;
    this.folderId = import.meta.env.VITE_YANDEX_FOLDER_ID || null;
  }

  /**
   * Проверка доступности сервиса
   */
  isAvailable(): boolean {
    return !!(this.apiKey && this.folderId);
  }

  /**
   * Синтез речи через Yandex SpeechKit API
   */
  async synthesize(options: SpeechOptions): Promise<string | null> {
    const {
      text,
      voice = 'alena',
      emotion = 'good',
      speed = 1.1,
      lang = 'ru-RU'
    } = options;

    // Проверяем кеш
    const cacheKey = `${text}_${voice}_${emotion}_${speed}`;
    if (this.audioCache.has(cacheKey)) {
      return this.audioCache.get(cacheKey)!;
    }

    // Если API недоступен, используем fallback
    if (!this.isAvailable()) {
      console.warn('Yandex SpeechKit не настроен, используем Web Speech API');
      return null;
    }

    try {
      const response = await fetch('https://tts.api.cloud.yandex.net/speech/v1/tts:synthesize', {
        method: 'POST',
        headers: {
          'Authorization': `Api-Key ${this.apiKey}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          text,
          lang,
          voice,
          emotion,
          speed: speed.toString(),
          format: 'mp3',
          folderId: this.folderId!
        })
      });

      if (!response.ok) {
        throw new Error(`SpeechKit error: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Кешируем результат
      this.audioCache.set(cacheKey, audioUrl);

      return audioUrl;
    } catch (error) {
      console.error('Ошибка синтеза речи:', error);
      return null;
    }
  }

  /**
   * Воспроизведение аудио
   */
  async speak(options: SpeechOptions): Promise<void> {
    // Останавливаем предыдущее воспроизведение
    this.stop();

    const audioUrl = await this.synthesize(options);

    if (audioUrl) {
      // Yandex SpeechKit
      return new Promise((resolve, reject) => {
        this.currentAudio = new Audio(audioUrl);
        this.currentAudio.onended = () => resolve();
        this.currentAudio.onerror = () => reject(new Error('Audio playback error'));
        this.currentAudio.play().catch(reject);
      });
    } else {
      // Fallback на Web Speech API
      return this.speakWithWebSpeech(options.text, options.lang || 'ru-RU');
    }
  }

  /**
   * Fallback: Web Speech API
   */
  private speakWithWebSpeech(text: string, lang: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        console.warn('Web Speech API не поддерживается');
        resolve();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 1.0;
      utterance.pitch = 1.2; // Чуть выше для более дружелюбного тона

      // Выбираем женский голос
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(v =>
        v.lang.startsWith(lang.split('-')[0]) &&
        (v.name.toLowerCase().includes('female') ||
         v.name.toLowerCase().includes('woman') ||
         v.name.includes('Milena') ||
         v.name.includes('Irina'))
      );
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = () => reject(new Error('Speech synthesis error'));

      window.speechSynthesis.speak(utterance);
    });
  }

  /**
   * Остановка воспроизведения
   */
  stop(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  /**
   * Очистка кеша
   */
  clearCache(): void {
    this.audioCache.forEach(url => URL.revokeObjectURL(url));
    this.audioCache.clear();
  }
}

export const speechService = new SpeechService();
export default speechService;
