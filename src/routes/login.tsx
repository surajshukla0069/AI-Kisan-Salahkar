import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { signUp, signIn } from '@/lib/auth-service'
import { useUserPreferences } from '@/hooks/use-user-preferences'
import { toast } from 'sonner'
import { Mail, Lock, Users, MapPin, CheckCircle2, Loader2 } from 'lucide-react'
import { LANGUAGES, type Language } from '@/lib/store'

type AuthStep = 'language' | 'location' | 'form' | 'success'

export default function LoginPage() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const { preferences } = useUserPreferences()
  const [step, setStep] = useState<AuthStep>('language')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [location, setLocation] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [language, setLanguage] = useState<Language>(preferences?.language || 'en')

  // Check if user is authenticated and redirect
  useEffect(() => {
    if (user && isAuthenticated) {
      router.navigate({ to: '/' })
    }
  }, [user, isAuthenticated, router])

  const handleLanguageSelect = async (lang: Language) => {
    setLanguage(lang)
    setStep('location')
  }

  const handleLocationNext = () => {
    if (!location.trim()) {
      toast.error('Please enter your location')
      return
    }
    setStep('form')
  }

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      console.log(`Attempting ${isSignUp ? 'signup' : 'login'}...`)
      if (isSignUp) {
        const user = await signUp(email, password)
        console.log('Signup successful:', user)
      } else {
        const user = await signIn(email, password)
        console.log('Login successful:', user)
      }
      setStep('success')
      toast.success(`${isSignUp ? 'Account created' : 'Logged in'} successfully! 🎉`)
      
      // Navigate after showing success animation
      const redirectTimer = setTimeout(() => {
        console.log('Redirecting to home...')
        router.navigate({ to: '/' })
      }, 1500)
      
      return () => clearTimeout(redirectTimer)
    } catch (error: any) {
      console.error('Auth error:', error)
      const errorMsg = error.message || (isSignUp ? 'Signup failed' : 'Login failed')
      toast.error(errorMsg)
      setStep('form')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated blob backgrounds */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-br from-green-200 to-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
      <div className="absolute top-40 right-10 w-72 h-72 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-gradient-to-br from-teal-200 to-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />

      <motion.div
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="inline-block mb-3 p-3 rounded-full bg-gradient-to-br from-green-400 to-emerald-500">
            <Users className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 text-transparent bg-clip-text">
            Kisan Salahkar
          </h1>
          <p className="text-sm text-muted-foreground mt-2">AI-Powered Farming Assistant</p>
        </motion.div>

        {/* Language Selection */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: step === 'language' ? 1 : 0, x: step === 'language' ? 0 : -20 }}
          transition={{ duration: 0.3 }}
          className={step === 'language' ? 'block' : 'hidden'}
        >
          <Card className="p-6 backdrop-blur-sm bg-white/80">
            <h2 className="text-lg font-semibold mb-4 text-center">Select Your Language</h2>
            <div className="space-y-2">
              {(Object.entries(LANGUAGES) as [Language, string][]).map(([key, label]) => (
                <motion.div
                  key={key}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="outline"
                    className="w-full py-6 text-base font-medium hover:border-green-500 hover:bg-green-50"
                    onClick={() => handleLanguageSelect(key)}
                  >
                    {label}
                  </Button>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Location Input */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: step === 'location' ? 1 : 0, x: step === 'location' ? 0 : 20 }}
          transition={{ duration: 0.3 }}
          className={step === 'location' ? 'block' : 'hidden'}
        >
          <Card className="p-6 backdrop-blur-sm bg-white/80">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-green-600" />
              <h2 className="text-lg font-semibold">Your Location</h2>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Village / City</Label>
                <Input
                  placeholder="Enter your village or city"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLocationNext()}
                  className="mt-2 border-green-200 focus:border-green-500 focus:ring-green-500"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep('language')}
                >
                  Back
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  onClick={handleLocationNext}
                >
                  Continue
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Authentication Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: step === 'form' ? 1 : 0, x: step === 'form' ? 0 : -20 }}
          transition={{ duration: 0.3 }}
          className={step === 'form' ? 'block' : 'hidden'}
        >
          <Card className="p-6 backdrop-blur-sm bg-white/80">
            <h2 className="text-lg font-semibold mb-4 text-center">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4 text-green-600" />
                  Email
                </Label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 border-green-200 focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div>
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Lock className="h-4 w-4 text-green-600" />
                  Password
                </Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
                  className="mt-2 border-green-200 focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <Button
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium py-6"
                onClick={handleAuth}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isSignUp ? 'Creating...' : 'Signing in...'}
                  </>
                ) : isSignUp ? (
                  'Create Account'
                ) : (
                  'Sign In'
                )}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-green-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">or</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full border-green-200 hover:bg-green-50"
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </Button>

              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setStep('location')}
              >
                Back
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Success Screen */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: step === 'success' ? 1 : 0, scale: step === 'success' ? 1 : 0.9 }}
          transition={{ duration: 0.3 }}
          className={step === 'success' ? 'block' : 'hidden'}
        >
          <Card className="p-8 backdrop-blur-sm bg-white/80 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="flex justify-center mb-4"
            >
              <div className="p-4 rounded-full bg-gradient-to-br from-green-400 to-emerald-500">
                <CheckCircle2 className="h-12 w-12 text-white" />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-2xl font-bold text-green-600 mb-2">Welcome!</h3>
              <p className="text-muted-foreground">Redirecting to your dashboard...</p>
            </motion.div>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.p
          className="text-center text-xs text-muted-foreground mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Powered by AI Kisan Salahkar • Secure & Private
        </motion.p>
      </motion.div>
    </div>
  )
}
