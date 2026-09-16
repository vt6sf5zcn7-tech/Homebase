/**
 * Subject Emoji & Category Recognition Utility
 * Provides intelligent emoji tagging and color mapping for high school subjects.
 */

export interface SubjectEmojiOption {
  emoji: string;
  name: string;
  category: string;
}

export const SUBJECT_EMOJIS_LIST: SubjectEmojiOption[] = [
  // Sciences
  { emoji: '🧪', name: 'Chemistry / Lab', category: 'Science' },
  { emoji: '🧬', name: 'Biology / Life Science', category: 'Science' },
  { emoji: '⚛️', name: 'Physics / Physical Science', category: 'Science' },
  { emoji: '🔬', name: 'Anatomy / Forensics / Research', category: 'Science' },
  { emoji: '🌿', name: 'Environmental Science / Botany', category: 'Science' },
  { emoji: '🔭', name: 'Astronomy / Earth Science', category: 'Science' },

  // Mathematics
  { emoji: '📐', name: 'Geometry / Trigonometry', category: 'Math' },
  { emoji: '🔢', name: 'Algebra / Pre-Calculus', category: 'Math' },
  { emoji: '📈', name: 'Calculus / Advanced Math', category: 'Math' },
  { emoji: '📊', name: 'Statistics / Data Science', category: 'Math' },
  { emoji: '🧮', name: 'Accounting / Math Lab', category: 'Math' },

  // English & Language Arts
  { emoji: '📚', name: 'English Literature / AP Lit', category: 'English' },
  { emoji: '✍️', name: 'Creative Writing / Composition', category: 'English' },
  { emoji: '📰', name: 'Journalism / Publications', category: 'English' },
  { emoji: '📖', name: 'Reading / Language Arts', category: 'English' },

  // History & Social Studies
  { emoji: '🏛️', name: 'US History / Government', category: 'Social Studies' },
  { emoji: '🌍', name: 'World History / Global Studies', category: 'Social Studies' },
  { emoji: '📜', name: 'European / Ancient History', category: 'Social Studies' },
  { emoji: '⚖️', name: 'Law / Civics / Criminal Justice', category: 'Social Studies' },
  { emoji: '💵', name: 'Economics / AP Micro/Macro', category: 'Social Studies' },
  { emoji: '🧠', name: 'Psychology / Human Behavior', category: 'Social Studies' },
  { emoji: '👥', name: 'Sociology / Anthropology', category: 'Social Studies' },

  // World Languages
  { emoji: '🇪🇸', name: 'Spanish / Español', category: 'Languages' },
  { emoji: '🇫🇷', name: 'French / Français', category: 'Languages' },
  { emoji: '🇮🇹', name: 'Italian / Italiano', category: 'Languages' },
  { emoji: '🇨🇳', name: 'Mandarin / Chinese', category: 'Languages' },
  { emoji: '🇯🇵', name: 'Japanese / Nihongo', category: 'Languages' },
  { emoji: '🇩🇪', name: 'German / Deutsch', category: 'Languages' },
  { emoji: '🏛️', name: 'Latin / Classical Studies', category: 'Languages' },
  { emoji: '🗣️', name: 'ASL / Sign Language', category: 'Languages' },

  // Technology & Computer Science
  { emoji: '💻', name: 'Computer Science / Coding', category: 'Tech' },
  { emoji: '🤖', name: 'Robotics / Automation', category: 'Tech' },
  { emoji: '⚙️', name: 'Engineering / CAD / Architecture', category: 'Tech' },
  { emoji: '🌐', name: 'Web Design / Media Tech', category: 'Tech' },

  // Arts & Music
  { emoji: '🎨', name: 'Studio Art / Drawing / Painting', category: 'Arts' },
  { emoji: '🏺', name: 'Ceramics / Sculpture', category: 'Arts' },
  { emoji: '📸', name: 'Photography / Digital Art', category: 'Arts' },
  { emoji: '🎵', name: 'Band / Concert Band / Jazz', category: 'Music' },
  { emoji: '🎻', name: 'Orchestra / Strings', category: 'Music' },
  { emoji: '🎤', name: 'Chorus / Choir / Vocal', category: 'Music' },
  { emoji: '🎭', name: 'Theater / Drama / Acting', category: 'Arts' },

  // Physical Education & Health
  { emoji: '🏃', name: 'Physical Education / Gym', category: 'PE & Health' },
  { emoji: '🏀', name: 'Team Sports / Athletics', category: 'PE & Health' },
  { emoji: '🏋️', name: 'Weight Training / Fitness', category: 'PE & Health' },
  { emoji: '🩺', name: 'Health / First Aid / Wellness', category: 'PE & Health' },

  // School Daily Life & Periods
  { emoji: '🥪', name: 'Lunch / Cafeteria / Commons', category: 'Daily Life' },
  { emoji: '📖', name: 'Study Hall / Library / Free', category: 'Daily Life' },
  { emoji: '🧭', name: 'Advisory / Homeroom / Guidance', category: 'Daily Life' },
  { emoji: '💼', name: 'Business / Finance / Marketing', category: 'Elective' },
  { emoji: '⚡', name: 'General Elective / Seminar', category: 'Elective' },
  { emoji: '📘', name: 'Standard Course / Academic', category: 'General' },
];

/**
 * Automatically determine the best emoji for a subject based on title keywords.
 */
export function getSubjectEmoji(name: string = '', isStudyHall?: boolean): string {
  const lower = name.toLowerCase().trim();

  // Study hall or Free period
  if (isStudyHall || lower.includes('study hall') || lower.includes('free period') || lower.includes('resource') || lower.includes('library')) {
    return '📖';
  }

  // Lunch
  if (lower.includes('lunch') || lower.includes('cafeteria') || lower.includes('commons')) {
    return '🥪';
  }

  // Homeroom / Advisory
  if (lower.includes('homeroom') && !lower.includes('history')) {
    return '🧭';
  }
  if (lower.includes('advisory') || lower.includes('guidance')) {
    return '🧭';
  }

  // Science
  if (lower.includes('chem') || lower.includes('chemistry')) return '🧪';
  if (lower.includes('bio') || lower.includes('biology') || lower.includes('genetics')) return '🧬';
  if (lower.includes('physic') || lower.includes('physics')) return '⚛️';
  if (lower.includes('anat') || lower.includes('anatomy') || lower.includes('forensic')) return '🔬';
  if (lower.includes('environ') || lower.includes('ecology') || lower.includes('earth')) return '🌿';
  if (lower.includes('astro') || lower.includes('astronomy')) return '🔭';
  if (lower.includes('science') || lower.includes('sci-') || lower.includes('lab')) return '🧪';

  // Math
  if (lower.includes('geom') || lower.includes('geometry') || lower.includes('trig')) return '📐';
  if (lower.includes('calc') || lower.includes('calculus')) return '📈';
  if (lower.includes('stat') || lower.includes('statistics') || lower.includes('data')) return '📊';
  if (lower.includes('algeb') || lower.includes('algebra') || lower.includes('pre-calc') || lower.includes('math')) return '🔢';

  // English
  if (lower.includes('lit') || lower.includes('literature') || lower.includes('ap lit') || lower.includes('english')) return '📚';
  if (lower.includes('writing') || lower.includes('composition') || lower.includes('creative')) return '✍️';
  if (lower.includes('journal') || lower.includes('newspaper') || lower.includes('publication')) return '📰';
  if (lower.includes('lang arts') || lower.includes('reading')) return '📖';

  // History & Social Studies
  if (lower.includes('apush') || lower.includes('us history') || lower.includes('u.s. history') || lower.includes('history')) return '🏛️';
  if (lower.includes('gov') || lower.includes('government') || lower.includes('civics') || lower.includes('politics')) return '⚖️';
  if (lower.includes('econ') || lower.includes('economics') || lower.includes('macro') || lower.includes('micro')) return '💵';
  if (lower.includes('psych') || lower.includes('psychology')) return '🧠';
  if (lower.includes('socio') || lower.includes('sociology') || lower.includes('global') || lower.includes('world hist')) return '🌍';
  if (lower.includes('euro') || lower.includes('ancient') || lower.includes('western')) return '📜';

  // Languages
  if (lower.includes('span') || lower.includes('spanish') || lower.includes('español')) return '🇪🇸';
  if (lower.includes('french') || lower.includes('français')) return '🇫🇷';
  if (lower.includes('ital') || lower.includes('italian')) return '🇮🇹';
  if (lower.includes('mandarin') || lower.includes('chinese')) return '🇨🇳';
  if (lower.includes('japan') || lower.includes('japanese')) return '🇯🇵';
  if (lower.includes('germ') || lower.includes('german')) return '🇩🇪';
  if (lower.includes('latin')) return '🏛️';
  if (lower.includes('sign lang') || lower.includes('asl')) return '🗣️';

  // Tech & Engineering
  if (lower.includes('robot') || lower.includes('robotics')) return '🤖';
  if (lower.includes('eng') && (lower.includes('cad') || lower.includes('drafting') || lower.includes('intro to eng'))) return '⚙️';
  if (lower.includes('comp') || lower.includes('coding') || lower.includes('program') || lower.includes('cs') || lower.includes('csp') || lower.includes('csa')) return '💻';
  if (lower.includes('web') || lower.includes('tech')) return '💻';

  // Arts & Music
  if (lower.includes('orchestra') || lower.includes('string')) return '🎻';
  if (lower.includes('band') || lower.includes('jazz') || lower.includes('brass')) return '🎵';
  if (lower.includes('chorus') || lower.includes('choir') || lower.includes('vocal')) return '🎤';
  if (lower.includes('theater') || lower.includes('theatre') || lower.includes('drama') || lower.includes('acting')) return '🎭';
  if (lower.includes('photo') || lower.includes('photography')) return '📸';
  if (lower.includes('ceramic') || lower.includes('sculpture') || lower.includes('pottery')) return '🏺';
  if (lower.includes('art') || lower.includes('draw') || lower.includes('paint') || lower.includes('studio')) return '🎨';

  // PE & Health
  if (lower.includes('gym') || lower.includes('pe') || lower.includes('phys ed') || lower.includes('physical education')) return '🏃';
  if (lower.includes('health') || lower.includes('first aid') || lower.includes('wellness')) return '🩺';
  if (lower.includes('weight') || lower.includes('fitness') || lower.includes('training')) return '🏋️';
  if (lower.includes('sports') || lower.includes('athletic')) return '🏀';

  // Business
  if (lower.includes('business') || lower.includes('market') || lower.includes('finance') || lower.includes('entrepreneur')) return '💼';

  return '📘';
}

/**
 * Get subject category string
 */
export function getSubjectCategory(name: string = ''): string {
  const lower = name.toLowerCase();
  if (lower.includes('chem') || lower.includes('bio') || lower.includes('physic') || lower.includes('science')) return 'Science';
  if (lower.includes('calc') || lower.includes('geom') || lower.includes('algeb') || lower.includes('math') || lower.includes('stat')) return 'Math';
  if (lower.includes('lit') || lower.includes('english') || lower.includes('writing') || lower.includes('journal')) return 'English';
  if (lower.includes('hist') || lower.includes('gov') || lower.includes('econ') || lower.includes('psych') || lower.includes('civic')) return 'Social Studies';
  if (lower.includes('span') || lower.includes('french') || lower.includes('ital') || lower.includes('mandarin') || lower.includes('latin')) return 'World Language';
  if (lower.includes('comp') || lower.includes('robot') || lower.includes('cad') || lower.includes('tech') || lower.includes('eng')) return 'Technology';
  if (lower.includes('art') || lower.includes('band') || lower.includes('choir') || lower.includes('orchestra') || lower.includes('theater')) return 'Arts & Music';
  if (lower.includes('gym') || lower.includes('pe') || lower.includes('health') || lower.includes('athletic')) return 'Phys Ed & Health';
  if (lower.includes('lunch') || lower.includes('commons')) return 'Lunch';
  if (lower.includes('study') || lower.includes('free')) return 'Study Hall';
  return 'Elective';
}
