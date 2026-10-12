import { whatsappUrl } from "@/lib/whatsapp";

const message = "Olá, CODE_PH! Gostaria de falar sobre os serviços.";

export default function WhatsAppFloat() {
  return (
    <a
      href={whatsappUrl(message)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar pelo WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-neon text-black shadow-[0_10px_30px_rgba(0,0,0,0.18)] transition-colors hover:bg-neon-deep md:bottom-7 md:right-7"
    >
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12.04 2c-5.46 0-9.9 4.44-9.9 9.9 0 1.74.46 3.44 1.32 4.94L2 22l5.3-1.39a9.86 9.86 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.44 9.9-9.9 0-2.64-1.03-5.13-2.9-7A9.82 9.82 0 0 0 12.04 2Zm0 1.67c2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.7 8.23-8.24 8.23a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.15.83.84-3.07-.2-.31a8.18 8.18 0 0 1-1.26-4.36c0-4.54 3.7-8.23 8.24-8.23Zm-3.6 4.3c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.23.9 2.42 1.03 2.59.13.17 1.78 2.72 4.4 3.72 2.18.83 2.62.66 3.1.62.48-.04 1.55-.63 1.77-1.24.22-.61.22-1.14.15-1.25-.06-.11-.23-.17-.48-.29-.25-.13-1.55-.76-1.79-.85-.24-.09-.42-.13-.59.13-.17.25-.67.85-.82 1.02-.15.17-.3.19-.55.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.25-1.49-1.4-1.74-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.55-1.43-.79-1.96-.2-.47-.42-.5-.59-.51-.15-.01-.33-.01-.5-.01Z" />
      </svg>
    </a>
  );
}
