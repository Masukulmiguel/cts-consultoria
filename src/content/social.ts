export type SocialLink = {
  key: 'facebook' | 'linkedin' | 'instagram' | 'whatsapp';
  label: string;
  href: string;
};

export const socialLinks: SocialLink[] = [
  {
    key: 'facebook',
    label: 'Facebook',
    href: 'https://www.facebook.com/consultoriacts',
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/consultoriacts',
  },
  {
    key: 'instagram',
    label: 'Instagram',
    href: 'https://www.instagram.com/consultoriacts',
  },
  {
    key: 'whatsapp',
    label: 'WhatsApp',
    href: 'https://wa.me/244958893484',
  },
];
