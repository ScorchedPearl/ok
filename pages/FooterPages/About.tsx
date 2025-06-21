import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import { 
  Target, Users, Lightbulb, Award,
  Building2, Compass, ChevronRight,
  BarChart3, Globe2
} from "lucide-react"

export default function About() {
  const [activeSection, setActiveSection] = useState("mission");

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
      id: "mission",
      title: "Our Mission",
      icon: <Target className="h-6 w-6" />,
      content: {
        title: "Revolutionizing Skills Assessment",
        mainText: "At Screenera, we're transforming how organizations evaluate and discover talent. Our mission is to create a more efficient, fair, and accurate way to assess professional capabilities.",
        subsections: [
          {
            title: "Our Purpose",
            content: `• Democratize access to opportunities through objective skill assessment
• Eliminate bias in the hiring process through data-driven evaluation
• Enable companies to build stronger teams based on verified capabilities
• Empower candidates to showcase their true potential
• Create a more meritocratic job market`
          },
          {
            title: "Our Impact",
            content: `• 500,000+ candidates assessed
• 1000+ companies using our platform
• 40% reduction in hiring time
• 85% improvement in candidate quality
• Global presence across 30+ countries`
          }
        ]
      }
    },
    {
      id: "story",
      title: "Our Story",
      icon: <Building2 className="h-6 w-6" />,
      content: {
        title: "The Screenera Journey",
        mainText: "Founded in 2023, Screenera emerged from a simple observation: traditional hiring processes weren't effectively identifying the best talent.",
        subsections: [
          {
            title: "Our Beginning",
            content: `• Started by HR tech veterans and AI specialists
• Initial focus on software development assessment
• Rapid expansion into multiple skill domains
• Strategic partnerships with industry leaders
• Continuous innovation in assessment technology`
          },
          {
            title: "Key Milestones",
            content: `• Launch of AI-powered assessment engine
• Expansion to enterprise solutions
• Introduction of skill-based certification
• Development of predictive analytics
• Integration with major HR platforms`
          }
        ]
      }
    },
    {
      id: "approach",
      title: "Our Approach",
      icon: <Compass className="h-6 w-6" />,
      content: {
        title: "Innovation in Assessment",
        mainText: "We combine cutting-edge technology with proven assessment methodologies to deliver accurate, comprehensive skill evaluations.",
        subsections: [
          {
            title: "Technology Stack",
            content: `• AI-powered skill analysis
• Real-time assessment capabilities
• Adaptive testing algorithms
• Comprehensive analytics dashboard
• Secure assessment environment`
          },
          {
            title: "Assessment Framework",
            content: `• Multi-dimensional skill evaluation
• Industry-specific benchmarking
• Behavioral analysis integration
• Performance prediction models
• Continuous validation process`
          }
        ]
      }
    },
    {
      id: "values",
      title: "Our Values",
      icon: <Lightbulb className="h-6 w-6" />,
      content: {
        title: "What We Stand For",
        mainText: "Our values guide every decision we make and shape how we serve our clients and candidates.",
        subsections: [
          {
            title: "Core Principles",
            content: `• Integrity in assessment delivery
• Innovation in technology
• Inclusion and fairness
• Impact-driven solutions
• Continuous improvement`
          },
          {
            title: "Commitment to Excellence",
            content: `• Regular platform updates
• Rigorous quality control
• Transparent communication
• Customer-centric approach
• Sustainable practices`
          }
        ]
      }
    },
    {
      id: "team",
      title: "Our Team",
      icon: <Users className="h-6 w-6" />,
      content: {
        title: "The People Behind Screenera",
        mainText: "Our diverse team brings together expertise in HR technology, data science, psychology, and business operations.",
        subsections: [
          {
            title: "Leadership",
            content: `• Industry veterans with 50+ years combined experience
• Diverse backgrounds across tech and HR
• Published thought leaders
• Regular conference speakers
• Active community contributors`
          },
          {
            title: "Culture",
            content: `• Remote-first workplace
• Continuous learning environment
• Cross-functional collaboration
• Innovation-driven mindset
• Work-life balance focus`
          }
        ]
      }
    },
    {
      id: "future",
      title: "Future Vision",
      icon: <BarChart3 className="h-6 w-6" />,
      content: {
        title: "Looking Ahead",
        mainText: "Our roadmap is focused on expanding our impact and continuing to innovate in the skills assessment space.",
        subsections: [
          {
            title: "Strategic Goals",
            content: `• Expand to new industry verticals
• Enhance predictive capabilities
• Develop new assessment types
• Scale global presence
• Deepen industry partnerships`
          },
          {
            title: "Innovation Focus",
            content: `• Advanced AI integration
• Enhanced candidate experience
• Expanded analytics capabilities
• Mobile-first solutions
• Industry-specific tools`
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
              About Us
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
              <h1 className="text-4xl font-bold text-indigo-950 mb-4">About Screenera</h1>
              <h2 className="text-2xl text-gray-600 mb-4">Transforming Talent Assessment</h2>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-12 border-b border-gray-100 pb-6">
                <Globe2 className="h-4 w-4" />
                <span>Global presence</span>
                <span>•</span>
                <Award className="h-4 w-4" />
                <span>Industry leader in skills assessment</span>
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