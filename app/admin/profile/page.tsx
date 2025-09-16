/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Edit,
  Save,
  X,
  Lock,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "seller";
  phone?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  twoFactorEnabled: boolean;
}

export default function AdminProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [twoFAData, setTwoFAData] = useState({ qrCodeUrl: "", secret: "" });
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      const response = await fetch(`/api/users/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.user);
        setFormData({
          name: data.user.name,
          phone: data.user.phone || "",
          address: data.user.address || "",
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        toast.error("Failed to fetch profile");
      }
    } catch (error) {
      toast.error("Error fetching profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (
      formData.newPassword &&
      formData.newPassword !== formData.confirmPassword
    ) {
      toast.error("New passwords do not match");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const updateData: any = {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
      };

      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      const response = await fetch(`/api/users/${profile?._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        toast.success("Profile updated successfully");
        setIsEditing(false);
        fetchProfile();

        // Update localStorage user data
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        user.name = formData.name;
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to update profile");
      }
    } catch (error) {
      toast.error("Error updating profile");
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name,
        phone: profile.phone || "",
        address: profile.address || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
    setIsEditing(false);
  };

  const enable2FA = async () => {
    try {
      const res = await fetch("/api/auth/enable-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: profile?._id }),
      });

      const data = await res.json();
      if (res.ok) {
        setTwoFAData({
          qrCodeUrl: data.qrCodeUrl,
          secret: data.secret
        });
        setIs2FAModalOpen(true);
      } else {
        toast.error(data.error || "Failed to enable 2FA");
      }
    } catch (error) {
      toast.error("Error enabling 2FA");
    }
  };

  const verify2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    setIsVerifying(true);
    try {
      const response = await fetch("/api/auth/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: profile?._id,
          token: verificationCode
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("2FA enabled successfully");
        setIs2FAModalOpen(false);
        setVerificationCode("");
        fetchProfile();
      } else {
        toast.error(data.error || "Verification failed");
      }
    } catch (error) {
      toast.error("Error verifying 2FA code");
    } finally {
      setIsVerifying(false);
    }
  };

  const disable2FA = async () => {
    try {
      const res = await fetch("/api/auth/disable-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: profile?._id }),
      });
      if (res.ok) {
        toast.success("2FA disabled");
        fetchProfile();
      } else {
        toast.error("Failed to disable 2FA");
      }
    } catch (error) {
      toast.error("Error disabling 2FA");
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout requiredRole="admin">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout requiredRole="admin">
        <div className="text-center py-12">
          <p className="text-gray-600">Failed to load profile</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600 mt-2">
              Manage your account settings and information
            </p>
          </div>
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-sky-300 hover:bg-sky-400 text-black"
            >
              <Edit className="w-5 h-5 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="w-5 h-5 mr-2" />
                Save Changes
              </Button>
              <Button onClick={handleCancel} variant="outline">
                <X className="w-5 h-5 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Overview */}
          <Card className="lg:col-span-1">
            <CardHeader className="text-center">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-12 h-12 text-blue-600" />
              </div>
              <CardTitle className="text-xl">{profile.name}</CardTitle>
              <CardDescription>{profile.email}</CardDescription>
              <Badge variant="default" className="w-fit mx-auto mt-2">
                <Shield className="w-3 h-3 mr-1" />
                {profile.role.toUpperCase()}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3 text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-gray-600">Member since</p>
                  <p className="font-medium">
                    {new Date(profile.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <div
                  className={`w-3 h-3 rounded-full ${profile.isActive ? "bg-green-500" : "bg-red-500"
                    }`}
                ></div>
                <div>
                  <p className="text-gray-600">Account Status</p>
                  <p className="font-medium">
                    {profile.isActive ? "Active" : "Inactive"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Details */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and contact details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                    />
                  ) : (
                    <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                      <User className="w-4 h-4 text-gray-400" />
                      <span>{profile.name}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{profile.email}</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Email cannot be changed
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder="Enter phone number"
                    />
                  ) : (
                    <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{profile.phone || "Not provided"}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                    <Shield className="w-4 h-4 text-gray-400" />
                    <span className="capitalize">{profile.role}</span>
                  </div>
                  <p className="text-xs text-gray-500">Role cannot be changed</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                {isEditing ? (
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    rows={3}
                    placeholder="Enter your address"
                  />
                ) : (
                  <div className="flex items-start space-x-2 p-2 bg-gray-50 rounded">
                    <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                    <span>{profile.address || "Not provided"}</span>
                  </div>
                )}
              </div>

              {isEditing && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium mb-4">Change Password</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={formData.currentPassword}
                        onChange={(e) =>
                          handleChange("currentPassword", e.target.value)
                        }
                        placeholder="Enter current password"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={formData.newPassword}
                        onChange={(e) =>
                          handleChange("newPassword", e.target.value)
                        }
                        placeholder="Enter new password"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          handleChange("confirmPassword", e.target.value)
                        }
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Leave password fields empty if you don't want to change your
                    password
                  </p>
                </div>
              )}

              {/* 🔐 2FA Section */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  <Lock className="w-5 h-5 mr-2" />
                  Two-Factor Authentication
                </h3>
                {profile.twoFactorEnabled ? (
                  <div className="space-y-2">
                    <p className="text-green-600">
                      ✅ 2FA is enabled on your account.
                    </p>
                    <Button
                      className="bg-red-600 hover:bg-red-700"
                      onClick={disable2FA}
                    >
                      Disable 2FA
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-gray-600">
                      2FA is currently disabled. Enable it for extra security.
                    </p>
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      onClick={enable2FA}
                    >
                      Enable 2FA
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 2FA Modal */}
      <Dialog open={is2FAModalOpen} onOpenChange={setIs2FAModalOpen}>
        <DialogContent className="sm:max-w-lg p-2">
          <DialogHeader>
            <DialogTitle className="p-2">Mobile Authenticator Setup</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4 p-4">
            {twoFAData.qrCodeUrl && (
              <div className="p-2 bg-white rounded">
                <Image
                  src={twoFAData.qrCodeUrl}
                  alt="2FA QR Code"
                  width={200}
                  height={200}
                  className="mx-auto"
                />
              </div>
            )}
            <div className="text-sm text-left space-y-2">
              <p>1. Install one of the following applications on your mobile:</p>
              <ul className="list-disc list-inside">
                <li>FreeOTP Authenticator</li>
                <li>Microsoft Authenticator</li>
                <li>Google Authenticator</li>
              </ul>
              <p>2. Open the application and enter the key:</p>
              <p className="font-mono bg-gray-100 p-2 rounded mt-1">{twoFAData.secret}</p>
              <p>4. Enter the one-time code provided by the application and click Submit to finish the setup.</p>
              <p>Provide a Device Name to help you manage your OTP devices.</p>
            </div>
            <div className="w-full space-y-2">
              <Label htmlFor="verificationCode">Verification Code</Label>
              <Input
                id="verificationCode"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
              />
            </div>
            <Button
              onClick={verify2FA}
              disabled={isVerifying || verificationCode.length !== 6}
              className="w-full"
            >
              {isVerifying ? "Verifying..." : "Verify and Enable 2FA"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}