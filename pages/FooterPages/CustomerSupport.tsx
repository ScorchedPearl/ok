import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import { 
  ExternalLink, HeadphonesIcon, Clock, Users, 
  MessageCircle, ShieldCheck, Rocket, 
  LifeBuoy, ChevronRight, HelpCircle 
} from "lucide-react"

export default function CustomerSupport() {
  const [activeSection, setActiveSection] = useState("getting-started");

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

  interface ScrollToSectionProps {
    sectionId: string;
  }

  const scrollToSection = ({ sectionId }: ScrollToSectionProps): void => {
    const element = document.getElementById(sectionId);
    if (element) {
      const yOffset: number = -80;
      const y: number = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const sections = [
    {
      id: "getting-started",
      title: "Getting Started",
      icon: <Rocket className="h-6 w-6" />,
      content: {
        title: "Getting Started with Screenera",
        mainText: "Welcome to Screenera's Customer Support. Find everything you need to get started with our platform.",
        subsections: [
          {
            title: "Quick Start Guide",
            content: `• Create your account
• Set up your organization profile
• Configure assessment preferences
• Invite team members
• Create your first assessment`
          },
          {
            title: "Account Setup",
            content: `• Account verification process
• Two-factor authentication setup
• User roles and permissions
• Team management basics
• Billing and subscription setup`
          }
        ]
      }
    },
    {
      id: "support-channels",
      title: "Support Channels",
      icon: <HeadphonesIcon className="h-6 w-6" />,
      content: {
        title: "Available Support Channels",
        mainText: "Multiple ways to get help when you need it:",
        subsections: [
          {
            title: "24/7 Support Options",
            content: `• Live Chat Support: Available 24/7
• Email Support: response within 4 hours
• Phone Support: Available 9AM-6PM EST
• Community Forum: Peer support
• Knowledge Base: Self-service resources`
          },
          {
            title: "Priority Support",
            content: `• Dedicated account manager
• Priority ticket handling
• Emergency response team
• Technical consultation
• Custom support solutions`
          }
        ]
      }
    },
    {
      id: "response-times",
      title: "Response Times",
      icon: <Clock className="h-6 w-6" />,
      content: {
        title: "Support Response Times",
        mainText: "Our commitment to timely support across different channels:",
        subsections: [
          {
            title: "Standard Support SLAs",
            content: `• Critical Issues: < 1 hour
• High Priority: < 4 hours
• Medium Priority: < 8 hours
• Low Priority: < 24 hours
• General Inquiries: < 48 hours`
          },
          {
            title: "Enterprise Support SLAs",
            content: `• Critical Issues: < 15 minutes
• High Priority: < 1 hour
• Medium Priority: < 4 hours
• Low Priority: < 12 hours
• 24/7 emergency support`
          }
        ]
      }
    },
    {
      id: "issue-resolution",
      title: "Issue Resolution",
      icon: <ShieldCheck className="h-6 w-6" />,
      content: {
        title: "Issue Resolution Process",
        mainText: "Our systematic approach to resolving your issues:",
        subsections: [
          {
            title: "Resolution Steps",
            content: `1. Issue Identification
2. Priority Assignment
3. Technical Analysis
4. Solution Implementation
5. Quality Verification
6. Customer Confirmation`
          },
          {
            title: "Resolution Guarantees",
            content: `• Satisfaction guarantee
• Follow-up communications
• Resolution documentation
• Prevention measures
• Continuous improvement`
          }
        ]
      }
    },
    {
      id: "self-service",
      title: "Self-Service",
      icon: <HelpCircle className="h-6 w-6" />,
      content: {
        title: "Self-Service Resources",
        mainText: "Comprehensive self-help resources at your fingertips:",
        subsections: [
          {
            title: "Knowledge Base",
            content: `• Step-by-step guides
• Video tutorials
• FAQs and troubleshooting
• Best practices
• Platform updates`
          },
          {
            title: "Training Resources",
            content: `• Online training modules
• Certification programs
• Webinar recordings
• Documentation library
• Community resources`
          }
        ]
      }
    },
    {
      id: "enterprise",
      title: "Enterprise Support",
      icon: <Users className="h-6 w-6" />,
      content: {
        title: "Enterprise Support Services",
        mainText: "Premium support services for enterprise customers:",
        subsections: [
          {
            title: "Dedicated Support",
            content: `• Named account manager
• Technical account manager
• Custom SLA agreements
• Quarterly business reviews
• Priority feature requests`
          },
          {
            title: "Enterprise Features",
            content: `• Custom integration support
• Migration assistance
• Security compliance
• Advanced training
• Infrastructure support`
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
              Customer Support
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
                  onClick={() => scrollToSection({ sectionId: section.id })}
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
              <h1 className="text-4xl font-bold text-indigo-950 mb-4">Customer Support</h1>
              <h2 className="text-2xl text-gray-600 mb-4">How we help you succeed</h2>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-12 border-b border-gray-100 pb-6">
                <span>Available 24/7</span>
                <span>•</span>
                <Link to="#" className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 transition duration-200">
                  Contact Support <MessageCircle className="h-4 w-4" />
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