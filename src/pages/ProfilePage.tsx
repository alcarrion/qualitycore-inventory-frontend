// src/pages/ProfilePage.tsx
import React, { useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import UserProfile from "../components/UserProfile";
import EditProfileForm from "../components/EditProfileForm";
import { ChangePasswordForm } from "../components/ChangePasswordForm";
import Modal from "../components/Modal";
import { setStoredUser } from "../services/authService";
import type { User } from "../types/models";
import type { LayoutContext } from "../types/context";
import "../styles/pages/ProfilePage.css";

export default function ProfilePage() {
  const { user } = useOutletContext<LayoutContext>();
  const [showEdit, setShowEdit] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [profile, setProfile] = useState<User>(user);
  const navigate = useNavigate();

  const handleClose = () => navigate('/dashboard');
  const handleSaveEdit = (newUser: unknown) => {
    setProfile(newUser as User);
    setShowEdit(false);
    setStoredUser(newUser as User);
  };
  const handleSavePass = () => { setShowPass(false); };

  return (
    <>
      <UserProfile
        user={profile}
        onClose={handleClose}
        onEditProfile={() => setShowEdit(true)}
        onChangePassword={() => setShowPass(true)}
      />
      {showEdit && (
        <Modal onClose={() => setShowEdit(false)}>
          <EditProfileForm user={profile} onSave={handleSaveEdit} onCancel={() => setShowEdit(false)} />
        </Modal>
      )}
      {showPass && (
        <Modal onClose={() => setShowPass(false)}>
          <ChangePasswordForm onSave={handleSavePass} onCancel={() => setShowPass(false)} />
        </Modal>
      )}
    </>
  );
}
