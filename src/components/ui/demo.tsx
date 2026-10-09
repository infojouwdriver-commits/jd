
import { motion } from "framer-motion";

export function HeroScrollDemo() {
  return (
    <section className="w-full py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-10 text-center">
          <h2 className="text-3xl md:text-5xl font-black text-white">
            Build the Future of Mobility
          </h2>
          <p className="mt-4 text-base md:text-lg text-white/70 max-w-2xl mx-auto">
            Every trip you manage today becomes a stronger, smarter, and more trusted platform tomorrow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, amount: 0.3 }}
            className="rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm"
          >
            <img
              src="https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=1400&q=80"
              alt="Professional taxi team operating in a modern city"
              className="h-72 w-full object-cover"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            viewport={{ once: true, amount: 0.3 }}
            className="rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm"
          >
            <img
              src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1400&q=80"
              alt="Driver dashboard and intelligent transport workflow"
              className="h-72 w-full object-cover"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
