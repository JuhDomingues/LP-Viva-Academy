export interface UserData {
  nome: string;
  email: string;
  telefone: string;
}

export interface MauticFormData {
  nome: string;
  email: string;
  telefone: string;
  formId: string;
  formName: string;
}

export class MauticAPI {
  private static readonly API_URL = import.meta.env.VITE_API_BASE_URL || '/api';

  static async submitForm(userData: UserData): Promise<boolean> {
    try {
      // Send to our backend proxy instead of directly to Mautic
      const response = await fetch(`${this.API_URL}/mautic`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: userData.nome,
          email: userData.email,
          telefone: userData.telefone,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Mautic API error:', error);
        throw new Error(error.error || 'Falha ao enviar dados');
      }

      const result = await response.json();
      console.log('Mautic submission successful:', result);

      return true;
    } catch (error) {
      console.error('Failed to submit form to Mautic:', error);
      throw new Error('Falha ao enviar dados. Por favor, tente novamente.');
    }
  }

  static validateUserData(userData: Partial<UserData>): {
    isValid: boolean;
    errors: Partial<Record<keyof UserData, string>>;
  } {
    const errors: Partial<Record<keyof UserData, string>> = {};

    if (!userData.nome?.trim()) {
      errors.nome = 'Nome é obrigatório';
    }

    if (!userData.email?.trim()) {
      errors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      errors.email = 'Email inválido';
    }

    if (!userData.telefone?.trim()) {
      errors.telefone = 'Telefone é obrigatório';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }
}
