/**
 * Stylized brown cork-board background — pure CSS (layered radial-gradients
 * for the speckled cork grain + a darker wooden frame), no image assets.
 */
export function CorkBoard({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-2xl p-4 sm:p-6 shadow-inner border-[10px] border-[#8a5a34] ${className}`}
      style={{
        backgroundColor: "#c98f56",
        backgroundImage: [
          "radial-gradient(circle at 12% 22%, rgba(0,0,0,0.16) 0, rgba(0,0,0,0.16) 1.5px, transparent 1.6px)",
          "radial-gradient(circle at 68% 8%, rgba(0,0,0,0.14) 0, rgba(0,0,0,0.14) 1.2px, transparent 1.3px)",
          "radial-gradient(circle at 34% 62%, rgba(0,0,0,0.15) 0, rgba(0,0,0,0.15) 1.8px, transparent 1.9px)",
          "radial-gradient(circle at 82% 48%, rgba(0,0,0,0.13) 0, rgba(0,0,0,0.13) 1.3px, transparent 1.4px)",
          "radial-gradient(circle at 55% 85%, rgba(0,0,0,0.15) 0, rgba(0,0,0,0.15) 1.6px, transparent 1.7px)",
          "radial-gradient(circle at 8% 75%, rgba(0,0,0,0.12) 0, rgba(0,0,0,0.12) 1.2px, transparent 1.3px)",
          "radial-gradient(circle at 92% 82%, rgba(0,0,0,0.14) 0, rgba(0,0,0,0.14) 1.4px, transparent 1.5px)",
          "radial-gradient(circle at 45% 35%, rgba(255,255,255,0.08) 0, rgba(255,255,255,0.08) 1px, transparent 1.1px)",
          "radial-gradient(circle at 25% 45%, rgba(255,255,255,0.06) 0, rgba(255,255,255,0.06) 1px, transparent 1.1px)",
          "radial-gradient(ellipse at center, rgba(255,255,255,0.08), rgba(0,0,0,0.18))",
        ].join(", "),
        backgroundSize: "38px 38px, 42px 42px, 46px 46px, 40px 40px, 44px 44px, 36px 36px, 41px 41px, 30px 30px, 33px 33px, 100% 100%",
      }}
    >
      {children}
    </div>
  );
}
