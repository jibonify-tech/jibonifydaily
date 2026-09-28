import React from 'react';
import { X, Download, FileText } from 'lucide-react';
import { Language } from '../../types';

interface ReceiptViewerModalProps {
  imageUrl: string;
  title: string;
  onClose: () => void;
  language: Language;
}

export const ReceiptViewerModal: React.FC<ReceiptViewerModalProps> = ({
  imageUrl,
  title,
  onClose,
  language,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="relative max-w-2xl w-full rounded-2xl bg-slate-900 border border-slate-800 p-3 sm:p-4 shadow-2xl flex flex-col items-center my-auto max-h-[90vh] overflow-y-auto">
        <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
          <div className="flex items-center gap-2 text-white text-sm font-bold">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span className="truncate">{title}</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-[75vh] w-full flex items-center justify-center overflow-auto rounded-xl bg-slate-950 p-2 border border-slate-800">
          <img
            src={imageUrl}
            alt={title}
            className="max-h-[70vh] w-auto max-w-full rounded-lg object-contain"
          />
        </div>

        <div className="w-full flex items-center justify-end gap-2 mt-3 pt-2 border-t border-slate-800">
          <a
            href={imageUrl}
            download={`receipt-${Date.now()}.png`}
            className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 px-3 py-2 text-xs font-semibold text-white transition"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>{language === 'bn' ? 'ডাউনলোড' : 'Download'}</span>
          </a>
          <button
            onClick={onClose}
            className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-semibold text-white transition"
          >
            {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
