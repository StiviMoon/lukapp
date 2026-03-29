import { LukappLogo } from "@/components/ui/lukapp-logo";

const FooterLogo = () => (
  <LukappLogo variant="logotipo" height={28} color="auto" />
);

const footerLinks = {
  Producto: ["Features", "Pricing", "Roadmap", "Status"],
  Compañía: ["Blog", "About", "Contacto", "Privacidad"],
};

export default function Footer() {
  return (
    <footer className="section-stripe border-t border-[#D8D8E4] dark:border-white/[0.06] pt-14 pb-8">
      <div className="max-w-[1100px] mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between gap-12 mb-14">
          {/* Brand */}
          <div className="flex-shrink-0">
            <div className="mb-4">
              <FooterLogo />
            </div>
            <p className="text-[13px] text-fg/25 max-w-[180px] leading-[1.65]">
              Finanzas inteligentes para todos.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-16 flex-wrap">
            {Object.entries(footerLinks).map(([group, links]) => (
              <div key={group}>
                <p className="text-[11px] font-bold text-fg/20 uppercase tracking-[1.5px] mb-5">
                  {group}
                </p>
                <div className="flex flex-col gap-3">
                  {links.map((l) => (
                    <a
                      key={l}
                      href="#"
                      className="text-[14px] text-fg/30 hover:text-fg/70 transition-colors duration-200"
                    >
                      {l}
                    </a>
                  ))}
                </div>
              </div>
            ))}

            <div>
              <p className="text-[11px] font-bold text-fg/20 uppercase tracking-[1.5px] mb-5">
                Contacto
              </p>
              <a
                href="mailto:hola@lukapp.co"
                className="text-[14px] text-lime/60 hover:text-lime transition-colors duration-200"
              >
                hola@lukapp.co
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-[#D8D8E4] dark:border-white/[0.05] pt-6 flex flex-col md:flex-row justify-between gap-3">
          <p className="text-[13px] text-fg/15">© 2026 lukapp</p>
          <p className="text-[13px] text-fg/15">Hecho para ti</p>
        </div>
      </div>
    </footer>
  );
}
