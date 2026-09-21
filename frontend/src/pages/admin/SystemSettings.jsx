import React from 'react';
import UserProfile from '../common/UserProfile';
import Badge from '../../components/common/Badge';
import Card, { CardBody } from '../../components/common/Card';
import { Server, Database, Shield, Cpu, Code2 } from 'lucide-react';

const SystemSettings = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      <div>
        <Badge variant="purple">Academic Architecture</Badge>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
          System Specifications & Governance
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Software Engineering project technical specs, infrastructure health, and administrator profile.
        </p>
      </div>

      {/* Tech Stack Specs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-5 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Application Server</h4>
            <p className="text-xs text-slate-500 mt-1">
              Node.js v26.9.0 + Express 4.19 with modular MVC routes, Zod schemas, and centralized error handling.
            </p>
          </div>
          <Badge variant="emerald">Operational</Badge>
        </Card>

        <Card className="p-5 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Database Engine</h4>
            <p className="text-xs text-slate-500 mt-1">
              MongoDB 7 running in isolated container on port 27017 with Mongoose ODM compound indexing.
            </p>
          </div>
          <Badge variant="emerald">Connected</Badge>
        </Card>

        <Card className="p-5 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Security Architecture</h4>
            <p className="text-xs text-slate-500 mt-1">
              Bcrypt salted hashing (10 rounds), JWT httpOnly sameSite cookies, and role-based middleware guards.
            </p>
          </div>
          <Badge variant="purple">Secured</Badge>
        </Card>
      </div>

      {/* Administrator Profile Settings */}
      <div className="pt-4 border-t border-slate-200">
        <UserProfile portalRole="admin" />
      </div>
    </div>
  );
};

export default SystemSettings;
