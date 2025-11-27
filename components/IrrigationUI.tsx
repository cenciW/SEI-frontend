import { Label } from "@/components/ui/label";

interface ApiStatusIndicatorProps {
  apiStatus: "checking" | "online" | "offline" | null;
}

export const ApiStatusIndicator = ({ apiStatus }: ApiStatusIndicatorProps) => {
  if (!apiStatus) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg border flex items-center gap-2 animate-in slide-in-from-top-5 ${
        apiStatus === "online"
          ? "bg-green-900/30 border-green-700 text-green-400"
          : apiStatus === "offline"
          ? "bg-red-900/30 border-red-700 text-red-400"
          : "bg-yellow-900/30 border-yellow-700 text-yellow-400"
      }`}
    >
      <div
        className={`w-2 h-2 rounded-full ${
          apiStatus === "online"
            ? "bg-green-500 animate-pulse"
            : apiStatus === "offline"
            ? "bg-red-500"
            : "bg-yellow-500 animate-pulse"
        }`}
      />
      <span className="text-sm font-medium">
        {apiStatus === "online"
          ? "API Online"
          : apiStatus === "offline"
          ? "API Offline"
          : "Verificando API..."}
      </span>
    </div>
  );
};

interface NotificationProps {
  message: string | null;
  type: "success" | "error";
  onClose?: () => void;
}

export const Notification = ({ message, type, onClose }: NotificationProps) => {
  if (!message) return null;

  const isSuccess = type === "success";

  const baseClasses =
    "fixed top-4 left-1/2 transform -translate-x-1/2 z-50 border rounded-lg shadow-lg animate-in slide-in-from-top-5 backdrop-blur-sm";
  const colorClasses = isSuccess
    ? "bg-green-900/90 border-green-700 text-green-100"
    : "bg-red-900/90 border-red-700 text-red-100";
  const paddingClasses = isSuccess ? "px-6 py-3" : "px-6 py-4";
  const widthClasses = isSuccess ? "" : "max-w-md";
  const flexClasses = isSuccess
    ? "flex items-center gap-2"
    : "flex items-start gap-3";

  return (
    <div
      className={`${baseClasses} ${colorClasses} ${paddingClasses} ${widthClasses}`}
    >
      <div className={flexClasses}>
        <svg
          className={`w-${isSuccess ? "5" : "6"} h-${
            isSuccess ? "5" : "6"
          } shrink-0 ${isSuccess ? "" : "mt-0.5"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isSuccess ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          )}
        </svg>
        {isSuccess ? (
          <span className="font-medium">{message}</span>
        ) : (
          <div className="flex-1">
            <p className="font-semibold mb-1">Erro</p>
            <p className="text-sm">{message}</p>
          </div>
        )}
        {!isSuccess && onClose && (
          <button
            onClick={onClose}
            className="shrink-0 hover:bg-red-800/50 rounded p-1 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

interface VolumeVisualizationProps {
  volumeL: number | string;
  isPot: boolean;
  potSize: string;
  color: "cyan" | "purple";
}

export const VolumeVisualization = ({
  volumeL,
  isPot,
  potSize,
  color,
}: VolumeVisualizationProps) => {
  const volume = typeof volumeL === "number" ? volumeL : 0;
  const height = Math.min(
    100,
    (volume / (isPot ? parseFloat(potSize) : 10)) * 100
  );

  return (
    <div className="relative group">
      <div className="w-24 h-32 bg-slate-800 border-2 border-slate-700 rounded-lg overflow-hidden relative shadow-inner">
        {/* Measurement Lines */}
        <div className="absolute inset-0 flex flex-col justify-between p-1 opacity-30 z-10 pointer-events-none">
          <div className="w-full border-b border-slate-500"></div>
          <div className="w-full border-b border-slate-500"></div>
          <div className="w-full border-b border-slate-500"></div>
          <div className="w-full border-b border-slate-500"></div>
        </div>

        {/* Water Fill */}
        <div
          className="absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-out"
          style={{
            height: `${height}%`,
            backgroundColor:
              color === "cyan"
                ? "rgba(34, 211, 238, 0.8)"
                : "rgba(168, 85, 247, 0.8)",
          }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-1 opacity-50 animate-pulse"
            style={{
              backgroundColor:
                color === "cyan"
                  ? "rgba(103, 232, 249, 1)"
                  : "rgba(192, 132, 252, 1)",
            }}
          ></div>
        </div>
      </div>
      <div className="text-center text-xs text-slate-500 mt-2">Volume</div>
    </div>
  );
};

interface VolumeDisplayProps {
  volumeL: number | string;
  isPot: boolean;
}

export const VolumeDisplay = ({ volumeL, isPot }: VolumeDisplayProps) => {
  if (typeof volumeL !== "number") return <>{volumeL}</>;

  if (volumeL < 1) {
    return (
      <>
        {Math.round(volumeL * 1000)}{" "}
        <span className="text-lg text-slate-500">{isPot ? "mL" : "mL/m²"}</span>
      </>
    );
  }

  return (
    <>
      {parseFloat(volumeL.toFixed(3))}{" "}
      <span className="text-lg text-slate-500">
        {isPot ? "Litros" : "L/m²"}
      </span>
    </>
  );
};
