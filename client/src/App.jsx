import { useState, useEffect } from 'react'
import axios from 'axios'

function App() {
  // Views: 'login', 'signup', 'dashboard'
  const [view, setView] = useState('login')
  const [token, setToken] = useState(localStorage.getItem('token'))
  
  // User Data States
  const [userData, setUserData] = useState(null)
  
  // Form States
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [photo, setPhoto] = useState('') // Base64 String for Image
  
  // Loading States
  const [loading, setLoading] = useState(false)
  const [updateLoading, setUpdateLoading] = useState(false)
  
  // Dark Mode State
  const [darkMode, setDarkMode] = useState(false)
  
   const API_URL = window.location.hostname === "localhost" 
    ? "http://localhost:5000" 
    : "https://profile-manager-x3bm.onrender.com";

  useEffect(() => {
    if (token) {
      fetchUserDashboard()
      setView('dashboard')
    }
  }, [token])

  // Token check when app loads
  useEffect(() => {
    if (token) {
      fetchUserDashboard()
      setView('dashboard')
    }
    
    // Check system preference for dark mode
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true)
    }
  }, [token])

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  // Image Handling
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      // File size validation (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size should be less than 5MB")
        return
      }
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhoto(reader.result) // Image converted to text string
      }
      reader.readAsDataURL(file)
    }
  }

  // Auth Functions
  const handleSignup = async () => {
    if (!name || !email || !password) {
      alert("Please fill all required fields")
      return
    }

    setLoading(true)
    try {
      await axios.post(`${API_URL}/signup`, { name, email, password, photo })
      alert("Signup Successful! Please Login.")
      setView('login')
      // Reset form
      setName('')
      setEmail('')
      setPassword('')
      setPhoto('')
    } catch (error) {
      alert(error.response?.data?.error || "Signup Failed")
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please enter both email and password")
      return
    }

    setLoading(true)
    try {
      const res = await axios.post(`${API_URL}/login`, { email, password })
      localStorage.setItem('token', res.data.token)
      setToken(res.data.token)
      alert("Login Successful!")
    } catch (error) {
      alert("Invalid Credentials")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setView('login')
    setUserData(null)
    setEmail('')
    setPassword('')
  }

  // Dashboard Functions
  const fetchUserDashboard = async () => {
    try {
      const res = await axios.get(`${API_URL}/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUserData(res.data)
      // Pre-fill edit fields
      setName(res.data.name)
      setPhoto(res.data.photo)
    } catch (error) {
      console.error("Session expired")
      handleLogout()
    }
  }

  const handleUpdate = async () => {
    if (!name.trim()) {
      alert("Name cannot be empty")
      return
    }

    setUpdateLoading(true)
    try {
      await axios.put(`${API_URL}/update`, 
        { name, photo },
        { headers: { Authorization: `Bearer ${token}` }}
      )
      alert("Profile Updated Successfully!")
      fetchUserDashboard()
    } catch (error) {
      console.error(error)
      alert("Update failed. Please try again.")
    } finally {
      setUpdateLoading(false)
    }
  }

  const handleDelete = async () => {
    if(window.confirm("Are you sure you want to delete your account? This action cannot be undone!")) {
      try {
        await axios.delete(`${API_URL}/delete`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        handleLogout()
        alert("Account deleted successfully")
      } catch (error) {
        alert("Failed to delete account")
      }
    }
  }

  // Theme classes based on dark mode
  const themeClasses = {
    background: darkMode 
      ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
      : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50',
    card: darkMode 
      ? 'bg-gray-800 border border-gray-700' 
      : 'bg-white border border-gray-100',
    text: {
      primary: darkMode ? 'text-white' : 'text-gray-900',
      secondary: darkMode ? 'text-gray-300' : 'text-gray-600',
      muted: darkMode ? 'text-gray-400' : 'text-gray-500'
    },
    input: darkMode 
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500' 
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
    button: {
      primary: darkMode 
        ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' 
        : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600',
      secondary: darkMode 
        ? 'bg-gray-700 hover:bg-gray-600 text-white' 
        : 'bg-gray-200 hover:bg-gray-300 text-gray-800',
      danger: darkMode 
        ? 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700' 
        : 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600',
      success: darkMode 
        ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700' 
        : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
    },
    status: {
      info: darkMode ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-200',
      success: darkMode ? 'bg-green-900/30 border-green-700' : 'bg-green-50 border-green-200',
      warning: darkMode ? 'bg-purple-900/30 border-purple-700' : 'bg-purple-50 border-purple-200'
    }
  }

  // Render Logic
  
  if (view === 'login') {
    return (
      <div className={`min-h-screen ${themeClasses.background} flex items-center justify-center p-4 w-full transition-all duration-300`}>
        <div className={`${themeClasses.card} rounded-3xl shadow-2xl p-8 w-full max-w-md backdrop-blur-sm bg-opacity-95 transition-all duration-300`}>
          {/* Theme Toggle */}
          <div className="flex justify-end mb-2">
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-200 text-gray-600'} transition-all duration-300`}
            >
              {darkMode ? '🌙' : '☀️'}
            </button>
          </div>

          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl font-bold">👤</span>
            </div>
            <h1 className={`text-3xl font-bold ${themeClasses.text.primary} mb-2`}>Welcome Back</h1>
            <p className={themeClasses.text.secondary}>Sign in to your account</p>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className={`block text-sm font-medium ${themeClasses.text.secondary} mb-2`}>Email Address</label>
              <input 
                type="email" 
                placeholder="Enter your email"
                className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 ${themeClasses.input}`}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${themeClasses.text.secondary} mb-2`}>Password</label>
              <input 
                type="password" 
                placeholder="Enter your password"
                className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 ${themeClasses.input}`}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            
            <button 
              onClick={handleLogin}
              disabled={loading}
              className={`w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-200 shadow-lg transform hover:scale-105 ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : themeClasses.button.primary
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
                  Signing In...
                </div>
              ) : 'Sign In'}
            </button>
          </div>
          
          <div className="text-center mt-6">
            <p className={themeClasses.text.secondary}>
              Don't have an account?{' '}
              <span 
                className="text-blue-400 hover:text-blue-300 font-semibold cursor-pointer transition-colors duration-200"
                onClick={() => setView('signup')}
              >
                Create Account
              </span>
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (view === 'signup') {
    return (
      <div className={`min-h-screen ${themeClasses.background} flex items-center justify-center p-4 w-full transition-all duration-300`}>
        <div className={`${themeClasses.card} rounded-3xl shadow-2xl p-8 w-full max-w-md backdrop-blur-sm bg-opacity-95 transition-all duration-300`}>
          {/* Theme Toggle */}
          <div className="flex justify-end mb-2">
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-200 text-gray-600'} transition-all duration-300`}
            >
              {darkMode ? '🌙' : '☀️'}
            </button>
          </div>

          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl font-bold">🚀</span>
            </div>
            <h1 className={`text-3xl font-bold ${themeClasses.text.primary} mb-2`}>Join Us Today</h1>
            <p className={themeClasses.text.secondary}>Create your account in seconds</p>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className={`block text-sm font-medium ${themeClasses.text.secondary} mb-2`}>Full Name</label>
              <input 
                type="text" 
                placeholder="Enter your full name"
                className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 ${themeClasses.input}`}
                onChange={e => setName(e.target.value)}
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${themeClasses.text.secondary} mb-2`}>Email Address</label>
              <input 
                type="email" 
                placeholder="Enter your email"
                className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 ${themeClasses.input}`}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${themeClasses.text.secondary} mb-2`}>Password</label>
              <input 
                type="password" 
                placeholder="Create a password"
                className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 ${themeClasses.input}`}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${themeClasses.text.secondary} mb-2`}>Profile Photo</label>
              <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 hover:border-purple-400 ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handlePhotoUpload}
                  className="hidden" 
                  id="photo-upload"
                />
                <label htmlFor="photo-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center">
                    <svg className={`w-10 h-10 mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className={`text-sm ${themeClasses.text.secondary}`}>Click to upload profile photo</span>
                    <span className={`text-xs ${themeClasses.text.muted} mt-1`}>PNG, JPG, JPEG up to 5MB</span>
                  </div>
                </label>
              </div>
            </div>
            
            {photo && (
              <div className="flex justify-center">
                <img 
                  src={photo} 
                  alt="Preview" 
                  className="w-24 h-24 rounded-full object-cover border-4 border-purple-400 shadow-lg transform hover:scale-105 transition-transform duration-200" 
                />
              </div>
            )}
            
            <button 
              onClick={handleSignup}
              disabled={loading}
              className={`w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-200 shadow-lg transform hover:scale-105 ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : themeClasses.button.primary
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
                  Creating Account...
                </div>
              ) : 'Create Account'}
            </button>
          </div>
          
          <div className="text-center mt-6">
            <p className={themeClasses.text.secondary}>
              Already have an account?{' '}
              <span 
                className="text-purple-400 hover:text-purple-300 font-semibold cursor-pointer transition-colors duration-200"
                onClick={() => setView('login')}
              >
                Sign In
              </span>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${themeClasses.background} p-4 w-full transition-all duration-300`}>
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className={`${themeClasses.card} rounded-3xl shadow-2xl p-8 mb-8 w-full backdrop-blur-sm bg-opacity-95 transition-all duration-300`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full">
            <div className="flex items-center space-x-6 mb-4 md:mb-0">
              {userData?.photo ? (
                <img 
                  src={userData.photo} 
                  alt="Profile" 
                  className="w-20 h-20 rounded-full object-cover border-4 border-blue-400 shadow-xl transform hover:scale-105 transition-transform duration-200" 
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-xl">
                  {userData?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
              <div>
                <h1 className={`text-3xl font-bold ${themeClasses.text.primary} mb-1`}>Welcome back, {userData?.name}! 👋</h1>
                <p className={themeClasses.text.secondary}>{userData?.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleDarkMode}
                className={`p-3 rounded-full ${darkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-200 text-gray-600'} transition-all duration-300 shadow-md`}
                title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {darkMode ? '🌙' : '☀️'}
              </button>
              <button 
                onClick={handleLogout}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg transform hover:scale-105 ${themeClasses.button.secondary}`}
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 w-full">
          {/* Profile Management - 3 columns */}
          <div className="xl:col-span-3">
            <div className={`${themeClasses.card} rounded-3xl shadow-2xl p-8 w-full backdrop-blur-sm bg-opacity-95 transition-all duration-300`}>
              <div className="flex items-center justify-between mb-8">
                <h2 className={`text-2xl font-bold ${themeClasses.text.primary}`}>Profile Management</h2>
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              
              <div className="space-y-8 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-sm font-medium ${themeClasses.text.secondary} mb-3`}>Full Name</label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 ${themeClasses.input}`}
                      placeholder="Update your name"
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium ${themeClasses.text.secondary} mb-3`}>Email</label>
                    <input 
                      type="email" 
                      value={userData?.email || ''}
                      disabled
                      className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 ${themeClasses.input} opacity-70 cursor-not-allowed`}
                    />
                  </div>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${themeClasses.text.secondary} mb-3`}>Profile Photo</label>
                  <div className="flex flex-col lg:flex-row lg:items-center space-y-6 lg:space-y-0 lg:space-x-8 w-full">
                    <div className="flex-shrink-0">
                      {photo ? (
                        <img 
                          src={photo} 
                          alt="Current" 
                          className="w-28 h-28 rounded-full object-cover border-4 border-blue-400 shadow-xl transform hover:scale-105 transition-transform duration-200" 
                        />
                      ) : (
                        <div className="w-28 h-28 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-3xl shadow-xl">
                          {name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>
                    <div className="flex-grow">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handlePhotoUpload}
                        className="hidden" 
                        id="update-photo"
                      />
                      <label 
                        htmlFor="update-photo" 
                        className={`inline-flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg transform hover:scale-105 cursor-pointer ${themeClasses.button.primary}`}
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Change Photo
                      </label>
                      <p className={`text-sm ${themeClasses.text.muted} mt-3`}>Upload a new profile picture (max 5MB)</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-4 pt-6">
                  <button 
                    onClick={handleUpdate}
                    disabled={updateLoading}
                    className={`px-8 py-4 rounded-xl font-semibold text-white transition-all duration-200 shadow-lg transform hover:scale-105 ${
                      updateLoading 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : themeClasses.button.success
                    }`}
                  >
                    {updateLoading ? (
                      <div className="flex items-center">
                        <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
                        Updating...
                      </div>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Update Profile
                      </>
                    )}
                  </button>
                  
                  <button 
                    onClick={handleDelete}
                    className={`px-8 py-4 rounded-xl font-semibold text-white transition-all duration-200 shadow-lg transform hover:scale-105 ${themeClasses.button.danger}`}
                  >
                    <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Sidebar - 1 column */}
          <div className="space-y-8">
            {/* Stats Card */}
            <div className={`${themeClasses.card} rounded-3xl shadow-2xl p-6 backdrop-blur-sm bg-opacity-95 transition-all duration-300`}>
              <h3 className={`text-xl font-bold ${themeClasses.text.primary} mb-6`}>Profile Overview</h3>
              <div className="space-y-4">
                <div className={`p-4 rounded-xl border transition-all duration-200 transform hover:scale-105 ${themeClasses.status.info}`}>
                  <h4 className={`font-semibold mb-2 ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>Account Status</h4>
                  <p className={`text-sm ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>Active & Verified</p>
                </div>
                
                <div className={`p-4 rounded-xl border transition-all duration-200 transform hover:scale-105 ${themeClasses.status.success}`}>
                  <h4 className={`font-semibold mb-2 ${darkMode ? 'text-green-300' : 'text-green-700'}`}>Member Since</h4>
                  <p className={`text-sm ${darkMode ? 'text-green-400' : 'text-green-600'}`}>{new Date().toLocaleDateString()}</p>
                </div>
                
                <div className={`p-4 rounded-xl border transition-all duration-200 transform hover:scale-105 ${themeClasses.status.warning}`}>
                  <h4 className={`font-semibold mb-2 ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>Profile Photo</h4>
                  <p className={`text-sm ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                    {userData?.photo ? 'Uploaded' : 'Not uploaded'}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className={`${themeClasses.card} rounded-3xl shadow-2xl p-6 backdrop-blur-sm bg-opacity-95 transition-all duration-300`}>
              <h3 className={`text-xl font-bold ${themeClasses.text.primary} mb-6`}>Quick Actions</h3>
              <div className="space-y-3">
                <button className={`w-full text-left p-4 rounded-xl transition-all duration-200 transform hover:scale-105 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}>
                  <span className={`font-medium ${themeClasses.text.primary}`}>Privacy Settings</span>
                </button>
                <button className={`w-full text-left p-4 rounded-xl transition-all duration-200 transform hover:scale-105 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}>
                  <span className={`font-medium ${themeClasses.text.primary}`}>Security</span>
                </button>
                <button className={`w-full text-left p-4 rounded-xl transition-all duration-200 transform hover:scale-105 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}>
                  <span className={`font-medium ${themeClasses.text.primary}`}>Help & Support</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App