interface AnalyticsCardProps {
    title: string;
    value: number;
    label: string;
    color?: string;
  }
  
  export default function AnalyticsCard({ title, value, label }: AnalyticsCardProps) {
    return (
      <div
        className="text-white p-4 rounded-xl w-full max-w-xs mx-auto md:max-w-sm lg:max-w-md"
        style={{ background: "linear-gradient(to bottom right, #1e1b4b, #4338ca)"}}
      >
        <h3 className="text-lg font-medium mb-6 text-center">{title}</h3>
        <div className="flex flex-col items-center">
          <div className={`text-5xl font-extrabold mb-2 ${"text-white"}`}>{value}</div>
          <div className="text-sm font-light opacity-80 text-center">{label}</div>
        </div>
      </div>
    );
  }


// bg-gradient-
  