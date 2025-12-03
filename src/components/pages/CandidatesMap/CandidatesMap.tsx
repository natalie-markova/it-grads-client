import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import { Search, Filter, List, MapPin, Briefcase, MessageSquare, ArrowLeft, Users, ChevronUp, Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Card from '../../ui/Card';
import Section from '../../ui/Section';
import { chatAPI } from '../../../utils/chat.api';
import type { OutletContext } from '../../../types';
import toast from 'react-hot-toast';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icon
const createCustomIcon = (count: number = 1) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background: linear-gradient(135deg, #06b6d4, #0891b2);
      width: ${count > 1 ? '40px' : '32px'};
      height: ${count > 1 ? '40px' : '32px'};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: ${count > 1 ? '14px' : '12px'};
      border: 3px solid white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    ">${count > 1 ? count : ''}</div>`,
    iconSize: [count > 1 ? 40 : 32, count > 1 ? 40 : 32],
    iconAnchor: [count > 1 ? 20 : 16, count > 1 ? 40 : 32],
    popupAnchor: [0, -32],
  });
};

// Координаты городов мира
const CITY_COORDINATES: Record<string, [number, number]> = {
  // Россия
  'Москва': [55.7558, 37.6173],
  'Санкт-Петербург': [59.9343, 30.3351],
  'Новосибирск': [55.0084, 82.9357],
  'Екатеринбург': [56.8389, 60.6057],
  'Казань': [55.8304, 49.0661],
  'Нижний Новгород': [56.2965, 43.9361],
  'Челябинск': [55.1644, 61.4368],
  'Самара': [53.1959, 50.1002],
  'Омск': [54.9885, 73.3242],
  'Ростов-на-Дону': [47.2357, 39.7015],
  'Уфа': [54.7388, 55.9721],
  'Красноярск': [56.0153, 92.8932],
  'Воронеж': [51.6720, 39.1843],
  'Пермь': [58.0105, 56.2502],
  'Волгоград': [48.7080, 44.5133],
  'Краснодар': [45.0355, 38.9753],
  'Саратов': [51.5336, 46.0343],
  'Тюмень': [57.1522, 65.5272],
  'Тольятти': [53.5078, 49.4205],
  'Ижевск': [56.8527, 53.2114],
  'Барнаул': [53.3548, 83.7698],
  'Ульяновск': [54.3142, 48.4031],
  'Иркутск': [52.2978, 104.2964],
  'Хабаровск': [48.4827, 135.0837],
  'Ярославль': [57.6261, 39.8845],
  'Владивосток': [43.1155, 131.8855],
  'Махачкала': [42.9849, 47.5047],
  'Томск': [56.4977, 84.9744],
  'Оренбург': [51.7682, 55.0969],
  'Кемерово': [55.3910, 86.0625],
  'Новокузнецк': [53.7596, 87.1216],
  'Рязань': [54.6296, 39.7368],
  'Астрахань': [46.3497, 48.0408],
  'Набережные Челны': [55.7436, 52.4144],
  'Пенза': [53.1959, 45.0183],
  'Липецк': [52.6103, 39.5947],
  'Киров': [58.6035, 49.6683],
  'Чебоксары': [56.1322, 47.2519],
  'Тула': [54.1961, 37.6182],
  'Калининград': [54.7104, 20.4522],
  'Курск': [51.7304, 36.1926],
  'Ставрополь': [45.0448, 41.9691],
  'Улан-Удэ': [51.8335, 107.5842],
  'Сочи': [43.5992, 39.7257],
  'Тверь': [56.8587, 35.9176],
  'Магнитогорск': [53.4073, 59.0455],
  'Иваново': [56.9994, 40.9728],
  'Брянск': [53.2521, 34.3717],
  'Белгород': [50.5997, 36.5986],
  'Сургут': [61.2540, 73.3961],
  'Владимир': [56.1366, 40.3966],
  'Архангельск': [64.5401, 40.5433],
  'Чита': [52.0515, 113.4712],
  'Калуга': [54.5293, 36.2754],
  'Смоленск': [54.7903, 32.0503],
  'Вологда': [59.2181, 39.8914],
  'Орёл': [52.9651, 36.0785],
  'Череповец': [59.1269, 37.9090],
  'Саранск': [54.1838, 45.1749],
  'Курган': [55.4408, 65.3411],
  'Тамбов': [52.7212, 41.4523],
  'Мурманск': [68.9585, 33.0827],
  'Петрозаводск': [61.7891, 34.3596],
  'Нижневартовск': [60.9344, 76.5531],
  'Йошкар-Ола': [56.6389, 47.8908],
  'Кострома': [57.7679, 40.9267],
  'Новороссийск': [44.7234, 37.7687],
  'Нальчик': [43.4981, 43.6186],
  'Грозный': [43.3176, 45.6919],
  'Сыктывкар': [61.6688, 50.8364],
  'Якутск': [62.0280, 129.7326],
  'Благовещенск': [50.2907, 127.5272],
  'Великий Новгород': [58.5213, 31.2755],
  'Псков': [57.8136, 28.3496],
  'Южно-Сахалинск': [46.9641, 142.7285],
  'Петропавловск-Камчатский': [53.0452, 158.6511],
  // СНГ
  'Минск': [53.9045, 27.5615],
  'Киев': [50.4501, 30.5234],
  'Алматы': [43.2220, 76.8512],
  'Астана': [51.1694, 71.4491],
  'Ташкент': [41.2995, 69.2401],
  'Баку': [40.4093, 49.8671],
  'Тбилиси': [41.7151, 44.8271],
  'Ереван': [40.1792, 44.4991],
  'Кишинёв': [47.0105, 28.8638],
  'Бишкек': [42.8746, 74.5698],
  'Душанбе': [38.5598, 68.7740],
  'Ашхабад': [37.9601, 58.3261],
  // Европа
  'Лондон': [51.5074, -0.1278],
  'Париж': [48.8566, 2.3522],
  'Берлин': [52.5200, 13.4050],
  'Мадрид': [40.4168, -3.7038],
  'Рим': [41.9028, 12.4964],
  'Амстердам': [52.3676, 4.9041],
  'Вена': [48.2082, 16.3738],
  'Прага': [50.0755, 14.4378],
  'Варшава': [52.2297, 21.0122],
  'Будапешт': [47.4979, 19.0402],
  'Стокгольм': [59.3293, 18.0686],
  'Хельсинки': [60.1699, 24.9384],
  'Осло': [59.9139, 10.7522],
  'Копенгаген': [55.6761, 12.5683],
  'Дублин': [53.3498, -6.2603],
  'Лиссабон': [38.7223, -9.1393],
  'Барселона': [41.3851, 2.1734],
  'Милан': [45.4642, 9.1900],
  'Мюнхен': [48.1351, 11.5820],
  'Цюрих': [47.3769, 8.5417],
  'Женева': [46.2044, 6.1432],
  'Брюссель': [50.8503, 4.3517],
  // Азия
  'Токио': [35.6762, 139.6503],
  'Пекин': [39.9042, 116.4074],
  'Шанхай': [31.2304, 121.4737],
  'Сеул': [37.5665, 126.9780],
  'Сингапур': [1.3521, 103.8198],
  'Гонконг': [22.3193, 114.1694],
  'Бангкок': [13.7563, 100.5018],
  'Дубай': [25.2048, 55.2708],
  'Мумбаи': [19.0760, 72.8777],
  'Дели': [28.7041, 77.1025],
  'Бангалор': [12.9716, 77.5946],
  'Тель-Авив': [32.0853, 34.7818],
  'Стамбул': [41.0082, 28.9784],
  // Северная Америка
  'Нью-Йорк': [40.7128, -74.0060],
  'Лос-Анджелес': [34.0522, -118.2437],
  'Сан-Франциско': [37.7749, -122.4194],
  'Чикаго': [41.8781, -87.6298],
  'Торонто': [43.6532, -79.3832],
  'Ванкувер': [49.2827, -123.1207],
  'Сиэтл': [47.6062, -122.3321],
  'Бостон': [42.3601, -71.0589],
  'Вашингтон': [38.9072, -77.0369],
  'Майами': [25.7617, -80.1918],
  'Остин': [30.2672, -97.7431],
  'Денвер': [39.7392, -104.9903],
  // Южная Америка
  'Сан-Паулу': [-23.5505, -46.6333],
  'Буэнос-Айрес': [-34.6037, -58.3816],
  'Сантьяго': [-33.4489, -70.6693],
  'Богота': [4.7110, -74.0721],
  'Лима': [-12.0464, -77.0428],
  // Океания
  'Сидней': [-33.8688, 151.2093],
  'Мельбурн': [-37.8136, 144.9631],
  'Окленд': [-36.8509, 174.7645],
  // Африка
  'Кейптаун': [-33.9249, 18.4241],
  'Каир': [30.0444, 31.2357],
  'Лагос': [6.5244, 3.3792],
};

interface Resume {
  id: number;
  title: string;
  description: string;
  skillsArray: string[];
  location: string;
  level: string;
  desiredSalary: number;
  experience?: string;
  education?: string;
  portfolio?: string;
  userId?: number;
  user?: {
    id: number;
    username: string;
    city?: string;
  };
}

interface CandidateMarker {
  position: [number, number];
  resumes: Resume[];
  city: string;
}

// Компонент для управления картой
const MapController = ({ center, zoom }: { center: [number, number]; zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

// Кнопка "Домой" для карты (навести на Москву)
const HomeButton = () => {
  const map = useMap();

  const goToMoscow = () => {
    map.setView([55.7558, 37.6173], 10);
  };

  return (
    <div className="leaflet-top leaflet-left" style={{ marginTop: '80px' }}>
      <div className="leaflet-control leaflet-bar">
        <button
          onClick={goToMoscow}
          className="bg-white hover:bg-gray-100 w-[30px] h-[30px] flex items-center justify-center border-0 cursor-pointer"
          title="Москва"
          style={{ borderRadius: '2px' }}
        >
          <Home className="h-4 w-4 text-gray-700" />
        </button>
      </div>
    </div>
  );
};

const CandidatesMap = () => {
  const navigate = useNavigate();
  const { user } = useOutletContext<OutletContext>();
  const { t } = useTranslation();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [creatingChatFor, setCreatingChatFor] = useState<number | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([55.7558, 49.0]);
  const [mapZoom, setMapZoom] = useState(4);

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
      const response = await fetch(`${apiUrl}/resumes`);
      if (response.ok) {
        const data = await response.json();
        setResumes(data);
      }
    } catch (error) {
      console.error('Error loading resumes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Получаем все уникальные навыки
  const allSkills = useMemo(() => {
    const skills = new Set<string>();
    resumes.forEach(r => r.skillsArray?.forEach(s => skills.add(s)));
    return Array.from(skills).sort();
  }, [resumes]);

  // Фильтруем резюме
  const filteredResumes = useMemo(() => {
    return resumes.filter(resume => {
      // Поиск по тексту
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          resume.title?.toLowerCase().includes(searchLower) ||
          resume.description?.toLowerCase().includes(searchLower) ||
          resume.user?.username?.toLowerCase().includes(searchLower) ||
          resume.location?.toLowerCase().includes(searchLower) ||
          resume.skillsArray?.some(s => s.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      // Фильтр по навыкам
      if (selectedSkills.length > 0) {
        const hasSkills = selectedSkills.some(skill =>
          resume.skillsArray?.includes(skill)
        );
        if (!hasSkills) return false;
      }

      // Фильтр по уровню
      if (selectedLevel && resume.level !== selectedLevel) {
        return false;
      }

      return true;
    });
  }, [resumes, searchTerm, selectedSkills, selectedLevel]);

  // Группируем резюме по городам для карты
  const markers = useMemo<CandidateMarker[]>(() => {
    const cityGroups: Record<string, Resume[]> = {};

    filteredResumes.forEach(resume => {
      const city = resume.location || resume.user?.city;
      if (city) {
        // Нормализуем название города
        const normalizedCity = Object.keys(CITY_COORDINATES).find(
          c => c.toLowerCase() === city.toLowerCase() || city.toLowerCase().includes(c.toLowerCase())
        );

        if (normalizedCity) {
          if (!cityGroups[normalizedCity]) {
            cityGroups[normalizedCity] = [];
          }
          cityGroups[normalizedCity].push(resume);
        }
      }
    });

    return Object.entries(cityGroups).map(([city, cityResumes]) => ({
      position: CITY_COORDINATES[city],
      resumes: cityResumes,
      city,
    }));
  }, [filteredResumes]);

  const handleStartChat = async (candidateId: number) => {
    if (!user) {
      toast.error('Войдите в систему, чтобы написать сообщение');
      navigate('/login');
      return;
    }

    if (user.role !== 'employer') {
      toast.error('Только работодатели могут писать кандидатам');
      return;
    }

    setCreatingChatFor(candidateId);
    try {
      const chat = await chatAPI.createChat(candidateId);
      toast.success('Чат создан!');
      navigate(`/messenger/${chat.id}`);
    } catch (error) {
      console.error('Error creating chat:', error);
      toast.error('Ошибка при создании чата');
    } finally {
      setCreatingChatFor(null);
    }
  };

  const handleCityClick = (city: string) => {
    const coords = CITY_COORDINATES[city];
    if (coords) {
      setMapCenter(coords);
      setMapZoom(10);
    }
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  // Статистика по городам
  const cityStats = useMemo(() => {
    const stats: Record<string, number> = {};
    markers.forEach(m => {
      stats[m.city] = m.resumes.length;
    });
    return Object.entries(stats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  }, [markers]);

  return (
    <div className="bg-dark-bg min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Section title="" className="bg-dark-bg py-0">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => navigate('/candidates')}
                className="text-gray-400 hover:text-accent-cyan transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <h1 className="text-4xl font-bold text-white">{t('candidates.mapTitle')}</h1>
            </div>
            <p className="text-gray-300 text-lg">
              {t('candidates.mapSubtitle')}
            </p>
          </div>

          {/* Поиск и фильтры */}
          <Card className="mb-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('candidates.search')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-dark-surface border border-dark-card rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-accent-cyan"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`btn-secondary flex items-center gap-2 ${showFilters ? 'border-accent-cyan text-accent-cyan' : ''}`}
                >
                  <Filter className="h-4 w-4" />
                  {t('common.filter')}
                  {(selectedSkills.length > 0 || selectedLevel) && (
                    <span className="bg-accent-cyan text-dark-bg text-xs px-2 py-0.5 rounded-full">
                      {selectedSkills.length + (selectedLevel ? 1 : 0)}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => navigate('/candidates')}
                  className="btn-secondary flex items-center gap-2"
                >
                  <List className="h-4 w-4" />
                  {t('candidates.listView')}
                </button>
              </div>

              {/* Фильтры */}
              {showFilters && (
                <div className="pt-4 border-t border-dark-card">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Уровень */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">{t('interview.level')}</label>
                      <select
                        value={selectedLevel}
                        onChange={(e) => setSelectedLevel(e.target.value)}
                        className="w-full px-4 py-2 bg-dark-surface border border-dark-card rounded-lg text-white focus:outline-none focus:border-accent-cyan"
                      >
                        <option value="">{t('common.all')}</option>
                        <option value="junior">Junior</option>
                        <option value="middle">Middle</option>
                        <option value="senior">Senior</option>
                        <option value="lead">Lead</option>
                      </select>
                    </div>

                    {/* Навыки */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">{t('profile.skills')}</label>
                      <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                        {allSkills.slice(0, 20).map(skill => (
                          <button
                            key={skill}
                            onClick={() => toggleSkill(skill)}
                            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                              selectedSkills.includes(skill)
                                ? 'bg-accent-cyan text-dark-bg'
                                : 'bg-dark-surface border border-dark-card text-gray-300 hover:border-accent-cyan'
                            }`}
                          >
                            {skill}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Кнопка сброса */}
                  {(selectedSkills.length > 0 || selectedLevel) && (
                    <button
                      onClick={() => {
                        setSelectedSkills([]);
                        setSelectedLevel('');
                      }}
                      className="mt-4 text-accent-cyan hover:text-accent-cyan/80 text-sm"
                    >
                      {t('candidates.resetFilters')}
                    </button>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Основной контент: карта + статистика */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Статистика по городам */}
            <Card className="lg:col-span-1 h-[600px] flex flex-col">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-accent-cyan" />
                {t('candidates.topCities')}
              </h3>
              <div className="space-y-2 flex-1 overflow-y-auto">
                {cityStats.map(([city, count]) => (
                  <button
                    key={city}
                    onClick={() => handleCityClick(city)}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-dark-surface transition-colors group"
                  >
                    <span className="text-gray-300 group-hover:text-white flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-accent-cyan" />
                      {t(`cities.${city}`, city)}
                    </span>
                    <span className="bg-accent-cyan/20 text-accent-cyan text-sm px-2 py-0.5 rounded-full">
                      {count}
                    </span>
                  </button>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-dark-card">
                <p className="text-sm text-gray-400">
                  {t('candidates.totalCandidates')}: <span className="text-white font-semibold">{filteredResumes.length}</span>
                </p>
                <p className="text-sm text-gray-400">
                  {t('candidates.onMap')}: <span className="text-white font-semibold">{markers.reduce((acc, m) => acc + m.resumes.length, 0)}</span>
                </p>
              </div>
            </Card>

            {/* Карта */}
            <Card className="lg:col-span-3 p-0 overflow-hidden h-[600px] relative z-0">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-accent-cyan"></div>
                </div>
              ) : (
                <MapContainer
                  center={mapCenter}
                  zoom={mapZoom}
                  style={{ height: '100%', width: '100%', zIndex: 0 }}
                  className="rounded-lg"
                  worldCopyJump={true}
                  attributionControl={false}
                >
                  <MapController center={mapCenter} zoom={mapZoom} />
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                  />
                  <HomeButton />
                  <MarkerClusterGroup
                    chunkedLoading
                    iconCreateFunction={(cluster: { getChildCount: () => number }) => {
                      const count = cluster.getChildCount();
                      return L.divIcon({
                        className: 'custom-cluster',
                        html: `<div style="
                          background: linear-gradient(135deg, #06b6d4, #0891b2);
                          width: 50px;
                          height: 50px;
                          border-radius: 50%;
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          color: white;
                          font-weight: bold;
                          font-size: 16px;
                          border: 4px solid white;
                          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                        ">${count}</div>`,
                        iconSize: [50, 50],
                        iconAnchor: [25, 25],
                      });
                    }}
                  >
                    {markers.map((marker, idx) => (
                      <Marker
                        key={idx}
                        position={marker.position}
                        icon={createCustomIcon(marker.resumes.length)}
                      >
                        <Popup className="custom-popup" maxWidth={400}>
                          <div className="bg-dark-surface rounded-lg p-4 min-w-[350px]">
                            <h3 className="text-white font-bold text-lg mb-2 flex items-center gap-2">
                              <MapPin className="h-5 w-5 text-accent-cyan" />
                              {t(`cities.${marker.city}`, marker.city)}
                            </h3>
                            <p className="text-gray-400 text-sm mb-3">
                              {t('candidates.totalInCity')}: <span className="text-accent-cyan font-semibold">{marker.resumes.length}</span>
                            </p>
                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                              {marker.resumes.map((resume, index) => (
                                <div key={resume.id} className="border-t border-dark-card pt-3">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500">#{index + 1}</span>
                                        <h4 className="text-white font-semibold">{resume.title}</h4>
                                      </div>
                                      <p className="text-gray-400 text-sm">{resume.user?.username || 'Кандидат'}</p>
                                    </div>
                                    {resume.desiredSalary && (
                                      <span className="text-xs text-accent-cyan whitespace-nowrap">
                                        от {resume.desiredSalary.toLocaleString()} ₽
                                      </span>
                                    )}
                                  </div>
                                  {resume.level && (
                                    <span className="inline-flex items-center gap-1 text-xs text-accent-cyan mt-1">
                                      <Briefcase className="h-3 w-3" />
                                      {resume.level}
                                    </span>
                                  )}
                                  {resume.skillsArray && resume.skillsArray.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {resume.skillsArray.slice(0, 4).map((skill, i) => (
                                        <span key={i} className="text-xs bg-dark-card px-2 py-0.5 rounded text-gray-300">
                                          {skill}
                                        </span>
                                      ))}
                                      {resume.skillsArray.length > 4 && (
                                        <span className="text-xs text-gray-500">
                                          +{resume.skillsArray.length - 4}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                  {user?.role === 'employer' && (
                                    <button
                                      onClick={() => handleStartChat(resume.user?.id || resume.userId || 0)}
                                      disabled={creatingChatFor === (resume.user?.id || resume.userId)}
                                      className="mt-2 text-xs text-accent-cyan hover:text-accent-cyan/80 flex items-center gap-1"
                                    >
                                      <MessageSquare className="h-3 w-3" />
                                      {t('candidates.writeMessage')}
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MarkerClusterGroup>
                </MapContainer>
              )}
            </Card>
          </div>

        </Section>
      </div>

      {/* Кнопка вернуться в начало */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 p-3 bg-accent-cyan hover:bg-accent-cyan/80 text-dark-bg rounded-full shadow-lg transition-all z-50"
        title="Вернуться в начало"
      >
        <ChevronUp className="h-6 w-6" />
      </button>
    </div>
  );
};

export default CandidatesMap;