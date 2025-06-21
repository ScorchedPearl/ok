import { motion } from "framer-motion"
import { Activity } from "lucide-react"

const activities = [
  { description: "Implemented new ethics training program", impact: "20% reduction in ethical violations" },
  { description: "Updated documentation procedures", impact: "30% improvement in documentation accuracy" },
  { description: "Conducted compliance audit", impact: "Identified and addressed 5 major compliance gaps" },
  { description: "Launched anonymous reporting system", impact: "50% increase in incident reporting" },
]

export function CompanyActivities() {
  return (
    <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="space-y-4">
      {activities.map((activity, index) => (
        <motion.li
          key={index}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="flex items-start space-x-2"
        >
          <Activity className="h-6 w-6 text-blue-500 flex-shrink-0 mt-1" />
          <div>
            <p className="font-medium">{activity.description}</p>
            <p className="text-sm text-gray-600">{activity.impact}</p>
          </div>
        </motion.li>
      ))}
    </motion.ul>
  )
}

