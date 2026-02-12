import React, { useState, useRef } from 'react';
import { X, Upload, Instagram, CheckCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { Event, Participant } from '../types';

interface RsvpModalProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: any) => Promise<void>;
}

export const RsvpModal: React.FC<RsvpModalProps> = ({ event, isOpen, onClose, onConfirm }) => {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Prefiro não dizer',
    originCity: '',
    instagramHandle: '',
    photoFile: null as File | null,
    photoPreview: ''
  });

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({
        ...prev,
        photoFile: file,
        photoPreview: URL.createObjectURL(file)
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create a participant object
      const participantData: Partial<Participant> = {
        name: formData.name,
        age: parseInt(formData.age),
        gender: formData.gender as any,
        originCity: formData.originCity,
        instagramHandle: formData.instagramHandle,
        photoUrl: formData.photoPreview || 'https://i.pravatar.cc/150?u=default' // Fallback
      };

      await onConfirm(participantData);
      setStep('success');
      setTimeout(() => {
        onClose();
        // Reset state after closing
        setTimeout(() => setStep('form'), 300);
      }, 2000);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {step === 'form' ? (
          <>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h2 className="text-lg font-bold text-gray-800">Confirmar Presença</h2>
              <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="text-center mb-4">
                <div 
                  className="w-24 h-24 rounded-full bg-gray-100 mx-auto mb-2 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 cursor-pointer hover:border-brand-400 transition-colors relative"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {formData.photoPreview ? (
                    <img src={formData.photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center text-gray-400">
                      <Upload className="w-6 h-6 mb-1" />
                      <span className="text-xs">Sua Foto</span>
                    </div>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept="image/*"
                  required 
                />
                <p className="text-xs text-gray-500">Clique para adicionar uma foto (obrigatório)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                  placeholder="Seu nome"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Idade</label>
                  <input 
                    type="number" 
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                    placeholder="25"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gênero</label>
                  <select 
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                  >
                    <option>Masculino</option>
                    <option>Feminino</option>
                    <option>Outro</option>
                    <option>Prefiro não dizer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cidade de Origem</label>
                <input 
                  type="text" 
                  name="originCity"
                  value={formData.originCity}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                  placeholder="Ex: São Paulo"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Instagram (Opcional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Instagram className="w-4 h-4" />
                  </div>
                  <input 
                    type="text" 
                    name="instagramHandle"
                    value={formData.instagramHandle}
                    onChange={handleInputChange}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                    placeholder="@seu.perfil"
                  />
                </div>
              </div>

              <Button type="submit" fullWidth disabled={loading} size="lg">
                {loading ? 'Confirmando...' : `Confirmar Presença em ${event.title}`}
              </Button>
              
              <p className="text-xs text-center text-gray-400 mt-2">
                Ao confirmar, seu perfil ficará visível na lista do evento.
              </p>
            </form>
          </>
        ) : (
          <div className="p-10 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 animate-bounce">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Você vai! 🎉</h3>
            <p className="text-gray-600">Sua presença foi confirmada no evento.</p>
          </div>
        )}
      </div>
    </div>
  );
};