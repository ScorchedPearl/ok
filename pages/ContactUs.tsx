import { motion } from "framer-motion"
import { useState } from "react"
import { 
  Mail, 
  MessageSquare, 
  Phone, 
  Send, 
  Building2,
  CheckCircle2
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { NavLink } from "@/components/home/NavLink";

interface ContactCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  className?: string;
}

const ContactCard = ({ icon: Icon, title, description, className = "" }: ContactCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    whileHover={{ y: -5, transition: { duration: 0.2 } }}
    className={`group bg-gradient-to-br from-white/10 to-white/5 hover:from-white/15 hover:to-white/10 
    backdrop-blur-xl rounded-xl p-8 flex flex-col items-center text-center transition-all duration-300 
    border border-white/10 hover:border-white/20 ${className}`}
  >
    <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 p-4 rounded-xl mb-4 
    group-hover:scale-110 transition-transform duration-300">
      <Icon className="w-7 h-7 text-indigo-300" />
    </div>
    <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
    <p className="text-indigo-200 text-lg">{description}</p>
  </motion.div>
)

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    // Simulated API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    setIsSuccess(true)
    // Reset form
    setFormData({ name: "", email: "", subject: "", message: "" })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#4338ca] relative overflow-hidden pb-12 px-4">
        {/* Header/Navigation */}
      <nav className="container mx-auto px-6 py-6 flex items-center justify-between relative z-20">
        <motion.div 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.5 }}
        >
          <span className="text-white text-2xl font-bold flex items-center gap-2">
            <span className="text-3xl">✴</span> Screenera
          </span>
        </motion.div>

        <div className="hidden md:flex items-center gap-8">
          <NavLink href="/pricing">Pricing</NavLink>
          <NavLink href="/features">Features</NavLink>
          <NavLink href="/contact">Contact</NavLink>
          <NavLink href="/login" isButton>
            Try for Free
          </NavLink>
        </div>
      </nav>
      {/* Mesh Gradient Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
        {/* Geometric Patterns */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-20 h-20 border border-white/20 rounded-lg transform rotate-45" />
          <div className="absolute bottom-40 right-20 w-32 h-32 border border-white/20 rounded-full" />
          <div className="absolute top-1/3 right-1/4 w-16 h-16 border border-white/20 transform rotate-12" />
        </div>
      </div>

      <div className="container mx-auto relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 p-4 rounded-2xl inline-block mb-6"
          >
            <MessageSquare className="w-10 h-10 text-indigo-300" />
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            Let's Connect
          </h1>
          <p className="text-xl md:text-2xl text-indigo-200 max-w-3xl mx-auto leading-relaxed">
            Have questions about Screenera? Our team is here to help you find the perfect solution for your hiring needs.
          </p>
        </motion.div>

        {/* Contact Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-20 items-center">
          <ContactCard
            icon={Mail}
            title="Email Us"
            description="support@screenera.com"
          />
        </div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-8 md:p-12
          border border-white/10">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-white text-lg">Your Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    className="h-14 bg-white/5 border-white/10 text-white placeholder:text-white/50 text-lg"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-white text-lg">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    className="h-14 bg-white/5 border-white/10 text-white placeholder:text-white/50 text-lg"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="subject" className="text-white text-lg">Subject</Label>
                <Input
                  id="subject"
                  placeholder="How can we help you?"
                  className="h-14 bg-white/5 border-white/10 text-white placeholder:text-white/50 text-lg"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="message" className="text-white text-lg">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Type your message here..."
                  className="min-h-[200px] bg-white/5 border-white/10 text-white placeholder:text-white/50 text-lg"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                />
              </div>

              {isSuccess && (
                <Alert className="bg-green-500/20 border-green-500/50 text-green-200">
                  <CheckCircle2 className="h-5 w-5" />
                  <AlertDescription>
                    Message sent successfully! We'll get back to you soon.
                  </AlertDescription>
                </Alert>
              )}

              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Button
                  type="submit"
                  className="w-full h-14 bg-gradient-to-r from-indigo-500 to-purple-600 
                  hover:from-indigo-600 hover:to-purple-700 text-white text-lg font-medium 
                  rounded-xl relative overflow-hidden transition-all duration-300 shadow-lg 
                  hover:shadow-xl disabled:opacity-70"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      Send Message
                      <Send className="w-5 h-5" />
                    </div>
                  )}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                    animate={{
                      x: ["-100%", "100%"],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      repeatDelay: 0.5,
                    }}
                  />
                </Button>
              </motion.div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  )
}