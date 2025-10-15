import React from "react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-8 text-center">
      <p>© {new Date().getFullYear()} EverPulse — AI-Enhanced Patient Record System</p>
      <p className="text-sm mt-2">
        Built for Hackathons 💡 | Empowering Healthcare with AI
      </p>
    </footer>
  );
}
