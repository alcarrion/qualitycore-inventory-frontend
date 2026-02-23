// src/pages/ProfilePage.js
import React, { useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import UserProfile from "../components/UserProfile";
import EditProfileForm from "../components/EditProfileForm";
import { ChangePasswordForm } from "../components/ChangePasswordForm";
import Modal from "../components/Modal";
import { setStoredUser } from "../services/authService";
import "../styles/pages/ProfilePage.css";

export default function ProfilePage() {
  const { user } = useOutletContext();
  const [showEdit, setShowEdit] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [profile, setProfile] = useState(user);

  const navigate = useNavigate();
  const handleClose = () => navigate('/dashboard');

  const handleSaveEdit = (newUser) => {
    setProfile(newUser);
    setShowEdit(false);
    setStoredUser(newUser);
  };

  const handleSavePass = () => {
    setShowPass(false);
  };

  const handleEditProfile = () => setShowEdit(true);
  const handleChangePassword = () => setShowPass(true);

  return (
    <>
      <UserProfile
        user={profile}
        onClose={handleClose}
        onEditProfile={handleEditProfile}
        onChangePassword={handleChangePassword}
      />

      {showEdit && (
        <Modal onClose={() => setShowEdit(false)}>
          <EditProfileForm
            user={profile}
            onSave={handleSaveEdit}
            onCancel={() => setShowEdit(false)}
          />
        </Modal>
      )}

      {showPass && (
        <Modal onClose={() => setShowPass(false)}>
          <ChangePasswordForm
            onSave={handleSavePass}
            onCancel={() => setShowPass(false)}
          />
        </Modal>
      )}
    </>
  );
}
