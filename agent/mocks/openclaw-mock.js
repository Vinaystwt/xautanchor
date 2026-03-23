// Mock for @tetherto/wdk-agent-skills to demonstrate architectural readiness
class AgentSkills {
  constructor() {
    this.skills = [];
    console.log('OPENCLAW_MOCK: Initialized Compatibility Layer');
  }
  register(name, description) {
    this.skills.push({ name, description });
    console.log(`OPENCLAW_MOCK: Skill Registered -> ${name}: ${description}`);
  }
}
module.exports = { AgentSkills };
