import { LukappLogo } from "@/components/ui/lukapp-logo";

const footerLinks = {
  Producto:  ["Features", "Pricing", "Roadmap", "Status"],
  Compañía:  ["Blog", "About", "Contacto", "Privacidad"],
};

export default function Footer() {
  return (
    <footer className="bg-[#f4f2ff] dark:bg-[#0a0018] border-t border-[#dbd7f0] dark:border-white/[0.06] pt-14 pb-8">
      <div className="max-w-[1100px] mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between gap-12 mb-14">

          {/* Brand */}
          <div className="flex-shrink-0">
            <div className="mb-4">
              <LukappLogo variant="logotipo" height={28} color="auto" />
            </div>
            <p className="text-[13px] text-[#666] dark:text-white/35 max-w-[180px] leading-[1.65]">
              Finanzas inteligentes para todos.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-16 flex-wrap">
            {Object.entries(footerLinks).map(([group, links]) => (
              <div key={group}>
                <p className="text-[11px] font-bold text-[#999] dark:text-white/25 uppercase tracking-[1.5px] mb-5">
                  {group}
                </p>
                <div className="flex flex-col gap-3">
                  {links.map((l) => (
                    <a
                      key={l}
                      href="#"
                      className="text-[14px] text-[#555] dark:text-white/40 hover:text-[#5913ef] dark:hover:text-white/80 transition-colors duration-200"
                    >
                      {l}
                    </a>
                  ))}
                </div>
              </div>
            ))}

            <div>
              <p className="text-[11px] font-bold text-[#999] dark:text-white/25 uppercase tracking-[1.5px] mb-5">
                Contacto
              </p>
              <a
                href="mailto:hola@lukapp.co"
                className="text-[14px] text-[#6b7c00] dark:text-[#baea0f]/70 hover:text-[#5913ef] dark:hover:text-[#baea0f] transition-colors duration-200"
              >
                hola@lukapp.co
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#dbd7f0] dark:border-white/[0.05] pt-6 flex flex-col md:flex-row justify-between gap-3">
          <p className="text-[13px] text-[#999] dark:text-white/20">© 2026 lukapp</p>
          <p className="text-[13px] text-[#999] dark:text-white/20">Hecho con 💜 para ti</p>
        </div>
      </div>
    </footer>
  );
}
