import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import { 
  ExternalLink, Scale, FileText,
  AlertCircle, Ban, DollarSign, ChevronRight, FileLock 
} from "lucide-react"

export default function TermsAndConditions() {
  const [activeSection, setActiveSection] = useState("acceptance");

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll("section[id]");
      const scrollPosition = window.scrollY + 100;

      sections.forEach((section) => {
        const htmlSection = section as HTMLElement;
        if (
          htmlSection.offsetTop <= scrollPosition &&
          htmlSection.offsetTop + htmlSection.offsetHeight > scrollPosition
        ) {
          setActiveSection(section.getAttribute("id") || "");
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const sections = [
    {
      id: "acceptance",
      title: "Acceptance of Terms",
      icon: <Scale className="h-6 w-6" />,
      content: {
        title: "Acceptance of Terms and Conditions",
        mainText: "By accessing or using Screenera's services, you agree to be bound by these Terms and Conditions.",
        subsections: [
          {
            title: "Agreement to Terms",
            content: `By accessing or using the Screenera platform, you agree that:
• You have read and understood these terms
• You have the authority to accept these terms
• You are at least 18 years of age
• You will comply with all applicable laws and regulations`
          },
          {
            title: "Modifications to Terms",
            content: `Screenera reserves the right to modify these terms at any time:
• Changes will be effective immediately upon posting
• Continued use constitutes acceptance of changes
• Users will be notified of material changes
• Previous versions will be archived and accessible`
          }
        ]
      }
    },
    {
      id: "service-terms",
      title: "Service Terms",
      icon: <FileText className="h-6 w-6" />,
      content: {
        title: "Terms of Service Usage",
        mainText: "Detailed terms governing the use of Screenera's services and platform.",
        subsections: [
          {
            title: "Service Description",
            content: `Our services include:
• Technical assessment platform
• Candidate evaluation tools
• Hiring process management
• Analytics and reporting
• Integration capabilities`
          },
          {
            title: "Service Availability",
            content: `Screenera commits to:
• 99.9% platform uptime
• Scheduled maintenance windows
• Emergency maintenance when required
• Advance notification of updates
• System status monitoring`
          }
        ]
      }
    },
    {
      id: "user-obligations",
      title: "User Obligations",
      icon: <AlertCircle className="h-6 w-6" />,
      content: {
        title: "User Responsibilities and Obligations",
        mainText: "Users of Screenera's platform must adhere to specific obligations and responsibilities.",
        subsections: [
          {
            title: "Account Responsibilities",
            content: `Users must:
• Maintain accurate account information
• Protect account credentials
• Report unauthorized access
• Update contact information
• Comply with security protocols`
          },
          {
            title: "Prohibited Activities",
            content: `Users must not:
• Share account credentials
• Reverse engineer the platform
• Attempt unauthorized access
• Upload malicious content
• Violate intellectual property rights`
          }
        ]
      }
    },
    {
      id: "payment-terms",
      title: "Payment Terms",
      icon: <DollarSign className="h-6 w-6" />,
      content: {
        title: "Payment and Billing Terms",
        mainText: "Terms governing payment, billing, and subscription management.",
        subsections: [
          {
            title: "Billing Policies",
            content: `Payment terms include:
• Monthly/annual billing options
• Automatic renewal terms
• Payment method requirements
• Late payment policies
• Refund conditions`
          },
          {
            title: "Subscription Management",
            content: `Subscription terms cover:
• Plan changes and upgrades
• Cancellation policies
• Pro-rated adjustments
• Usage-based billing
• Enterprise agreements`
          }
        ]
      }
    },
    {
      id: "intellectual-property",
      title: "Intellectual Property",
      icon: <FileLock className="h-6 w-6" />,
      content: {
        title: "Intellectual Property Rights",
        mainText: "Protection and rights regarding Screenera's intellectual property.",
        subsections: [
          {
            title: "Ownership Rights",
            content: `Screenera maintains ownership of:
• Platform software and code
• Assessment content
• Documentation and materials
• Branding and trademarks
• Proprietary algorithms`
          },
          {
            title: "User Content Rights",
            content: `Users retain rights to:
• Uploaded assessment content
• Custom test cases
• Company-specific materials
• Generated reports
• Integration configurations`
          }
        ]
      }
    },
    {
      id: "limitations",
      title: "Limitations",
      icon: <Ban className="h-6 w-6" />,
      content: {
        title: "Limitations and Restrictions",
        mainText: "Limitations on liability and usage restrictions.",
        subsections: [
          {
            title: "Liability Limitations",
            content: `Screenera's liability is limited regarding:
• Service interruptions
• Data loss or corruption
• Third-party actions
• Force majeure events
• Consequential damages`
          },
          {
            title: "Usage Restrictions",
            content: `Platform usage restrictions include:
• API rate limits
• Storage limitations
• Concurrent user limits
• Feature availability
• Geographic restrictions`
          }
        ]
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b bg-gradient-to-r from-indigo-950 to-indigo-900 text-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <Link to="/" className="text-xl font-bold hover:text-indigo-200 transition duration-200">
                Screenera
              </Link>
            </div>
            <div className="flex items-center gap-4 text-lg font-semibold">
              Terms and Conditions
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 mt-16">
        <div className="grid grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="col-span-12 lg:col-span-3">
            <nav className="sticky top-24 space-y-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`w-full flex items-center gap-3 text-sm py-3 px-4 rounded-lg transition duration-200 ${
                    activeSection === section.id
                      ? "bg-indigo-50 text-indigo-950"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <div className={`${
                    activeSection === section.id
                      ? "text-indigo-600"
                      : "text-gray-400"
                  }`}>
                    {section.icon}
                  </div>
                  <span className="font-medium">{section.title}</span>
                  {activeSection === section.id && (
                    <ChevronRight className="ml-auto h-4 w-4 text-indigo-600" />
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="col-span-12 lg:col-span-9">
            <div className="max-w-5xl bg-white p-8 lg:p-12 rounded-xl shadow-sm border border-gray-100">
              <h1 className="text-4xl font-bold text-indigo-950 mb-4">Terms and Conditions</h1>
              <h2 className="text-2xl text-gray-600 mb-4">Legal Agreement for Using Screenera</h2>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-12 border-b border-gray-100 pb-6">
                <span>Last Updated: February 12, 2025</span>
                <span>•</span>
                <Link to="#" className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 transition duration-200">
                  Previous versions <ExternalLink className="h-4 w-4" />
                </Link>
              </div>

              <div className="prose prose-indigo max-w-none">
                {sections.map((section) => (
                  <section key={section.id} id={section.id} className="mb-16 scroll-mt-24">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-indigo-50 rounded-lg">
                        {section.icon}
                      </div>
                      <h2 className="text-2xl font-semibold text-indigo-950">
                        {section.content.title}
                      </h2>
                    </div>
                    <div className="text-gray-700 leading-relaxed space-y-6">
                      <p>{section.content.mainText}</p>
                      {section.content.subsections.map((subsection, index) => (
                        <div key={index} className="ml-4">
                          <h3 className="text-lg font-semibold text-indigo-900 mb-2">
                            {subsection.title}
                          </h3>
                          <div className="whitespace-pre-line text-gray-600">
                            {subsection.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}