import React, { useState } from 'react';
import { Lock, Delete, ShieldCheck, AlertCircle } from 'lucide-react';

interface PinLockModalProps {
  correctPin: string;
  onSuccess: () => void;
  language: 'bn' | 'en';
}

export const PinLockModal: React.FC<PinLockModalProps> = ({ correctPin, onSuccess, language }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleDigit = (digit: string) => {
    if (pin.length >= 4) return;
    const newPin = pin + digit;
    setPin(newPin);
    setError(false);

    if (newPin.length === 4) {
      if (newPin === correctPin) {
        onSuccess();
      } else {
        setError(true);
        setTimeout(() => {
          setPin('');
        }, 600);
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-xs flex flex-col items-center text-center my-auto">
        <div className="h-16 w-16 rounded-2xl bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 shadow-lg shadow-emerald-950/40">
          <Lock className="w-8 h-8" />
        </div>

        <h2 className="text-xl font-bold text-white tracking-tight">
          {language === 'bn' ? 'জীবনফাই ডেইলি পিন লক' : 'Jibonify Daily PIN Lock'}
        </h2>
        <p className="text-xs text-slate-400 mt-1 mb-6">
          {language === 'bn' ? 'আপনার ব্যক্তিগত হিসাব দেখতে ৪-সংখ্যার পিন দিন' : 'Enter 4-digit PIN to access your daily hisab'}
        </p>

        {/* 4 dots */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`h-4 w-4 rounded-full transition-all duration-200 ${
                idx < pin.length
                  ? error
                    ? 'bg-rose-500 scale-110 shadow-sm shadow-rose-500'
                    : 'bg-emerald-400 scale-110 shadow-sm shadow-emerald-400'
                  : 'bg-slate-700'
              }`}
            />
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-1.5 text-xs text-rose-400 mb-4">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'ভুল পিন কোড! আবার চেষ্টা করুন' : 'Incorrect PIN code! Try again'}</span>
          </div>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3 w-full">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleDigit(digit)}
              className="h-14 rounded-2xl bg-slate-900 border border-slate-800 text-xl font-bold text-white hover:bg-slate-800 active:scale-95 transition flex items-center justify-center shadow-xs"
            >
              {digit}
            </button>
          ))}
          <div className="flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-emerald-500/40" />
          </div>
          <button
            onClick={() => handleDigit('0')}
            className="h-14 rounded-2xl bg-slate-900 border border-slate-800 text-xl font-bold text-white hover:bg-slate-800 active:scale-95 transition flex items-center justify-center shadow-xs"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="h-14 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 active:scale-95 transition flex items-center justify-center shadow-xs"
          >
            <Delete className="w-6 h-6" />
          </button>
        </div>

        <p className="mt-6 text-xs text-slate-400">
          {language === 'bn' ? 'ডিফল্ট ডেমো পিন: 1234' : 'Default demo PIN: 1234'}
        </p>
      </div>
    </div>
  );
};
