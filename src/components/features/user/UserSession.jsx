import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import UserDropdownMenu from './UserDropdownMenu';
import styles from './UserSession.module.css';
import { IoMdArrowDropdown } from 'react-icons/io';

const UserSession = () => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleMouseEnter = () => {
    setIsDropdownVisible(true);
  };

  const handleMouseLeave = () => {
    setIsDropdownVisible(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Redirect to homepage after logout
      navigate('/');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const getUserName = () => {
    if (!currentUser) return 'Identifícate';
    if (currentUser.displayName) return currentUser.displayName.split(' ')[0];
    return currentUser.email.split('@')[0];
  };

  return (
    <div
      className={styles['user-session-container']}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles['user-info']}>
        <span className={styles['greeting']}>Hola,</span>
        <span className={styles['username']}>
          {getUserName()}
        </span>
      </div>
      <IoMdArrowDropdown className={styles['dropdown-arrow']} />
      <UserDropdownMenu
        isVisible={isDropdownVisible}
        isLoggedIn={!!currentUser}
        onLogout={handleLogout}
      />
    </div>
  );
};

export default UserSession;
