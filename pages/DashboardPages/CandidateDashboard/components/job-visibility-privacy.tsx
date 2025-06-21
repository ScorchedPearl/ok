import { useState, useEffect } from "react";
import { Shield, Eye, FileText, Settings, Info, User, Bell } from "lucide-react";

export default function CandidateVisibilityGuidelines() {
  const [activeSection, setActiveSection] = useState("data-visibility");

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
interface ScrollToSectionParams {
    sectionId: string;
}

const scrollToSection = ({ sectionId }: ScrollToSectionParams): void => {
    const element = document.getElementById(sectionId);
    if (element) {
        const yOffset: number = -80;
        const y: number = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
    }
};

  const sections = [
    {
      id: "data-visibility",
      title: "Data Visibility",
      icon: <Eye className="h-5 w-5" />,
      content: {
        title: "Employer Visibility",
        mainText: "Understanding what employers can see about your profile and assessment results:",
        points: [
          "Your profile information (name, contact details, professional summary)",
          "Your assessment scores and performance metrics",
          "Technical skill ratings based on completed assessments",
          "Your availability status and job preferences",
          "Professional background information you've provided"
        ]
      }
    },
    {
      id: "data-usage",
      title: "Data Usage",
      icon: <FileText className="h-5 w-5" />,
      content: {
        title: "How Your Data Is Used",
        mainText: "We use your information for the following purposes:",
        points: [
          "Matching you with relevant job opportunities",
          "Providing employers with insights about your skills",
          "Improving our assessment accuracy and relevance",
          "Customizing your platform experience",
          "Communicating updates and opportunities"
        ]
      }
    },
    {
      id: "privacy-controls",
      title: "Privacy Controls",
      icon: <Settings className="h-5 w-5" />,
      content: {
        title: "Managing Your Privacy",
        mainText: "You have control over your data visibility:",
        points: [
          "Profile visibility settings (public, limited, private)",
          "Option to hide specific assessment results",
          "Control over which employers can view your full profile",
          "Ability to limit contact from recruiters",
          "Data export and deletion options"
        ]
      }
    },
    {
      id: "best-practices",
      title: "Best Practices",
      icon: <Info className="h-5 w-5" />,
      content: {
        title: "Recommendations for Candidates",
        mainText: "Tips to manage your professional presence effectively:",
        points: [
          "Keep your profile updated with current skills and experience",
          "Regularly review your privacy settings",
          "Complete assessments that highlight your strongest skills",
          "Be selective about which information you make public",
          "Review employer requests before granting full access"
        ]
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="w-full bg-gradient-to-r from-blue-800 to-blue-900 text-white shadow-lg py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6" />
              <h1 className="text-xl font-bold">Candidate Data Visibility and Privacy Guidelines</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-4 lg:col-span-3">
            <div className="sticky top-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold mb-4 text-blue-900">Guidelines Content</h2>
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection({ sectionId: section.id })}
                    className={`w-full flex items-center gap-2 text-sm py-2 px-3 rounded-md transition duration-200 ${
                      activeSection === section.id
                        ? "bg-blue-50 text-blue-800"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <div className={activeSection === section.id ? "text-blue-600" : "text-gray-400"}>
                      {section.icon}
                    </div>
                    <span className="font-medium">{section.title}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="md:col-span-8 lg:col-span-9">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-blue-900 mb-2">Your Data Visibility</h1>
                <p className="text-gray-600">
                  Understanding how employers view your profile and how your data is used in our platform
                </p>
              </div>

              <div className="space-y-8">
                {sections.map((section) => (
                  <section key={section.id} id={section.id} className="scroll-mt-20">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-50 rounded-lg text-blue-700">
                        {section.icon}
                      </div>
                      <h2 className="text-xl font-semibold text-blue-900">
                        {section.content.title}
                      </h2>
                    </div>
                    <div className="text-gray-700 leading-relaxed">
                      <p className="mb-3">{section.content.mainText}</p>
                      <ul className="space-y-2 ml-5">
                        {section.content.points.map((point, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="min-w-4 mt-1">•</div>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </section>
                ))}
              </div>

              <div className="mt-10 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <User className="h-4 w-4" />
                  <span>
                    Having questions about your data? Contact{" "}
                    <a href="#" className="text-blue-600 hover:underline">
                      support@screenera.com
                    </a>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}