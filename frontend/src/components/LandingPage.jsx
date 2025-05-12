import React, { useState } from 'react';
import { Menu, X,Globe } from 'lucide-react'; // Ensure lucide-react is installed
import { Link } from 'react-router-dom';

const LandingPage = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="font-sans text-gray-800 overflow-x-hidden bg-gradient-to-br from-blue-100 via-white to-pink-100">
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-md shadow-md z-50 px-6 md:px-20 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
        <Globe className="h-8 w-8 text-indigo-600" />
        <Link to="/">
        <span className="text-2xl font-bold text-indigo-700">MultiLingo</span>
        </Link>

        </div>

        {/* Desktop menu */}
        <ul className="hidden md:flex space-x-6 text-sm font-medium">
          <li><a href="#about" className="hover:text-indigo-600 transition">About</a></li>
          <li><a href="#features" className="hover:text-indigo-600 transition">Features</a></li>
          <li><a href="#how-it-works" className="hover:text-indigo-600 transition">How It Works</a></li>
          <li><a href="#testimonials" className="hover:text-indigo-600 transition">Testimonials</a></li>
          <li><a href="#faq" className="hover:text-indigo-600 transition">FAQ</a></li>
          <li><a href="translator" className="hover:text-indigo-600 transition">Get Started</a></li>
        </ul>

        {/* Mobile hamburger */}
        <div className="md:hidden">
          {menuOpen ? (
            <X className="w-6 h-6 cursor-pointer" onClick={() => setMenuOpen(false)} />
          ) : (
            <Menu className="w-6 h-6 cursor-pointer" onClick={() => setMenuOpen(true)} />
          )}
        </div>

        {/* App button */}
        <a
          href="/translator"
          className="hidden md:inline bg-indigo-600 text-white px-4 py-2 rounded-full text-sm shadow hover:bg-indigo-700 transition"
        >
          Launch App
        </a>
      </nav>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-white shadow-lg rounded-lg absolute top-16 left-4 right-4 z-40 py-4 px-6">
          <ul className="space-y-4 text-sm font-medium text-indigo-700">
            <li><a href="#about" onClick={() => setMenuOpen(false)}>About</a></li>
            <li><a href="#features" onClick={() => setMenuOpen(false)}>Features</a></li>
            <li><a href="#how-it-works" onClick={() => setMenuOpen(false)}>How It Works</a></li>
            <li><a href="#testimonials" onClick={() => setMenuOpen(false)}>Testimonials</a></li>
            <li><a href="#faq" onClick={() => setMenuOpen(false)}>FAQ</a></li>
            <li><a href="translator" onClick={() => setMenuOpen(false)}>Get Started</a></li>
            <li><a href="translator" className="text-indigo-900 font-semibold">Launch App</a></li>
          </ul>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col justify-center items-center px-6 text-center pt-32 pb-20 bg-gradient-to-tr from-indigo-100 to-white text-gray-900 transition-all duration-700">
        <h1 className="text-5xl md:text-6xl font-extrabold drop-shadow-2xl animate-fade-in-up leading-tight">
          <span className="bg-gradient-to-r from-yellow-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
            Multilingual Learning
          </span><br />
          <span className="text-indigo-700">Web Application</span>
        </h1>

        <div className="mt-6 bg-white/70 p-5 backdrop-blur-lg rounded-xl shadow-xl max-w-xl mx-auto animate-fade-in-up delay-150">
          <p className="text-lg md:text-xl text-gray-700 font-light leading-relaxed">
          Learn languages faster with AI-enhanced translations, grammar tips, examples, and more.
          </p>
        </div>

        <a
          href="#features"
          className="mt-10 inline-block bg-indigo-600 text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:scale-105 transition-transform duration-300"
        >
          Explore Features
        </a>

       
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-6 md:px-20 bg-white transition-all duration-700">
        <h2 className="text-3xl font-bold text-center mb-8 text-indigo-600">Why This Project?</h2>
        <div className="max-w-5xl mx-auto text-lg text-gray-700 space-y-6 leading-relaxed">
          <p>
            Built from a personal language learning experience, this app solves real-world problems like slow dictionary lookups, lack of examples, and difficulty comparing sentence structures across languages.
          </p>
          <p>
          It uses an AI-integrated system (MyMemory API) to provide translations, idioms, grammar usage, and intelligent suggestions all in one place.          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 md:px-20 bg-gradient-to-br from-white to-blue-50">
        <h2 className="text-3xl font-bold text-center mb-12 text-purple-600">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto text-center">
          {[
            {
              title: "AI-enhanced translations",
              desc: "for real-time high-quality translations.",
              icon: "🧠",
            },
            {
              title: "Side-by-Side Language Comparison",
              desc: "Compare sentence structures, tenses, and grammar across multiple languages.",
              icon: "🌍",
            },
            {
              title: "Idioms & Context Extraction",
              desc: "Get idioms, synonyms, and example usages directly from text.",
              icon: "📘",
            },
            {
              title: "Save & Share Outputs",
              desc: "Easily save and download your results for later use or sharing.",
              icon: "💾",
            },
            {
              title: "Mobile Responsive UI",
              desc: "Beautifully designed to work on desktops, tablets, and phones.",
              icon: "📱",
            },
            {
              title: "Built with Django + React",
              desc: "A powerful stack ensures fast performance and seamless integration.",
              icon: "⚙️",
            },
          ].map((f, i) => (
            <div key={i} className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transform hover:scale-105 transition duration-300">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-indigo-700">{f.title}</h3>
              <p className="text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6 md:px-20 bg-white">
        <h2 className="text-3xl font-bold text-center mb-12 text-indigo-600">How It Works</h2>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {[
            {
              step: "1",
              title: "Input Text",
              desc: "Enter the text you want to translate or analyze.",
            },
            {
              step: "2",
              title: "AI Processing",
              desc: "Our AI-integrated models analyze text to provide translations, grammar tips, and more.",
            },
            {
              step: "3",
              title: "Review & Learn",
              desc: "Review the output, save it for later, or share with others.",
            },
          ].map((item, index) => (
            <div key={index} className="bg-indigo-50 p-6 rounded-lg shadow-md hover:shadow-lg transition">
              <div className="text-3xl font-bold text-indigo-600 mb-2">Step {item.step}</div>
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-700">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-6 md:px-20 bg-gradient-to-br from-pink-50 to-blue-50">
        <h2 className="text-3xl font-bold text-center mb-12 text-pink-600">What Users Say</h2>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: "Sara K.",
              feedback: "This app helped me understand Spanish grammar like never before! I use it every day.",
            },
            {
              name: "James M.",
              feedback: "Combining these translation & word analyzer in one interface is genius. I saved so much time.",
            },
            {
              name: "Michell J.",
              feedback: "The examples and idioms are so helpful, especially when writing essays in French.",
            },
          ].map((t, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow hover:shadow-xl transition">
              <p className="text-gray-600 italic">"{t.feedback}"</p>
              <div className="mt-4 font-semibold text-indigo-700">- {t.name}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-6 md:px-20 bg-white">
        <h2 className="text-3xl font-bold text-center mb-12 text-indigo-600">Frequently Asked Questions</h2>
        <div className="max-w-4xl mx-auto space-y-6">
          {[
            {
              q: "Is this app free to use?",
              a: "Yes, it's completely free for educational and personal use. You can explore all features without cost.",
            },
            {
              q: "Which languages are supported?",
              a: "The app supports over 50 languages including English, French, Korean, Spanish, Chinese, and more.",
            },
            {
              q: "Can I save the outputs?",
              a: "Yes! You can save or copy the generated translations and examples with one click.",
            },
          ].map((item, i) => (
            <div key={i}>
              <h3 className="text-lg font-semibold text-indigo-700">{item.q}</h3>
              <p className="text-gray-700">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section id="cta" className="py-20 px-6 md:px-20 bg-gradient-to-tr from-indigo-100 to-pink-100 text-center">
        <h2 className="text-3xl font-bold mb-6 text-indigo-800">Ready to Learn Smarter?</h2>
        <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
          Dive into the world of intelligent language learning. Launch the app now and experience the future of multilingual education.
        </p>
        <a
          href="/translator"
          className="bg-indigo-700 text-white px-8 py-3 rounded-full text-lg font-medium shadow-lg hover:bg-indigo-800 transition"
        >
          Launch App
        </a>
      </section>

      {/* Footer */}
      <footer className="bg-white text-center py-6 text-sm text-gray-500 border-t border-gray-200">
        &copy; {new Date().getFullYear()} MultiLingo. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;
