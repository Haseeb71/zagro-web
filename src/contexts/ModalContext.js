import React, { createContext, useContext, useState } from 'react';
import CustomModal from '../components/CustomModal';

const ModalContext = createContext();

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

export const ModalProvider = ({ children }) => {
  const [modal, setModal] = useState({
    isOpen: false,
    title: "Are you sure?",
    subtitle: "Grab a 20% discount for your first purchase using the code BARGAIN.",
    highlightText: "BARGAIN",
    buttons: [
      { text: "BACK TO THE STORE", variant: "primary", onClick: () => {} },
      { text: "NO, THANKS", variant: "secondary", onClick: () => {} }
    ],
    disclaimer: "For first-time customers only.",
    showCloseButton: true,
    overlayClickable: true,
    rightImage: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=800&fit=crop"
  });

  const showModal = (modalData) => {
    setModal({
      ...modal,
      ...modalData,
      isOpen: true
    });
  };

  const hideModal = () => {
    setModal(prev => ({
      ...prev,
      isOpen: false
    }));
  };

  const updateModal = (updates) => {
    setModal(prev => ({
      ...prev,
      ...updates
    }));
  };

  const value = {
    modal,
    showModal,
    hideModal,
    updateModal
  };

  return (
    <ModalContext.Provider value={value}>
      {children}
      <CustomModal
        isOpen={modal.isOpen}
        onClose={hideModal}
        title={modal.title}
        subtitle={modal.subtitle}
        highlightText={modal.highlightText}
        buttons={modal.buttons}
        disclaimer={modal.disclaimer}
        showCloseButton={modal.showCloseButton}
        overlayClickable={modal.overlayClickable}
        rightImage={modal.rightImage}
      />
    </ModalContext.Provider>
  );
};
