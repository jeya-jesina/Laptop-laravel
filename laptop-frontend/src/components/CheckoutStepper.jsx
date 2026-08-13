import { Check } from "lucide-react";

const steps = ["Details", "Address", "Payment"];

export default function CheckoutStepper({ current }) {
  return (
    <div className="flex items-center justify-center gap-0 w-full max-w-xl mx-auto mb-8">
      {steps.map((label, i) => {
        const step = i + 1;
        const done = step < current;
        const active = step === current;
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-2">
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  done
                    ? "bg-emerald-500 text-white"
                    : active
                    ? "bg-[#3271D7] text-white shadow-lg shadow-blue-200 scale-110"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {done ? <Check size={18} strokeWidth={3} /> : step}
              </div>
              <span
                className={`text-[11px] font-semibold uppercase tracking-wide ${
                  active ? "text-[#3271D7]" : done ? "text-emerald-600" : "text-gray-400"
                }`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`h-0.5 flex-1 mx-2 mb-5 rounded-full transition-colors duration-300 ${
                  done || active ? "bg-[#3271D7]/40" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
