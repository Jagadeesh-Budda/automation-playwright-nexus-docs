import { notFound } from 'next/navigation';
import { prisma } from '../../../lib/prisma';
import { ShieldCheck, Award, CheckCircle, Activity } from 'lucide-react';
import DownloadVerificationReport from '../../../components/DownloadVerificationReport';

export default async function CredentialVerificationPage({ params }: { params: { certId: string } }) {
  const { certId } = params;

  const record = await prisma.certificate.findUnique({
    where: { certId }
  });

  if (!record) {
    notFound();
  }

  const issueDate = new Date(record.issuedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-[var(--bg-color)] flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      
      {/* Header / Authority Logo */}
      <div className="max-w-3xl w-full text-center mb-10">
        <h1 className="text-2xl md:text-3xl font-black tracking-widest text-[var(--text-main)] uppercase bg-clip-text text-transparent bg-gradient-to-r from-gray-200 to-gray-500">
          Playwright Automation Academy
        </h1>
        <p className="text-sm font-semibold text-[var(--accent)] tracking-[0.2em] mt-2 uppercase">
          Certified by: Automation Excellence Institute
        </p>
      </div>

      <div className="max-w-3xl w-full bg-[var(--sidebar-bg)] border border-[var(--border-color)] rounded-xl shadow-2xl overflow-hidden">
        
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-green-900/40 via-green-800/20 to-transparent border-b border-[var(--border-color)] p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-green-600" />
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 font-bold text-sm mb-6 tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            VERIFIED CREDENTIAL
          </div>

          <h2 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">
            {record.name}
          </h2>
          
          <div className="flex items-center justify-center gap-3 mt-4 mb-8">
            <Award className="w-8 h-8 text-yellow-500" />
            <span className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600 tracking-wider">
              AUTOMATION LEGEND
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-left max-w-2xl mx-auto bg-black/20 rounded-lg p-4 border border-[var(--border-color)]">
            <div>
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1 font-semibold">Certificate No.</p>
              <p className="text-sm text-gray-200 font-mono">{record.certId}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1 font-semibold">Issue Date</p>
              <p className="text-sm text-gray-200">{issueDate}</p>
            </div>
            <div className="col-span-2 md:col-span-1">
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1 font-semibold">Credential Status</p>
              <div className="flex items-center gap-1.5 text-green-400 font-bold text-sm">
                <CheckCircle className="w-4 h-4" /> Active
              </div>
            </div>
          </div>
        </div>

        {/* Body Section */}
        <div className="p-8 grid md:grid-cols-5 gap-8">
          
          {/* Skills Validated (Left 3 cols) */}
          <div className="md:col-span-3">
            <h3 className="text-lg font-bold text-[var(--text-main)] mb-6 flex items-center gap-2 border-b border-[var(--border-color)] pb-2">
              <Activity className="w-5 h-5 text-[var(--accent)]" />
              Skills Validated
            </h3>
            
            <ul className="grid sm:grid-cols-2 gap-y-4 gap-x-2">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-gray-200">Playwright Automation</p>
                  <p className="text-xs text-[var(--text-muted)]">Advanced POM & Locators</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-gray-200">API Testing</p>
                  <p className="text-xs text-[var(--text-muted)]">Hybrid UI/API Flows</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-gray-200">Framework Architecture</p>
                  <p className="text-xs text-[var(--text-muted)]">Enterprise 4-Layer Design</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-gray-200">Test Data Management</p>
                  <p className="text-xs text-[var(--text-muted)]">Factories & Fixtures</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-gray-200">Reporting</p>
                  <p className="text-xs text-[var(--text-muted)]">HTML & Telemetry</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-gray-200">CI/CD Integration</p>
                  <p className="text-xs text-[var(--text-muted)]">Docker & Pipelines</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Seal and Download (Right 2 cols) */}
          <div className="md:col-span-2 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-[var(--border-color)] pt-8 md:pt-0 md:pl-8">
            
            {/* Massive Premium Seal */}
            <div className="relative w-32 h-32 flex flex-col items-center justify-center flex-shrink-0 mb-8">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-600 to-yellow-800 shadow-[0_0_30px_rgba(234,179,8,0.3)]" />
              <div className="absolute inset-1.5 rounded-full bg-gradient-to-br from-gray-100 via-gray-400 to-gray-700 border border-black/30" />
              <div className="absolute inset-3 rounded-full bg-gradient-to-br from-red-500 to-red-900 border-2 border-white/20 shadow-inner" />
              
              <div className="relative z-10 text-center text-white drop-shadow-md">
                <Award className="w-8 h-8 mx-auto text-yellow-200 filter drop-shadow mb-1" />
                <div className="text-[0.45rem] font-black tracking-widest uppercase">Automation</div>
                <div className="text-xs font-black tracking-widest text-yellow-200 mt-0.5">LEGEND</div>
              </div>
            </div>

            <DownloadVerificationReport 
              name={record.name}
              certId={record.certId}
              issueDate={issueDate}
            />

            {/* LinkedIn Integration Panel */}
            <div className="w-full mt-6 bg-[#0e76a8]/10 border border-[#0e76a8]/30 rounded-lg p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2 justify-center">
                <svg className="w-5 h-5 text-[#0e76a8] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                <span className="font-bold text-[var(--text-main)] text-sm">Verify on LinkedIn</span>
              </div>
              
              <div className="flex flex-col gap-2 w-full">
                <a 
                  href={`https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=Playwright+Automation+Legend&organizationName=Aegis+Automation+Academy&issueYear=${new Date(record.issuedAt).getFullYear()}&issueMonth=${new Date(record.issuedAt).getMonth() + 1}&certUrl=https://aegis-automation.com/credential/${record.certId}&certId=${record.certId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center px-4 py-2 bg-[#0e76a8] text-white rounded font-medium hover:bg-[#006097] transition-colors no-underline text-xs"
                >
                  Add to Profile
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-[var(--text-muted)] text-xs max-w-lg">
        <p>This page confirms that the individual above has successfully completed all requirements for the Automation Legend certification.</p>
        <p className="mt-2 font-mono">Verification ID: {record.certId}</p>
      </div>

    </div>
  );
}
