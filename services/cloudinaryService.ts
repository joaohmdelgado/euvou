const CLOUD_NAME = 'dajbjbsk7';
const UPLOAD_PRESET = 'euvou_presets';

export const cloudinaryService = {
    uploadImage: async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);

        try {
            const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Falha no upload da imagem');
            }

            const data = await response.json();
            return data.secure_url;
        } catch (error) {
            console.error('Erro ao fazer upload para o Cloudinary:', error);
            throw error;
        }
    }
};
