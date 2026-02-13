import React, { useState, useRef } from 'react';
import { X, Upload, Instagram, CheckCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { Event, Participant } from '../types';
import { cloudinaryService } from '../services/cloudinaryService';
import { auth, googleProvider } from '../firebaseConfig';
import { signInWithPopup } from 'firebase/auth';

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

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      setFormData(prev => ({
        ...prev,
        name: user.displayName || prev.name,
        photoPreview: user.photoURL || prev.photoPreview,
        // Google doesn't provide these standardly without extra scopes/API calls, so we leave them
      }));
    } catch (error) {
      console.error("Google Sign-In Error", error);
      alert("Erro ao entrar com Google. Tente novamente.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalPhotoUrl = formData.photoPreview || 'https://i.pravatar.cc/150?u=default';

      if (formData.photoFile) {
        try {
          finalPhotoUrl = await cloudinaryService.uploadImage(formData.photoFile);
        } catch (uploadError) {
          console.error("Photo upload failed", uploadError);
          alert("Falha ao fazer upload da foto. Tente novamente.");
          setLoading(false);
          return;
        }
      }

      // Create a participant object
      const participantData: Partial<Participant> = {
        name: formData.name,
        age: parseInt(formData.age),
        gender: formData.gender as any,
        originCity: formData.originCity,
        instagramHandle: formData.instagramHandle,
        photoUrl: finalPhotoUrl
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

            <div className="p-6 pb-0">
              <Button
                type="button"
                variant="outline"
                fullWidth
                onClick={handleGoogleSignIn}
                className="flex items-center justify-center gap-2 mb-4 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 4.63c1.61 0 3.06.56 4.21 1.64l3.16-3.16C17.45 1.19 14.97 0 12 0 7.7 0 3.99 2.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Usar conta Google
              </Button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink-0 mx-4 text-gray-400 text-xs">Ou preencha manualmente</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-4">
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