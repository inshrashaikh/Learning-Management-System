import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Globe, Shield, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Learn<span className="text-brand-400">Sphere</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Enterprise-grade educational architecture designed for structured curriculums, active progress tracking, and rigorous academic assessment.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Curriculum
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/courses?category=Web+Development" className="hover:text-white transition-colors">
                  Web Development
                </Link>
              </li>
              <li>
                <Link to="/courses?category=Software+Architecture" className="hover:text-white transition-colors">
                  Software Architecture
                </Link>
              </li>
              <li>
                <Link to="/courses?category=Cybersecurity" className="hover:text-white transition-colors">
                  Cybersecurity
                </Link>
              </li>
              <li>
                <Link to="/courses?category=Cloud+Computing" className="hover:text-white transition-colors">
                  Cloud & DevOps
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/courses" className="hover:text-white transition-colors">
                  Course Catalog
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Student Portal
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Instructor Hub
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Admin Governance
                </Link>
              </li>
            </ul>
          </div>

          {/* Academic Report / Docs */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Academic Project
            </h4>
            <p className="text-xs text-slate-400 mb-3">
              Built as a Software Engineering Capstone Project following modular N-tier design, Zod validations, JWT cookies, and automated test coverage.
            </p>
            <div className="inline-flex items-center gap-1 text-xs text-brand-400 bg-brand-950/60 px-2.5 py-1 rounded-md border border-brand-800/60">
              <span>Status: Production-Grade MVP</span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} LearnSphere LMS. Software Engineering Academic Project.</p>
          <div className="flex items-center gap-6">
            <span>Role-Based Authorization</span>
            <span>Dynamic Progress Engine</span>
            <span>RESTful Micro-Services</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
