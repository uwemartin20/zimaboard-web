interface UserCircleProps {
  user?: { name?: string };
  color: string;
  size?: "sm" | "md";
}

const UserCircle = ({ user, color, size = "md" }: UserCircleProps) => {
    const sizeClasses =
      size === "sm"
        ? "w-7 h-7 text-xs"
        : "w-9 h-9 text-sm";
  
    return (
      <div className="relative group">
        <div
          className={`flex items-center justify-center rounded-full text-white font-semibold ${color} ${sizeClasses}`}
        >
          {user?.name?.charAt(0).toUpperCase()}
        </div>
  
        {/* Tooltip */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap
                        bg-black text-white text-xs px-2 py-1 rounded opacity-0
                        group-hover:opacity-100 transition pointer-events-none z-10">
          {user?.name}
        </div>
      </div>
    );
};

export default UserCircle;
  