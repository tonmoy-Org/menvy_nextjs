"use client";

import React from 'react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-4 mt-auto font-semibold">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
          {/* Copyright */}
          <div className="mb-2 md:mb-0">
            <p className="text-sm text-gray-600">
              © 2025 Menvy. Professional Shop Management System
            </p>
          </div>
          
          {/* Developer Credit */}
          <div className="text-sm text-gray-600">
            <span>Developed by </span>
            <Link 
              href="https://github.com/Tonmoy-Org" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              Md. Tanvir Hasan Tonmoy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;