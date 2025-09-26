// Push notification manager for Helio app
// Handles service worker registration, permission requests, and sending push notifications

class PushNotificationManager {
  constructor() {
    this.registration = null;
    this.subscription = null;
    this.vapidPublicKey = 'BK8J5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K'; // Demo key
  }

  async init() {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      console.warn('Push notifications not supported - no browser environment');
      return false;
    }
    
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications not supported');
      return false;
    }

    try {
      // Register service worker
      this.registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service worker registered');

      // Request permission
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        console.warn('Push notification permission denied');
        return false;
      }

      // Subscribe to push notifications
      await this.subscribe();
      return true;
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
      return false;
    }
  }

  async requestPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission;
    }
    return 'denied';
  }

  async subscribe() {
    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
      });
      
      this.subscription = subscription;
      console.log('Push subscription created');
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Send push notification (simulated for demo - in production this would be server-side)
  async sendPushNotification(notificationData) {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      console.warn('Push notifications not available - no browser environment');
      return;
    }

    // In production, this would be sent to your backend server
    // which would then send the push notification via Web Push Protocol
    // For demo purposes, we'll use the local notification API
    try {
      if ('Notification' in window && Notification.permission === 'granted') {
        const notification = new Notification(notificationData.title, {
          body: notificationData.message,
          icon: '/favicon.ico',
          tag: notificationData.type,
          requireInteraction: notificationData.type === 'emergency_request' || notificationData.type === 'incoming_call',
          vibrate: notificationData.type === 'incoming_call' ? [200, 100, 200] : [100]
        });

        // Auto close after 5 seconds for non-critical notifications
        if (notificationData.type !== 'incoming_call' && notificationData.type !== 'emergency_request') {
          setTimeout(() => notification.close(), 5000);
        }

        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      }
    } catch (error) {
      console.error('Failed to send push notification:', error);
    }
  }

  // Check if push notifications are supported and enabled
  isSupported() {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
    return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  }

  // Get current permission status
  getPermissionStatus() {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission;
  }
}

// Create singleton instance
const pushNotificationManager = new PushNotificationManager();

export default pushNotificationManager;