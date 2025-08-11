// src/pages/ProfilePage.js
import React, { useState } from "react";
import UserProfile from "../components/UserProfile";
import EditProfileForm from "../components/EditProfileForm";
import { ChangePasswordForm } from "../components/ChangePasswordForm";
import Modal from "../components/Modal";
import "../styles/pages/ProfilePage.css"; 

export default function ProfilePage({ user }) {
  const [showEdit, setShowEdit] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [profile, setProfile] = useState(user);

  const handleClose = () => window.history.back();

  const handleSaveEdit = (newUser) => {
    setProfile(newUser);
    setShowEdit(false);
    localStorage.setItem("user", JSON.stringify(newUser));
    window.dispatchEvent(new Event("storage"));
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
