import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import LoginBanner from "../assets/LoginBanner.png";
import api from "../services/api"; // 👈 Import the api instance (ready for future direct calls)

export default function Register() {
  const { register, loading, user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const redirect = searchParams.get("redirect") || "/";
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (user) {
      navigate(redirect, { replace: true });
    }
  }, [user, navigate, redirect]);

  const handlePhoneChange = (e) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhone(digits);
    setPhoneError(
      digits.length > 0 && digits.length < 10
        ? "Phone number must be exactly 10 digits"
        : ""
    );
  };

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailError(
      e.target.value.length > 0 && !isValidEmail(e.target.value)
        ? "Please enter a valid email address."
        : ""
    );
  };

  const handleEmailBlur = () => {
    if (email.length > 0 && !isValidEmail(email)) {
      setEmailError("Please enter a valid email address.");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!name || !email || !phone || !address || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (!isValidEmail(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      setPhoneError("Phone number must be exactly 10 digits");
      return;
    }

    const response = await register(name, email, phone, address, password);
    if (response.status) {
      setIsModalOpen(false);
      navigate("/login", { replace: true });
    } else {
      setError(response.message || "Registration failed");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    navigate("/");
  };

  const handleNext = () => {
    setError("");

    if (!name || !email || !phone) {
      setError("Please fill in all fields");
      return;
    }

    if (!isValidEmail(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      setPhoneError("Phone number must be exactly 10 digits");
      return;
    }

    setStep(2);
  };

  const handleBack = () => {
    setError("");
    setStep(1);
  };

  if (!isModalOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-y-auto max-h-screen animate-slideUp">
          <button
            onClick={closeModal}
            className="absolute top-3 right-3 z-30 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 hover:bg-white shadow-md transition text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex flex-col md:flex-row min-h-[420px]">
            <div className="hidden md:block w-full md:w-2/5 overflow-hidden">
              <img
                src={LoginBanner}
                alt="Login banner"
                className="h-full w-full object-cover object-center"
              />
            </div>

            <div className="w-full md:w-3/5 p-6 md:p-8 bg-white">
              <div className="max-w-sm mx-auto">
                <h2 className="text-xl font-semibold text-[#181818]">Create Account</h2>
                <p className="mt-0.5 text-xs text-gray-500">
                  Create an account to place orders and receive shipment notifications.
                </p>

                <div className="mt-4 flex items-center gap-2">
                  <div className="flex-1">
                    <div className={`h-1.5 rounded-full ${step >= 1 ? "bg-blue-600" : "bg-gray-200"}`} />
                  </div>
                  <div className="flex-1">
                    <div className={`h-1.5 rounded-full ${step >= 2 ? "bg-blue-600" : "bg-gray-200"}`} />
                  </div>
                </div>

                <p className="mt-2 text-[11px] text-gray-400">
                  Step {step} of 2
                </p>

                {error && (
                  <div className="mt-3 rounded-lg bg-red-50 p-2 text-xs text-red-700 border border-red-200">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="mt-4 space-y-3">
                  {step === 1 && (
                    <>
                      <div>
                        <label className="block text-[11px] font-medium text-gray-700 mb-1">
                          Full Name *
                        </label>
                        <input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          placeholder="Enter your full name"
                          className="w-full rounded-lg border border-blue-300 px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition outline-none bg-gray-50 hover:bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-gray-700 mb-1">
                          Email Address *
                        </label>
                        <input
                          value={email}
                          onChange={handleEmailChange}
                          onBlur={handleEmailBlur}
                          required
                          type="email"
                          placeholder="Enter your email"
                          className="w-full rounded-lg border border-blue-300 px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition outline-none bg-gray-50 hover:bg-white"
                        />
                        {emailError && (
                          <p className="mt-1 text-[11px] text-red-600">
                            {emailError}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-gray-700 mb-1">
                          Phone Number *
                        </label>
                        <input
                          value={phone}
                          onChange={handlePhoneChange}
                          required
                          type="tel"
                          inputMode="numeric"
                          maxLength="10"
                          placeholder="Enter your 10-digit phone number"
                          className="w-full rounded-lg border border-blue-300 px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition outline-none bg-gray-50 hover:bg-white"
                        />
                        {phoneError && (
                          <p className="mt-1 text-[11px] text-red-600">
                            {phoneError}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={handleNext}
                        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-white text-sm font-medium hover:bg-blue-700 transition-all transform hover:scale-[1.02] mt-2 shadow-md hover:shadow-lg"
                      >
                        Next
                      </button>
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <div>
                        <label className="block text-[11px] font-medium text-gray-700 mb-1">
                          Address *
                        </label>
                        <textarea
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          required
                          rows="2"
                          placeholder="Enter your complete address"
                          className="w-full rounded-lg border border-blue-300 px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition resize-none outline-none bg-gray-50 hover:bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-gray-700 mb-1">
                          Password *
                        </label>
                        <div className="relative">
                          <input
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a password (min 6 characters)"
                            className="w-full rounded-lg border border-blue-300 px-3.5 py-2.5 pr-11 text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition outline-none bg-gray-50 hover:bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600 transition"
                          >
                            {showPassword ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">
                          Password must be at least 6 characters
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <button
                          type="button"
                          onClick={handleBack}
                          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-700 text-sm font-medium hover:bg-gray-50 transition"
                        >
                          Back
                        </button>

                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-white text-sm font-medium hover:bg-blue-700 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-md hover:shadow-lg"
                        >
                          {loading ? "Creating account..." : "Register"}
                        </button>
                      </div>
                    </>
                  )}
                </form>

                <div className="mt-4 pt-3 border-t border-gray-100">
                  <p className="text-[10px] text-gray-400 text-center leading-relaxed">
                    By continuing, you agree to our{" "}
                    <a href="#" className="text-[#a97c50] hover:underline font-medium">
                      Privacy Policy
                    </a>{" "}
                    &{" "}
                    <a href="#" className="text-[#a97c50] hover:underline font-medium">
                      T&C's
                    </a>
                  </p>
                </div>

                <p className="mt-3 text-sm text-gray-600 text-center">
                  Already have an account?{" "}
                  <Link
                    className="text-blue-600 font-semibold hover:underline"
                    to={`/login?redirect=${encodeURIComponent(redirect)}`}
                  >
                    Login
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
}