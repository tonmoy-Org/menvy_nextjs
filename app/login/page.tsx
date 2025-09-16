"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Eye, EyeOff, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import TwoFactorModal from '@/components/TwoFactorModal/TwoFactorModal';
import logo from '@/public/logo.png'
import Image from 'next/image';
import Link from 'next/link';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLogin = async (twoFactorCode?: string) => {
    setIsLoading(true);

    try {
      const payload = twoFactorCode
        ? { ...formData, twoFactorCode, userId }
        : formData;

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.requiresTwoFactor && !twoFactorCode) {
          // First step: credentials are valid, need 2FA code
          setRequiresTwoFactor(true);
          setUserId(data.userId);
          toast.info('Please enter your 2FA code');
        } else {
          // Login successful (with or without 2FA)
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));

          toast.success(`Welcome back, ${data.user.name}!`);

          // Redirect based on role
          if (data.user.role === 'admin') {
            router.push('/admin/dashboard');
          } else {
            router.push('/seller/dashboard');
          }
        }
      } else {
        toast.error(data.error || 'Login failed');
      }
    } catch (error) {
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin();
  };

  const handleTwoFactorVerify = async (code: string) => {
    await handleLogin(code);
  };

  const handleTwoFactorCancel = () => {
    setRequiresTwoFactor(false);
    setUserId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-white rounded-md shadow-xl p-8">
            <div className="text-center mb-8">
              <Image src={logo} alt="Menvy Logo" className="mx-auto mb-4 w-44 h-full" />
              <p className="text-black mt-1 text-xl font-bold">Welcome To</p>
              <p className="text-gray-600 mt-1 text-sm">Menvy Shop Management System</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    className="h-12 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-sky-300 hover:bg-sky-400 text-black font-medium"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            {/* <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="text-center text-sm text-gray-600">
                <p>Demo Credentials:</p>
                <p className="mt-1">
                  <span className="font-medium">Admin:</span> admin@menvy.store / admin123
                </p>
                <p>
                  <span className="font-medium">Seller:</span> seller@menvy.store / seller123
                </p>
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/seed', { method: 'POST' });
                      const data = await response.json();
                      if (response.ok) {
                        toast.success('Demo users created successfully!');
                      } else {
                        toast.info(data.message || 'Demo users already exist');
                      }
                    } catch (error) {
                      toast.error('Failed to create demo users');
                    }
                  }}
                  className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  Create Demo Users (Click if login fails)
                </button>
              </div>
            </div> */}
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="container flex items-center justify-between mx-auto px-28">
          <div className="text-center text-sm text-gray-500">
            © 2025 Menvy. Professional Shop Management System
          </div>
          <div>
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

      {requiresTwoFactor && userId && (
        <TwoFactorModal
          userEmail={formData.email}
          userId={userId}
          onVerify={handleTwoFactorVerify}
          onCancel={handleTwoFactorCancel}
        />
      )}
    </div>
  );
}