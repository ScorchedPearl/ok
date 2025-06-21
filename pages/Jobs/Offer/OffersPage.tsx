"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { BadgeCheck, Building2, Briefcase, Calendar, ChevronRight } from "lucide-react";

// Sample data (could come from an API or a database)
const sampleOffers = [
  {
    id: "1",
    company: "Tech Corp",
    position: "Senior Developer",
    offerValidTill: "2024-03-15",
    location: "San Francisco, CA",
    department: "Engineering",
    type: "Full-time",
  },
  {
    id: "2",
    company: "Cool Startup",
    position: "Frontend Engineer",
    offerValidTill: "2024-04-01",
    location: "Remote",
    department: "Product",
    type: "Full-time",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
};

export default function OffersPage() {
  const [offers] = useState(sampleOffers);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Header Section */}
          <div className="mb-10">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-4 mb-6"
            >
              <div className="h-12 w-12 rounded-full bg-indigo-600 flex items-center justify-center">
                <BadgeCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Offers</h1>
                <p className="text-gray-600 mt-1">Review and manage your job offers</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-3 gap-6"
            >
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <p className="text-gray-600 text-sm">Active Offers</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{offers.length}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <p className="text-gray-600 text-sm">Days to Respond</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">7</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <p className="text-gray-600 text-sm">Status</p>
                <p className="text-2xl font-bold text-indigo-600 mt-1">Active</p>
              </div>
            </motion.div>
          </div>

          {/* Offers List */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {offers.map((offer) => (
              <motion.div
                key={offer.id}
                variants={itemVariants}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                          <span className="text-indigo-600 font-semibold">
                            {offer.company.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">
                            {offer.company}
                          </h3>
                          <p className="text-indigo-600 font-medium">{offer.position}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <Building2 className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{offer.department}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Briefcase className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{offer.type}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Valid till: {offer.offerValidTill}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="inline-block h-2 w-2 rounded-full bg-green-400" />
                          <span className="text-sm text-gray-600">{offer.location}</span>
                        </div>
                      </div>
                    </div>

                    <Link
                      to={`/job-offer/${offer.id}`}
                      className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors group"
                    >
                      <span>View Details</span>
                      <ChevronRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>

                <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      Job ID: <span className="font-medium text-gray-900">{offer.id}</span>
                    </p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      New Offer
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}