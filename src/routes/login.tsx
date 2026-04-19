import { useNavigate } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { signUp, signIn } from "@/lib/auth-service"
import { toast } from "sonner"
import { Loader2, Mail, Lock, Sprout, ArrowRight, CheckCircle2 } from "lucide-react"
import { motion } from "framer-motion"

type AuthStep = "mode" | "credentials" | "success"

function LoginPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<AuthStep>("mode")

  useEffect(() => {
    if (isAuthenticated) navigate("/")
  }, [isAuthenticated, navigate])

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      toast.error("Please fill all fields")
      return
    }
    if (isSignUp && password !== confirmPassword) {
      toast.error("Passwords don't match")
      return
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    setLoading(true)
    try {
      if (isSignUp) {
        await signUp(email, password)
      } else {
        await signIn(email, password)
      }
      setStep("success")
      toast.success("🎉 Welcome to AI Kisan Salahkar!")
      setTimeout(() => navigate("/"), 2000)
    } catch (error: any) {
      toast.error(error.message || "Auth failed")
    } finally {
      setLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute top-10 right-10 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full max-w-md relative z-10">
        {/* Step 1: Choose Mode */}
        {step === "mode" && (
          <motion.div variants={cardVariants} initial="hidden" animate="visible">
            <Card className="bg-white/95 backdrop-blur border-0 shadow-2xl p-8">
              <motion.div className="flex justify-center mb-8" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }}>
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-600 shadow-lg">
                  <Sprout className="h-8 w-8 text-white" />
                </div>
              </motion.div>

              <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">
                AI Kisan Salahkar
              </h1>
              <p className="text-center text-gray-500 mb-8">Smart farming, better yields 🌾</p>

              <div className="space-y-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setIsSignUp(false)
                    setStep("credentials")
                  }}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  Sign In
                  <ArrowRight className="h-4 w-4" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setIsSignUp(true)
                    setStep("credentials")
                  }}
                  className="w-full bg-white border-2 border-green-200 hover:border-green-300 text-green-700 font-semibold py-3 px-6 rounded-xl transition-all active:bg-green-50"
                >
                  Create Account
                </motion.button>
              </div>

              <p className="text-center text-xs text-gray-400 mt-8">
                Secure agricultural advisory platform
              </p>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Credentials */}
        {step === "credentials" && (
          <motion.div variants={cardVariants} initial="hidden" animate="visible">
            <Card className="bg-white/95 backdrop-blur border-0 shadow-2xl p-8">
              <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  {isSignUp ? "Create Account" : "Welcome Back"}
                </h2>
                <p className="text-gray-500">
                  {isSignUp ? "Join thousands of farmers" : "Sign in to your account"}
                </p>
              </motion.div>

              <div className="space-y-4 mb-6">
                {/* Email */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      className="pl-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                </motion.div>

                {/* Password */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      className="pl-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                </motion.div>

                {/* Confirm Password (only for signup) */}
                {isSignUp && (
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={loading}
                        className="pl-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-green-500 focus:ring-green-500"
                      />
                    </div>
                  </motion.div>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAuth}
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {isSignUp ? "Create Account" : "Sign In"}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => setStep("mode")}
                disabled={loading}
                className="w-full mt-3 text-green-600 hover:text-green-700 font-semibold py-2"
              >
                ← Back
              </motion.button>

              <p className="text-center text-xs text-gray-400 mt-6">
                Your data is encrypted and secure
              </p>
            </Card>
          </motion.div>
        )}

        {/* Step 3: Success */}
        {step === "success" && (
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <Card className="bg-white/95 backdrop-blur border-0 shadow-2xl p-8 text-center">
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="mb-6"
              >
                <div className="flex justify-center mb-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 shadow-lg">
                    <CheckCircle2 className="h-10 w-10 text-green-600" />
                  </div>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                <h2 className="text-3xl font-bold text-green-600 mb-2">Success!</h2>
                <p className="text-gray-600">Welcome to AI Kisan Salahkar</p>
                <p className="text-sm text-gray-500 mt-4">Redirecting in a moment...</p>
              </motion.div>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

export default LoginPage
