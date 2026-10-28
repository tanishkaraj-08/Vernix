import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { getInstitutions, addComplaint } from '../../lib/storage';
import { Bureau, Priority } from '../../types';
import { FileUp, AlertCircle, CheckCircle2 } from 'lucide-react';

interface RegisterComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  preselectedInstitutionId?: string;
}

export const RegisterComplaintModal: React.FC<RegisterComplaintModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  preselectedInstitutionId,
}) => {
  const institutions = getInstitutions();

  const [institutionId, setInstitutionId] = useState(preselectedInstitutionId || (institutions[0]?.id || ''));
  const [bureau, setBureau] = useState<Bureau>('PGRC');
  const [category, setCategory] = useState<any>('Laboratory & Infrastructure Deficiency');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [complainantType, setComplainantType] = useState<any>('Student');
  const [priority, setPriority] = useState<Priority>('HIGH');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const categories = [
    'Laboratory & Infrastructure Deficiency',
    'Faculty Qualifications & Shortage',
    'Capitation Fee & Fee Overcharging',
    'Ragging & Student Harassment',
    'Admission Irregularities',
    'Unapproved Course Offering',
    'Examination & Evaluation Malpractice',
    'Delayed Scholarship Disbursement'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!institutionId) {
      setError('Please select an AICTE approved institution.');
      return;
    }
    if (!subject.trim() || subject.trim().length < 8) {
      setError('Please enter a descriptive grievance subject (min 8 characters).');
      return;
    }
    if (!description.trim() || description.trim().length < 20) {
      setError('Please provide specific grievance details (min 20 characters).');
      return;
    }

    const selectedInst = institutions.find(i => i.id === institutionId);
    if (!selectedInst) {
      setError('Selected institution not found.');
      return;
    }

    try {
      addComplaint({
        institutionId: selectedInst.id,
        institutionName: selectedInst.name,
        bureau,
        category,
        subject: subject.trim(),
        description: description.trim(),
        complainantType,
        priority,
        currentStatus: 'Submitted',
        slaDays: priority === 'CRITICAL' ? 7 : 15,
        aiSummary: `Initial intake recorded for ${selectedInst.name} concerning ${category.toLowerCase()}.`,
        missingInfoDetected: ['Supporting evidentiary documentation pending'],
        delayRiskScore: priority === 'CRITICAL' ? 75 : 30,
        recommendedPriority: priority,
        attachments: [
          { name: 'Grievance_Filing_Statement.pdf', size: '1.2 MB', date: new Date().toISOString().split('T')[0] }
        ]
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        if (onSuccess) onSuccess();
        // Reset form
        setSubject('');
        setDescription('');
      }, 900);
    } catch (err: any) {
      setError(err?.message || 'Failed to save complaint');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Register New Complaint / Grievance"
      subtitle="Intake complaint into AICTE Central Coordination Registry and trigger AI overlap check"
      maxWidth="2xl"
    >
      {success ? (
        <div className="py-8 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
          <h4 className="text-lg font-bold text-slate-800">Complaint Registered Successfully</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            The record has been indexed into the central repository and evaluated for cross-bureau overlap.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Institution Select */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="font-semibold text-slate-700">
                Target Institution <span className="text-rose-500">*</span>
              </label>
              <select
                value={institutionId}
                onChange={(e) => setInstitutionId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              >
                {institutions.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.name} ({inst.id} - {inst.state})
                  </option>
                ))}
              </select>
            </div>

            {/* Receiving Bureau */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">
                Receiving Bureau / Cell <span className="text-rose-500">*</span>
              </label>
              <select
                value={bureau}
                onChange={(e) => setBureau(e.target.value as Bureau)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              >
                <option value="RB">RB (Approval & Regulation Bureau)</option>
                <option value="PGRC">PGRC (Public Grievance Redressal Cell)</option>
                <option value="VIGILANCE">VIGILANCE (Chief Vigilance Cell)</option>
              </select>
            </div>

            {/* Priority */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Initial Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              >
                <option value="LOW">LOW (Standard 30 Days)</option>
                <option value="MEDIUM">MEDIUM (Standard 20 Days)</option>
                <option value="HIGH">HIGH (Standard 15 Days)</option>
                <option value="CRITICAL">CRITICAL (Urgent 7 Days)</option>
              </select>
            </div>

            {/* Category */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="font-semibold text-slate-700">
                Complaint Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Complainant Type */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="font-semibold text-slate-700">Complainant Classification</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['Student', 'Faculty', 'Parent', 'Anonymous Whistleblower'].map((type) => (
                  <label
                    key={type}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-center justify-center cursor-pointer transition-colors ${
                      complainantType === type
                        ? 'bg-blue-50 border-blue-500 text-blue-700 font-semibold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="complainantType"
                      value={type}
                      checked={complainantType === type}
                      onChange={() => setComplainantType(type)}
                      className="sr-only"
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Grievance Subject */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="font-semibold text-slate-700">
                Grievance Subject / Headline <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Non-functional electronics lab equipment and deficient oscilloscope kits"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              />
            </div>

            {/* Grievance Description */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="font-semibold text-slate-700">
                Detailed Grievance Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Provide comprehensive details of the grievance, affected departments, violation of AICTE Approval Handbook norms, etc."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition-colors"
            >
              Register & Run AI Overlap Check
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
