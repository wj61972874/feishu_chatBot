import React, { useState, useRef, useEffect } from "react";

interface PopoverProps {
  content: React.ReactNode;
  children: React.ReactNode;
}

const Popover: React.FC<PopoverProps> = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (
      popoverRef.current &&
      !popoverRef.current.contains(event.target as Node)
    ) {
      setIsVisible(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block" ref={popoverRef}>
      <div onClick={() => setIsVisible(!isVisible)} className="cursor-pointer">
        {children}
      </div>
      {isVisible && (
        <div className="absolute bottom-[100%] left-[50%] translate-x-[-50%] mt-2 p-2 bg-white border-[1px] border-[#ccc] shadow-[0 2px 8px 0 rgba(7, 12, 20, .04)] z-1000 rounded-lg">
          {content}
        </div>
      )}
    </div>
  );
};

export default Popover;
