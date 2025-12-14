import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MauticAPI, type UserData } from '@/lib/mautic-api';
import { Loader2 } from 'lucide-react';

interface UserInfoFormProps {
  onSubmit: (userData: UserData) => void;
}

export function UserInfoForm({ onSubmit }: UserInfoFormProps) {
  const [formData, setFormData] = useState<UserData>({
    nome: '',
    email: '',
    telefone: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof UserData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof UserData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    const validation = MauticAPI.validateUserData(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    try {
      // Submit to Mautic
      await MauticAPI.submitForm(formData);

      // Call parent callback
      onSubmit(formData);
    } catch (error) {
      console.error('Failed to submit form:', error);
      setErrors({
        email: 'Erro ao enviar dados. Por favor, tente novamente.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div className="text-center mb-4">
        <h3 className="font-semibold text-lg text-gray-900 mb-2">
          Antes de começar...
        </h3>
        <p className="text-sm text-gray-600">
          Para personalizar nosso atendimento, precisamos de algumas informações
        </p>
      </div>

      {/* Nome */}
      <div>
        <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
          Nome <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="nome"
          value={formData.nome}
          onChange={(e) => handleChange('nome', e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
          placeholder="Seu nome completo"
          disabled={isSubmitting}
        />
        {errors.nome && (
          <p className="text-xs text-red-500 mt-1">{errors.nome}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
          placeholder="seu@email.com"
          disabled={isSubmitting}
        />
        {errors.email && (
          <p className="text-xs text-red-500 mt-1">{errors.email}</p>
        )}
      </div>

      {/* Telefone */}
      <div>
        <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-1">
          Telefone <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          id="telefone"
          value={formData.telefone}
          onChange={(e) => handleChange('telefone', e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
          placeholder="(00) 00000-0000"
          disabled={isSubmitting}
        />
        {errors.telefone && (
          <p className="text-xs text-red-500 mt-1">{errors.telefone}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full bg-primary hover:bg-primary/90"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Enviando...
          </>
        ) : (
          'Iniciar Conversa'
        )}
      </Button>

      <p className="text-xs text-gray-500 text-center">
        Seus dados estão seguros e serão usados apenas para melhorar seu atendimento
      </p>
    </form>
  );
}
