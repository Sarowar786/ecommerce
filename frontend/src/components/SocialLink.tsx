import Link from "next/link";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { twMerge } from "tailwind-merge";

interface Props {
  className?: string;
  variant?: "dark" | "light";
}

const SocialLink = ({ className, variant = "dark" }: Props) => {
  const isDark = variant === "dark";

  const socialLinks = [
    {
      name: "Facebook",
      href: "https://www.facebook.com",
      icon: <FaFacebookF className="text-sm" />,
      hoverBg: "hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2]",
    },
    {
      name: "Twitter / X",
      href: "https://www.x.com",
      icon: <FaXTwitter className="text-sm" />,
      hoverBg: "hover:bg-black hover:text-white hover:border-black",
    },
    {
      name: "Instagram",
      href: "https://www.instagram.com",
      icon: <FaInstagram className="text-sm" />,
      hoverBg: "hover:bg-gradient-to-tr hover:from-amber-500 hover:via-pink-500 hover:to-purple-600 hover:text-white hover:border-pink-500",
    },
    {
      name: "LinkedIn",
      href: "https://www.linkedin.com",
      icon: <FaLinkedinIn className="text-sm" />,
      hoverBg: "hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2]",
    },
    {
      name: "YouTube",
      href: "https://www.youtube.com",
      icon: <FaYoutube className="text-sm" />,
      hoverBg: "hover:bg-[#FF0000] hover:text-white hover:border-[#FF0000]",
    },
  ];

  return (
    <div className={twMerge("flex items-center gap-2.5", className)}>
      {socialLinks.map((social) => (
        <Link
          key={social.name}
          href={social.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={social.name}
          className={twMerge(
            "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg border",
            isDark
              ? "bg-slate-800/80 border-slate-700/80 text-slate-300 hover:shadow-cyan-500/10"
              : "bg-white border-slate-200 text-slate-700 shadow-sm",
            social.hoverBg
          )}
        >
          {social.icon}
        </Link>
      ))}
    </div>
  );
};

export default SocialLink;
