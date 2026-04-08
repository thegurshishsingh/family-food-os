import logoImg from "@/assets/logo.jpg";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

const sizeMap = {
  sm: "w-7 h-7",
  md: "w-8 h-8",
  lg: "w-10 h-10",
};

const textSizeMap = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-2xl",
};

const Logo = ({ size = "md", showText = true, className = "" }: LogoProps) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <img
      src={logoImg}
      alt="Family Food OS"
      className={`${sizeMap[size]} rounded-lg object-cover`}
    />
    {showText && (
      <span className={`font-serif ${textSizeMap[size]} font-semibold text-foreground`}>
        Family Food OS
      </span>
    )}
  </div>
);

export default Logo;
