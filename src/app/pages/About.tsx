import { motion } from 'motion/react';
import { Shield, Target, Zap, Users, TrendingUp } from 'lucide-react';
import { Card } from '../components/ui/card';

export function About() {
  return (
    <div className="min-h-screen pt-24 pb-20 bg-gray-50">
      
      {/* Hero Section */}
      <section className="px-4 sm:px-6 lg:px-8 bg-white py-16 border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-6 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-[#22C55E]/10 text-[#22C55E] font-semibold text-sm border border-[#22C55E]/30">
              <Shield className="w-4 h-4" />
              Our Mission
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#0f172a] mb-6">
              Empowering India's E-commerce<br />
              <span className="text-[#22C55E]">One Warehouse at a Time</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl leading-relaxed">
              At SmartGodown, we believe no business should lose money to dead stock. We're building AI-powered tools that bring enterprise-grade inventory predictability to every seller.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-[#0f172a]">Why We Do It</h2>
          <p className="text-gray-500 mt-4 max-w-2xl mx-auto">Our core principles heavily influence the predictive models we craft for our sellers.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <Zap className="w-8 h-8 text-[#22C55E]" />,
              title: "Lightning Fast Action",
              desc: "Predicting demand in real-time allows our users to reorder faster without waiting."
            },
            {
              icon: <TrendingUp className="w-8 h-8 text-[#22C55E]" />,
              title: "Data-Driven Growth",
              desc: "By cutting down on dead stock, we help small businesses free up their trapped capital."
            },
            {
              icon: <Users className="w-8 h-8 text-[#22C55E]" />,
              title: "Built for the User",
              desc: "Whether connecting WhatsApp alerts or Excel uploads, it's tailored for local workflows."
            }
          ].map((val, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
            >
              <Card className="p-8 hover:shadow-lg transition-shadow border-gray-100 bg-white">
                <div className="w-14 h-14 rounded-xl bg-[#22C55E]/10 flex items-center justify-center mb-6">
                  {val.icon}
                </div>
                <h3 className="text-xl font-bold text-[#0f172a] mb-3">{val.title}</h3>
                <p className="text-gray-600 leading-relaxed">{val.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-[#22C55E] px-4 sm:px-6 lg:px-8 text-white mt-10">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/20">
          {[
            { stat: "10K+", label: "Happy Sellers" },
            { stat: "₹50Cr", label: "Capital Recovered" },
            { stat: "95%", label: "Prediction Accuracy" },
            { stat: "24/7", label: "Automated Alerts" }
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center justify-center space-y-2">
              <span className="text-4xl md:text-5xl font-extrabold">{item.stat}</span>
              <span className="text-green-100 font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}