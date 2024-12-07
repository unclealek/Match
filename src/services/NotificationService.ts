import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { app, messaging as appMessaging } from '../config/firebase';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

class NotificationService {
  private messaging: Messaging | null;

  constructor() {
    this.messaging = appMessaging;
    if (this.messaging) {
      this.setupForegroundListener();
    }
  }

  async requestPermission(userId: string): Promise<void> {
    if (!this.messaging || !('Notification' in window)) {
      console.warn('Notifications are not supported in this environment');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const token = await this.getToken();
        if (token) {
          await this.saveTokenToDatabase(userId, token);
        }
      } else {
        console.warn('Notification permission denied');
      }
    } catch (error) {
      console.error('Failed to get notification permission:', error);
    }
  }

  private async getToken(): Promise<string | null> {
    if (!this.messaging) return null;

    try {
      const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
      if (!vapidKey) {
        throw new Error('VAPID key not found in environment variables');
      }

      const currentToken = await getToken(this.messaging, {
        vapidKey
      });

      if (!currentToken) {
        throw new Error('Failed to generate FCM token');
      }

      return currentToken;
    } catch (error) {
      console.error('Failed to get FCM token:', error);
      return null;
    }
  }

  private async saveTokenToDatabase(userId: string, token: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        fcmToken: token,
        tokenLastUpdated: new Date()
      });
      console.log('FCM token saved successfully');
    } catch (error) {
      console.error('Failed to save FCM token:', error);
    }
  }

  private setupForegroundListener(): void {
    if (!this.messaging) return;

    try {
      onMessage(this.messaging, (payload) => {
        console.log('Received foreground message:', payload);
        
        if (!payload.notification) {
          console.warn('Received message without notification data');
          return;
        }

        const { title, body } = payload.notification;
        if (!title) {
          console.warn('Received notification without title');
          return;
        }

        this.showNotification(title, body || '', payload.data);
      });
    } catch (error) {
      console.error('Error setting up message listener:', error);
    }
  }

  private showNotification(title: string, body: string, data: any = {}): void {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return;
    }

    if (Notification.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    try {
      const notificationOptions: NotificationOptions = {
        body,
        icon: '/logo192.png',
        badge: '/logo192.png',
        tag: data?.tag || 'default',
        data
      };

      new Notification(title, notificationOptions);
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }
}

export const notificationService = new NotificationService();
