import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import { supabase } from '../supabaseClient';
import axios from 'axios';
import { Camera, ShieldCheck, UserPlus, LogIn, Loader2, CheckCircle2, XCircle, UploadCloud, Monitor, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.PROD ? '' : 'http://localhost:8000';

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'
  const navigate = useNavigate();
  
  // States
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [registerStep, setRegisterStep] = useState(1); // 1 = Account Create + OTP, 2 = Biometrics
  
  const [uploadMode, setUploadMode] = useState('camera'); // 'camera' or 'file'
  const [status, setStatus] = useState({ state: 'idle', message: '' }); 
  const [selectedFile, setSelectedFile] = useState(null);
  const webcamRef = useRef(null);

  const dataURLtoFile = (dataurl, filename) => {
    let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type:mime});
  }

  // OTP Logic
  const handleSendOtp = async () => {
    if (!email) return setStatus({ state: 'error', message: 'Email is required to send OTP' });
    try {
      await axios.post(`${API_URL}/send-otp`, { email });
      setIsOtpSent(true);
      setStatus({ state: 'success', message: 'Verification code generated!' });
    } catch (err) {
      // Even if network error, we want to allow the user to try entering a code if they have it
      setIsOtpSent(true); 
      setStatus({ state: 'error', message: 'Connection issue. Check logs for code.' });
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return setStatus({ state: 'error', message: 'Please enter the OTP' });
    setStatus({ state: 'loading', message: 'Verifying code...' });
    try {
      await axios.post(`${API_URL}/verify-otp`, { email, otp });
      setIsOtpVerified(true);
      setStatus({ state: 'success', message: 'Email verified! You can now create your account.' });
    } catch (err) {
      setStatus({ state: 'error', message: err.response?.data?.detail || 'Invalid or expired OTP' });
    }
  };

  // Two-Step Registration Logic
  const handleRegisterStep1 = async () => {
    if (!email || !username) return setStatus({ state: 'error', message: 'Email and Username are required' });
    if (!isOtpVerified) return setStatus({ state: 'error', message: 'Please verify your email via OTP first' });
    setStatus({ state: 'loading', message: 'Creating database record...' });
    
    try {
      // Create space in the database first
      const { error } = await supabase
        .from('users')
        .insert([{ email, username }]); // face_embedding will default to NULL
        
      if (error) {
          if (error.code === '23505') {
              setStatus({ state: 'success', message: 'Account exists! Attaching face to existing account.' });
              setRegisterStep(2);
              return;
          }
          throw error;
      }
      
      setStatus({ state: 'success', message: 'Account row created! Now scan your face.' });
      setRegisterStep(2);
    } catch (err) {
      setStatus({ state: 'error', message: err.message || 'Database creation failed' });
    }
  };

  const handleRegisterStep2 = async () => {
    if (uploadMode === 'file' && !selectedFile) return setStatus({ state: 'error', message: 'Please upload an image file' });
    setStatus({ state: 'loading', message: 'Extracting PyTorch features...' });
    
    try {
      let file;
      if (uploadMode === 'camera') {
        const imageSrc = webcamRef.current.getScreenshot();
        if (!imageSrc) throw new Error('Could not access camera');
        file = dataURLtoFile(imageSrc, 'face.jpg');
      } else {
        file = selectedFile;
      }
      
      const formData = new FormData();
      formData.append('file', file);
      const res = await axios.post(`${API_URL}/embed`, formData);
      const embedding = res.data.embedding; 
      
      setStatus({ state: 'loading', message: 'Adding features to database row...' });
      
      const { data, error } = await supabase
        .from('users')
        .update({ face_embedding: JSON.stringify(embedding) })
        .eq('email', email);
        
      if (error) throw error;
      setStatus({ state: 'success', message: 'Biometric scan complete! You can now Sign In.' });
      
      setTimeout(() => {
          setActiveTab('login');
          setRegisterStep(1);
          setStatus({ state: 'idle', message: '' });
      }, 2000);
      
    } catch (err) {
      if (err.response?.data?.detail) {
           setStatus({ state: 'error', message: err.response.data.detail });
      } else {
           setStatus({ state: 'error', message: err.message || 'Feature extraction failed' });
      }
    }
  };

  const handleLogin = async () => {
    if (!email) return setStatus({ state: 'error', message: 'Email is required' });
    if (uploadMode === 'file' && !selectedFile) return setStatus({ state: 'error', message: 'Please upload an image file' });
    
    setStatus({ state: 'loading', message: 'Fetching user features from database...' });
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
        
      if (error || !data) throw new Error('Identity not found');
      if (!data.face_embedding) throw new Error('User has not added a face scan yet!');
      
      setStatus({ state: 'loading', message: 'Comparing features...' });
      
      let file;
      if (uploadMode === 'camera') {
        const imageSrc = webcamRef.current.getScreenshot();
        if (!imageSrc) throw new Error('Could not access camera');
        file = dataURLtoFile(imageSrc, 'live-face.jpg');
      } else {
        file = selectedFile;
      }
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('stored_embedding', data.face_embedding);
      
      const res = await axios.post(`${API_URL}/verify`, formData);
      const result = res.data;
      
      if (result.granted) {
          setStatus({ state: 'success', message: `Hello ${data.username}! Access Granted. Redirecting to Analyzer...` });
          // Store auth state in session/local storage for simplicity
          sessionStorage.setItem('is_authenticated', 'true');
          sessionStorage.setItem('user_name', data.username);
          
          setTimeout(() => {
            navigate('/analyzer');
          }, 1500);
      } else {
          setStatus({ state: 'error', message: `Access Denied! Face mismatch. (Distance: ${result.distance.toFixed(3)})` });
      }
    } catch (err) {
      if (err.response?.data?.detail) {
           setStatus({ state: 'error', message: err.response.data.detail });
      } else {
           setStatus({ state: 'error', message: err.message || 'Login failed' });
      }
    }
  };

  const switchTab = (tab) => {
      setActiveTab(tab); 
      setStatus({state:'idle', message:''}); 
      setRegisterStep(1);
      setIsOtpSent(false);
      setIsOtpVerified(false);
      setOtp('');
      // Force camera mode on tab switch for maximum security
      setUploadMode('camera');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-pulse delay-1000"></div>

      <div className="glass-card w-full max-w-md overflow-hidden relative z-10">
        <div className="p-8 text-center border-b border-gray-800/50">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/30 mb-6">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Biometric Auth</h1>
          <p className="text-gray-400 text-sm">Two-step deep learning protocol</p>
        </div>

        <div className="flex border-b border-gray-800/50">
          <button onClick={() => switchTab('login')} className={`flex-1 py-4 text-sm font-medium transition-colors ${activeTab === 'login' ? 'text-white border-b-2 border-indigo-500' : 'text-gray-500 hover:text-gray-300'}`}>
            <LogIn className="w-4 h-4 inline mr-2" /> Sign In
          </button>
          <button onClick={() => switchTab('register')} className={`flex-1 py-4 text-sm font-medium transition-colors ${activeTab === 'register' ? 'text-white border-b-2 border-indigo-500' : 'text-gray-500 hover:text-gray-300'}`}>
            <UserPlus className="w-4 h-4 inline mr-2" /> Registration
          </button>
        </div>

        {/* Input Toggle for Photos (Only for Registration Step 2) */}
        {(activeTab === 'register' && registerStep === 2) && (
            <div className="flex bg-gray-900/50 p-1 mx-8 mt-6 rounded-lg border border-gray-800/50">
               <button onClick={() => setUploadMode('camera')} className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${uploadMode === 'camera' ? 'bg-indigo-500 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}>
                 <Monitor className="w-3 h-3 inline mr-1" /> Use Webcam
               </button>
               <button onClick={() => setUploadMode('file')} className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${uploadMode === 'file' ? 'bg-indigo-500 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}>
                 <UploadCloud className="w-3 h-3 inline mr-1" /> Desktop Image
               </button>
            </div>
        )}

        <div className="p-8 space-y-6">
          
          {/* STEP 1 FIELDS / LOGIN FIELDS */}
          {(activeTab === 'login' || (activeTab === 'register' && registerStep === 1)) && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Email Access</label>
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono text-sm shadow-inner"
                placeholder="neo@matrix.com"
              />
            </div>

            {activeTab === 'register' && (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Username</label>
              <input 
                type="text" 
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono text-sm shadow-inner"
                placeholder="morpheus"
              />
            </div>
            )}

            {activeTab === 'register' && registerStep === 1 && (
              <div className="space-y-4 pt-2">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-400 mb-2">Email OTP Verification</label>
                  <div className="flex space-x-2">
                    <input 
                      type="text" 
                      value={otp}
                      onChange={e => setOtp(e.target.value)}
                      disabled={!isOtpSent || isOtpVerified}
                      className="flex-1 bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono text-center tracking-[0.5em] text-lg shadow-inner disabled:opacity-50"
                      placeholder="000000"
                      maxLength={6}
                    />
                    {!isOtpSent ? (
                      <button 
                        onClick={handleSendOtp}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 rounded-xl text-xs font-bold transition-colors whitespace-nowrap"
                      >
                        Send OTP
                      </button>
                    ) : !isOtpVerified ? (
                      <button 
                        onClick={handleVerifyOtp}
                        className="bg-green-600 hover:bg-green-500 text-white px-4 rounded-xl text-xs font-bold transition-colors whitespace-nowrap"
                      >
                        Verify
                      </button>
                    ) : (
                      <div className="bg-green-900/30 border border-green-500/50 text-green-400 px-4 rounded-xl flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  {isOtpSent && !isOtpVerified && (
                    <p className="text-[10px] text-gray-500 mt-2 text-center uppercase tracking-widest">Verification code sent to email</p>
                  )}
                </div>
              </div>
            )}
          </div>
          )}

          {/* STEP 2 FIELD / LOGIN FIELD (Camera/Upload) */}
          {((activeTab === 'register' && registerStep === 2) || activeTab === 'login') && (
          <div className="relative rounded-xl overflow-hidden bg-gray-950 aspect-video border border-gray-800 shadow-inner flex flex-col items-center justify-center">
            {uploadMode === 'camera' ? (
              <>
                <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" className="w-full h-full object-cover" videoConstraints={{ facingMode: "user" }} />
                <div className="absolute inset-0 border-2 border-indigo-500/20 m-4 rounded-lg pointer-events-none"></div>
                <div className="absolute bottom-2 right-2 flex items-center space-x-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-gray-800">
                   <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                   <span className="text-white text-xs font-medium tracking-wide">Live Stream</span>
                </div>
              </>
            ) : (
               <div className="w-full h-full relative cursor-pointer group hover:bg-gray-900 transition-colors flex flex-col items-center justify-center text-gray-500 p-4 text-center border border-dashed border-gray-700 m-2 rounded-lg">
                 <input type="file" title="" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" accept="image/*" onChange={e => setSelectedFile(e.target.files[0])} />
                 {selectedFile ? (
                   <>
                     <CheckCircle2 className="w-8 h-8 text-indigo-400 mb-3" />
                     <p className="text-white text-sm font-medium truncate max-w-[200px] bg-gray-800 px-3 py-1 rounded-full border border-gray-700">{selectedFile.name}</p>
                   </>
                 ) : (
                   <>
                     <UploadCloud className="w-10 h-10 mb-3 text-gray-400 group-hover:text-indigo-400 group-hover:scale-110 transition-all" />
                     <p className="text-sm font-semibold text-gray-300">Drag & drop desktop photo</p>
                     <p className="text-xs text-gray-500 mt-2">JPEG, PNG up to 10MB</p>
                   </>
                 )}
               </div>
            )}
            
            {status.state === 'loading' && (
              <div className="absolute inset-0 bg-gray-900/80 flex flex-col items-center justify-center backdrop-blur-md z-20">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-3" />
                <span className="text-indigo-400 text-xs font-bold tracking-widest uppercase">Computing Tensor</span>
              </div>
            )}
          </div>
          )}

          {status.message && (
            <div className={`p-4 rounded-xl flex items-start space-x-3 text-sm font-medium ${
              status.state === 'error' ? 'bg-red-950/50 text-red-400 border border-red-500/30 shadow-lg shadow-red-500/10' : 
              status.state === 'success' ? 'bg-green-950/50 text-green-400 border border-green-500/30 shadow-lg shadow-green-500/10' : 
              'bg-indigo-950/50 text-indigo-400 border border-indigo-500/30 shadow-lg shadow-indigo-500/10'
            }`}>
              {status.state === 'error' && <XCircle className="w-5 h-5 flex-shrink-0" />}
              {status.state === 'success' && <CheckCircle2 className="w-5 h-5 flex-shrink-0" />}
              {status.state === 'loading' && <Loader2 className="w-5 h-5 flex-shrink-0 animate-spin" />}
              <p className="leading-relaxed">{status.message}</p>
            </div>
          )}

          <button 
            onClick={
                activeTab === 'login' ? handleLogin : 
                (registerStep === 1 ? handleRegisterStep1 : handleRegisterStep2)
            } 
            disabled={status.state === 'loading'} 
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-4 px-6 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] transition-all active:scale-[0.98] disabled:opacity-50 flex justify-center items-center group overflow-hidden relative"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out"></div>
            
            {activeTab === 'login' ? (
              <><ShieldCheck className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" /> Grant Access</>
            ) : registerStep === 1 ? (
              <><UserPlus className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" /> Create Database Record <ChevronRight className="w-4 h-4 ml-1 opacity-70"/></>
            ) : (
              <><Camera className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" /> Add Biometric Features</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
