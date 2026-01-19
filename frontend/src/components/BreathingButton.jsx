import React, { useRef } from "react";
import gsap from "gsap";

const BreathingButton = ({
  children,
  onClick,
  className = "",
  fillColor = "rgb(179, 217, 255)",
  icon: Icon,
  defaultIconColor = "text-indigo-500",
  ...props // 👈 Allow type="submit", disabled, etc.
}) => {
  const buttonRef = useRef(null);
  const fillRef = useRef(null);
  const iconRef = useRef(null);

  // Track animation to kill it instantly if needed
  const tweenRef = useRef(null);

  // 🌬️ INHALE
  const handleMouseEnter = (e) => {
    if (tweenRef.current) tweenRef.current.kill();

    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Reset Bubble
    gsap.set(fillRef.current, {
      x: x,
      y: y,
      xPercent: -50,
      yPercent: -50,
      scale: 0,
      opacity: 0.6,
    });

    // Animate Bubble
    tweenRef.current = gsap.to(fillRef.current, {
      scale: 5,
      opacity: 1,
      duration: 3.0,
      ease: "power2.in",
    });

    // Animate Button
    gsap.to(buttonRef.current, {
      scale: 1.02,
      duration: 1,
      ease: "power2.out",
    });

    // Animate Icon
    if (iconRef.current) {
      gsap.to(iconRef.current, { scale: 1.1, color: "#1e293b", duration: 0.5 });
    }
  };

  // 💨 EXHALE
  const handleMouseLeave = () => {
    if (tweenRef.current) tweenRef.current.kill();

    gsap.to(fillRef.current, {
      scale: 0,
      opacity: 0,
      duration: 0.4,
      ease: "power2.out",
    });

    gsap.to(buttonRef.current, { scale: 1, duration: 0.4 });
    if (iconRef.current) {
      gsap.to(iconRef.current, {
        scale: 1,
        clearProps: "color",
        duration: 0.3,
      });
    }
  };

  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props} // 👈 Pass all standard button props here
      className={`relative overflow-hidden group ${className}`}
    >
      {/* AIR BUBBLE */}
      <div
        ref={fillRef}
        className="absolute top-0 left-0 w-[300px] h-[300px] rounded-full pointer-events-none blur-2xl z-0"
        style={{
          backgroundColor: fillColor,
          opacity: 0,
          transform: "scale(0)",
        }}
      />

      {/* CONTENT (Removed hardcoded text-slate-800 so you can choose color) */}
      <div className="relative z-10 flex items-center justify-center gap-2 w-full h-full transition-colors duration-300">
        {children}
        {Icon && (
          <div
            ref={iconRef}
            className={`transition-colors duration-300 ${defaultIconColor}`}
          >
            <Icon size={24} />
          </div>
        )}
      </div>
    </button>
  );
};

export default BreathingButton;
