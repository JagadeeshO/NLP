import { useState, useLayoutEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Upload, ArrowLeft, FileText, Loader2, CheckCircle2, AlertCircle, Moon, Sun, Search } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const AnalyzerPage = () => {
  const navigate = useNavigate()
  const [file, setFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

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

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && (droppedFile.name.endsWith('.csv') || droppedFile.name.endsWith('.xlsx'))) {
      setFile(droppedFile)
      handleFileUpload(droppedFile)
    }
  }

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      handleFileUpload(selectedFile)
    }
  }

  const handleFileUpload = async (uploadFile) => {
    setIsLoading(true)
    setError(null)
    setResults(null)

    const formData = new FormData()
    formData.append('file', uploadFile)

    try {
      // Use relative URL so it works both locally and on Railway
      const apiUrl = import.meta.env.PROD ? '/api/predict' : 'http://localhost:5000/api/predict'
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Prevent auto-scroll by maintaining scroll position
        const currentScrollPosition = window.scrollY
        setResults(data)
        // Restore scroll position after state update
        setTimeout(() => {
          window.scrollTo(0, currentScrollPosition)
        }, 0)
      } else {
        setError(data.error || 'Failed to analyze file')
      }
    } catch (err) {
      setError('Failed to connect to server. Make sure the backend is running.')
    } finally {
      setIsLoading(false)
    }
  }

  const COLORS = ['#06B6D4', '#8B5CF6', '#EC4899']
  const DARK_COLORS = ['#06B6D4', '#8B5CF6', '#EC4899']

  return (
    <div className={`min-h-screen p-6 transition-colors duration-700 ${
      isDarkMode ? 'bg-[#0D1117]' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'
    }`}>
      {/* Floating Gradient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className={`absolute top-20 -left-20 w-96 h-96 rounded-full blur-3xl ${
            isDarkMode ? 'bg-gradient-to-br from-[#3B82F6]/15 to-[#8B5CF6]/15' : 'bg-gradient-to-br from-blue-400/20 to-purple-400/20'
          }`}
          animate={{ y: [0, -40, 0], x: [0, 30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className={`absolute bottom-20 right-10 w-[500px] h-[500px] rounded-full blur-3xl ${
            isDarkMode ? 'bg-gradient-to-br from-[#8B5CF6]/15 to-[#EC4899]/15' : 'bg-gradient-to-br from-pink-400/20 to-indigo-400/20'
          }`}
          animate={{ y: [0, 40, 0], x: [0, -20, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

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
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
      >
        {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </motion.button>

      {/* Header */}
      <motion.header
        className="max-w-7xl mx-auto mb-12 flex items-center justify-between relative z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-4">
          <motion.button
            onClick={() => navigate('/')}
            className={`p-3 rounded-xl backdrop-blur-md border transition-all duration-300 ${
              isDarkMode 
                ? 'bg-[#161B22]/60 border-[#3B82F6]/20 text-[#9CA3AF] hover:border-[#3B82F6]/60 hover:text-[#3B82F6]' 
                : 'bg-white/70 border-white/40 text-slate-700 hover:bg-white'
            }`}
            whileHover={{ x: -5, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <h1 className={`text-2xl md:text-3xl font-display font-bold ${
            isDarkMode ? 'text-[#F3F4F6]' : 'text-slate-800'
          }`}>
            Product Review Analyzer
          </h1>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto">
        {/* Upload Section */}
        <AnimatePresence mode="wait">
          {!results && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-2xl mx-auto"
            >
              <div
                className={`rounded-3xl p-12 text-center backdrop-blur-md border transition-all duration-500 ${
                  isDarkMode 
                    ? isDragging 
                      ? 'bg-[#161B22]/80 border-[#3B82F6] scale-105 shadow-[0_0_50px_rgba(59,130,246,0.5)]' 
                      : 'bg-[#161B22]/60 border-[#3B82F6]/30 shadow-lg'
                    : isDragging 
                      ? 'bg-white/80 border-blue-500 border-4 scale-105' 
                      : 'bg-white/70 border-white/40 border-2'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <motion.div
                  className="flex justify-center mb-8"
                  animate={{ 
                    y: isDragging ? -10 : 0,
                    scale: isDragging ? 1.1 : 1
                  }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <motion.div 
                    className={`p-6 rounded-3xl ${
                      isDarkMode 
                        ? 'bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6]' 
                        : 'bg-gradient-to-br from-blue-500 to-purple-600'
                    }`}
                    animate={isDarkMode ? {
                      boxShadow: [
                        '0 0 20px rgba(59,130,246,0.4)',
                        '0 0 40px rgba(139,92,246,0.5)',
                        '0 0 20px rgba(59,130,246,0.4)'
                      ]
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Upload className="w-14 h-14 text-white" />
                  </motion.div>
                </motion.div>

                <h2 className={`text-3xl md:text-4xl font-display font-bold mb-5 ${
                  isDarkMode ? 'text-[#F3F4F6]' : 'text-slate-800'
                }`}>
                  Upload Your Dataset
                </h2>
                <p className={`mb-10 text-lg ${
                  isDarkMode ? 'text-[#9CA3AF]' : 'text-slate-600'
                }`}>
                  Drop your CSV or Excel file here, or click to browse
                  <br />
                  <span className={`text-sm mt-2 block ${
                    isDarkMode ? 'text-[#6B7280]' : 'text-slate-500'
                  }`}>
                    File must contain <strong>Product</strong> and <strong>Review</strong> columns
                  </span>
                </p>

                <input
                  type="file"
                  accept=".csv,.xlsx"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <motion.div
                    className={`inline-flex items-center gap-3 px-10 py-4 text-white font-semibold rounded-2xl cursor-pointer transition-all ${
                      isDarkMode 
                        ? 'bg-gradient-to-r from-[#6366F1] to-[#EC4899]' 
                        : 'bg-gradient-to-r from-blue-600 to-purple-600'
                    }`}
                    whileHover={{ 
                      scale: 1.05, 
                      y: -3,
                      boxShadow: isDarkMode 
                        ? '0 0 40px rgba(99,102,241,0.5)' 
                        : '0 20px 30px rgba(0,0,0,0.15)'
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FileText className="w-5 h-5" />
                    Choose File
                  </motion.div>
                </label>

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`mt-10 flex items-center justify-center gap-3 ${
                      isDarkMode ? 'text-[#3B82F6]' : 'text-blue-600'
                    }`}
                  >
                    <Loader2 className="w-7 h-7 animate-spin" />
                    <span className="text-lg font-medium">Analyzing your data...</span>
                  </motion.div>
                )}

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-10 p-5 rounded-2xl backdrop-blur-md flex items-center gap-3 border ${
                      isDarkMode 
                        ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                        : 'bg-red-50 border-red-200 text-red-600'
                    }`}
                  >
                    <AlertCircle className="w-6 h-6" />
                    <span className="text-sm">{error}</span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* Results Section */}
          {results && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Success Message */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring' }}
                className={`mb-10 p-6 rounded-2xl flex items-center gap-4 max-w-4xl mx-auto backdrop-blur-md border relative z-10 ${
                  isDarkMode 
                    ? 'bg-[#161B22]/70 border-[#22C55E]/30 shadow-[0_0_30px_rgba(34,197,94,0.15)]' 
                    : 'bg-white/80 border-white/40 shadow-xl'
                }`}
              >
                <div className={`p-3 rounded-xl ${
                  isDarkMode ? 'bg-[#22C55E]/10 border border-[#22C55E]/30' : 'bg-green-50'
                }`}>
                  <CheckCircle2 className={`w-9 h-9 ${
                    isDarkMode ? 'text-[#22C55E]' : 'text-green-500'
                  }`} />
                </div>
                <div className="flex-1">
                  <p className={`font-bold text-xl ${
                    isDarkMode ? 'text-[#F3F4F6]' : 'text-slate-800'
                  }`}>Analysis Complete!</p>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-[#9CA3AF]' : 'text-slate-600'
                  }`}>
                    Analyzed <strong>{results.total_reviews}</strong> reviews successfully
                  </p>
                </div>
                <motion.button
                  onClick={() => {
                    setResults(null)
                    setFile(null)
                    setError(null)
                  }}
                  className={`px-6 py-3 rounded-xl font-medium border ${
                    isDarkMode 
                      ? 'bg-[#3B82F6]/10 border-[#3B82F6]/30 text-[#3B82F6] hover:bg-[#3B82F6]/20' 
                      : 'bg-blue-500 text-white hover:bg-blue-600 border-transparent'
                  }`}
                  whileHover={{ scale: 1.05, boxShadow: isDarkMode ? '0 0 20px rgba(59,130,246,0.3)' : '0 10px 20px rgba(0,0,0,0.1)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  Upload New File
                </motion.button>
              </motion.div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Sentiment Distribution Pie Chart */}
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
                  className={`rounded-3xl p-8 backdrop-blur-md border relative z-10 ${
                    isDarkMode 
                      ? 'bg-[#161B22]/70 border-[#3B82F6]/20 shadow-lg' 
                      : 'bg-white/80 border-white/40 shadow-xl'
                  }`}
                  whileHover={{ 
                    y: -5, 
                    borderColor: isDarkMode ? 'rgba(59,130,246,0.5)' : 'rgba(59,130,246,0.3)',
                    boxShadow: isDarkMode ? '0 0 40px rgba(59,130,246,0.2)' : '0 25px 50px -12px rgba(0,0,0,0.15)' 
                  }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-1.5 h-9 rounded-full ${
                      isDarkMode ? 'bg-[#3B82F6]' : 'bg-blue-600'
                    }`} />
                    <h3 className={`text-xl font-display font-bold ${
                      isDarkMode ? 'text-[#F3F4F6]' : 'text-slate-800'
                    }`}>
                      📊 Sentiment Distribution
                    </h3>
                  </div>
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                      <defs>
                        {/* Gradient definitions for each slice */}
                        <linearGradient id="positiveGradient" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#06B6D4" stopOpacity={1}/>
                          <stop offset="100%" stopColor="#0891B2" stopOpacity={1}/>
                        </linearGradient>
                        <linearGradient id="negativeGradient" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#8B5CF6" stopOpacity={1}/>
                          <stop offset="100%" stopColor="#7C3AED" stopOpacity={1}/>
                        </linearGradient>
                        <linearGradient id="neutralGradient" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#EC4899" stopOpacity={1}/>
                          <stop offset="100%" stopColor="#DB2777" stopOpacity={1}/>
                        </linearGradient>
                      </defs>
                      <Pie
                        data={Object.entries(results.sentiment_distribution).map(([key, value]) => ({
                          name: key,
                          value: value,
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={{
                          stroke: isDarkMode ? '#9CA3AF' : '#64748b',
                          strokeWidth: 2
                        }}
                        label={({ name, percent, cx, cy, midAngle, innerRadius, outerRadius }) => {
                          const RADIAN = Math.PI / 180;
                          const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                          const x = cx + radius * Math.cos(-midAngle * RADIAN);
                          const y = cy + radius * Math.sin(-midAngle * RADIAN);
                          
                          return (
                            <text 
                              x={x} 
                              y={y} 
                              fill={isDarkMode ? '#F3F4F6' : 'black'}
                              textAnchor={x > cx ? 'start' : 'end'} 
                              dominantBaseline="central"
                              className="font-bold text-sm"
                            >
                              {`${name} ${(percent * 100).toFixed(1)}%`}
                            </text>
                          );
                        }}
                        outerRadius={110}
                        innerRadius={65}
                        dataKey="value"
                        animationBegin={200}
                        animationDuration={1000}
                        animationEasing="ease-out"
                      >
                        {Object.entries(results.sentiment_distribution).map(([key], index) => {
                          let gradientId = 'positiveGradient';
                          if (key.toLowerCase().includes('negative')) gradientId = 'negativeGradient';
                          if (key.toLowerCase().includes('neutral')) gradientId = 'neutralGradient';
                          if (key.toLowerCase().includes('positive')) gradientId = 'positiveGradient';
                          
                          return (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={`url(#${gradientId})`}
                              strokeWidth={3}
                              stroke={isDarkMode ? '#0D1117' : '#fff'}
                              style={{
                                filter: isDarkMode ? 'drop-shadow(0 0 8px rgba(59,130,246,0.3))' : 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))'
                              }}
                            />
                          );
                        })}
                      </Pie>
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: isDarkMode ? '#161B22' : '#fff',
                          border: isDarkMode ? '1px solid rgba(59,130,246,0.3)' : '1px solid #e2e8f0',
                          borderRadius: '12px',
                          color: isDarkMode ? '#F3F4F6' : '#000',
                          boxShadow: isDarkMode ? '0 0 20px rgba(59,130,246,0.2)' : '0 10px 20px rgba(0,0,0,0.1)',
                          padding: '12px',
                          fontWeight: 'bold'
                        }}
                        itemStyle={{
                          color: isDarkMode ? '#F3F4F6' : '#000'
                        }}
                      />
                      <Legend 
                        wrapperStyle={{
                          paddingTop: '20px'
                        }}
                        iconType="circle"
                        iconSize={12}
                        formatter={(value) => (
                          <span className={`font-medium ${
                            isDarkMode ? 'text-[#9CA3AF]' : 'text-slate-700'
                          }`}>
                            {value}
                          </span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </motion.div>

                {/* Top Products Bar Chart */}
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
                  className={`rounded-3xl p-8 backdrop-blur-md border relative z-10 ${
                    isDarkMode 
                      ? 'bg-[#161B22]/70 border-[#8B5CF6]/20 shadow-lg' 
                      : 'bg-white/80 border-white/40 shadow-xl'
                  }`}
                  whileHover={{ 
                    y: -5, 
                    borderColor: isDarkMode ? 'rgba(139,92,246,0.5)' : 'rgba(139,92,246,0.3)',
                    boxShadow: isDarkMode ? '0 0 40px rgba(139,92,246,0.2)' : '0 25px 50px -12px rgba(0,0,0,0.15)' 
                  }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-1.5 h-9 rounded-full ${
                      isDarkMode ? 'bg-[#8B5CF6]' : 'bg-purple-600'
                    }`} />
                    <h3 className={`text-xl font-display font-bold ${
                      isDarkMode ? 'text-[#F3F4F6]' : 'text-slate-800'
                    }`}>
                      🏆 Top Products by Positive Sentiment
                    </h3>
                  </div>
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart
                      data={Object.entries(results.top_products)
                        .map(([name, value]) => ({
                          name: name.length > 20 ? name.substring(0, 20) + '...' : name,
                          score: (value * 100).toFixed(1),
                        }))
                        .slice(0, 8)}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <XAxis 
                        type="number" 
                        domain={[0, 100]} 
                        tick={{ fill: isDarkMode ? '#9ca3af' : '#64748b' }}
                      />
                      <YAxis 
                        type="category" 
                        dataKey="name" 
                        width={150} 
                        tick={{ fill: isDarkMode ? '#9ca3af' : '#64748b', fontSize: 12 }}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: isDarkMode ? '#161B22' : '#fff',
                          border: isDarkMode ? '1px solid rgba(139,92,246,0.3)' : '1px solid #e2e8f0',
                          borderRadius: '12px',
                          color: isDarkMode ? '#F3F4F6' : '#000',
                          boxShadow: isDarkMode ? '0 0 20px rgba(139,92,246,0.2)' : '0 10px 20px rgba(0,0,0,0.1)'
                        }}
                        cursor={{ fill: isDarkMode ? 'rgba(139,92,246,0.1)' : 'rgba(0,0,0,0.05)' }}
                      />
                      <Bar 
                        dataKey="score" 
                        fill={isDarkMode ? 'url(#darkGradient)' : 'url(#lightGradient)'}
                        radius={[0, 12, 12, 0]}
                        animationDuration={1000}
                      />
                      <defs>
                        <linearGradient id="darkGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#06B6D4" stopOpacity={1}/>
                          <stop offset="50%" stopColor="#3B82F6" stopOpacity={0.9}/>
                          <stop offset="100%" stopColor="#8B5CF6" stopOpacity={1}/>
                        </linearGradient>
                        <linearGradient id="lightGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.9}/>
                          <stop offset="50%" stopColor="#3B82F6" stopOpacity={0.85}/>
                          <stop offset="100%" stopColor="#8B5CF6" stopOpacity={1}/>
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>
              </div>

              {/* Sample Predictions Table */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 100 }}
                className={`rounded-3xl p-8 backdrop-blur-md border relative z-10 ${
                  isDarkMode 
                    ? 'bg-[#161B22]/70 border-[#EC4899]/20 shadow-lg' 
                    : 'bg-white/80 border-white/40 shadow-xl'
                }`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-1.5 h-9 rounded-full ${
                      isDarkMode ? 'bg-[#EC4899]' : 'bg-indigo-600'
                    }`} />
                    <h3 className={`text-xl font-display font-bold ${
                      isDarkMode ? 'text-[#F3F4F6]' : 'text-slate-800'
                    }`}>
                      🔍 Sample Predictions
                    </h3>
                  </div>
                  
                  {/* Search Bar */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search reviews..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`pl-10 pr-4 py-2.5 rounded-xl border backdrop-blur-sm transition-all duration-300 ${
                        isDarkMode 
                          ? 'bg-[#0D1117]/50 border-[#3B82F6]/30 text-[#F3F4F6] placeholder-[#6B7280] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20' 
                          : 'bg-white/50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                      }`}
                    />
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                      isDarkMode ? 'text-[#6B7280]' : 'text-slate-400'
                    }`} />
                  </div>
                </div>
                <div className="overflow-x-auto rounded-2xl">
                  <table className="w-full">
                    <thead>
                      <tr className={`border-b-2 ${
                        isDarkMode ? 'border-[#3B82F6]/20 bg-[#0D1117]/50' : 'border-slate-200 bg-slate-50/50'
                      }`}>
                        <th className={`text-left py-4 px-6 font-bold text-xs uppercase tracking-wider ${
                          isDarkMode ? 'text-[#9CA3AF]' : 'text-slate-700'
                        }`}>Product</th>
                        <th className={`text-left py-4 px-6 font-bold text-xs uppercase tracking-wider ${
                          isDarkMode ? 'text-[#9CA3AF]' : 'text-slate-700'
                        }`}>Review</th>
                        <th className={`text-center py-4 px-6 font-bold text-xs uppercase tracking-wider ${
                          isDarkMode ? 'text-[#9CA3AF]' : 'text-slate-700'
                        }`}>Sentiment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.sample_predictions
                        .filter(row => 
                          searchQuery === '' || 
                          row.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          row.review.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          row.sentiment_label.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((row, index) => (
                        <motion.tr
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + index * 0.03 }}
                          className={`border-b transition-all duration-300 ${
                            isDarkMode 
                              ? 'border-[#374151]/30 hover:bg-[#1F2937]/30' 
                              : 'border-slate-100 hover:bg-slate-50/80'
                          }`}
                          whileHover={{ scale: 1.005, x: 3 }}
                        >
                          <td className={`py-4 px-6 font-medium max-w-xs truncate ${
                            isDarkMode ? 'text-[#E5E7EB]' : 'text-slate-800'
                          }`}>
                            {row.product_name}
                          </td>
                          <td className={`py-4 px-6 max-w-md truncate ${
                            isDarkMode ? 'text-[#9CA3AF]' : 'text-slate-600'
                          }`}>
                            {row.review}
                          </td>
                          <td className="py-4 px-6 text-center">
                            <motion.span
                              className={`inline-block px-4 py-2 rounded-xl text-xs font-bold border ${
                                row.sentiment_label === 'Positive'
                                  ? isDarkMode 
                                    ? 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/30' 
                                    : 'bg-green-100 text-green-700 border-green-200'
                                  : isDarkMode 
                                    ? 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30' 
                                    : 'bg-red-100 text-red-700 border-red-200'
                              }`}
                              whileHover={{ scale: 1.08, boxShadow: row.sentiment_label === 'Positive' ? '0 0 15px rgba(34,197,94,0.3)' : '0 0 15px rgba(239,68,68,0.3)' }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {row.sentiment_label}
                            </motion.span>
                          </td>
                        </motion.tr>
                      ))}
                      {results.sample_predictions.filter(row => 
                        searchQuery === '' || 
                        row.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        row.review.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        row.sentiment_label.toLowerCase().includes(searchQuery.toLowerCase())
                      ).length === 0 && (
                        <tr>
                          <td colSpan="3" className="py-8 text-center">
                            <p className={`text-sm ${
                              isDarkMode ? 'text-[#9CA3AF]' : 'text-slate-500'
                            }`}>
                              No results found for "{searchQuery}"
                            </p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default AnalyzerPage
