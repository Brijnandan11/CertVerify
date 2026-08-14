type LogoMarkProps = {
  size?: number;
  className?: string;
  showText?: boolean;
  textClassName?: string;
};

export function LogoMark({ size = 40, className = "", showText = false, textClassName = "" }: LogoMarkProps) {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <img
        src="/devinx-logo.png"
        alt="Devinx logo"
        width={size}
        height={size}
        className="block rounded-[28%] object-cover"
      />
      {showText && <span className={`font-display font-bold text-ink ${textClassName}`}>Devinx</span>}
    </div>
  );
}
