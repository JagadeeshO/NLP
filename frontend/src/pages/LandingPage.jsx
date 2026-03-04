import { useState, useLayoutEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Sparkles, TrendingUp, Brain, BarChart3, Moon, Sun } from 'lucide-react'

const LandingPage = () => {
  const navigate = useNavigate()
  const [isDarkMode, setIsDarkMode] = useState(false)

  useLayoutEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    requestAnimationFrame(() => window.scrollTo(0, 0))
    return () => {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'auto'
      }
    }
  }, [])

  const techStack = [
    { name: 'Python', color: 'bg-blue-500' },
    { name: 'Machine Learning', color: 'bg-purple-500' },
    { name: 'Pandas', color: 'bg-indigo-500' },
    { name: 'React', color: 'bg-cyan-500' },
    { name: 'Tailwind CSS', color: 'bg-teal-500' }
  ]

  const features = [
    { icon: Brain, title: 'ML-Powered', desc: 'Advanced sentiment analysis' },
    { icon: TrendingUp, title: 'Insights', desc: 'Product performance metrics' },
    { icon: BarChart3, title: 'Visualizations', desc: 'Beautiful data charts' }
  ]

  return (
    <div className={`min-h-screen   relative overflow-x-hidden transition-colors duration-700 ${
      isDarkMode ? 'bg-[#0D1117]' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'
    }`}>
      {/* Dark Mode Toggle */}
      <motion.button
        onClick={() => setIsDarkMode(!isDarkMode)}
        className={`fixed top-8 right-8 z-50 p-3 rounded-xl backdrop-blur-md transition-all duration-300 ${
          isDarkMode 
            ? 'bg-[#161B22]/80 text-[#3B82F6] border border-[#3B82F6]/20 shadow-[0_0_20px_rgba(59,130,246,0.3)]' 
            : 'bg-white/80 border border-slate-200 text-slate-700'
        }`}
        whileHover={{ 
          scale: 1.05,
          boxShadow: isDarkMode ? '0 0 30px rgba(59,130,246,0.5)' : '0 10px 25px rgba(0,0,0,0.15)'
        }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </motion.button>

      {/* Floating Gradient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className={`absolute top-20 -left-20 w-96 h-96 rounded-full blur-3xl ${
            isDarkMode 
              ? 'bg-gradient-to-br from-[#3B82F6]/20 to-[#8B5CF6]/20' 
              : 'bg-gradient-to-br from-blue-400/20 to-purple-400/20'
          }`}
          animate={{ 
            y: [0, -40, 0],
            x: [0, 30, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className={`absolute bottom-20 right-10 w-[500px] h-[500px] rounded-full blur-3xl ${
            isDarkMode 
              ? 'bg-gradient-to-br from-[#8B5CF6]/20 to-[#EC4899]/20' 
              : 'bg-gradient-to-br from-pink-400/20 to-indigo-400/20'
          }`}
          animate={{ 
            y: [0, 40, 0],
            x: [0, -20, 0],
            scale: [1, 1.15, 1]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Main Content */}
      <div className="min-h-screen  flex flex-col items-center justify-center px-6 relative z-10">
        <motion.div
          className="max-w-5xl mx-auto text-center w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Sparkle Icon */}
          <motion.div
            className="flex p-5 justify-center mb-8"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <motion.div 
              className={`p-5 rounded-2xl relative ${
                isDarkMode 
                  ? 'bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6]' 
                  : 'bg-gradient-to-br from-blue-500 to-purple-600'
              }`}
              animate={isDarkMode ? {
                boxShadow: [
                  '0 0 20px rgba(59,130,246,0.5)',
                  '0 0 40px rgba(139,92,246,0.6)',
                  '0 0 20px rgba(59,130,246,0.5)'
                ]
              } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-12 h-12 text-white" />
            </motion.div>
          </motion.div>

          {/* Title */}
          <motion.h1
            className="text-6xl md:text-7xl lg:text-8xl font-display font-bold mb-6 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <motion.span 
              className={isDarkMode 
                ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] via-[#8B5CF6] to-[#EC4899]' 
                : 'gradient-text'
              }
              style={{ backgroundSize: '200% auto' }}
              animate={{ backgroundPosition: ['0% center', '200% center'] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            >
              Product Review
            </motion.span>
            <br />
            <span className={isDarkMode ? 'text-[#F3F4F6]' : 'text-slate-800'}>Analyzer</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className={`text-xl md:text-2xl mb-4 font-light ${
              isDarkMode ? 'text-[#9CA3AF]' : 'text-slate-600'
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Created by <span className={`font-semibold ${
              isDarkMode ? 'text-[#3B82F6]' : 'text-slate-800'
            }`}>Aditya</span>
          </motion.p>

          {/* Description */}
          <motion.p
            className={`text-lg md:text-xl mb-12 max-w-3xl mx-auto leading-relaxed ${
              isDarkMode ? 'text-[#9CA3AF]' : 'text-slate-600'
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            Upload your product review dataset and explore intelligent visual insights powered by Machine Learning.
            <br />
            <span className={`text-base mt-3 block ${
              isDarkMode ? 'text-[#6B7280]' : 'text-slate-500'
            }`}>
              Powered by Logistic Regression ML model and TF-IDF NLP vectorizing technique
            </span>
          </motion.p>

          {/* Tech Stack Badges */}
          <motion.div
            className="flex flex-wrap justify-center gap-3 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
          >
            {techStack.map((tech, index) => (
              <motion.span
                key={tech.name}
                className={`px-5 py-2.5 backdrop-blur-md rounded-xl text-sm font-medium border transition-all duration-300 cursor-default ${
                  isDarkMode 
                    ? 'bg-[#161B22]/60 border-[#3B82F6]/30 text-[#9CA3AF] hover:border-[#3B82F6]/60 hover:text-[#3B82F6]' 
                    : `${tech.color} text-white border-transparent`
                }`}
                initial={{ opacity: 0, scale: 0, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ 
                  duration: 0.5, 
                  delay: 1.0 + index * 0.1,
                  type: 'spring',
                  stiffness: 200
                }}
                whileHover={{ 
                  scale: 1.05, 
                  y: -3,
                  boxShadow: isDarkMode ? '0 0 20px rgba(59,130,246,0.3)' : '0 10px 20px rgba(0,0,0,0.15)'
                }}
              >
                {tech.name}
              </motion.span>
            ))}
          </motion.div>

          {/* Get Started Button - Centered */}
          <div className="flex justify-center w-full mb-16">
            <motion.button
              onClick={() => navigate('/analyzer')}
              className={`group relative px-12 py-5 text-white text-lg font-semibold rounded-2xl overflow-hidden ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-[#6366F1] to-[#EC4899]' 
                  : 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500'
              }`}
              initial={{ opacity: 0, scale: 0.5, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2, type: 'spring', stiffness: 150 }}
              whileHover={{ 
                scale: 1.05, 
                y: -3,
                boxShadow: isDarkMode 
                  ? '0 0 40px rgba(99,102,241,0.6), 0 20px 40px rgba(0,0,0,0.3)' 
                  : '0 20px 40px rgba(0,0,0,0.25)'
              }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="relative z-10 flex items-center gap-3">
                Get Started
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  →
                </motion.span>
              </span>
              
              {/* Hover glow effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-[#EC4899] to-[#6366F1] opacity-0"
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              />
              
              {/* Pulsing glow in dark mode */}
              {isDarkMode && (
                <motion.div
                  className="absolute inset-0 rounded-2xl"
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(99,102,241,0.3)',
                      '0 0 40px rgba(99,102,241,0.5)',
                      '0 0 20px rgba(99,102,241,0.3)'
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}
            </motion.button>
          </div>

          {/* Features */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.5 }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className={`p-7 rounded-2xl backdrop-blur-md border transition-all duration-300 group ${
                  isDarkMode 
                    ? 'bg-[#161B22]/60 border-[#3B82F6]/20 hover:border-[#3B82F6]/50' 
                    : 'bg-white/70 border-white/40 hover:border-blue-300'
                }`}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 + index * 0.15, duration: 0.6, type: 'spring' }}
                whileHover={{ 
                  y: -8, 
                  scale: 1.03,
                  boxShadow: isDarkMode 
                    ? '0 0 30px rgba(59,130,246,0.3)' 
                    : '0 20px 40px rgba(0,0,0,0.12)'
                }}
              >
                <feature.icon className={`w-11 h-11 mx-auto mb-4 transition-all duration-300 ${
                  isDarkMode 
                    ? 'text-[#3B82F6] group-hover:text-[#8B5CF6]' 
                    : 'text-blue-600 group-hover:text-purple-600'
                }`} />
                <h3 className={`font-bold mb-2 text-lg ${
                  isDarkMode ? 'text-[#F3F4F6]' : 'text-slate-800'
                }`}>{feature.title}</h3>
                <p className={`text-sm leading-relaxed ${
                  isDarkMode ? 'text-[#9CA3AF]' : 'text-slate-600'
                }`}>{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>

        </motion.div>
      </div>

      {/* Footer */}
      <motion.footer
        className={`relative z-10 py-8 text-center text-sm max-w-3xl mx-auto px-6 ${
          isDarkMode ? 'text-[#9CA3AF]' : 'text-slate-500'
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 2.0 }}
      >
        <p className="mb-1">© 2025 Product Review Analyzer — Made with ❤️ using Python & ML</p>
      </motion.footer>
    </div>
  )
}

export default LandingPage
