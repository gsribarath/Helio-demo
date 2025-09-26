// Initialize push notifications on app startup
import { useEffect, useState } from 'react';

export const usePushNotifications = () => {
  const [pushManager, setPushManager] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('default');

  useEffect(() => {
    const initPushNotifications = async () => {
      try {
        // Only initialize in browser environment
        if (typeof window === 'undefined') return;
        
        const { default: manager } = await import('../utils/pushNotifications');
        setPushManager(manager);
        setIsSupported(manager.isSupported());
        setPermissionStatus(manager.getPermissionStatus());
        
        const initialized = await manager.init();
        if (initialized) {
          console.log('Push notifications initialized successfully');
          setPermissionStatus(manager.getPermissionStatus());
        } else {
          console.log('Push notifications not available or permission denied');
        }
      } catch (error) {
        console.error('Failed to initialize push notifications:', error);
      }
    };

    // Small delay to ensure DOM is ready
    setTimeout(initPushNotifications, 1000);
  }, []);

  return {
    isSupported,
    permissionStatus,
    pushManager
  };
};