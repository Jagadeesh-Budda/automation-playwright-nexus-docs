import { CheckCircle2, Zap, Terminal, Shield, Star, Trophy, Globe } from 'lucide-react';

export const ACHIEVEMENTS_CONFIG = [
  { id: "first-test", name: "First Test", icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/30", desc: "Pass your very first automation test." },
  { id: "pom-creator", name: "POM Creator", icon: Zap, color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/30", desc: "Complete a Page Object Model lesson." },
  { id: "cli-commander", name: "CLI Commander", icon: Terminal, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/30", desc: "Execute your first test from the CLI." },
  { id: "bug-hunter", name: "Bug Hunter", icon: Shield, color: "text-orange-400", bg: "bg-orange-800/20", border: "border-orange-700/50", desc: "Complete the debugging module." },
  { id: "foundations-grad", name: "Foundations Graduate", icon: Star, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", desc: "Complete 100% of the Foundations track." },
  { id: "enterprise-prac", name: "Enterprise Practitioner", icon: Star, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30", desc: "Complete 100% of the Enterprise track." },
  { id: "regulated-spec", name: "Regulated Specialist", icon: Star, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/30", desc: "Complete 100% of the Regulated track." },
  { id: "curriculum-master", name: "Curriculum Master", icon: Trophy, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30", desc: "Complete every module in the academy." },
  { id: "path-explorer", name: "Path Explorer", icon: Globe, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/30", desc: "Complete at least one lesson in all three tracks." },
];
