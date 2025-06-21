import { motion } from "framer-motion"
import { CheckCircle } from "lucide-react"

const practices = [
  "Implement browser lockdown features to prevent tab switching and restrict access to external resources.",
  "Use advanced proctoring software that includes video, audio, and screen monitoring to detect suspicious activities.",
  "Disable clipboard functionalities and monitor system processes to prevent copy-pasting and unauthorized software usage.",
  "Employ biometric verification at the start and randomly during exams to confirm the identity of the test taker.",
  "Analyze audio feeds and background noise to detect the presence of additional people or electronic devices.",
  "Educate students and staff on the ethical implications and rules of online examination to foster a culture of integrity."
]

export function BestPractices() {
  return (
    <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="space-y-4">
      {practices.map((practice, index) => (
        <motion.li
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="flex items-start space-x-2 text-[#1e1b4b]"
        >
          <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
          <span>{practice}</span>
        </motion.li>
      ))}
    </motion.ul>
  )
}

