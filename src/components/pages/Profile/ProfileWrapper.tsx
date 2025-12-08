import { useOutletContext, useSearchParams } from 'react-router-dom';
import { OutletContext } from '../../../types';
import GraduateProfile from './Profile';
import EmployerProfile from './EmployerProfile';
import { ParmaTour } from '../../mascot';

const ProfileWrapper = () => {
  const { user } = useOutletContext<OutletContext>();
  const [searchParams] = useSearchParams();

  // Проверяем, нужно ли запустить тур (после регистрации)
  const shouldStartTour = searchParams.get('tour') === 'start';

  if (!user) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-white text-xl">Необходимо авторизоваться</div>
      </div>
    );
  }

  const role = user.role || 'graduate';

  return (
    <>
      {/* Тур по сайту */}
      <ParmaTour
        role={role}
        autoStart={shouldStartTour}
      />

      {/* Профиль */}
      {role === 'employer' ? <EmployerProfile /> : <GraduateProfile />}
    </>
  );
};

export default ProfileWrapper;
