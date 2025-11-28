import { useOutletContext } from 'react-router-dom';
import { OutletContext } from '../../../types';
import GraduateProfile from './Profile';
import EmployerProfile from './EmployerProfile';

const ProfileWrapper = () => {
  const { user } = useOutletContext<OutletContext>();

  if (!user) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-white text-xl">Необходимо авторизоваться</div>
      </div>
    );
  }

  return user.role === 'employer' ? <EmployerProfile /> : <GraduateProfile />;
};

export default ProfileWrapper;
