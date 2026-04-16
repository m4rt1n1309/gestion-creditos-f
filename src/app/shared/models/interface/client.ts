import { Credit } from './credit';

export interface Client {
  dni: string;
  initials: string;
  avatarColor: string;
  name: string;
  phone: string;
  credits: number;
  risk: 'Al dia' | 'Mora leve' | 'Mora alta';
}

export interface ClientDetail {
  dni: string;
  initials: string;
  avatarColor: string;
  name: string;
  phone: string;
  email: string;
  direccion: string;
  ciudad: string;
  risk: 'Al dia' | 'Mora leve' | 'Mora alta';
  credits: Credit[];
}
