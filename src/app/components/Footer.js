//components/Footer.js
import Link from 'next/link';

const Footer = () => (
  <footer className="bg-blue-600 text-white p-4">
    <div className="text-center">
      <p>&copy; 2024 PlacesToStay. All rights reserved.</p>
      <p>
        <Link href="/privacy" className="hover:underline">
          Privacy Policy
        </Link> 
        {' | '}
        <Link href="/terms" className="hover:underline">
          Terms of Service
        </Link>
      </p>
    </div>
  </footer>
);

export default Footer;
