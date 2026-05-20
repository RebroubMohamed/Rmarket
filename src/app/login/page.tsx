// src/app/login/page.tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, Lock, Mail, ShoppingBag, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Identifiants incorrects");
        return;
      }

      toast.success("Connexion réussie !");
      router.push("/admin");
      router.refresh();
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-4'>
      {/* Background decoration */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute -top-40 -right-40 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl' />
        <div className='absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-violet-500/5 blur-3xl' />
      </div>

      <div className='relative w-full max-w-md animate-fade-in'>
        {/* Logo */}
        <div className='text-center mb-8'>
          <div className='inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur border border-white/20 mb-4 shadow-xl'>
            <ShoppingBag className='w-8 h-8 text-white' />
          </div>
          <h1 className='text-3xl font-bold text-white tracking-tight'>
            ShopAdmin
          </h1>
          <p className='text-slate-400 mt-2 text-sm'>
            Panneau d&apos;administration
          </p>
        </div>

        {/* Card */}
        <div className='bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl'>
          <div className='mb-6'>
            <h2 className='text-xl font-semibold text-white'>Connexion</h2>
            <p className='text-slate-400 text-sm mt-1'>
              Accédez à votre espace admin
            </p>
          </div>

          <form onSubmit={handleLogin} className='space-y-5'>
            <div className='space-y-2'>
              <label className='text-sm font-medium text-slate-300'>
                Adresse email
              </label>
              <div className='relative'>
                <Mail className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500' />
                <input
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder='admin@shop.ma'
                  required
                  className='w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-sm'
                />
              </div>
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-medium text-slate-300'>
                Mot de passe
              </label>
              <div className='relative'>
                <Lock className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500' />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder='••••••••'
                  required
                  className='w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-sm'
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors'
                >
                  {showPassword ? (
                    <EyeOff className='w-4 h-4' />
                  ) : (
                    <Eye className='w-4 h-4' />
                  )}
                </button>
              </div>
            </div>

            <button
              type='submit'
              disabled={loading}
              className='w-full py-3 bg-white text-slate-900 rounded-xl font-semibold text-sm hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg'
            >
              {loading ? (
                <>
                  <Loader2 className='w-4 h-4 animate-spin' /> Connexion...
                </>
              ) : (
                "Se connecter"
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className='mt-6 p-4 bg-white/5 rounded-xl border border-white/5'>
            <p className='text-xs text-slate-400 font-medium mb-2'>
              Accès démo :
            </p>
            <div className='space-y-1'>
              <p className='text-xs text-slate-300 font-mono'>
                📧 admin@shop.ma
              </p>
              <p className='text-xs text-slate-300 font-mono'>🔑 admin123</p>
            </div>
          </div>
        </div>

        <p className='text-center text-slate-600 text-xs mt-6'>
          © 2024 ShopAdmin — Tous droits réservés
        </p>
      </div>
    </div>
  );
}
