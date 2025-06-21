import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import { 
  ExternalLink, Shield, Lock, Users, ScrollText, Clock, 
  ChevronRight, Database 
} from "lucide-react"

export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState("introduction");

  // Handle smooth scrolling and active section highlighting
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

  // Smooth scroll function
interface ScrollToSectionOptions {
    top: number;
    behavior: ScrollBehavior;
}

const scrollToSection = (sectionId: string): void => {
    const element: HTMLElement | null = document.getElementById(sectionId);
    if (element) {
        const yOffset: number = -80;
        const y: number = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        const scrollOptions: ScrollToSectionOptions = { top: y, behavior: "smooth" };
        window.scrollTo(scrollOptions);
    }
};

  const sections = [
    {
      id: "introduction",
      title: "Introduction",
      icon: <Shield className="h-6 w-6" />,
      content: {
        title: "Legal Information Collection and Usage",
        mainText: `Screenera ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how your personal information is collected, used, and disclosed by Screenera.`,
        subsections: [
          {
            title: "Scope of Policy",
            content: "This Privacy Policy applies to information we collect when you use our website, platform, and other online products and services (collectively, the 'Services') or when you otherwise interact with us."
          },
          {
            title: "Acceptance of Terms",
            content: "By accessing or using our Services, you signify that you have read, understood, and agree to our collection, storage, use, and disclosure of your personal information as described in this Privacy Policy."
          }
        ]
      }
    },
    {
      id: "data-collection",
      title: "Data Collection",
      icon: <Database className="h-6 w-6" />,
      content: {
        title: "Information We Collect",
        mainText: "We collect several types of information from and about users of our Services:",
        subsections: [
          {
            title: "Personal Information",
            content: `• Name and contact details
• Professional background
• Educational history
• Employment information
• Technical assessment results
• Communication preferences`
          },
          {
            title: "Technical Data",
            content: `• IP addresses
• Browser type and version
• Device information
• Operating system
• Access timestamps
• Usage patterns`
          }
        ]
      }
    },
    {
      id: "legal-basis",
      title: "Legal Basis",
      icon: <ScrollText className="h-6 w-6" />,
      content: {
        title: "Legal Basis for Processing",
        mainText: "We process your information under the following legal bases:",
        subsections: [
          {
            title: "Contractual Necessity",
            content: "Processing necessary for the performance of a contract with you or to take steps at your request before entering into a contract."
          },
          {
            title: "Legitimate Interests",
            content: "Processing necessary for our legitimate interests, provided those interests are not overridden by your rights and freedoms."
          },
          {
            title: "Legal Obligation",
            content: "Processing necessary to comply with our legal obligations."
          }
        ]
      }
    },
    {
      id: "data-usage",
      title: "Data Usage",
      icon: <Lock className="h-6 w-6" />,
      content: {
        title: "How We Use Your Information",
        mainText: "We use the collected information for various purposes:",
        subsections: [
          {
            title: "Service Provision",
            content: `• Delivering technical assessments
• Managing hiring processes
• Providing analytics and insights
• Maintaining user accounts
• Processing transactions`
          },
          {
            title: "Service Improvement",
            content: `• Analyzing usage patterns
• Developing new features
• Enhancing user experience
• Debugging and testing
• Performance optimization`
          }
        ]
      }
    },
    {
      id: "data-sharing",
      title: "Data Sharing",
      icon: <Users className="h-6 w-6" />,
      content: {
        title: "Information Sharing and Disclosure",
        mainText: "We share your information with:",
        subsections: [
          {
            title: "Service Providers",
            content: `• Cloud hosting providers
• Analytics services
• Payment processors
• Communication services
• Security vendors`
          },
          {
            title: "Legal Requirements",
            content: "We may disclose your information if required by law, regulation, legal process, or governmental request."
          }
        ]
      }
    },
    {
      id: "retention",
      title: "Data Retention",
      icon: <Clock className="h-6 w-6" />,
      content: {
        title: "Data Retention Periods",
        mainText: "We retain different types of data for specific periods:",
        subsections: [
          {
            title: "Active Data",
            content: `• Account information: Duration of account activity
• Assessment results: 12 months
• Communication records: 36 months
• Payment information: 7 years (legal requirement)`
          },
          {
            title: "Archived Data",
            content: `• Inactive accounts: 24 months
• Technical logs: 6 months
• Analytics data: 12 months
• Backup data: 30 days`
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
              Privacy Policy
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
              <h1 className="text-4xl font-bold text-indigo-950 mb-4">Privacy Policy</h1>
              <h2 className="text-2xl text-gray-600 mb-4">How Screenera handles your data</h2>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-12 border-b border-gray-100 pb-6">
                <span>Updated February 12, 2025</span>
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