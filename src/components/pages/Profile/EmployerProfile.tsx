import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useOutletContext, useSearchParams } from 'react-router-dom';
import { Edit, Trash2, Building2, Globe, MapPin, Users, Briefcase, Check, X, User as UserIcon, RefreshCw, Eye, ChevronLeft, ChevronRight, MessageSquare, Award, GraduationCap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { OutletContext } from '../../../types';
import { $api, clearAccessToken } from '../../../utils/axios.instance';
import { chatAPI } from '../../../utils/chat.api';
import toast from 'react-hot-toast';
import VacanciesManagement from '../Vacancies/VacanciesManagement';
import Card from '../../ui/Card';
import EmployerProfileNav from './EmployerProfileNav';
import ChangePassword from './ChangePassword';
import ConfirmModal from '../../ui/ConfirmModal';
import { getImageUrl } from '../../../utils/image.utils';


interface EmployerProfileData {
  companyName: string;
  companyDescription: string;
  companyWebsite: string;
  companyAddress: string;
  companySize: string;
  industry: string;
  phone: string;
  email: string;
  avatar?: string;
}

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

interface Application {
  id: number;
  vacancyId: number;
  userId: number;
  status: 'pending' | 'accepted' | 'rejected';
  coverLetter?: string;
  createdAt: string;
  vacancy?: {
    id: number;
    title: string;
    companyName?: string;
  };
  user?: {
    id: number;
    username: string;
    email: string;
    phone?: string;
    avatar?: string;
    resumes?: Array<{
      id: number;
      title: string;
    }>;
  };
}

const EmployerProfile = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, setUser } = useOutletContext<OutletContext>();
  const [profile, setProfile] = useState<EmployerProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const [viewingResumes, setViewingResumes] = useState<Resume[]>([]);
  const [currentResumeIndex, setCurrentResumeIndex] = useState<number>(0);
  const [showResumeModal, setShowResumeModal] = useState<boolean>(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    variant: 'info'
  });

  const [formData, setFormData] = useState<EmployerProfileData>({
    companyName: '',
    companyDescription: '',
    companyWebsite: '',
    companyAddress: '',
    companySize: '',
    industry: '',
    phone: '',
    email: ''
  });

  useEffect(() => {
    if (!user) {
            navigate('/login')
      return
          }
    if (user.role !== 'employer') {
        navigate('/login')
      return
    }
      loadProfile()
      loadApplications()
  }, [user])

  useEffect(() => {
    if (isEditing && profile && !avatarPreview && !avatarFile) {
      setAvatarPreview(profile.avatar ? getImageUrl(profile.avatar) : null)
    }
  }, [isEditing, profile])

  const loadProfile = async () => {
    if (!user) return
    try {
      const response = await $api.get('/user/profile')
      const data = response.data

      const profileData: EmployerProfileData = {
        companyName: data.companyName || '',
        companyDescription: data.companyDescription || '',
        companyWebsite: data.companyWebsite || '',
        companyAddress: data.companyAddress || '',
        companySize: data.companySize || '',
        industry: data.industry || '',
        phone: data.phone || '',
        email: data.email || user.email || '',
        avatar: data.avatar
      }

      setProfile(profileData)
      setFormData(profileData)
      setAvatarPreview(profileData.avatar ? getImageUrl(profileData.avatar) : null)
    } catch (error: any) {
      console.error('Error loading profile:', error)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      let avatarToSave: string | undefined = undefined

      if (formData.avatar && formData.avatar.trim() !== '' && !formData.avatar.startsWith('data:')) {
        avatarToSave = formData.avatar
      } else if (profile?.avatar && profile.avatar.trim() !== '') {
        avatarToSave = profile.avatar
      }

      const dataToSave: Record<string, unknown> = {
        companyName: formData.companyName,
        companyDescription: formData.companyDescription,
        companyWebsite: formData.companyWebsite,
        companyAddress: formData.companyAddress,
        companySize: formData.companySize,
        industry: formData.industry,
        phone: formData.phone,
        email: formData.email,
      }

      if (avatarToSave !== undefined) {
        dataToSave.avatar = avatarToSave
      }

      console.log('Saving employer profile, avatar:', avatarToSave)

      const response = await $api.put('/user/profile', dataToSave)
      if (response.data) {
        const profileData: EmployerProfileData = {
          companyName: response.data.companyName || '',
          companyDescription: response.data.companyDescription || '',
          companyWebsite: response.data.companyWebsite || '',
          companyAddress: response.data.companyAddress || '',
          companySize: response.data.companySize || '',
          industry: response.data.industry || '',
          phone: response.data.phone || '',
          email: response.data.email || user.email || '',
          avatar: response.data.avatar || response.data.photo
        }
        setProfile(profileData)
        setFormData(profileData)
        setAvatarPreview(profileData.avatar ? getImageUrl(profileData.avatar) : null)
      } else {
        setProfile(formData)
        setFormData(formData)
      }
      setIsEditing(false)
      toast.success(t('employerProfile.profileUpdated'))
    } catch (error: any) {
      console.error('Error saving profile:', error)

      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        toast.error(t('employerProfile.connectionError'))
      } else if (error.response?.status === 401) {
        toast.error(t('employerProfile.authError'))
      } else if (error.response?.status === 403) {
        toast.error(t('employerProfile.permissionError'))
      } else {
        const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || t('employerProfile.saveError')
        toast.error(errorMessage)
      }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error(t('employerProfile.selectImageFile'))
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t('employerProfile.fileSizeLimit'))
        return
      }
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUploadAvatar = async () => {
    if (!avatarFile) return

    setIsUploadingAvatar(true)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('photo', avatarFile)

      const response = await $api.post('/user/upload-photo', uploadFormData)

      const data = response.data
      const avatarUrl = data.photo || data.avatar || ''

      setFormData(prev => ({
        ...prev,
        avatar: avatarUrl
      }))
      setAvatarPreview(getImageUrl(avatarUrl))
      setAvatarFile(null)
      toast.success(t('employerProfile.avatarUploaded'))
    } catch (error: any) {
      console.error('Error uploading avatar:', error)

      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        toast.error(t('employerProfile.connectionError'))
      } else if (error.response) {
        const errorMessage = error.response?.data?.error || error.response?.data?.message || t('employerProfile.uploadError')
        toast.error(errorMessage)
      } else {
        const errorMessage = error.message || t('employerProfile.uploadError')
        toast.error(errorMessage)
      }
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const loadApplications = async () => {
    if (!user) return
    try {
      const response = await $api.get('/applications/employer/all')
      const apps = Array.isArray(response.data) ? response.data : []
      setApplications(apps)
    } catch (error) {
      console.error('Error loading applications:', error)
    }
  }

  const handleDeleteProfile = async () => {
    if (!user) return
    setConfirmModal({
      isOpen: true,
      title: t('profile.confirmDelete.profileTitle'),
      message: t('profile.confirmDelete.profileMessage'),
      variant: 'danger',
      onConfirm: async () => {
        try {
          await $api.delete('/user/profile')
          clearAccessToken()
          setUser(null)
          setProfile(null)
          toast.success(t('profile.success.profileDeleted'))
          navigate('/')
        } catch (error: any) {
          console.error('Error deleting profile:', error)
          const errorMessage = error.response?.data?.message || error.message || t('profile.errors.deleteError')
          toast.error(errorMessage)
        } finally {
          setConfirmModal({ ...confirmModal, isOpen: false })
        }
      }
    })
  }

  const handleUpdateApplicationStatus = async (applicationId: number, status: 'accepted' | 'rejected') => {
    try {
      await $api.put(`/applications/${applicationId}/status`, { status });
      toast.success(status === 'accepted' ? t('employerProfile.applicationAccepted') : t('employerProfile.applicationRejected'));
      loadApplications();
    } catch (error: any) {
      console.error('Error updating application status:', error);
      toast.error(error.response?.data?.error || t('employerProfile.statusUpdateError'));
    }
  };

  const handleViewResumes = async (userId: number) => {
    try {
      const response = await $api.get(`/resumes/user/${userId}`);
      const userResumes = response.data;
      
      if (userResumes.length === 0) {
        toast.error(t('toasts.noResumes'));
        return;
      }

      setViewingResumes(userResumes);
      setCurrentResumeIndex(0);
      setShowResumeModal(true);
    } catch (error: any) {
      console.error('Error loading user resumes:', error);
      toast.error(t('toasts.resumeLoadError'));
    }
  };

  const handleNextResume = () => {
    if (currentResumeIndex < viewingResumes.length - 1) {
      setCurrentResumeIndex(currentResumeIndex + 1);
    }
  };

  const handlePrevResume = () => {
    if (currentResumeIndex > 0) {
      setCurrentResumeIndex(currentResumeIndex - 1);
    }
  };

  const handleStartChat = async (userId: number) => {
    if (!user) {
      toast.error(t('toasts.loginRequired'));
      navigate('/login');
      return;
    }

    try {
      const chat = await chatAPI.createChat(userId);
      toast.success(t('toasts.chatCreated'));
      navigate(`/messenger/${chat.id}`);
    } catch (error) {
      console.error('Error creating chat:', error);
      toast.error(t('toasts.chatError'));
    }
  };

  const [searchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'profile'

  const handleTabChange = (tab: string) => {
    navigate(`/profile/employer?tab=${tab}`, { replace: true })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-white text-xl">{t('employerProfile.loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Navigation Menu */}
        <EmployerProfileNav activeTab={activeTab} onTabChange={handleTabChange} />

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-dark-surface rounded-lg p-8 border border-dark-card">
          <div className="flex justify-between items-start mb-8">
            <h1 className="text-3xl font-bold text-white">{t('employerProfile.title')}</h1>
            <div className="flex space-x-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="p-2 text-accent-cyan hover:bg-dark-card rounded-lg transition-colors"
                title={t('employerProfile.editProfile')}
              >
                <Edit className="h-5 w-5" />
              </button>
              <button
                onClick={handleDeleteProfile}
                className="p-2 text-red-400 hover:bg-dark-card rounded-lg transition-colors"
                title={t('profile.deleteProfile')}
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>

          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-6">
              {/* Загрузка аватара */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('employerProfile.companyAvatar')}
                </label>
                <div className="space-y-3">
                  {avatarPreview && (
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-dark-card">
                      <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setAvatarPreview(null)
                          setAvatarFile(null)
                          setFormData({ ...formData, avatar: '' })
                        }}
                        className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-black/70 rounded-full transition-all cursor-default"
                        title="Удалить фото"
                      >
                        <X className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  )}
                  <div className="flex gap-2 flex-wrap">
                    <input
                      ref={avatarFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => avatarFileInputRef.current?.click()}
                      className="px-4 py-2 bg-dark-card hover:bg-dark-card/80 text-white rounded-lg transition-colors text-sm flex items-center gap-2"
                    >
                      📁 {avatarFile ? t('employerProfile.fileSelected') : t('employerProfile.selectFile')}
                    </button>
                    {avatarFile && (
                      <button
                        type="button"
                        onClick={handleUploadAvatar}
                        disabled={isUploadingAvatar}
                        className="px-4 py-2 bg-accent-cyan hover:bg-accent-cyan/80 text-dark-bg font-medium rounded-lg transition-colors text-sm disabled:opacity-50"
                      >
                        {isUploadingAvatar ? t('employerProfile.uploading') : t('employerProfile.upload')}
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">{t('employerProfile.maxFileSize')}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('employerProfile.companyName')}
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-dark-bg border border-dark-card rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('employerProfile.industry')}
                  </label>
                  <select
                    name="industry"
                    value={formData.industry}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-dark-bg border border-dark-card rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                  >
                    <option value="">{t('employerProfile.selectIndustry')}</option>
                    <option value="IT">{t('employerProfile.industries.it')}</option>
                    <option value="Finance">{t('employerProfile.industries.finance')}</option>
                    <option value="Healthcare">{t('employerProfile.industries.healthcare')}</option>
                    <option value="Education">{t('employerProfile.industries.education')}</option>
                    <option value="Retail">{t('employerProfile.industries.retail')}</option>
                    <option value="Manufacturing">{t('employerProfile.industries.manufacturing')}</option>
                    <option value="Other">{t('employerProfile.industries.other')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('employerProfile.companySize')}
                  </label>
                  <select
                    name="companySize"
                    value={formData.companySize}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-dark-bg border border-dark-card rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                  >
                    <option value="">{t('employerProfile.selectSize')}</option>
                    <option value="1-10">{t('employerProfile.companySizes.1-10')}</option>
                    <option value="11-50">{t('employerProfile.companySizes.11-50')}</option>
                    <option value="51-200">{t('employerProfile.companySizes.51-200')}</option>
                    <option value="201-500">{t('employerProfile.companySizes.201-500')}</option>
                    <option value="501+">{t('employerProfile.companySizes.501+')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('employerProfile.companyWebsite')}
                  </label>
                  <input
                    type="url"
                    name="companyWebsite"
                    value={formData.companyWebsite}
                    onChange={handleInputChange}
                    placeholder="https://example.com"
                    className="w-full px-4 py-2 bg-dark-bg border border-dark-card rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('employerProfile.companyAddress')}
                  </label>
                  <input
                    type="text"
                    name="companyAddress"
                    value={formData.companyAddress}
                    onChange={handleInputChange}
                    placeholder={t('employerProfile.addressPlaceholder')}
                    className="w-full px-4 py-2 bg-dark-bg border border-dark-card rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('employerProfile.phone')}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+7 (999) 123-45-67"
                    className="w-full px-4 py-2 bg-dark-bg border border-dark-card rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('employerProfile.companyDescription')}
                </label>
                <textarea
                  name="companyDescription"
                  value={formData.companyDescription}
                  onChange={handleInputChange}
                  rows={6}
                  placeholder={t('employerProfile.tellAboutCompany')}
                  className="w-full px-4 py-2 bg-dark-bg border border-dark-card rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                />
              </div>

              <div className="flex gap-4">
                <button type="submit" className="btn-primary">
                  {t('employerProfile.save')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    if (profile) {
                      setFormData(profile);
                      setAvatarPreview(profile.avatar ? getImageUrl(profile.avatar) : null);
                      setAvatarFile(null);
                    }
                  }}
                  className="px-6 py-2 bg-dark-card hover:bg-dark-card/80 text-white rounded-lg transition-colors"
                >
                  {t('employerProfile.cancel')}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-8">
              {/* Company Header */}
              <div className="flex items-start gap-6">
                <div className="w-24 h-24 bg-accent-cyan/20 rounded-lg flex items-center justify-center">
                  {profile.avatar ? (
                    <img src={getImageUrl(profile.avatar)} alt={profile.companyName} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <Building2 className="h-12 w-12 text-accent-cyan" />
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {profile.companyName || t('employerProfile.nameNotSpecified')}
                  </h2>
                  {profile.industry && (
                    <p className="text-accent-cyan font-medium mb-2">{profile.industry}</p>
                  )}
                  <div className="flex flex-wrap gap-4 text-gray-400 text-sm">
                    {profile.companySize && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {profile.companySize}
                      </div>
                    )}
                    {profile.companyAddress && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {profile.companyAddress}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Company Description */}
              {profile.companyDescription && (
                <div className="bg-dark-card rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-accent-cyan" />
                    {t('employerProfile.aboutCompany')}
                  </h3>
                  <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                    {profile.companyDescription}
                  </p>
                </div>
              )}

              {/* Contact Information */}
              <div className="bg-dark-card rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-4">{t('employerProfile.contactInfo')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.email && (
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Email</p>
                      <a href={`mailto:${profile.email}`} className="text-accent-cyan hover:text-accent-cyan/80">
                        {profile.email}
                      </a>
                    </div>
                  )}
                  {profile.phone && (
                    <div>
                      <p className="text-gray-400 text-sm mb-1">{t('employerProfile.phone')}</p>
                      <a href={`tel:${profile.phone}`} className="text-accent-cyan hover:text-accent-cyan/80">
                        {profile.phone}
                      </a>
                    </div>
                  )}
                  {profile.companyWebsite && (
                    <div>
                      <p className="text-gray-400 text-sm mb-1">{t('employerProfile.companyWebsite')}</p>
                      <a
                        href={profile.companyWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent-cyan hover:text-accent-cyan/80 flex items-center gap-2"
                      >
                        <Globe className="h-4 w-4" />
                        {profile.companyWebsite}
                      </a>
                    </div>
                  )}
                  {profile.companyAddress && (
                    <div>
                      <p className="text-gray-400 text-sm mb-1">{t('employerProfile.companyAddress')}</p>
                      <p className="text-white">{profile.companyAddress}</p>
                    </div>
                  )}
                </div>
              </div>

              {!profile.companyName && !profile.companyDescription && (
                <div className="text-center py-12">
                  <Building2 className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">{t('employerProfile.profileNotFilled')}</h3>
                  <p className="text-gray-400 mb-6">{t('employerProfile.fillProfileHint')}</p>
                  <button onClick={() => setIsEditing(true)} className="btn-primary">
                    {t('employerProfile.fillProfile')}
                  </button>
                </div>
              )}
            </div>
          )}
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className="bg-dark-surface rounded-lg p-8 border border-dark-card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">{t('employerProfile.applicationsTitle')}</h2>
            <button
              onClick={loadApplications}
              className="p-2 text-accent-cyan hover:bg-dark-card rounded-lg transition-colors"
              title={t('employerProfile.refreshApplications')}
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>
          {applications.length > 0 ? (
              <div className="space-y-4">
                {applications.map((app) => {
                  console.log('Rendering application:', app);
                  return (
                  <Card key={app.id} className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {app.user?.avatar ? (
                            <img
                              src={getImageUrl(app.user.avatar)}
                              alt={app.user.username} 
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-accent-cyan/20 flex items-center justify-center">
                              <UserIcon className="h-6 w-6 text-accent-cyan" />
                            </div>
                          )}
                          <div>
                            <h3 className="text-lg font-semibold text-white">
                              {app.user?.username || app.user?.email || t('employerProfile.user')}
                            </h3>
                            {app.user?.email && (
                              <p className="text-gray-400 text-sm">{app.user.email}</p>
                            )}
                          </div>
                        </div>
                        <div className="ml-16">
                          <p className="text-white font-medium mb-1">
                            {t('employerProfile.vacancy')}: {app.vacancy?.title || `#${app.vacancyId}` || t('employerProfile.vacancyDeleted')}
                          </p>
                          <p className="text-gray-400 text-sm mb-2">
                            {t('employerProfile.applicationSent')}: {new Date(app.createdAt).toLocaleDateString('ru-RU', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          {app.coverLetter && (
                            <div className="mt-3 p-3 bg-dark-card rounded-lg">
                              <p className="text-gray-300 text-sm whitespace-pre-wrap">{app.coverLetter}</p>
                            </div>
                          )}
                          {app.user?.resumes && app.user.resumes.length > 0 && (
                            <div className="mt-3">
                              <p className="text-gray-400 text-sm mb-1">{t('employerProfile.resume')}:</p>
                              <p className="text-accent-cyan text-sm">{app.user.resumes[0].title}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4 items-center flex-wrap">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                          app.status === 'accepted' ? 'bg-green-500/20 text-green-400' :
                          app.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {app.status === 'accepted' ? t('employerProfile.accepted') :
                           app.status === 'rejected' ? t('employerProfile.rejected') :
                           t('employerProfile.underReview')}
                        </span>
                        <button
                          onClick={() => handleViewResumes(app.userId)}
                          className="px-3 py-1.5 bg-accent-cyan/20 hover:bg-accent-cyan/30 text-accent-cyan rounded-lg text-sm transition-colors flex items-center gap-1 whitespace-nowrap"
                        >
                          <Eye className="h-4 w-4" />
                          {t('employerProfile.viewResume')}
                        </button>
                        {app.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateApplicationStatus(app.id, 'accepted')}
                              className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm transition-colors flex items-center gap-1 whitespace-nowrap"
                            >
                              <Check className="h-4 w-4" />
                              {t('employerProfile.accept')}
                            </button>
                            <button
                              onClick={() => handleUpdateApplicationStatus(app.id, 'rejected')}
                              className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-colors flex items-center gap-1 whitespace-nowrap"
                            >
                              <X className="h-4 w-4" />
                              {t('employerProfile.reject')}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <p className="text-gray-300 text-center py-8">
                  {t('employerProfile.noApplicationsYet')}
                  <br />
                  <span className="text-gray-400 text-sm">{t('employerProfile.makeActiveVacancies')}</span>
                </p>
              </Card>
            )}
          </div>
        )}

        {/* Vacancies Tab */}
        {activeTab === 'vacancies' && (
          <div className="bg-dark-surface rounded-lg p-8 border border-dark-card">
            <VacanciesManagement userId={user?.id} />
          </div>
        )}

        {/* Reputation Tab */}
        {activeTab === 'reputation' && (
          <div className="bg-dark-surface rounded-lg p-8 border border-dark-card">
            <h2 className="text-2xl font-bold text-white mb-6">{t('employerProfile.reputation.title')}</h2>
            <p className="text-gray-400 mb-6">{t('employerProfile.reputation.description')}</p>
            <button
              onClick={() => navigate('/companies')}
              className="btn-primary"
            >
              {t('employerProfile.reputation.viewRating')}
            </button>
          </div>
        )}

        {activeTab === 'profile' && <ChangePassword />}
      </div>

      {showResumeModal && viewingResumes.length > 0 && (
        <div 
          className="fixed inset-0 bg-black/75 flex items-center justify-center z-[100] p-4"
          onClick={() => setShowResumeModal(false)}
        >
          <div 
            className="max-w-4xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar relative z-[101]"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="w-full">
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {viewingResumes[currentResumeIndex].title}
                  </h2>
                  <p className="text-gray-400">
                    {viewingResumes[currentResumeIndex].user?.username || t('employerProfile.candidate')}
                  </p>
                </div>
                <button
                  onClick={() => setShowResumeModal(false)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-dark-surface rounded-lg transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {viewingResumes.length > 1 && (
                <div className="mb-6 pb-4 border-b border-dark-card">
                  <div className="text-sm text-gray-400">
                    {t('employerProfile.resumeCounter', { current: currentResumeIndex + 1, total: viewingResumes.length })}
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {viewingResumes[currentResumeIndex].description && (
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">{t('employerProfile.description')}</h3>
                    <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                      {viewingResumes[currentResumeIndex].description}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {viewingResumes[currentResumeIndex].location && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <MapPin className="h-5 w-5 text-accent-cyan" />
                      <span>{viewingResumes[currentResumeIndex].location}</span>
                    </div>
                  )}
                  {viewingResumes[currentResumeIndex].level && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <Briefcase className="h-5 w-5 text-accent-cyan" />
                      <span className="capitalize">{viewingResumes[currentResumeIndex].level}</span>
                    </div>
                  )}
                  {viewingResumes[currentResumeIndex].desiredSalary && (
                    <div className="flex items-center gap-2 text-accent-cyan font-semibold">
                      <span>от {viewingResumes[currentResumeIndex].desiredSalary.toLocaleString()} ₽</span>
                    </div>
                  )}
                </div>

                {viewingResumes[currentResumeIndex].skillsArray && viewingResumes[currentResumeIndex].skillsArray.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">{t('employerProfile.skills')}</h3>
                    <div className="flex flex-wrap gap-2">
                      {viewingResumes[currentResumeIndex].skillsArray.map((skill, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-accent-cyan/20 text-accent-cyan rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {viewingResumes[currentResumeIndex].experience && (
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                      <Award className="h-5 w-5 text-accent-cyan" />
                      {t('employerProfile.experience')}
                    </h3>
                    <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                      {viewingResumes[currentResumeIndex].experience}
                    </p>
                  </div>
                )}

                {viewingResumes[currentResumeIndex].education && (
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-accent-cyan" />
                      {t('employerProfile.education')}
                    </h3>
                    <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                      {viewingResumes[currentResumeIndex].education}
                    </p>
                  </div>
                )}

                {viewingResumes[currentResumeIndex].portfolio && (
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                      <Globe className="h-5 w-5 text-accent-cyan" />
                      {t('employerProfile.portfolio')}
                    </h3>
                    <a
                      href={viewingResumes[currentResumeIndex].portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-cyan hover:text-accent-cyan/80 transition-colors break-all"
                    >
                      {viewingResumes[currentResumeIndex].portfolio}
                    </a>
                  </div>
                )}

                <div className="pt-4 border-t border-dark-card">
                  <div className="flex gap-3 flex-wrap">
                    {viewingResumes.length > 1 && currentResumeIndex > 0 && (
                      <button
                        onClick={handlePrevResume}
                        className="btn-primary flex items-center gap-2"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        {t('employerProfile.previousResume')}
                      </button>
                    )}
                    {viewingResumes.length > 1 && currentResumeIndex < viewingResumes.length - 1 && (
                      <button
                        onClick={handleNextResume}
                        className="btn-primary flex items-center gap-2"
                      >
                        {t('employerProfile.nextResume')}
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        const userId = viewingResumes[currentResumeIndex].user?.id || viewingResumes[currentResumeIndex].userId;
                        if (userId) {
                          setShowResumeModal(false);
                          handleStartChat(userId);
                        }
                      }}
                      className="btn-primary flex items-center gap-2"
                    >
                      <MessageSquare className="h-4 w-4" />
                      {t('employerProfile.sendMessage')}
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={t('common.confirm')}
        cancelText={t('common.cancel')}
        variant={confirmModal.variant}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
      />
    </div>
  );
};

export default EmployerProfile;
