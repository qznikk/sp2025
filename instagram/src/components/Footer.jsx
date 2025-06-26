import React from 'react';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa'; // Wymaga `npm install react-icons`

export default function Footer() {
  const currentYear = new Date().getFullYear();

  // Obiekty stylów
  const footerStyles = {
    mainFooter: {
      backgroundColor: '#1f1f3a', // Ciemniejsze tło, jak karty w dashboardzie
      color: '#e0e0e0', // Jasny tekst
      padding: '50px 20px',
      fontFamily: 'Arial, sans-serif',
    },
    footerContent: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '30px',
      maxWidth: '1200px',
      margin: '0 auto',
    },
    footerSection: {
      padding: '0 15px',
    },
    heading: {
      color: '#8a2be2', // Głęboki fiolet, jako kolor nagłówka
      marginBottom: '20px',
      fontSize: '1.3em',
      borderBottom: '2px solid #3d007c', // Fioletowa linia
      paddingBottom: '10px',
      display: 'inline-block',
    },
    paragraph: {
      lineHeight: '1.6',
      marginBottom: '15px',
      color: '#b0b0b0', // Jaśniejszy szary dla tekstu akapitowego
    },
    contactInfoSpan: {
      display: 'block',
      marginBottom: '10px',
    },
    icon: {
      marginRight: '10px',
      color: '#8a2be2', // Fioletowe ikony
    },
    socialLink: {
      color: '#e0e0e0', // Jasny kolor ikon społecznościowych
      fontSize: '1.5em',
      marginRight: '15px',
      transition: 'color 0.3s ease',
      textDecoration: 'none',
    },
    socialLinkHover: {
      color: '#9370db', // Jaśniejszy fiolet na hover
    },
    ul: {
      listStyle: 'none',
      padding: '0',
    },
    li: {
      marginBottom: '10px',
    },
    link: {
      color: '#e0e0e0', // Jasny kolor linków
      textDecoration: 'none',
      transition: 'color 0.3s ease',
    },
    linkHover: {
      color: '#9370db', // Jaśniejszy fiolet na hover
      textDecoration: 'underline',
    },
    newsletterForm: {
      display: 'flex',
      marginTop: '15px',
    },
    newsletterInput: {
      flexGrow: '1',
      padding: '10px',
      border: '1px solid #3d007c', // Fioletowa ramka
      borderRadius: '5px 0 0 5px',
      outline: 'none',
      fontSize: '1em',
      backgroundColor: '#2a2a47', // Ciemniejsze tło inputu
      color: '#e0e0e0', // Jasny tekst w inputu
    },
    newsletterButton: {
      backgroundColor: '#8a2be2', // Fioletowy przycisk
      color: 'white',
      border: 'none',
      padding: '10px 15px',
      borderRadius: '0 5px 5px 0',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
      fontSize: '1em',
    },
    newsletterButtonHover: {
      backgroundColor: '#6a0dad', // Ciemniejszy fiolet na hover
    },
    footerBottom: {
      textAlign: 'center',
      marginTop: '40px',
      paddingTop: '20px',
      borderTop: '1px solid #3d007c', // Fioletowa linia
      color: '#b0b0b0', // Jasny szary tekst
      fontSize: '0.9em',
    },
  };
  return (
    <footer style={footerStyles.mainFooter}>
      <div style={footerStyles.footerContent}>
        <div style={footerStyles.footerSection}>
          <h3 style={footerStyles.heading}>O Nas</h3>
          <p style={footerStyles.paragraph}>
            Jesteśmy firmą pasjonującą się tworzeniem innowacyjnych rozwiązań, które ułatwiają życie naszym klientom.
            Naszym celem jest dostarczanie produktów najwyższej jakości i doskonałej obsługi.
          </p>
          <div style={{ marginBottom: '15px' }}> {/* Dodatkowy div na kontakt-info */}
            <span style={footerStyles.contactInfoSpan}><i className="fas fa-map-marker-alt" style={footerStyles.icon}></i> Gliwice, Polska</span>
            <span style={footerStyles.contactInfoSpan}><i className="fas fa-phone" style={footerStyles.icon}></i> +48 123 456 789</span>
            <span style={footerStyles.contactInfoSpan}><i className="fas fa-envelope" style={footerStyles.icon}></i> kontakt@twojastrona.pl</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}> {/* Kontener na ikony społecznościowe */}
            <a href="https://www.facebook.com/profile.php?id=100014032571472" target="_blank" rel="noopener noreferrer" style={footerStyles.socialLink}><FaFacebookF /></a>
            <a href="https://www.instagram.com/muszka.z.uszkiem/" target="_blank" rel="noopener noreferrer" style={footerStyles.socialLink}><FaInstagram /></a>
            <a href="https://www.linkedin.com/in/miko%C5%82aj-mach-308b98316/" target="_blank" rel="noopener noreferrer" style={footerStyles.socialLink}><FaLinkedinIn /></a>
          </div>
        </div>

        <div style={footerStyles.footerSection}>
          <h3 style={footerStyles.heading}>Newsletter</h3>
          <p style={footerStyles.paragraph}>Bądź na bieżąco z naszymi nowościami i promocjami!</p>
          <form style={footerStyles.newsletterForm} onSubmit={(e) => { e.preventDefault(); alert('Dziękujemy za zapisanie się do newslettera!'); }}>
            <input type="email" placeholder="Twój adres e-mail" required style={footerStyles.newsletterInput} />
            <button type="submit" style={footerStyles.newsletterButton}>Zapisz się</button>
          </form>
        </div>
      </div>

      <div style={footerStyles.footerBottom}>
        <p>&copy; {currentYear} The worse Instragam. Wszelkie prawa zastrzeżone.</p>
      </div>
    </footer>
  );
}