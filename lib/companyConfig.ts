
export type CompanyId = 'ELITE' | 'JAG' | 'TSS' | 'RIGHT';

export interface CompanyProfile {
  id: CompanyId;
  name: string;
  logo: string;
  color: {
    primary: string;   // For headers/buttons (tailwind class)
    secondary: string; // For accents (tailwind class)
    text: string;      // Specific text color (tailwind class)
    gradient?: string; // For special looks (tailwind class)
  };
  contact: {
    email: string;
    website?: string;
    phones: string[];
    address: string;
    cr?: string;       // Commercial Registration Number
    vat?: string;      // VAT Registration Number
  };
  bank?: {
    name: string;
    accountName: string;
    iban: string;
    swift?: string;
  };
}

export const COMPANY_CONFIG: Record<CompanyId, CompanyProfile> = {
  ELITE: {
    id: 'ELITE',
    name: 'ElitePro Events & Advertising',
    logo: 'https://placehold.co/400x200/2d9a91/ffffff?text=ELITEPRO',
    color: {
      primary: 'bg-teal-600',
      secondary: 'border-teal-600',
      text: 'text-teal-700',
      gradient: 'bg-gradient-to-r from-teal-500 to-emerald-400'
    },
    contact: {
      email: 'firash@eliteproeventsksa.com',
      website: 'www.eliteproeventsksa.com',
      phones: ['+966 54 531 1018', '+966 53 706 0245'],
      address: 'Al Souq, Dammam 32242'
    },
    bank: {
      name: 'Al Rajhi Bank',
      accountName: 'ElitePro Events Est.',
      iban: 'SA42 8000 0000 6080 1010 2200'
    }
  },
  JAG: {
    id: 'JAG',
    name: 'JAG Arabia',
    // REPLACE THIS URL WITH YOUR UPLOADED LOGO FILE PATH
    logo: "https://placehold.co/600x250/ffffff/dc2626?text=JAG+ARABIA+LOGO",
    color: {
      primary: 'bg-red-600',
      secondary: 'border-red-600',
      text: 'text-slate-800',
      gradient: 'bg-red-700'
    },
    contact: {
      email: 'firashpc@gmail.com',
      phones: ['+966 54 531 1018'],
      address: 'Dammam, Saudi Arabia',
      cr: '7012235367',
      vat: '300581379100003'
    },
    bank: {
      name: 'SNB (Saudi National Bank)',
      accountName: 'JAG Arabia Trading',
      iban: 'SA98 1000 0000 2020 4040 5050'
    }
  },
  TSS: {
    id: 'TSS',
    name: 'TSS Advertising',
    logo: 'https://placehold.co/400x200/f97316/ffffff?text=TSS+ADV',
    color: {
      primary: 'bg-orange-500',
      secondary: 'border-orange-500',
      text: 'text-orange-600',
      gradient: 'bg-gradient-to-r from-orange-500 to-purple-600'
    },
    contact: {
      email: 'firashpc@gmail.com',
      phones: ['+966 50 234 5678'],
      address: 'Dammam, Saudi Arabia'
    },
    bank: {
      name: 'Riyad Bank',
      accountName: 'TSS Advertising',
      iban: 'SA55 2000 0000 9090 1010 3030'
    }
  },
  RIGHT: {
    id: 'RIGHT',
    name: 'Right Events',
    logo: 'https://placehold.co/400x200/000000/ffffff?text=RIGHT+EVENTS',
    color: {
      primary: 'bg-black',
      secondary: 'border-black',
      text: 'text-red-600',
      gradient: 'bg-black'
    },
    contact: {
      email: 'firashpc@gmail.com',
      phones: ['+966 50 384 9793'],
      address: 'Dammam, Saudi Arabia'
    },
    bank: {
      name: 'SAB (Saudi Awwal Bank)',
      accountName: 'Right Events Co.',
      iban: 'SA12 5500 0000 7070 8080 9090'
    }
  }
};
