import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  AiOutlineFileText,
  AiOutlineUser,
  AiOutlineCalendar,
} from "react-icons/ai";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#f8fbff] text-[#0f172a] font-sans">
      {/* Navbar */}
      <Navbar />

      {/* HERO SECTION */}
      <header className="flex flex-col items-center justify-center text-center px-6 pt-32 pb-28 bg-gradient-to-br from-[#dbeafe] via-[#bfdbfe] to-[#93c5fd] relative overflow-hidden">
        {/* Floating glow circles */}
        <div className="absolute w-96 h-96 bg-[#c7d2fe] rounded-full blur-3xl opacity-30 top-[-120px] left-[-100px]" />
        <div className="absolute w-80 h-80 bg-[#a5b4fc] rounded-full blur-3xl opacity-25 bottom-[-100px] right-[-80px]" />

        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight max-w-4xl tracking-tight drop-shadow-lg text-[#002D72]">
          Transforming Healthcare with{" "}
          <span className="text-[#0047AB]">EverPulse</span>
        </h1>

        <p className="mt-6 text-xl md:text-2xl max-w-3xl text-[#1e293b] leading-relaxed">
          Streamlined patient records, intelligent summaries, and effortless
          appointments — all in one intuitive, AI-powered platform.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <a
            href="/signup"
            className="bg-[#0047AB] text-white px-10 py-4 rounded-xl text-lg font-semibold shadow-md hover:bg-[#003B8E] transition-transform transform hover:scale-105"
          >
            Get Started
          </a>
          <a
            href="/login"
            className="border border-[#0047AB] text-[#0047AB] px-10 py-4 rounded-xl text-lg font-semibold hover:bg-[#e0e7ff] transition"
          >
            Login
          </a>
        </div>
      </header>

      {/* FEATURES SECTION */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-extrabold text-center text-[#003B8E] mb-16">
            Key Features
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            {/* Card 1 */}
            <div className="p-8 border border-[#e0e7ff] rounded-2xl bg-[#f9fbff] shadow hover:shadow-lg transition-all duration-300 text-center flex flex-col items-center">
              <AiOutlineFileText className="text-[#0047AB] text-7xl mb-6" />
              <h3 className="text-2xl font-bold text-[#003B8E] mb-3">
                AI-Powered Summaries
              </h3>
              <p className="text-[#334155] text-lg">
                Turn complex patient notes into clear, concise insights with
                one-click AI assistance.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-8 border border-[#e0e7ff] rounded-2xl bg-[#f9fbff] shadow hover:shadow-lg transition-all duration-300 text-center flex flex-col items-center">
              <AiOutlineUser className="text-[#0047AB] text-7xl mb-6" />
              <h3 className="text-2xl font-bold text-[#003B8E] mb-3">
                Smart Patient Management
              </h3>
              <p className="text-[#334155] text-lg">
                Keep patient details, medical records, and treatment plans in a
                seamless, secure environment.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-8 border border-[#e0e7ff] rounded-2xl bg-[#f9fbff] shadow hover:shadow-lg transition-all duration-300 text-center flex flex-col items-center">
              <AiOutlineCalendar className="text-[#0047AB] text-7xl mb-6" />
              <h3 className="text-2xl font-bold text-[#003B8E] mb-3">
                Appointment Scheduler
              </h3>
              <p className="text-[#334155] text-lg">
                Manage, track, and optimize appointments effortlessly for both
                doctors and patients.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section
        id="about"
        className="py-24 bg-gradient-to-r from-[#f0f5ff] via-[#dceafe] to-[#bfd8ff] text-center px-6"
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-[#0047AB] mb-8">
            About EverPulse
          </h2>
          <p className="text-[#1e293b] text-xl leading-relaxed mb-6">
            EverPulse merges modern design and AI innovation to empower
            healthcare professionals. Manage patient data, appointments, and
            medical summaries all in one reliable, cloud-based system.
          </p>
          <p className="text-[#334155] text-lg">
            Developed using{" "}
            <span className="font-semibold">React</span>,{" "}
            <span className="font-semibold">Node.js</span>,{" "}
            <span className="font-semibold">MongoDB</span>, and{" "}
            <span className="font-semibold">OpenAI APIs</span>.  
            Designed for hackathons, startups, and forward-thinking healthcare teams.
          </p>
        </div>
      </section>

      {/* CONTACT / CTA SECTION */}
      <section
        id="contact"
        className="py-24 bg-[#dbeafe] text-center text-[#0f172a]"
      >
        <h2 className="text-4xl font-bold mb-4 text-[#0047AB]">
          Get in Touch
        </h2>
        <p className="text-xl mb-10 max-w-xl mx-auto text-[#1e293b]">
          Join us in shaping the future of healthcare with AI-driven
          intelligence. Start your EverPulse journey today!
        </p>
        <a
          href="/signup"
          className="bg-[#0047AB] text-white px-10 py-4 rounded-xl text-lg font-semibold shadow hover:bg-[#003B8E] transition-transform transform hover:scale-105"
        >
          Join EverPulse
        </a>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
