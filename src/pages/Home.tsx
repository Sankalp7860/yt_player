
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Logo from '@/components/Logo';
import MoodCard from '@/components/MoodCard';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { 
  Smile, 
  Frown, 
  Zap, 
  Heart, 
  Moon, 
  Cloud, 
  Sun, 
  Music,
  ArrowRight,
  CircleUser,
  LogIn 
} from 'lucide-react';

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const handleMoodSelection = (mood: string) => {
    setSelectedMood(mood === selectedMood ? null : mood);
  };
  
  const handleContinue = () => {
    if (!selectedMood) {
      toast.error('Please select a mood to continue');
      return;
    }
    
    if (!isAuthenticated) {
      // Save selected mood to session storage and redirect to login
      sessionStorage.setItem('selected_mood', selectedMood);
      toast.info('Please log in to continue');
      navigate('/login');
      return;
    }
    
    // Go to recommendations page with selected mood
    navigate(`/explore?mood=${selectedMood.toLowerCase()}`);
  };
  
  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };
  
  const moods = [
    { name: 'Happy', icon: <Smile size={32} />, color: 'happy', description: 'Feeling joyful, content, or pleased' },
    { name: 'Sad', icon: <Frown size={32} />, color: 'sad', description: 'Feeling down, blue, or unhappy' },
    { name: 'Energetic', icon: <Zap size={32} />, color: 'energetic', description: 'Feeling excited, motivated, or dynamic' },
    { name: 'Romantic', icon: <Heart size={32} />, color: 'romantic', description: 'Feeling loving, tender, or passionate' },
    { name: 'Calm', icon: <Sun size={32} />, color: 'calm', description: 'Feeling relaxed, peaceful, or tranquil' },
    { name: 'Melancholy', icon: <Cloud size={32} />, color: 'melancholy', description: 'Feeling wistful, nostalgic, or reflective' },
    { name: 'Night', icon: <Moon size={32} />, color: 'night', description: 'Feeling mysterious, atmospheric, or deep' },
    { name: 'Discover', icon: <Music size={32} />, color: 'discover', description: 'Discover new music across all emotions' },
  ];
  
  // Features for the "How It Works" section
  const features = [
    {
      icon: <div className="p-3 rounded-full bg-blue-500/20 text-blue-400"><Smile size={24} /></div>,
      title: 'Share Your Mood',
      description: 'Select your current emotion from our intuitive interface, or let our system detect it for you.'
    },
    {
      icon: <div className="p-3 rounded-full bg-purple-500/20 text-purple-400"><Music size={24} /></div>,
      title: 'Get Recommendations',
      description: 'Receive personalized music suggestions that complement your emotional state.'
    },
    {
      icon: <div className="p-3 rounded-full bg-green-500/20 text-green-400"><Heart size={24} /></div>,
      title: 'Track History',
      description: 'Review your emotional journey and discover patterns in your music preferences over time.'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="p-4 md:p-6">
        <div className="max-w-screen-xl mx-auto flex justify-between items-center">
          <Logo />
          <div>
            {isAuthenticated ? (
              <Link to="/dashboard" className="flex items-center gap-2 text-sm font-medium hover:text-blue-400 transition-colors">
                <CircleUser size={20} />
                <span className="hidden md:inline">Dashboard</span>
              </Link>
            ) : (
              <Link to="/login" className="btn-primary flex items-center gap-2 text-sm">
                <LogIn size={16} />
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-screen-xl mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-6xl font-bold mb-4"
          >
            Music for every <span className="text-blue-500">Mood</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto mb-16"
          >
            Discover music perfectly tailored to your emotional state. Our intelligent system recommends tracks that resonate with how you're feeling right now.
          </motion.p>
          
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="mb-10"
          >
            <h2 className="text-xl font-medium mb-8">How are you feeling today?</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto">
              {moods.map((mood) => (
                <motion.div key={mood.name} variants={item}>
                  <MoodCard
                    icon={mood.icon}
                    mood={mood.name}
                    description={mood.description}
                    color={mood.color}
                    isSelected={selectedMood === mood.name}
                    onClick={() => handleMoodSelection(mood.name)}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="btn-primary flex items-center gap-2 mx-auto"
            onClick={handleContinue}
          >
            Continue <ArrowRight size={18} />
          </motion.button>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-16 md:py-24 px-4 bg-mood-gradient">
        <div className="max-w-screen-xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center mb-16"
          >
            How It Works
          </motion.h2>
          
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-6 rounded-xl glassmorphism text-center"
              >
                <div className="flex justify-center mb-4">{feature.icon}</div>
                <h3 className="text-xl font-medium mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-screen-lg mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl font-bold mb-4"
          >
            Ready to match music to your mood?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="text-muted-foreground mb-8"
          >
            Join MoodTunes today and transform how you experience music.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            viewport={{ once: true }}
          >
            <Link to="/signup" className="btn-primary">
              Get Started
            </Link>
          </motion.div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/10">
        <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Logo />
          </div>
          <div className="text-sm text-muted-foreground">
            © 2023 MoodTunes. All rights reserved.
          </div>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy Policy</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Terms of Service</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
