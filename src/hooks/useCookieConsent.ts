import { useEffect } from 'react';
import { useCookieConsentStore } from '@/stores/CookieConsent.store';
import { useBottomBannerStore } from '@/stores/Banner.store';

export function useCookieConsent() {
  const consent = useCookieConsentStore((state) => state.consent);
  const setConsent = useCookieConsentStore((state) => state.setConsent);
  const showBanner = useBottomBannerStore((state) => state.showBanner);

  useEffect(() => {
    if (consent === null) {
      setTimeout(() => {
        showBanner({
          title: '¿Te gustaría aceptar nuestras cookies? 🍪',
          description:
            'Este sitio utiliza cookies esenciales para garantizar su correcto funcionamiento y mejorar tu experiencia de navegación.',
          link: 'https://pitmydoro.com/politica-de-cookies',
          smallText:
            'Al hacer clic en "Aceptar", aceptas el uso de cookies. Puedes aceptar o rechazar su uso en cualquier momento.',
          declineText: 'Rechazar',
          acceptText: 'Aceptar',
          image: '/images/cookie.png',
          onAccept: () => {
            setConsent('accepted');
            if (Notification && Notification.permission !== 'granted')
              Notification.requestPermission();
          },
          onDecline: () => setConsent('declined'),
        });
      }, 2500);
    }
  }, [consent, setConsent, showBanner]);
}
