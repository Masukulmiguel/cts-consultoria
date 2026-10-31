import { socialLinks } from '@/content/social';

function BrandIcon({ name }: { name: (typeof socialLinks)[number]['key'] }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'currentColor',
  } as const;

  if (name === 'facebook') {
    return (
      <svg {...common} aria-hidden="true" focusable="false">
        <path d="M14 8.5V7c0-.9.2-1.4 1.6-1.4H17V2.6h-2.6C11.2 2.6 10 4.4 10 6.7v1.8H7.5V12H10v9.4h4V12h2.6l.4-3.5H14Z" />
      </svg>
    );
  }

  if (name === 'linkedin') {
    return (
      <svg {...common} aria-hidden="true" focusable="false">
        <path d="M6.9 21H3V8.9h3.9V21ZM5 7.4A2.3 2.3 0 1 1 5 2.8a2.3 2.3 0 0 1 0 4.6ZM21 21h-3.9v-5.9c0-1.4 0-3.2-2-3.2s-2.2 1.5-2.2 3.1V21H9V8.9h3.7v1.6h.1a4 4 0 0 1 3.6-2c3.8 0 4.5 2.5 4.5 5.8V21Z" />
      </svg>
    );
  }

  if (name === 'instagram') {
    return (
      <svg {...common} aria-hidden="true" focusable="false">
        <path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2Zm0 3.1a6.7 6.7 0 1 0 0 13.4 6.7 6.7 0 0 0 0-13.4Zm0 11a4.3 4.3 0 1 1 0-8.6 4.3 4.3 0 0 1 0 8.6Zm8.5-11.2a1.6 1.6 0 1 1-3.1 0 1.6 1.6 0 0 1 3.1 0Z" />
      </svg>
    );
  }

  return (
    <svg {...common} aria-hidden="true" focusable="false">
      <path d="M12 2a10 10 0 0 0-8.7 15L2 22l5.2-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3.1.8.8-3-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.3 0-.5.1-.7l.5-.5c.1-.2.2-.3.3-.5 0-.2 0-.4 0-.5l-.7-1.7c-.2-.4-.4-.4-.5-.4h-.5c-.2 0-.5.1-.7.4-.2.2-.9.9-.9 2.1s.9 2.4 1 2.6c.1.2 1.7 2.7 4.2 3.8.6.2 1 .4 1.4.5.6.2 1.1.1 1.5.1.5 0 1.4-.6 1.6-1.2.2-.6.2-1.1.1-1.2l-.4-.2Z" />
    </svg>
  );
}

/**
 * Única fonte de ícones de redes sociais do site.
 * Só o rodapé importa este componente — nenhuma outra página os repete.
 */
export function SocialLinks({ className }: { className?: string }) {
  return (
    <ul className={className}>
      {socialLinks.map((social) => (
        <li key={social.key}>
          <a
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={social.label}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/15 text-white/70 transition duration-200 hover:-translate-y-0.5 hover:border-accent-500 hover:bg-accent-500 hover:text-white"
          >
            <BrandIcon name={social.key} />
          </a>
        </li>
      ))}
    </ul>
  );
}
