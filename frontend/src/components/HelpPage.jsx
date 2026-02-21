import React from 'react';
import { 
  Mail,
  Sparkles, 
  Gem,
  Star,
  Shield,
  Zap,
  Users,
  Award,
  Globe,
  MessageCircle,
  Clock,
  CheckCircle2,
  Headphones,
  LifeBuoy
} from 'lucide-react';

const HelpPage = () => {
  const contactInfo = {
    email: 'sarthaksethi2803@gmail.com',
    title: 'Senior Software Engineer & Technical Lead',
    company: 'Danier Luxury Systems',
    response: '24-48 hours',
    languages: ['English', 'Technical Support', 'Business Intelligence']
  };

  const helpSections = [
    {
      title: 'Premium Support',
      icon: <Award className="w-6 h-6" />,
      color: 'from-danier-gold to-luxury-champagne',
      items: [
        'Executive-level technical assistance',
        'Priority response for luxury operations',
        'Custom solution development',
        'Advanced analytics consultation'
      ]
    },
    {
      title: 'System Features',
      icon: <Gem className="w-6 h-6" />,
      color: 'from-fashion-sapphire to-fashion-emerald',
      items: [
        'Real-time inventory intelligence',
        'Automated luxury stock alerts',
        'Premium dashboard analytics',
        'Multi-user enterprise access'
      ]
    },
    {
      title: 'Fashion Intelligence',
      icon: <Star className="w-6 h-6" />,
      color: 'from-fashion-ruby to-luxury-velvet',
      items: [
        'Seasonal collection monitoring',
        'Trend-based stock predictions',
        'Premium brand analytics',
        'Luxury market insights'
      ]
    }
  ];

  const quickActions = [
    {
      title: 'Emergency Support',
      description: 'Critical system issues',
      icon: <Shield className="w-8 h-8" />,
      color: 'from-fashion-ruby to-fashion-burgundy',
      action: 'Contact immediately'
    },
    {
      title: 'Feature Requests',
      description: 'Luxury system enhancements',
      icon: <Sparkles className="w-8 h-8" />,
      color: 'from-danier-gold to-luxury-rose-gold',
      action: 'Submit proposal'
    },
    {
      title: 'Training & Onboarding',
      description: 'Team education programs',
      icon: <Users className="w-8 h-8" />,
      color: 'from-fashion-emerald to-fashion-sapphire',
      action: 'Schedule session'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-fashion-entrance">
      {/* Ultra-Premium Header */}
      <div className="text-center space-y-6">
        <div className="flex justify-center mb-8">
          <div className="relative group">
            <div style={{ width: '88px', height: '88px', background: 'rgba(201,168,76,0.08)', border: '2px solid rgba(201,168,76,0.2)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="animate-float">
              <Headphones style={{ width: '40px', height: '40px', color: '#c9a84c', strokeWidth: 1.5 }} />
            </div>
            <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', width: '28px', height: '28px', background: 'linear-gradient(135deg, #c9a84c, #e8c96a)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(201,168,76,0.4)' }}>
              <LifeBuoy style={{ width: '14px', height: '14px', color: '#000' }} />
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-fashion bg-clip-text text-transparent font-fashion tracking-tight">
            Premium Support
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 font-luxury max-w-3xl mx-auto leading-relaxed">
            Luxury-grade technical assistance for your premium inventory intelligence system
          </p>
        </div>
      </div>

      {/* Contact Information Card */}
      <div className="card-premium dark:card-premium-dark p-8 sm:p-12 text-center animate-slide-up shadow-fashion-3d">
        <div className="space-y-8">
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-fashion-emerald to-fashion-sapphire rounded-2xl shadow-luxury flex items-center justify-center animate-float">
                <Mail className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-danier-gold rounded-full flex items-center justify-center animate-diamond-sparkle shadow-gold">
                <Award className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-gradient-fashion mb-2 font-fashion">
                Direct Technical Contact
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 font-luxury">
                {contactInfo.title}
              </p>
            </div>

            {/* Premium Contact Details */}
            <div className="bg-gradient-to-r from-luxury-cream to-luxury-champagne dark:from-slate-800 dark:to-slate-700 rounded-3xl p-8 border border-danier-gold/20 shadow-silk">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-center md:justify-start space-x-3">
                    <div className="w-10 h-10 bg-gradient-fashion rounded-xl flex items-center justify-center shadow-gold">
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest">Email</p>
                      <a 
                        href={`mailto:${contactInfo.email}`}
                        className="text-lg font-bold text-danier-gold hover:text-danier-gold-light transition-colors duration-300 font-mono"
                      >
                        {contactInfo.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center justify-center md:justify-start space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-fashion-emerald to-fashion-sapphire rounded-xl flex items-center justify-center shadow-luxury">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest">Response Time</p>
                      <p className="text-lg font-bold text-danier-dark dark:text-white">{contactInfo.response}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-center md:justify-start space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-luxury-velvet to-fashion-ruby rounded-xl flex items-center justify-center shadow-velvet">
                      <Globe className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest">Company</p>
                      <p className="text-lg font-bold text-danier-dark dark:text-white">{contactInfo.company}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center md:justify-start space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-danier-gold to-luxury-champagne rounded-xl flex items-center justify-center shadow-gold">
                      <MessageCircle className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest">Support Languages</p>
                      <p className="text-sm font-medium text-danier-dark dark:text-white">
                        {contactInfo.languages.join(' • ')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium CTA Button */}
            <a
              href={`mailto:${contactInfo.email}?subject=Danier Luxury System Support Request`}
              className="btn-premium inline-flex items-center space-x-4 px-12 py-6 bg-gradient-fashion text-white rounded-3xl font-luxury font-bold text-xl shadow-fashion-3d hover:shadow-luxury hover:scale-105 hover:animate-glow-pulse transition-all duration-500"
            >
              <Mail className="w-6 h-6" />
              <span>Contact Premium Support</span>
              <Sparkles className="w-6 h-6 animate-diamond-sparkle" />
            </a>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        {quickActions.map((action, index) => (
          <div 
            key={action.title}
            className="card-premium dark:card-premium-dark p-8 text-center hover:animate-luxury-hover transition-all duration-500 shadow-luxury hover:shadow-fashion-3d"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className={`w-16 h-16 bg-gradient-to-br ${action.color} rounded-2xl shadow-luxury flex items-center justify-center animate-float text-white`}>
                  {action.icon}
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-danier-dark dark:text-white mb-2 font-luxury">
                  {action.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {action.description}
                </p>
                <span className="inline-flex items-center px-4 py-2 bg-danier-gold/10 text-danier-gold rounded-xl text-sm font-semibold border border-danier-gold/30">
                  {action.action}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Help Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-up" style={{ animationDelay: '0.4s' }}>
        {helpSections.map((section, index) => (
          <div 
            key={section.title}
            className="card-premium dark:card-premium-dark p-8 hover:animate-luxury-hover transition-all duration-500 shadow-luxury hover:shadow-fashion-3d"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${section.color} rounded-xl shadow-luxury flex items-center justify-center text-white animate-tilt-3d`}>
                  {section.icon}
                </div>
                <h3 className="text-xl font-bold text-danier-dark dark:text-white font-luxury">
                  {section.title}
                </h3>
              </div>
              
              <ul className="space-y-3">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-fashion-emerald mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Premium Footer */}
      <div className="card-premium dark:card-premium-dark p-8 text-center animate-fade-in shadow-fashion-3d" style={{ animationDelay: '0.6s' }}>
        <div className="flex items-center justify-center space-x-4 mb-4">
          <Zap className="w-6 h-6 text-danier-gold animate-diamond-sparkle" />
          <span className="text-lg font-semibold text-danier-dark dark:text-white font-luxury">
            Premium $100M+ Fashion Brand Support
          </span>
          <Zap className="w-6 h-6 text-danier-gold animate-diamond-sparkle" />
        </div>
        <p className="text-gray-600 dark:text-gray-400 font-luxury">
          Engineered for luxury operations • Senior-level technical expertise • Enterprise-grade solutions
        </p>
      </div>
    </div>
  );
};

export default HelpPage; 