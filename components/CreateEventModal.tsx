import React, { useState, useRef } from 'react';
import { X, Upload, CheckCircle, Calendar, MapPin, DollarSign, User, FileText, Image as ImageIcon } from 'lucide-react';
import { Button } from './ui/Button';
import { EventCategory } from '../types';
import { CITIES } from '../constants';
import { cloudinaryService } from '../services/cloudinaryService';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialFormState = {
    title: '',
    description: '',
    city: 'São Paulo',
    date: '', // YYYY-MM-DD
    startTime: '', // HH:MM
    locationName: '',
    address: '',
    category: EventCategory.PARTY,
    price: '',
    duration: '4 horas',
    imageUrl: '',
    photoFile: null as File | null,
    participantsGoal: 100,
    organizer: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({
        ...prev,
        photoFile: file,
        imageUrl: URL.createObjectURL(file)
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Parse date and time using native Date with ISO format
      // formData.date is YYYY-MM-DD, startTime is HH:mm
      const dateObj = new Date(`${formData.date}T${formData.startTime}`);

      if (isNaN(dateObj.getTime())) {
        alert("Data ou horário inválidos");
        setLoading(false);
        return;
      }

      let finalImageUrl = formData.imageUrl;

      // Upload to Cloudinary if a file is selected
      if (formData.photoFile) {
        try {
          finalImageUrl = await cloudinaryService.uploadImage(formData.photoFile);
        } catch (uploadError) {
          console.error("Image upload failed", uploadError);
          alert("Falha ao fazer upload da imagem. Tente novamente.");
          setLoading(false);
          return;
        }
      } else if (!finalImageUrl) {
        finalImageUrl = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1000';
      }

      const eventData = {
        title: formData.title,
        description: formData.description,
        city: formData.city,
        date: dateObj,
        startTime: formData.startTime,
        locationName: formData.locationName,
        address: formData.address,
        coordinates: { lat: -23.5505, lng: -46.6333 }, // Default mock coords
        category: formData.category,
        price: Number(formData.price) || 0,
        duration: formData.duration,
        imageUrl: finalImageUrl,
        participantsGoal: Number(formData.participantsGoal),
        organizer: formData.organizer || 'Organizador Anônimo',
      };

      await onSubmit(eventData);
      setStep('success');
      setTimeout(() => {
        onClose();
        setTimeout(() => {
          setStep('form');
          setFormData(initialFormState);
        }, 300);
      }, 2000);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Filter out 'Todas' from cities for the form
  const formCities = CITIES.filter(c => c !== 'Todas');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">

        {step === 'form' ? (
          <>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h2 className="text-lg font-bold text-gray-800">Criar Novo Evento</h2>
              <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-6 custom-scrollbar">
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Image Upload */}
                <div
                  className="w-full h-48 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-colors relative overflow-hidden group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {formData.imageUrl ? (
                    <>
                      <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-white font-medium">Trocar imagem</p>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center text-gray-400">
                      <ImageIcon className="w-10 h-10 mb-2" />
                      <span className="text-sm font-medium">Adicionar Capa do Evento</span>
                      <span className="text-xs mt-1">Clique para upload</span>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                  />
                </div>

                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Evento</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                      placeholder="Ex: Festival de Jazz no Parque"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                      >
                        {Object.values(EventCategory).map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                      <select
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                      >
                        {formCities.map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Horário</label>
                      <input
                        type="time"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Duração Est.</label>
                      <input
                        type="text"
                        name="duration"
                        value={formData.duration}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                        placeholder="Ex: 3 horas"
                      />
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-4 pt-2 border-t border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center">
                    <MapPin className="w-4 h-4 mr-1 text-brand-600" />
                    Localização
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Nome do Local</label>
                      <input
                        type="text"
                        name="locationName"
                        value={formData.locationName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                        placeholder="Ex: Parque Central"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Endereço Completo</label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                        placeholder="Rua, Número - Bairro"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-4 pt-2 border-t border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center">
                    <FileText className="w-4 h-4 mr-1 text-brand-600" />
                    Detalhes
                  </h3>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Descrição</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                      placeholder="Conte mais sobre o evento..."
                      required
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Valor do Ingresso (R$)</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                          <span className="text-xs">R$</span>
                        </div>
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                          placeholder="0 = Grátis"
                          min="0"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Meta de Participantes</label>
                      <input
                        type="number"
                        name="participantsGoal"
                        value={formData.participantsGoal}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                        placeholder="Ex: 100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Organizador</label>
                      <input
                        type="text"
                        name="organizer"
                        value={formData.organizer}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                        placeholder="Nome ou Empresa"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button type="submit" fullWidth disabled={loading} size="lg">
                    {loading ? 'Criando Evento...' : 'Publicar Evento'}
                  </Button>
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="p-10 flex flex-col items-center justify-center text-center h-full">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 animate-bounce">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Evento Criado! 🚀</h3>
            <p className="text-gray-600">Seu evento já está disponível na lista para todos.</p>
          </div>
        )}
      </div>
    </div>
  );
};