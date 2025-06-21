"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom"; 
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Building2, Briefcase, Calendar } from "lucide-react";

// --- Sample Data (could come from an API) ---
const sampleOffers = [
  {
    id: "1",
    company: "Tech Corp",
    position: "Senior Developer",
    offerValidTill: "2024-03-15",
    location: "San Francisco, CA",
    department: "Engineering",
    type: "Full-time",
    ctc: {
      base: 120000,
      bonus: {
        performance: 20000,
        joining: 10000,
        retention: 15000,
      },
      stocks: {
        rsus: 50000,
        vestingSchedule: "25% per year over 4 years",
      },
      benefits: {
        health: {
          insurance: 12000,
          dental: 2000,
          vision: 1000,
        },
        retirement: {
          contribution401k: 8000,
          matching: "100% up to 6% of base salary",
        },
        miscAllowances: {
          meals: 3000,
          transport: 2000,
          internet: 1000,
          learning: 4000,
        },
      },
      leavePolicy: {
        annual: 20,
        sick: 12,
        personal: 5,
        parental: {
          maternal: 84,
          paternal: 14,
        },
        carryForward: "Up to 10 days",
      },
    },
    termsAndConditions: [
      "Offer valid for 7 days from the date of issue",
      "Background verification clearance required",
      "Non-compete agreement for 12 months post-employment",
      "Intellectual property rights assignment",
      "6 months probation period",
      "Notice period of 2 months",
    ],
  },
  {
    id: "2",
    company: "Cool Startup",
    position: "Frontend Engineer",
    offerValidTill: "2024-04-01",
    location: "Remote",
    department: "Product",
    type: "Full-time",
    ctc: {
      base: 110000,
      bonus: {
        performance: 15000,
        joining: 0,
        retention: 5000,
      },
      stocks: {
        rsus: 25000,
        vestingSchedule: "25% per year over 4 years",
      },
      benefits: {
        health: {
          insurance: 8000,
          dental: 1500,
          vision: 500,
        },
        retirement: {
          contribution401k: 5000,
          matching: "50% up to 6% of base salary",
        },
        miscAllowances: {
          meals: 2000,
          transport: 1500,
          internet: 1000,
          learning: 3000,
        },
      },
      leavePolicy: {
        annual: 15,
        sick: 10,
        personal: 5,
        parental: {
          maternal: 60,
          paternal: 10,
        },
        carryForward: "Up to 5 days",
      },
    },
    termsAndConditions: [
      "Offer valid for 14 days from the date of issue",
      "Background verification clearance required",
      "No side projects that conflict with company IP",
      "6 months probation period",
    ],
  },
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// Helper: EnhancedCTCBreakdown
function EnhancedCTCBreakdown({ ctc }: { ctc: any }) {
  const totalFixed =
    ctc.base + ctc.bonus.performance + ctc.bonus.joining + ctc.bonus.retention;

  const totalBenefits =
    ctc.benefits.health.insurance +
    ctc.benefits.health.dental +
    ctc.benefits.health.vision +
    ctc.benefits.retirement.contribution401k +
    ctc.benefits.miscAllowances.meals +
    ctc.benefits.miscAllowances.transport +
    ctc.benefits.miscAllowances.internet +
    ctc.benefits.miscAllowances.learning;

  return (
    <motion.div
      variants={itemVariants}
      className="space-y-6 px-6 pb-6 pt-4 border-b border-gray-100"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800">
          Compensation &amp; Stock
        </h3>
      </div>
      {/* Fixed + Stock Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Fixed Components */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
          <h4 className="font-semibold text-gray-700 mb-3">Fixed Components</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Base Salary</span>
              <span className="font-medium">${ctc.base.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Performance Bonus</span>
              <span className="font-medium">
                ${ctc.bonus.performance.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Joining Bonus</span>
              <span className="font-medium">
                ${ctc.bonus.joining.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Retention Bonus</span>
              <span className="font-medium">
                ${ctc.bonus.retention.toLocaleString()}
              </span>
            </div>
            <div className="pt-2 border-t text-sm font-semibold">
              <div className="flex justify-between">
                <span>Total Fixed</span>
                <span>${totalFixed.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stock Options */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
          <h4 className="font-semibold text-gray-700 mb-3">Stock Options</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">RSUs Value</span>
              <span className="font-medium">
                ${ctc.stocks.rsus.toLocaleString()}
              </span>
            </div>
            <div className="text-sm text-gray-500 mt-2">
              <p className="font-medium">Vesting Schedule:</p>
              <p>{ctc.stocks.vestingSchedule}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits & Allowances */}
      <div className="flex items-center justify-between mt-6 mb-3">
        <h4 className="text-lg font-semibold text-gray-800">
          Benefits &amp; Allowances
        </h4>
      </div>
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Health */}
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2">
              Health Benefits
            </h5>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500">Insurance</span>
                <span className="font-medium">
                  ${ctc.benefits.health.insurance.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Dental</span>
                <span className="font-medium">
                  ${ctc.benefits.health.dental.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Vision</span>
                <span className="font-medium">
                  ${ctc.benefits.health.vision.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Retirement */}
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2">
              Retirement
            </h5>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500">401(k)</span>
                <span className="font-medium">
                  ${ctc.benefits.retirement.contribution401k.toLocaleString()}
                </span>
              </div>
              <p className="text-gray-500 text-sm mt-1">
                Matching: {ctc.benefits.retirement.matching}
              </p>
            </div>
          </div>

          {/* Allowances */}
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2">
              Allowances
            </h5>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500">Meals</span>
                <span className="font-medium">
                  ${ctc.benefits.miscAllowances.meals.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Transport</span>
                <span className="font-medium">
                  ${ctc.benefits.miscAllowances.transport.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Internet</span>
                <span className="font-medium">
                  ${ctc.benefits.miscAllowances.internet.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Learning</span>
                <span className="font-medium">
                  ${ctc.benefits.miscAllowances.learning.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Total CTC */}
      <div className="mt-6 flex items-center justify-between">
        <span className="text-sm font-semibold text-indigo-900">
          Total CTC (All Benefits)
        </span>
        <span className="font-bold text-indigo-900">
          ${(totalFixed + ctc.stocks.rsus + totalBenefits).toLocaleString()}
        </span>
      </div>
    </motion.div>
  );
}

// Helper: LeavePolicy
function LeavePolicy({ policy }: { policy: any }) {
  return (
    <motion.div
      variants={itemVariants}
      className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-3 mx-6 pb-6"
    >
      <h3 className="font-semibold text-gray-700">Leave Policy</h3>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-600">Annual Leave</p>
          <p className="font-medium">{policy.annual} days</p>
        </div>
        <div>
          <p className="text-gray-600">Sick Leave</p>
          <p className="font-medium">{policy.sick} days</p>
        </div>
        <div>
          <p className="text-gray-600">Personal Leave</p>
          <p className="font-medium">{policy.personal} days</p>
        </div>
        <div>
          <p className="text-gray-600">Carry Forward</p>
          <p className="font-medium">{policy.carryForward}</p>
        </div>
      </div>
      <div className="mt-2">
        <p className="text-sm text-gray-600">Parental Leave</p>
        <div className="grid grid-cols-2 gap-4 mt-1 text-sm">
          <div>
            <p className="text-xs text-gray-500">Maternal</p>
            <p className="font-medium">{policy.parental.maternal} days</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Paternal</p>
            <p className="font-medium">{policy.parental.paternal} days</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ---- MAIN OFFER DETAIL PAGE COMPONENT ----
export default function OfferDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"Pending" | "Accepted" | "Rejected">("Pending");
  const [actionTimestamp, setActionTimestamp] = useState<Date | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [offer, setOffer] = useState<any | null>(null);

  useEffect(() => {
    if (!id) {
      navigate("/job-offer");
      return;
    }
    const found = sampleOffers.find((o) => o.id === id);
    if (!found) {
      navigate("/404");
    } else {
      setOffer(found);
    }
  }, [id, navigate]);

  if (!offer) return null;

  const canChangeStatus =
    actionTimestamp &&
    Date.now() - actionTimestamp.getTime() < 24 * 60 * 60 * 1000;

  const handleAcceptOffer = () => {
    if (!termsAccepted) {
      Swal.fire({
        icon: "error",
        title: "Terms Not Accepted",
        text: "Please accept the terms and conditions before accepting the offer.",
      });
      return;
    }
    setStatus("Accepted");
    setActionTimestamp(new Date());
    Swal.fire({
      icon: "success",
      title: "Offer Accepted",
      text: `You've successfully accepted the offer from ${offer.company}.`,
    });
  };

  const handleRejectOffer = () => {
    setStatus("Rejected");
    setActionTimestamp(new Date());
    Swal.fire({
      icon: "info",
      title: "Offer Rejected",
      text: `You have rejected the offer from ${offer.company}.`,
    });
  };

  const confirmRejectOffer = () => {
    Swal.fire({
      title: "Reject Offer?",
      text: "Are you sure you want to reject this offer? This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, reject",
    }).then((result) => {
      if (result.isConfirmed) {
        handleRejectOffer();
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-10">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Button variant="outline" onClick={() => navigate("/job-offer")}>
            ← Back to Offers
          </Button>
        </motion.div>

        {/* Offer Header Card */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <motion.div
            variants={itemVariants}
            className="p-6 bg-indigo-50 flex flex-col sm:flex-row justify-between items-start sm:items-center"
          >
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-gray-800">
                {offer.company}
              </h1>
              <p className="text-indigo-600 font-medium">{offer.position}</p>
              <div className="mt-2 text-sm text-gray-500 space-y-1">
                <p>Job ID: {offer.id}</p>
                <p>Valid till: {offer.offerValidTill}</p>
              </div>
            </div>
            <div className="mt-4 sm:mt-0 space-y-1 text-sm">
              <div>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    status === "Accepted"
                      ? "bg-green-100 text-green-800"
                      : status === "Rejected"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {status}
                </span>
              </div>
              {actionTimestamp && canChangeStatus && (
                <p className="text-xs text-gray-500">
                  Status can be changed until{" "}
                  {new Date(
                    actionTimestamp.getTime() + 24 * 60 * 60 * 1000
                  ).toLocaleString()}
                </p>
              )}
            </div>
          </motion.div>

          {/* Additional Info Row */}
          <motion.div
            variants={itemVariants}
            className="px-6 py-3 bg-white flex flex-col sm:flex-row items-start sm:items-center gap-4 border-t border-gray-100"
          >
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Building2 className="h-4 w-4 text-gray-400" />
              <span>{offer.department || "General"}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Briefcase className="h-4 w-4 text-gray-400" />
              <span>{offer.type || "Full-time"}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span>Valid till: {offer.offerValidTill}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span className="inline-block h-2 w-2 rounded-full bg-green-400" />
              <span>{offer.location || "Location Unavailable"}</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Breakdown, Leave Policy, Terms */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-6"
        >
          <EnhancedCTCBreakdown ctc={offer.ctc} />
          <LeavePolicy policy={offer.ctc.leavePolicy} />

          {/* Terms & Conditions */}
          <motion.div
            variants={itemVariants}
            className="bg-gray-50 px-6 py-4 border-t border-gray-100"
          >
            <h3 className="font-semibold text-gray-700 mb-2">
              Terms and Conditions
            </h3>
            <ul className="list-disc list-inside space-y-2">
              {offer.termsAndConditions.map((term: string, idx: number) => (
                <li key={idx} className="text-sm text-gray-600">
                  {term}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Acceptance Checkbox + Buttons */}
          {status === "Pending" && (
            <motion.div
              variants={itemVariants}
              className="px-6 py-4 border-t border-gray-100"
            >
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={termsAccepted}
                    onCheckedChange={(checked) =>
                      setTermsAccepted(Boolean(checked))
                    }
                  />
                  <label htmlFor="terms" className="text-sm text-gray-600">
                    I have read and accept the terms &amp; conditions
                  </label>
                </div>
              </div>
              <div className="flex items-center gap-4 pt-3">
                <Button onClick={handleAcceptOffer}>Accept Offer</Button>
                <Button variant="destructive" onClick={confirmRejectOffer}>
                  Reject Offer
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
