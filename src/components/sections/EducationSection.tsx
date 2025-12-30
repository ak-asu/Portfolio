import { motion } from "framer-motion";
import { ArcReactorIcon } from "@/components/ui/ArcReactor";
import educationDataRaw from "@/data/education.json";

// Format period from start and end years
const formatPeriod = (startYear: number, endYear: number) => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sept",
    "Oct",
    "Nov",
    "Dec",
  ];
  const currentYear = new Date().getFullYear();
  const isOngoing = endYear >= currentYear;

  return `${months[7]} ${startYear} - ${isOngoing ? "Present" : `${months[4]} ${endYear}`}`;
};

// Format subjects into description
const formatDescription = (
  subjects: Array<{ name: string; grade: string }>,
) => {
  if (!subjects || subjects.length === 0)
    return "Comprehensive program in Computer Science.";

  const courseList = subjects.map((s) => `${s.name} (${s.grade})`).join(", ");
  return `Key Courses: ${courseList}`;
};

// Transform education data to match component structure
const educationData = educationDataRaw.map((edu, index) => ({
  id: index + 1,
  degree: `${edu.degree} in ${edu.field}`,
  institution: edu.institution,
  period: formatPeriod(edu.startDate, edu.endDate),
  score: `GPA: ${edu.gpa}/4.0`,
  description: formatDescription(edu.subjects),
}));

const EducationCard = ({
  education,
  index,
}: {
  education: (typeof educationData)[0];
  index: number;
}) => {
  return (
    <motion.div
      className="relative group"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
    >
      {/* Card Frame */}
      <div
        className="relative rounded-xl p-0.75"
        style={{
          background:
            "linear-gradient(180deg, hsl(44 90% 55%) 0%, hsl(44 98% 39%) 50%, hsl(44 100% 25%) 100%)",
        }}
      >
        <div
          className="relative rounded-xl p-4 sm:p-5 min-h-50"
          style={{
            background:
              "linear-gradient(180deg, hsl(0 85% 30%) 0%, hsl(0 100% 20%) 100%)",
          }}
        >
          {/* Corner decorations */}
          <div className="absolute top-2 left-2 w-4 h-4 sm:w-6 sm:h-6 border-t-2 border-l-2 border-arc-blue/50 rounded-tl-lg" />
          <div className="absolute top-2 right-2 w-4 h-4 sm:w-6 sm:h-6 border-t-2 border-r-2 border-arc-blue/50 rounded-tr-lg" />
          <div className="absolute bottom-2 left-2 w-4 h-4 sm:w-6 sm:h-6 border-b-2 border-l-2 border-arc-blue/50 rounded-bl-lg" />
          <div className="absolute bottom-2 right-2 w-4 h-4 sm:w-6 sm:h-6 border-b-2 border-r-2 border-arc-blue/50 rounded-br-lg" />

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Institution Logo Placeholder */}
            <div className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-iron-red-dark border border-iron-gold/30 flex items-center justify-center">
              <span className="font-orbitron text-base sm:text-lg text-iron-gold font-bold">
                {education.institution
                  .split(" ")[0]
                  .substring(0, 3)
                  .toUpperCase()}
              </span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-orbitron text-xs sm:text-sm md:text-base uppercase text-iron-gold-light leading-tight mb-1">
                {education.degree}
              </h3>
              <p className="text-iron-gold font-rajdhani text-xs sm:text-sm mb-1">
                {education.period}
              </p>
              <p className="text-arc-blue font-orbitron text-[10px] sm:text-xs mb-2">
                {education.score}
              </p>
              <p className="text-foreground/70 font-rajdhani text-xs sm:text-sm">
                {education.description}
              </p>
            </div>
          </div>

          {/* Arc Reactor decoration */}
          <div className="absolute bottom-3 left-3">
            <ArcReactorIcon size={20} className="text-arc-blue opacity-60" />
          </div>
        </div>
      </div>

      {/* Hover glow */}
      <motion.div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ boxShadow: "0 0 30px hsl(195 100% 50% / 0.2)" }}
      />
    </motion.div>
  );
};

export const EducationSection = () => {
  return (
    <section
      id="education"
      className="relative min-h-screen w-full overflow-hidden py-12 sm:py-16 md:py-20"
    >
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-linear-to-b from-background via-iron-red-dark/20 to-background" />

        {/* Circuit pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" preserveAspectRatio="none">
            <defs>
              <pattern
                id="circuitEdu"
                patternUnits="userSpaceOnUse"
                width="60"
                height="60"
              >
                <path
                  d="M30 0 L30 30 M0 30 L60 30"
                  stroke="hsl(44 98% 39%)"
                  strokeWidth="0.5"
                  fill="none"
                />
                <circle cx="30" cy="30" r="2" fill="hsl(195 100% 50%)" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#circuitEdu)" />
          </svg>
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          className="text-center mb-8 sm:mb-12 md:mb-16"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-orbitron text-3xl sm:text-4xl md:text-5xl font-bold gold-text tracking-wider mb-3 sm:mb-4">
            EDUCATION
          </h2>
          <p className="font-orbitron text-xs sm:text-sm text-arc-blue uppercase tracking-widest">
            Academic Journey & Qualifications
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {educationData.map((education, index) => (
            <EducationCard
              key={education.id}
              education={education}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
