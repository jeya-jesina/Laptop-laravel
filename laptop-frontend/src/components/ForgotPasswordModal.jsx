import { useState } from "react";
import { Mail, KeyRound, ArrowLeft, ShieldCheck, X, Eye, EyeOff } from "lucide-react";
import api from "../services/api";

export default function ForgotPasswordModal({ onClose }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const sendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email) {
      setError("Please enter your email address");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/send_otp", { email });
      if (res.data.status === "success") {
        setMessage(res.data.message || "OTP sent to your email");
        setStep(2);
      } else {
        setError(res.data.message || "Unable to send OTP");
      }
    } catch {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!otp) {
      setError("Please enter the OTP");
      return;
    }
    if (!password || !confirmPassword) {
      setError("Please fill in both password fields");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/reset_password", {
        token: otp,
        password,
        confirm_password: confirmPassword,
      });
      if (res.data.status) {
        setSuccess(true);
        setTimeout(onClose, 2500);
      } else {
        setError(res.data.message || "Invalid or expired OTP. Please try again.");
      }
    } catch {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setError("");
    setMessage("");
    try {
      const res = await api.post("/auth/send_otp", { email });
      setMessage(res.data.message || "OTP re-sent to your email");
    } catch {
      setError("Unable to resend OTP");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-slideUp">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-30 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 hover:bg-white shadow-md transition text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="bg-gradient-to-r from-[#3271D7] to-[#4f8ef5] px-6 py-6 text-center">
          {success ? (
            <ShieldCheck className="w-12 h-12 text-green-200 mx-auto" />
          ) : (
            <KeyRound className="w-10 h-10 text-white mx-auto" />
          )}
          <h2 className="mt-2 text-xl font-bold text-white">
            {success ? "Password Updated!" : "Reset Password"}
          </h2>
          <p className="text-xs text-blue-100 mt-1">
            {success
              ? "You can now login with your new password"
              : step === 1
              ? "Enter your email to receive an OTP"
              : `OTP sent to ${email}`}
          </p>
        </div>

        <div className="p-6">
          {success ? (
            <div className="text-center py-4">
              <div className="flex justify-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                ))}
              </div>
            </div>
          ) : step === 1 ? (
            <form onSubmit={sendOtp} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-red-50 p-2.5 text-xs text-red-700 border border-red-200">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-blue-300 px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none bg-gray-50 hover:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-white text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full text-center text-xs text-gray-500 hover:text-gray-700"
              >
                Back to Login
              </button>
            </form>
          ) : (
            <form onSubmit={resetPassword} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-red-50 p-2.5 text-xs text-red-700 border border-red-200">
                  {error}
                </div>
              )}
              {message && (
                <div className="rounded-lg bg-green-50 p-2.5 text-xs text-green-700 border border-green-200">
                  {message}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-medium text-gray-700 mb-1">
                  Enter OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="6-digit OTP"
                  maxLength={6}
                  className="w-full rounded-lg border border-blue-300 px-3.5 py-2.5 text-sm text-center tracking-[0.5em] font-bold focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none bg-gray-50 hover:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full rounded-lg border border-blue-300 px-3.5 py-2.5 pr-11 text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none bg-gray-50 hover:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full rounded-lg border border-blue-300 px-3.5 py-2.5 pr-11 text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none bg-gray-50 hover:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-white text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>

              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" /> Change email
                </button>
                <button
                  type="button"
                  onClick={resendOtp}
                  className="text-blue-600 hover:underline"
                >
                  Resend OTP
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-slideUp { animation: slideUp 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
}
