export default function Avatar({ name }: { name: string }) {
    const initials = name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase();
  
    return (
      <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center border">
        <span className="text-xl font-semibold text-gray-700">
          {initials}
        </span>
      </div>
    );
  }  