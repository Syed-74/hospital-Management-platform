import { useState } from "react";
import { useAuth } from "../../core/context/AuthContext";
import { Hospital, LogIn } from "lucide-react";
import Button from "../../core/components/ui/Button";
import Input from "../../core/components/ui/Input";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await login(email, password);
    if (!result.success) {
      setError(result.message);
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white flex selection:bg-blue-100 selection:text-blue-900">
      
      {/* Left Panel - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-slate-950 overflow-hidden isolate">
        {/* Animated background glowing orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-blue-600/20 blur-[120px] mix-blend-screen animate-pulse"></div>
          <div className="absolute bottom-[10%] right-[10%] w-[60%] h-[60%] rounded-full bg-indigo-500/20 blur-[100px] mix-blend-screen" style={{ animationDelay: '1s' }}></div>
        </div>
        
        {/* Abstract structural grid line overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] opacity-30"></div>
        
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-20 w-full h-full">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600/90 backdrop-blur p-2.5 rounded-xl shadow-2xl shadow-blue-900/50 border border-blue-500/30">
              <Hospital className="w-7 h-7 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold tracking-wide text-white">Enterprise HMS</span>
          </div>
          
          <div className="space-y-8 max-w-lg">
            <h1 className="text-[3.5rem] font-bold tracking-tight text-white leading-[1.1] drop-shadow-sm">
              Modernizing <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
                healthcare delivery.
              </span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed font-light">
              A secure, scalable, and intelligent hospital management system designed exclusively for modern healthcare professionals.
            </p>
          </div>
          
          <div className="flex items-center text-sm text-slate-500 font-medium">
            <span>© 2026 Enterprise HMS. All rights reserved.</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-16 md:px-24 lg:px-32 relative bg-white">
        <div className="w-full max-w-[420px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-both">
          
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center space-x-3 mb-12">
            <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-600/20">
              <Hospital className="w-7 h-7 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900">Enterprise HMS</span>
          </div>

          <div className="space-y-3 mb-10">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Welcome back</h2>
            <p className="text-slate-500 text-sm font-medium">Please enter your credentials to sign in.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start space-x-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="shrink-0 mt-0.5">
                <svg className="w-5 h-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-sm font-medium text-red-800 leading-tight">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Email Address</label>
                <div className="relative">
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@hospital.com"
                    autoComplete="email"
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all duration-200"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Password</label>
                <div className="relative">
                  <Input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center space-x-2.5">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600/20 focus:ring-offset-0 cursor-pointer transition-colors"
                />
                <label htmlFor="remember-me" className="text-sm font-medium text-slate-600 cursor-pointer select-none hover:text-slate-900 transition-colors">
                  Remember me
                </label>
              </div>
              
              <a href="/forgot-password" className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                Forgot password?
              </a>
            </div>

            <div className="pt-2">
              <Button 
                type="submit" 
                isLoading={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-4 text-[15px] font-semibold tracking-wide shadow-lg shadow-blue-600/25 transition-all duration-200 active:scale-[0.98] flex items-center justify-center border-none"
              >
                {!isLoading && <LogIn className="mr-2 w-5 h-5" />}
                Sign In
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}