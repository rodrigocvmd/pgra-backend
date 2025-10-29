"use client";

import { useEffect } from 'react';

interface CustomAlertProps {
  message: string;
  onClose: () => void;
  type?: 'success' | 'error' | 'info';
}

export default function CustomAlert({ message, onClose, type = 'error' }: CustomAlertProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // Fecha o alerta após 3 segundos

    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  }[type];

  return (
    <div className={`fixed top-5 right-5 p-4 rounded-lg text-white ${bgColor} shadow-lg z-50`}>
      <p>{message}</p>
      <button onClick={onClose} className="absolute top-1 right-2 text-white font-bold">&times;</button>
    </div>
  );
}
