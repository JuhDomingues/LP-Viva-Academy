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
  private static readonly MAUTIC_URL = 'https://mkt.vivaacademy.co';
  private static readonly FORM_ID = '3';
  private static readonly FORM_NAME = 'formagenteia';

  static async submitForm(userData: UserData): Promise<boolean> {
    try {
      const formData = new FormData();

      // Add form fields
      formData.append('mauticform[nome]', userData.nome);
      formData.append('mauticform[email]', userData.email);
      formData.append('mauticform[telefone]', userData.telefone);
      formData.append('mauticform[formId]', this.FORM_ID);
      formData.append('mauticform[formName]', this.FORM_NAME);
      formData.append('mauticform[submit]', '1');

      const response = await fetch(
        `${this.MAUTIC_URL}/form/submit?formId=${this.FORM_ID}`,
        {
          method: 'POST',
          body: formData,
          mode: 'no-cors', // Mautic may not have CORS enabled
        }
      );

      // With no-cors, we can't read the response, so we assume success
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
