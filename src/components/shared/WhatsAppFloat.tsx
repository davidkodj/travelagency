'use client'
import { motion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'

export default function WhatsAppFloat() {
  const wa = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '22890000000'
  return (
    <motion.a
      href={`https://wa.me/${wa}`}
      target="_blank" rel="noopener noreferrer"
      className="wa-float"
      aria-label="Contacter sur WhatsApp"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 2.5, type: 'spring', stiffness: 260, damping: 20 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.92 }}
    >
      <MessageCircle className="w-6 h-6 text-white" />
    </motion.a>
  )
}
