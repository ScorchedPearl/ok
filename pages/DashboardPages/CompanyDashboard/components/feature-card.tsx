interface FeatureCardProps {
    title: string;
    imageSrc: string;
    description: string; // Add a description prop to interface
}

export default function FeatureCard({ title, description, imageSrc}: FeatureCardProps) {
    return (
        <div className="bg-gradient-to-br from-[#1e1b4b] to-[#4338ca] text-white rounded-xl flex flex-col items-center text-center overflow-hidden shadow-lg">
            <div className="w-full aspect-video"> {/* Ensures the container is always square */}
                <img
                    src={imageSrc || '/placeholder.svg'}
                    alt={title}
                    className="w-full h-full object-cover rounded-xl" // Uses 'object-cover' for better aspect ratio handling
                />
            </div>
            <div className="p-4">
                <h3 className="text-lg font-bold">{title}</h3>
                <p className="text-sm text-gray-300 mt-2 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: '3', WebkitBoxOrient: 'vertical' }}>
                    {description} {/* Text clamping applied to the description */}
                </p>
            </div>
        </div>
    );
}
