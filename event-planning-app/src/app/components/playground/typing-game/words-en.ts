// 800 common English words (4-10 letters)
export const ENGLISH_WORDS: string[] = [
  // Common verbs
  'have', 'make', 'take', 'come', 'give', 'find', 'tell', 'work', 'call', 'feel',
  'become', 'leave', 'keep', 'think', 'turn', 'start', 'show', 'hear', 'play', 'move',
  'live', 'believe', 'bring', 'happen', 'write', 'provide', 'sit', 'stand', 'lose', 'meet',
  'include', 'continue', 'learn', 'change', 'follow', 'stop', 'speak', 'read', 'spend', 'grow',
  'open', 'walk', 'offer', 'remember', 'consider', 'appear', 'buy', 'wait', 'serve', 'send',
  'expect', 'build', 'stay', 'fall', 'cut', 'reach', 'kill', 'remain', 'suggest', 'raise',
  'pass', 'sell', 'require', 'report', 'decide', 'pull', 'develop', 'agree', 'return', 'pick',
  'hope', 'create', 'watch', 'carry', 'allow', 'thank', 'receive', 'join', 'explain', 'wonder',
  'hold', 'cover', 'break', 'drive', 'enjoy', 'enter', 'catch', 'choose', 'wear', 'fight',
  'throw', 'share', 'laugh', 'arrive', 'occur', 'claim', 'form', 'save', 'manage', 'perform',

  // Common nouns - People
  'people', 'woman', 'child', 'family', 'friend', 'mother', 'father', 'brother', 'sister', 'parent',
  'husband', 'wife', 'neighbor', 'customer', 'student', 'teacher', 'doctor', 'lawyer', 'artist', 'writer',
  'player', 'driver', 'manager', 'director', 'officer', 'leader', 'member', 'worker', 'owner', 'partner',

  // Common nouns - Places
  'place', 'world', 'country', 'state', 'city', 'town', 'street', 'road', 'house', 'home',
  'room', 'office', 'school', 'church', 'store', 'market', 'garden', 'park', 'field', 'forest',
  'mountain', 'river', 'beach', 'island', 'building', 'floor', 'wall', 'door', 'window', 'kitchen',

  // Common nouns - Time
  'time', 'year', 'month', 'week', 'hour', 'minute', 'second', 'moment', 'today', 'morning',
  'evening', 'night', 'season', 'summer', 'winter', 'spring', 'autumn', 'future', 'history', 'period',

  // Common nouns - Objects
  'thing', 'book', 'paper', 'table', 'chair', 'phone', 'computer', 'screen', 'keyboard', 'letter',
  'picture', 'bottle', 'glass', 'plate', 'knife', 'spoon', 'fork', 'food', 'water', 'coffee',
  'money', 'card', 'ticket', 'gift', 'clothes', 'shirt', 'dress', 'shoe', 'coat', 'ring',

  // Common nouns - Nature
  'tree', 'flower', 'grass', 'leaf', 'plant', 'animal', 'bird', 'fish', 'horse', 'star',
  'moon', 'cloud', 'rain', 'snow', 'wind', 'fire', 'stone', 'sand', 'earth', 'ocean',

  // Common nouns - Body
  'body', 'head', 'face', 'hand', 'foot', 'finger', 'hair', 'heart', 'blood', 'brain',
  'shoulder', 'knee', 'neck', 'back', 'skin', 'bone', 'muscle', 'tooth', 'tongue', 'chest',

  // Common nouns - Abstract
  'life', 'death', 'love', 'hope', 'fear', 'dream', 'idea', 'power', 'peace', 'truth',
  'freedom', 'justice', 'beauty', 'health', 'success', 'failure', 'problem', 'solution', 'question', 'answer',
  'reason', 'result', 'effect', 'cause', 'purpose', 'value', 'price', 'cost', 'level', 'degree',

  // Adjectives
  'good', 'great', 'little', 'small', 'large', 'long', 'short', 'high', 'young', 'right',
  'different', 'important', 'early', 'certain', 'public', 'possible', 'able', 'local', 'social', 'national',
  'best', 'better', 'real', 'major', 'special', 'human', 'political', 'economic', 'whole', 'clear',
  'sure', 'full', 'hard', 'easy', 'strong', 'common', 'single', 'personal', 'open', 'late',
  'general', 'private', 'close', 'similar', 'final', 'main', 'available', 'free', 'wrong', 'true',
  'beautiful', 'wonderful', 'terrible', 'horrible', 'amazing', 'incredible', 'fantastic', 'excellent', 'perfect', 'complete',
  'happy', 'angry', 'sorry', 'afraid', 'worried', 'nervous', 'tired', 'sick', 'healthy', 'alive',
  'dead', 'rich', 'poor', 'cheap', 'expensive', 'empty', 'busy', 'quiet', 'loud', 'clean',
  'dirty', 'warm', 'cool', 'cold', 'soft', 'rough', 'smooth', 'thick', 'thin', 'deep',
  'light', 'dark', 'bright', 'sharp', 'sweet', 'bitter', 'fresh', 'wild', 'calm', 'crazy',

  // Adverbs
  'well', 'still', 'also', 'back', 'even', 'just', 'only', 'most', 'very', 'much',
  'really', 'already', 'always', 'never', 'often', 'sometimes', 'usually', 'probably', 'perhaps', 'maybe',
  'actually', 'certainly', 'clearly', 'quickly', 'slowly', 'suddenly', 'finally', 'simply', 'exactly', 'nearly',
  'almost', 'especially', 'generally', 'recently', 'currently', 'directly', 'easily', 'hardly', 'naturally', 'obviously',

  // Technical/Modern words
  'project', 'team', 'meeting', 'report', 'system', 'network', 'server', 'software', 'program', 'application',
  'function', 'method', 'process', 'analysis', 'research', 'study', 'develop', 'improve', 'organize', 'control',
  'verify', 'validate', 'confirm', 'modify', 'delete', 'copy', 'paste', 'save', 'restore', 'connect',
  'download', 'upload', 'share', 'publish', 'display', 'update', 'install', 'remove', 'setup', 'configure',

  // Additional words to reach 800
  'action', 'activity', 'agency', 'agent', 'agreement', 'aircraft', 'album', 'amount', 'analysis', 'approach',
  'area', 'argument', 'army', 'article', 'aspect', 'attention', 'attitude', 'audience', 'author', 'balance',
  'ball', 'band', 'bank', 'base', 'basis', 'battle', 'benefit', 'bill', 'block', 'board',
  'boat', 'border', 'bottom', 'branch', 'brand', 'bridge', 'brother', 'budget', 'button', 'cabinet',
  'camera', 'campaign', 'cancer', 'candidate', 'capital', 'captain', 'career', 'case', 'category', 'cell',
  'center', 'central', 'century', 'chain', 'chair', 'challenge', 'chamber', 'champion', 'chance', 'channel',
  'chapter', 'character', 'charge', 'chart', 'check', 'chemical', 'chief', 'choice', 'circle', 'citizen',
  'civil', 'class', 'classic', 'climate', 'clock', 'club', 'coach', 'coast', 'code', 'coffee',
  'cold', 'collection', 'college', 'color', 'column', 'combat', 'command', 'comment', 'commercial', 'commission',
  'committee', 'communication', 'community', 'company', 'comparison', 'competition', 'complex', 'computer', 'concept', 'concern',
  'concert', 'condition', 'conference', 'conflict', 'congress', 'connection', 'consequence', 'consumer', 'contact', 'content',
  'context', 'contract', 'contribution', 'control', 'conversation', 'corner', 'corporation', 'cost', 'council', 'count',
  'counter', 'couple', 'courage', 'course', 'court', 'cousin', 'coverage', 'creation', 'credit', 'crime',
  'criminal', 'crisis', 'critic', 'criticism', 'crowd', 'culture', 'currency', 'customer', 'cycle', 'damage',
  'dance', 'danger', 'data', 'database', 'date', 'daughter', 'deal', 'dealer', 'debate', 'debt',
  'decade', 'decision', 'defense', 'definition', 'degree', 'delay', 'delivery', 'demand', 'democracy', 'department',
  'deputy', 'description', 'design', 'designer', 'desire', 'desk', 'detail', 'development', 'device', 'dialogue',
  'diet', 'difference', 'difficulty', 'dimension', 'dinner', 'direction', 'discipline', 'discount', 'discovery', 'discussion',
  'disease', 'disk', 'display', 'distance', 'district', 'division', 'document', 'domain', 'double', 'doubt',
  'drama', 'drink', 'drug', 'dust', 'duty', 'economy', 'edge', 'edition', 'editor', 'education',
  'effect', 'efficiency', 'effort', 'election', 'element', 'emergency', 'emotion', 'emphasis', 'employee', 'employer',
  'employment', 'energy', 'engine', 'engineer', 'enterprise', 'entertainment', 'enthusiasm', 'environment', 'episode', 'equipment',
  'error', 'escape', 'essay', 'estate', 'estimate', 'evidence', 'evolution', 'examination', 'example', 'exception',
  'exchange', 'excitement', 'executive', 'exercise', 'exhibition', 'existence', 'expansion', 'expectation', 'expense', 'experience',
  'experiment', 'expert', 'explanation', 'expression', 'extension', 'extent', 'external', 'extreme', 'facility', 'factor',
  'factory', 'faith', 'false', 'familiar', 'fashion', 'fate', 'fault', 'feature', 'feedback', 'feeling',
  'fellow', 'female', 'fence', 'festival', 'fiction', 'field', 'fight', 'fighter', 'figure', 'file',
  'film', 'finance', 'finding', 'finish', 'fishing', 'fitness', 'flag', 'flash', 'flight', 'flow',
  'flower', 'focus', 'folk', 'football', 'force', 'forecast', 'foreign', 'formation', 'formula', 'fortune',
  'forum', 'foundation', 'founder', 'frame', 'framework', 'freedom', 'frequency', 'front', 'fruit', 'fuel',
  'function', 'fund', 'funding', 'funeral', 'furniture', 'gallery', 'game', 'gap', 'garage', 'garden',
  'gate', 'gender', 'generation', 'gentleman', 'giant', 'gift', 'girl', 'glass', 'global', 'goal',
  'gold', 'golden', 'golf', 'goods', 'government', 'governor', 'grade', 'graduate', 'grain', 'grand',
  'grandfather', 'grandmother', 'grant', 'grass', 'green', 'ground', 'group', 'growth', 'guard', 'guess',
  'guest', 'guidance', 'guide', 'guideline', 'guitar', 'habit', 'hall', 'hand', 'handle', 'hang',
  'harbor', 'harm', 'hate', 'headline', 'headquarters', 'heat', 'heavy', 'height', 'hell', 'help',
  'hero', 'highlight', 'highway', 'hill', 'hire', 'historian', 'hole', 'holiday', 'holy', 'honor',
  'horizon', 'horror', 'hospital', 'host', 'hotel', 'household', 'housing', 'huge', 'humor', 'hundred',
  'hunger', 'hunter', 'hunting', 'husband', 'ice', 'ideal', 'identity', 'illness', 'image', 'imagination',
  'impact', 'implement', 'importance', 'impression', 'improvement', 'incident', 'income', 'increase', 'index', 'indication',
  'individual', 'industry', 'inflation', 'influence', 'initial', 'initiative', 'injury', 'inner', 'innocent', 'innovation',
  'input', 'inquiry', 'inside', 'inspector', 'instance', 'institution', 'instruction', 'instrument', 'insurance', 'intellectual',
  'intelligence', 'intention', 'interaction', 'interest', 'internal', 'internet', 'interpretation', 'interval', 'interview', 'introduction',
  'investigation', 'investment', 'investor', 'invitation', 'iron', 'island', 'issue', 'item', 'jacket', 'joint',
  'joke', 'journal', 'journey', 'judge', 'judgment', 'juice', 'jump', 'jungle', 'junior', 'jury'
];
