import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-serif text-xl text-accent mb-4">Ulacab</h3>
            <p className="text-sm text-primary-foreground/70">
              Singapore's first voice-activated chauffeur booking platform.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-cream">Services</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link to="#" className="hover:text-accent">Airport Transfer</Link></li>
              <li><Link to="#" className="hover:text-accent">City Transfer</Link></li>
              <li><Link to="#" className="hover:text-accent">Hourly Rental</Link></li>
              <li><Link to="#" className="hover:text-accent">Corporate</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-cream">Company</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link to="#" className="hover:text-accent">About Us</Link></li>
              <li><Link to="#" className="hover:text-accent">Careers</Link></li>
              <li><Link to="#" className="hover:text-accent">Press</Link></li>
              <li><Link to="#" className="hover:text-accent">Blog</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-cream">Support</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link to="#" className="hover:text-accent">Help Center</Link></li>
              <li><Link to="#" className="hover:text-accent">Terms of Service</Link></li>
              <li><Link to="#" className="hover:text-accent">Privacy Policy</Link></li>
              <li><Link to="#" className="hover:text-accent">Contact Us</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-primary-foreground/20 mt-12 pt-8 text-center text-sm text-primary-foreground/50">
          © {new Date().getFullYear()} Ulacab. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
