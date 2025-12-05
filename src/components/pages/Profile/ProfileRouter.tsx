import { useOutletContext } from 'react-router-dom'
import { type OutletContext } from '../../../types'
import Profile from './Profile'
import EmployerProfile from './EmployerProfile'

const ProfileRouter = () => {
  const { user } = useOutletContext<OutletContext>()

  if (!user) {
    return null
  }

  if (user.role === 'employer') {
    return <EmployerProfile />
  }

  return <Profile />
}

export default ProfileRouter
















