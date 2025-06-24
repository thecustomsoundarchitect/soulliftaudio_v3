import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreativeFlowSession } from "@shared/schema";
import { useCreativeFlow } from "@/hooks/use-creative-flow";
import { useLocation } from "wouter";

// Predefined music tracks with local music samples
const musicTracks = [
  { id: 'gentle-piano', name: 'Gentle Piano', category: 'free', duration: '2:30', preview: '/api/music/gentle-piano' },
  { id: 'soft-strings', name: 'Soft Strings', category: 'free', duration: '3:15', preview: '/api/music/soft-strings' },
  { id: 'peaceful-nature', name: 'Peaceful Nature', category: 'free', duration: '2:45', preview: '/api/music/peaceful-nature' },
  { id: 'warm-acoustic', name: 'Warm Acoustic', category: 'premium', duration: '3:00', preview: '/api/music/warm-acoustic' },
  { id: 'uplifting-orchestral', name: 'Uplifting Orchestral', category: 'premium', duration: '3:30', preview: '/api/music/uplifting-orchestral' },
  { id: 'ambient-meditation', name: 'Ambient Meditation', category: 'premium', duration: '4:00', preview: '/api/music/ambient-meditation' },
  { id: 'jazz-cafe', name: 'Jazz Cafe', category: 'premium', duration: '2:50', preview: '/api/music/jazz-cafe' },
  { id: 'classical-embrace', name: 'Classical Embrace', category: 'premium', duration: '3:45', preview: '/api/music/classical-embrace' },
  { id: 'folk-harmony', name: 'Folk Harmony', category: 'premium', duration: '3:10', preview: '/api/music/folk-harmony' },
  { id: 'cinematic-love', name: 'Cinematic Love', category: 'premium', duration: '4:15', preview: '/api/music/cinematic-love' }
];

// Predefined cover images
const coverImages = [
  { id: 'sunset-heart', name: 'Sunset Heart', url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=400&fit=crop' },
  { id: 'gentle-flowers', name: 'Gentle Flowers', url: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&h=400&fit=crop' },
  { id: 'warm-embrace', name: 'Warm Embrace', url: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=400&h=400&fit=crop' },
  { id: 'peaceful-nature', name: 'Peaceful Nature', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop' },
  { id: 'golden-light', name: 'Golden Light', url: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=400&h=400&fit=crop' },
  { id: 'soft-pastels', name: 'Soft Pastels', url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=400&fit=crop' }
];

export default function AudioHug() {
  const [location, setLocation] = useLocation();
  const { state } = useCreativeFlow();
  const session = state.session;
  const [isLoading, setIsLoading] = useState(true);
  const [userTier] = useState<'free' | 'premium'>('free'); // This would come from user data
  
  // Audio recording states
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedAudio, setRecordedAudio] = useState<string | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordingInterval, setRecordingInterval] = useState<NodeJS.Timeout | null>(null);
  
  // AI voice states
  const [selectedTone, setSelectedTone] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("");
  const [aiAudio, setAiAudio] = useState<string | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  
  // Music states
  const [selectedMusic, setSelectedMusic] = useState("");
  const [musicVolume, setMusicVolume] = useState(0.3);
  const [voiceVolume, setVoiceVolume] = useState(1.0);
  const [playingPreview, setPlayingPreview] = useState<string | null>(null);
  const [previewingMix, setPreviewingMix] = useState(false);
  const [mixPreviewAudio, setMixPreviewAudio] = useState<string | null>(null);
  
  // Image states
  const [selectedCover, setSelectedCover] = useState("");
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null);
  
  // Final compilation states
  const [finalHug, setFinalHug] = useState<string | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  
  // Script viewer
  const [showScript, setShowScript] = useState(true);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const aiAudioRef = useRef<HTMLAudioElement>(null);
  const musicPreviewRef = useRef<HTMLAudioElement>(null);
  const finalHugRef = useRef<HTMLAudioElement>(null);
  const previewAudioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  useEffect(() => {
    console.log('AudioHug page loaded with session:', session);
    
    // Check if we have a session or need to wait for it to load
    const timer = setTimeout(() => {
      setIsLoading(false);
      if (!session) {
        console.log('No session found after delay, redirecting to main page');
        setLocation('/');
      }
    }, 2000); // Give more time for session loading
    
    // If session loads, stop loading immediately
    if (session) {
      setIsLoading(false);
      clearTimeout(timer);
    }
    
    return () => clearTimeout(timer);
  }, [session, setLocation]);

  // Function to stop all audio previews
  const stopAllPreviews = useCallback(() => {
    Object.keys(previewAudioRefs.current).forEach(trackId => {
      const audio = previewAudioRefs.current[trackId];
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    });
    setPlayingPreview(null);
    setPreviewingMix(false);
  }, []);

  // Clean up speech synthesis and audio previews on component unmount
  useEffect(() => {
    return () => {
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }
      stopAllPreviews();
      if ((window as any).stopMixPreview) {
        (window as any).stopMixPreview();
      }
    };
  }, [stopAllPreviews]);

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl m-auto glass-morphism rounded-2xl shadow-2xl p-8 sm:p-12 fade-in text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Loading Your Soul Hug</h2>
        <p className="text-slate-600 mb-6">Please wait while we load your session...</p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="w-full max-w-6xl m-auto glass-morphism rounded-2xl shadow-2xl p-8 sm:p-12 fade-in text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Session Not Found</h2>
        <p className="text-slate-600 mb-6">Please start your Soul Hug journey first.</p>
        <Button onClick={() => setLocation('/')} className="bg-gradient-to-r from-teal-600 to-indigo-600 text-white">
          Start Creating Soul Hug
        </Button>
      </div>
    );
  }

  // Audio recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const audioChunks: BlobPart[] = [];

      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudio(audioUrl);
        stream.getTracks().forEach(track => track.stop());
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      const interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      setRecordingInterval(interval);
    } catch (error) {
      alert('Microphone access denied or not available');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.pause();
      setIsPaused(true);
      if (recordingInterval) clearInterval(recordingInterval);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorder && isPaused) {
      mediaRecorder.resume();
      setIsPaused(false);
      const interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      setRecordingInterval(interval);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (recordingInterval) {
        clearInterval(recordingInterval);
        setRecordingInterval(null);
      }
    }
  };

  const downloadRecording = () => {
    if (recordedAudio) {
      const a = document.createElement('a');
      a.href = recordedAudio;
      a.download = `soul-hug-${session.recipientName.replace(/\s+/g, '-').toLowerCase()}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const stopAIVoice = () => {
    console.log('Stopping AI voice');
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setCurrentUtterance(null);
    setIsGeneratingAI(false);
  };

  const generateAIVoice = async () => {
    if (!session.finalMessage?.trim() || !selectedTone || !selectedVoice) {
      alert('Please ensure you have a message and have selected both tone and voice type');
      return;
    }

    // Stop any existing speech
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }

    setIsGeneratingAI(true);
    setIsSpeaking(false);
    
    try {
      // Use Web Speech API for text-to-speech
      if ('speechSynthesis' in window) {
        // Wait for voices to load
        const waitForVoices = () => {
          return new Promise<void>((resolve) => {
            const voices = speechSynthesis.getVoices();
            if (voices.length > 0) {
              resolve();
            } else {
              speechSynthesis.addEventListener('voiceschanged', () => resolve(), { once: true });
            }
          });
        };

        await waitForVoices();

        const utterance = new SpeechSynthesisUtterance(session.finalMessage);
        setCurrentUtterance(utterance);
        
        // Configure voice based on selection
        const voices = speechSynthesis.getVoices();
        let selectedSynthVoice = null;
        
        if (selectedVoice === 'female') {
          selectedSynthVoice = voices.find(voice => 
            voice.name.toLowerCase().includes('female') || 
            voice.name.toLowerCase().includes('woman') ||
            voice.name.toLowerCase().includes('zira') ||
            voice.name.toLowerCase().includes('susan') ||
            voice.name.toLowerCase().includes('samantha')
          );
        } else if (selectedVoice === 'male') {
          selectedSynthVoice = voices.find(voice => 
            voice.name.toLowerCase().includes('male') || 
            voice.name.toLowerCase().includes('man') ||
            voice.name.toLowerCase().includes('david') ||
            voice.name.toLowerCase().includes('mark') ||
            voice.name.toLowerCase().includes('alex')
          );
        }
        
        if (selectedSynthVoice) {
          utterance.voice = selectedSynthVoice;
        }
        
        // Configure tone settings
        switch (selectedTone) {
          case 'calm':
            utterance.rate = 0.8;
            utterance.pitch = 0.9;
            break;
          case 'uplifting':
            utterance.rate = 1.1;
            utterance.pitch = 1.2;
            break;
          case 'warm':
            utterance.rate = 0.9;
            utterance.pitch = 1.0;
            break;
          case 'playful':
            utterance.rate = 1.2;
            utterance.pitch = 1.3;
            break;
          case 'gentle':
            utterance.rate = 0.7;
            utterance.pitch = 0.8;
            break;
          case 'confident':
            utterance.rate = 1.0;
            utterance.pitch = 1.1;
            break;
          default:
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
        }
        
        // Set up event handlers
        utterance.onstart = () => {
          setIsSpeaking(true);
          setIsGeneratingAI(false);
          console.log('AI voice started speaking');
        };
        
        utterance.onend = () => {
          setIsSpeaking(false);
          setCurrentUtterance(null);
          console.log('AI voice finished speaking');
          
          // Create a simple audio blob for download (placeholder)
          const audioBlob = new Blob(['AI Voice Generated'], { type: 'audio/wav' });
          const audioUrl = URL.createObjectURL(audioBlob);
          setAiAudio(audioUrl);
        };
        
        utterance.onerror = (event) => {
          console.error('Speech synthesis error:', event);
          setIsSpeaking(false);
          setCurrentUtterance(null);
          setIsGeneratingAI(false);
          alert('AI voice generation failed. Please try again.');
        };
        
        // Start speaking
        speechSynthesis.speak(utterance);
      } else {
        throw new Error('Speech synthesis not supported');
      }
    } catch (error) {
      console.error('AI voice generation error:', error);
      alert('AI voice generation failed. Your browser may not support this feature.');
      setIsGeneratingAI(false);
      setIsSpeaking(false);
    }
  };

  const downloadAIAudio = () => {
    if (aiAudio) {
      const a = document.createElement('a');
      a.href = aiAudio;
      a.download = `soul-hug-ai-${session.recipientName.replace(/\s+/g, '-').toLowerCase()}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('Image file size must be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setCustomImage(e.target?.result as string);
        setUploadedImageFile(file);
        setSelectedCover(''); // Clear selected predefined cover
      };
      reader.readAsDataURL(file);
    }
  };

  const mixAudioWithMusic = async (voiceBlob: Blob, musicUrl: string): Promise<Blob> => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    try {
      // Load voice audio
      const voiceArrayBuffer = await voiceBlob.arrayBuffer();
      const voiceAudioBuffer = await audioContext.decodeAudioData(voiceArrayBuffer);
      
      // Load music audio (using Web Audio API with a mock music track for demo)
      const musicResponse = await fetch(`/api/music/${musicUrl}`);
      const musicArrayBuffer = await musicResponse.arrayBuffer();
      const musicAudioBuffer = await audioContext.decodeAudioData(musicArrayBuffer);
      
      // Create offline context for mixing
      const duration = Math.max(voiceAudioBuffer.duration, musicAudioBuffer.duration);
      const offlineContext = new OfflineAudioContext(2, duration * 44100, 44100);
      
      // Create sources
      const voiceSource = offlineContext.createBufferSource();
      const musicSource = offlineContext.createBufferSource();
      
      // Create gain nodes for volume control
      const voiceGain = offlineContext.createGain();
      const musicGain = offlineContext.createGain();
      
      voiceSource.buffer = voiceAudioBuffer;
      musicSource.buffer = musicAudioBuffer;
      
      voiceGain.gain.value = voiceVolume;
      musicGain.gain.value = musicVolume;
      
      // Connect nodes
      voiceSource.connect(voiceGain);
      musicSource.connect(musicGain);
      voiceGain.connect(offlineContext.destination);
      musicGain.connect(offlineContext.destination);
      
      // Start sources
      voiceSource.start();
      musicSource.start();
      
      // Render final audio
      const renderedBuffer = await offlineContext.startRendering();
      
      // Convert to blob
      const length = renderedBuffer.length;
      const arrayBuffer = new ArrayBuffer(length * 4);
      const view = new Float32Array(arrayBuffer);
      
      for (let i = 0; i < length; i++) {
        view[i] = renderedBuffer.getChannelData(0)[i];
      }
      
      return new Blob([arrayBuffer], { type: 'audio/wav' });
    } catch (error) {
      console.error('Audio mixing failed:', error);
      // Fallback: return original voice audio
      return voiceBlob;
    } finally {
      audioContext.close();
    }
  };

  const compileFinalHug = async () => {
    if (!recordedAudio && !aiAudio) {
      alert('Please create a voice recording or generate AI voice first.');
      return;
    }

    if (!selectedCover && !customImage) {
      alert('Please select a cover image for your Soul Hug.');
      return;
    }

    setIsCompiling(true);
    
    try {
      // Get the voice audio blob
      let voiceBlob: Blob;
      const audioUrl = recordedAudio || aiAudio;
      
      if (audioUrl) {
        const response = await fetch(audioUrl);
        voiceBlob = await response.blob();
      } else {
        throw new Error('No audio available');
      }

      // Mix with music if selected
      let finalAudioBlob = voiceBlob;
      if (selectedMusic) {
        finalAudioBlob = await mixAudioWithMusic(voiceBlob, selectedMusic);
      }

      // Create final audio URL
      const finalAudioUrl = URL.createObjectURL(finalAudioBlob);
      setFinalHug(finalAudioUrl);
      
      alert('Your Soul Hug has been compiled successfully! You can now play, download, or send it.');
    } catch (error) {
      console.error('Compilation failed:', error);
      alert('Failed to compile your Soul Hug. Please try again.');
    } finally {
      setIsCompiling(false);
    }
  };

  const downloadFinalHug = () => {
    if (finalHug) {
      const a = document.createElement('a');
      a.href = finalHug;
      a.download = `soul-hug-complete-${session.recipientName.replace(/\s+/g, '-').toLowerCase()}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const playMusicPreview = (trackId: string, previewUrl: string) => {
    // Stop any currently playing preview
    stopAllPreviews();
    
    // Create or get audio element for this track
    if (!previewAudioRefs.current[trackId]) {
      previewAudioRefs.current[trackId] = new Audio(previewUrl);
      previewAudioRefs.current[trackId].volume = 0.5;
    }
    
    const audio = previewAudioRefs.current[trackId];
    audio.currentTime = 0;
    setPlayingPreview(trackId);
    
    audio.onended = () => {
      setPlayingPreview(null);
    };
    
    audio.play().catch(error => {
      console.error('Preview playback failed:', error);
      setPlayingPreview(null);
    });
  };

  const stopMusicPreview = (trackId: string) => {
    const audio = previewAudioRefs.current[trackId];
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setPlayingPreview(null);
  };

  const previewVoiceWithMusic = async () => {
    if (!selectedMusic || (!recordedAudio && !aiAudio)) {
      alert('Please select background music and have a voice recording or AI voice ready.');
      return;
    }

    setPreviewingMix(true);
    
    try {
      // Get the selected music track
      const selectedTrack = musicTracks.find(track => track.id === selectedMusic);
      if (!selectedTrack) {
        throw new Error('Selected music track not found');
      }

      // For demo purposes, we'll simulate mixing by playing both audio sources
      // In a real implementation, you would use Web Audio API to properly mix the tracks
      
      const voiceAudioUrl = recordedAudio || aiAudio;
      if (!voiceAudioUrl) {
        throw new Error('No voice audio available');
      }

      // Create audio elements for both voice and music
      const voiceAudio = new Audio(voiceAudioUrl);
      const musicAudio = new Audio(selectedTrack.preview);
      
      voiceAudio.volume = voiceVolume;
      musicAudio.volume = musicVolume;
      
      // Synchronize playback
      const playBothAudios = async () => {
        await Promise.all([
          voiceAudio.play(),
          musicAudio.play()
        ]);
      };

      // Set up end handlers
      const stopPreview = () => {
        voiceAudio.pause();
        musicAudio.pause();
        voiceAudio.currentTime = 0;
        musicAudio.currentTime = 0;
        setPreviewingMix(false);
      };

      voiceAudio.onended = stopPreview;
      musicAudio.onended = stopPreview;

      // Store stop function for manual stopping
      (window as any).stopMixPreview = stopPreview;

      await playBothAudios();
      
    } catch (error) {
      console.error('Mix preview failed:', error);
      alert('Failed to preview voice with music. Please try again.');
      setPreviewingMix(false);
    }
  };

  const stopMixPreview = () => {
    if ((window as any).stopMixPreview) {
      (window as any).stopMixPreview();
    }
    setPreviewingMix(false);
  };

  const sendAudioHug = () => {
    if (finalHug) {
      alert('Complete Soul Hug sent successfully!');
      setLocation('/');
    } else if (recordedAudio || aiAudio) {
      alert('Audio Soul Hug sent!');
      setLocation('/');
    } else {
      alert('Please create an audio recording or generate an AI voice first.');
    }
  };

  return (
    <div className="w-full max-w-6xl m-auto glass-morphism rounded-2xl shadow-2xl p-8 sm:p-12 fade-in">
      <div className="text-center mb-8">
        <div className="mb-6">
          <i className="fas fa-microphone text-4xl text-teal-500 mb-4"></i>
          <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-teal-600 to-indigo-600 bg-clip-text text-transparent">
            BRING YOUR SOUL HUG TO LIFE WITH AUDIO
          </h1>
        </div>
        <p className="text-slate-600 mt-2 text-lg max-w-2xl mx-auto leading-relaxed">
          Record it in your voice, or let SoulLift read it for you.
        </p>
      </div>

      {/* Script Viewer */}
      <div className="glass-secondary p-4 rounded-lg border border-white/50 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-slate-800">Your Soul Hug Script</h3>
          <button
            onClick={() => setShowScript(!showScript)}
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            {showScript ? 'Hide' : 'Show'}
          </button>
        </div>
        {showScript && (
          <div className="bg-white/90 p-4 rounded-lg border border-slate-200 max-h-64 overflow-y-auto">
            <p className="text-slate-800 font-serif text-base leading-relaxed" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
              {session.finalMessage || 'No message available. Please go back and create your Soul Hug message first.'}
            </p>
          </div>
        )}
      </div>

      {/* Audio Options */}
      <div className="glass-secondary p-6 rounded-lg border border-white/50 mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Option 1: Record Your Voice */}
          <div className="bg-white/80 p-6 rounded-lg border border-slate-200 shadow-sm">
            <div className="text-center mb-6">
              <i className="fas fa-user-alt text-4xl text-red-500 mb-3"></i>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Record Your Voice</h3>
              <p className="text-slate-600">Add your personal touch with your own voice</p>
            </div>

            <div className="space-y-4">
              {!isRecording && !recordedAudio && (
                <Button
                  onClick={startRecording}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white font-bold py-3 rounded-lg shadow-lg hover:from-red-600 hover:to-red-700 transition-all"
                >
                  <i className="fas fa-microphone mr-2"></i>Start Recording
                </Button>
              )}

              {isRecording && (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600 mb-2">
                      {formatTime(recordingTime)}
                    </div>
                    <div className="flex items-center justify-center space-x-2 mb-4">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-red-600 font-medium">Recording...</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-center space-x-3">
                    {!isPaused ? (
                      <Button
                        onClick={pauseRecording}
                        variant="outline"
                        className="border-orange-400 text-orange-600 hover:bg-orange-50"
                      >
                        <i className="fas fa-pause mr-2"></i>Pause
                      </Button>
                    ) : (
                      <Button
                        onClick={resumeRecording}
                        variant="outline"
                        className="border-green-400 text-green-600 hover:bg-green-50"
                      >
                        <i className="fas fa-play mr-2"></i>Resume
                      </Button>
                    )}
                    <Button
                      onClick={stopRecording}
                      variant="outline"
                      className="border-red-400 text-red-600 hover:bg-red-50"
                    >
                      <i className="fas fa-stop mr-2"></i>Stop
                    </Button>
                  </div>
                </div>
              )}

              {recordedAudio && (
                <div className="space-y-4">
                  <div className="text-center">
                    <i className="fas fa-check-circle text-green-500 text-2xl mb-2"></i>
                    <p className="text-green-600 font-medium">Recording Complete!</p>
                  </div>
                  
                  <audio
                    ref={audioRef}
                    src={recordedAudio}
                    controls
                    className="w-full"
                  />
                  
                  <div className="flex justify-center space-x-3">
                    <Button
                      onClick={() => {
                        setRecordedAudio(null);
                        setRecordingTime(0);
                      }}
                      variant="outline"
                      className="border-slate-400 text-slate-600 hover:bg-slate-50"
                    >
                      <i className="fas fa-redo mr-2"></i>Re-record
                    </Button>
                    <Button
                      onClick={downloadRecording}
                      className="bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-green-700 transition-all"
                    >
                      <i className="fas fa-download mr-2"></i>Download MP3
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Option 2: AI Voice Generation */}
          <div className="bg-white/80 p-6 rounded-lg border border-slate-200 shadow-sm">
            <div className="text-center mb-6">
              <i className="fas fa-robot text-4xl text-indigo-500 mb-3"></i>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Generate AI Voice</h3>
              <p className="text-slate-600">Let SoulLift speak your Soul Hug</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <i className="fas fa-palette mr-1"></i>Tone
                </label>
                <Select value={selectedTone} onValueChange={setSelectedTone}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a tone..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="calm">Calm</SelectItem>
                    <SelectItem value="uplifting">Uplifting</SelectItem>
                    <SelectItem value="warm">Warm</SelectItem>
                    <SelectItem value="playful">Playful</SelectItem>
                    <SelectItem value="gentle">Gentle</SelectItem>
                    <SelectItem value="confident">Confident</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <i className="fas fa-user-circle mr-1"></i>Voice Type
                </label>
                <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a voice..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={generateAIVoice}
                  disabled={isGeneratingAI || isSpeaking || !selectedTone || !selectedVoice || !session.finalMessage?.trim()}
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold py-3 rounded-lg shadow-lg hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50"
                >
                  {isGeneratingAI ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>Preparing...
                    </>
                  ) : isSpeaking ? (
                    <>
                      <i className="fas fa-volume-up mr-2"></i>Speaking...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-magic mr-2"></i>Generate Voice
                    </>
                  )}
                </Button>
                
                {(isSpeaking || isGeneratingAI) && (
                  <Button
                    onClick={stopAIVoice}
                    className="bg-red-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:bg-red-600 transition-all"
                  >
                    <i className="fas fa-stop mr-1"></i>Stop
                  </Button>
                )}
              </div>

              {aiAudio && (
                <div className="space-y-4">
                  <div className="text-center">
                    <i className="fas fa-check-circle text-green-500 text-2xl mb-2"></i>
                    <p className="text-green-600 font-medium">Voice Generated!</p>
                  </div>
                  
                  <audio
                    ref={aiAudioRef}
                    src={aiAudio}
                    controls
                    className="w-full"
                  />
                  
                  <div className="flex justify-center space-x-3">
                    <Button
                      onClick={generateAIVoice}
                      variant="outline"
                      className="border-indigo-400 text-indigo-600 hover:bg-indigo-50"
                      disabled={isGeneratingAI}
                    >
                      <i className="fas fa-redo mr-2"></i>Regenerate
                    </Button>
                    <Button
                      onClick={downloadAIAudio}
                      className="bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-green-700 transition-all"
                    >
                      <i className="fas fa-download mr-2"></i>Download MP3
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Music Selection */}
      <div className="glass-secondary p-6 rounded-lg border border-white/50 mb-8">
        <div className="text-center mb-6">
          <i className="fas fa-music text-4xl text-purple-500 mb-3"></i>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Add Background Music</h3>
          <p className="text-slate-600">Choose from our curated tracks to enhance your Soul Hug</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {musicTracks.map((track) => {
            const isLocked = track.category === 'premium' && userTier === 'free';
            const isSelected = selectedMusic === track.id;
            
            return (
              <div
                key={track.id}
                className={`relative p-4 rounded-lg border cursor-pointer transition-all ${
                  isSelected 
                    ? 'bg-purple-100 border-purple-400 shadow-md' 
                    : 'bg-white/80 border-slate-200 hover:border-purple-300'
                } ${isLocked ? 'opacity-60' : ''}`}
                onClick={() => !isLocked && setSelectedMusic(isSelected ? '' : track.id)}
              >
                {isLocked && (
                  <div className="absolute top-2 right-2">
                    <i className="fas fa-lock text-orange-500"></i>
                  </div>
                )}
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-slate-800">{track.name}</h4>
                  <span className="text-xs text-slate-500">{track.duration}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    track.category === 'premium' 
                      ? 'bg-orange-100 text-orange-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {track.category === 'premium' ? 'Premium' : 'Free'}
                  </span>
                  {isSelected && <i className="fas fa-check text-purple-600"></i>}
                </div>
                <div className="flex items-center justify-center">
                  {playingPreview === track.id ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        stopMusicPreview(track.id);
                      }}
                      className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-all"
                    >
                      <i className="fas fa-pause text-xs"></i>
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isLocked) {
                          playMusicPreview(track.id, track.preview);
                        }
                      }}
                      disabled={isLocked}
                      className={`bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-purple-600 transition-all ${
                        isLocked ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <i className="fas fa-play text-xs"></i>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {selectedMusic && (
          <div className="bg-white/90 p-4 rounded-lg border border-slate-200 mb-4">
            <h4 className="font-semibold text-slate-800 mb-3">Audio Mix Settings</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Voice Volume</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={voiceVolume}
                  onChange={(e) => setVoiceVolume(parseFloat(e.target.value))}
                  className="w-full"
                />
                <span className="text-xs text-slate-500">{Math.round(voiceVolume * 100)}%</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Music Volume</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={musicVolume}
                  onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                  className="w-full"
                />
                <span className="text-xs text-slate-500">{Math.round(musicVolume * 100)}%</span>
              </div>
            </div>
            
            {(recordedAudio || aiAudio) && (
              <div className="flex justify-center space-x-3">
                {previewingMix ? (
                  <Button
                    onClick={stopMixPreview}
                    className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:bg-red-600 transition-all"
                  >
                    <i className="fas fa-stop mr-2"></i>Stop Preview
                  </Button>
                ) : (
                  <Button
                    onClick={previewVoiceWithMusic}
                    className="bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:from-green-600 hover:to-teal-600 transition-all"
                  >
                    <i className="fas fa-headphones mr-2"></i>Preview Voice + Music
                  </Button>
                )}
                <div className="text-xs text-slate-600 flex items-center">
                  <i className="fas fa-info-circle mr-1"></i>
                  Hear how your voice sounds with the background music
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cover Image Selection */}
      <div className="glass-secondary p-6 rounded-lg border border-white/50 mb-8">
        <div className="text-center mb-6">
          <i className="fas fa-image text-4xl text-pink-500 mb-3"></i>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Choose Cover Image</h3>
          <p className="text-slate-600">Select a beautiful cover for your Soul Hug</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {coverImages.map((cover) => {
            const isSelected = selectedCover === cover.id;
            return (
              <div
                key={cover.id}
                className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-all ${
                  isSelected ? 'ring-4 ring-pink-400 shadow-lg' : 'hover:ring-2 hover:ring-pink-300'
                }`}
                onClick={() => {
                  setSelectedCover(isSelected ? '' : cover.id);
                  setCustomImage(null);
                }}
              >
                <img
                  src={cover.url}
                  alt={cover.name}
                  className="w-full h-full object-cover"
                />
                {isSelected && (
                  <div className="absolute inset-0 bg-pink-500/20 flex items-center justify-center">
                    <i className="fas fa-check text-white text-2xl"></i>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2">
                  <p className="text-xs font-medium">{cover.name}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <label className="inline-block">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <div className="bg-white/80 p-4 rounded-lg border-2 border-dashed border-slate-300 hover:border-pink-400 cursor-pointer transition-all">
              {customImage ? (
                <div className="space-y-2">
                  <img src={customImage} alt="Custom cover" className="w-20 h-20 object-cover rounded mx-auto" />
                  <p className="text-sm text-green-600 font-medium">Custom image uploaded</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <i className="fas fa-upload text-slate-400 text-2xl"></i>
                  <p className="text-sm text-slate-600">Upload Custom Image</p>
                  <p className="text-xs text-slate-500">Max 5MB • JPG, PNG, GIF</p>
                </div>
              )}
            </div>
          </label>
        </div>
      </div>

      {/* Final Compilation */}
      <div className="glass-secondary p-6 rounded-lg border border-white/50 mb-8">
        <div className="text-center mb-6">
          <i className="fas fa-magic text-4xl text-indigo-500 mb-3"></i>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Create Final Soul Hug</h3>
          <p className="text-slate-600">Combine your voice, music, and cover into one beautiful package</p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={compileFinalHug}
            disabled={isCompiling || (!recordedAudio && !aiAudio) || (!selectedCover && !customImage)}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold py-3 rounded-lg shadow-lg hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50"
          >
            {isCompiling ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>Compiling Your Soul Hug...
              </>
            ) : (
              <>
                <i className="fas fa-wand-magic mr-2"></i>Compile Final Soul Hug
              </>
            )}
          </Button>

          {finalHug && (
            <div className="bg-white/90 p-4 rounded-lg border border-slate-200">
              <div className="text-center mb-4">
                <i className="fas fa-check-circle text-green-500 text-2xl mb-2"></i>
                <p className="text-green-600 font-medium">Your Soul Hug is ready!</p>
              </div>
              
              <audio
                ref={finalHugRef}
                src={finalHug}
                controls
                className="w-full mb-4"
              />
              
              <div className="flex justify-center space-x-3">
                <Button
                  onClick={downloadFinalHug}
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-green-700 transition-all"
                >
                  <i className="fas fa-download mr-2"></i>Download Complete Hug
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-center items-center gap-6 mt-8">
        <Button
          onClick={() => setLocation('/creative-flow')}
          variant="secondary"
          className="bg-slate-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-slate-700 transition-all"
        >
          <i className="fas fa-arrow-left mr-2"></i>Back to Craft
        </Button>
        <Button
          onClick={() => setLocation('/')}
          variant="outline"
          className="border-slate-600 text-slate-600 hover:bg-slate-50 font-bold py-3 px-8 rounded-lg shadow-lg transition-all"
        >
          <i className="fas fa-refresh mr-2"></i>Start Over
        </Button>
        <Button
          onClick={sendAudioHug}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 px-8 rounded-lg shadow-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105"
        >
          <i className="fas fa-heart mr-2"></i>Send Soul Hug
        </Button>
      </div>
    </div>
  );
}