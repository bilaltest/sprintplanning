// 800 common English words (4-10 letters) - balanced difficulty
export const ENGLISH_WORDS: string[] = [
  // Common verbs (100 words)
  'have', 'make', 'take', 'come', 'give', 'find', 'tell', 'work', 'call', 'feel',
  'become', 'leave', 'keep', 'think', 'turn', 'start', 'show', 'hear', 'play', 'move',
  'live', 'believe', 'bring', 'happen', 'write', 'provide', 'sit', 'stand', 'lose', 'meet',
  'include', 'continue', 'learn', 'change', 'follow', 'stop', 'speak', 'read', 'spend', 'grow',
  'open', 'walk', 'offer', 'remember', 'consider', 'appear', 'buy', 'wait', 'serve', 'send',
  'expect', 'build', 'stay', 'fall', 'reach', 'kill', 'remain', 'suggest', 'raise', 'pass',
  'sell', 'require', 'report', 'decide', 'pull', 'develop', 'agree', 'return', 'pick', 'hope',
  'create', 'watch', 'carry', 'allow', 'thank', 'receive', 'join', 'explain', 'wonder', 'hold',
  'cover', 'break', 'drive', 'enjoy', 'enter', 'catch', 'choose', 'wear', 'fight', 'throw',
  'share', 'laugh', 'arrive', 'occur', 'claim', 'form', 'save', 'manage', 'perform', 'produce',

  // Common nouns - People (30 words)
  'people', 'woman', 'child', 'family', 'friend', 'mother', 'father', 'brother', 'sister', 'parent',
  'husband', 'wife', 'neighbor', 'customer', 'student', 'teacher', 'doctor', 'lawyer', 'artist', 'writer',
  'player', 'driver', 'manager', 'director', 'officer', 'leader', 'member', 'worker', 'owner', 'partner',

  // Common nouns - Places (30 words)
  'place', 'world', 'country', 'state', 'city', 'town', 'street', 'road', 'house', 'home',
  'room', 'office', 'school', 'church', 'store', 'market', 'garden', 'park', 'field', 'forest',
  'mountain', 'river', 'beach', 'island', 'building', 'floor', 'wall', 'door', 'window', 'kitchen',

  // Common nouns - Time (20 words)
  'time', 'year', 'month', 'week', 'hour', 'minute', 'second', 'moment', 'today', 'morning',
  'evening', 'night', 'season', 'summer', 'winter', 'spring', 'autumn', 'future', 'history', 'period',

  // Common nouns - Objects (30 words)
  'thing', 'book', 'paper', 'table', 'chair', 'phone', 'computer', 'screen', 'keyboard', 'letter',
  'picture', 'bottle', 'glass', 'plate', 'knife', 'spoon', 'fork', 'food', 'water', 'coffee',
  'money', 'card', 'ticket', 'gift', 'clothes', 'shirt', 'dress', 'shoe', 'coat', 'ring',

  // Common nouns - Nature (20 words)
  'tree', 'flower', 'grass', 'leaf', 'plant', 'animal', 'bird', 'fish', 'horse', 'star',
  'moon', 'cloud', 'rain', 'snow', 'wind', 'fire', 'stone', 'sand', 'earth', 'ocean',

  // Common nouns - Body (20 words)
  'body', 'head', 'face', 'hand', 'foot', 'finger', 'hair', 'heart', 'blood', 'brain',
  'shoulder', 'knee', 'neck', 'back', 'skin', 'bone', 'muscle', 'tooth', 'tongue', 'chest',

  // Common nouns - Abstract (30 words)
  'life', 'death', 'love', 'hope', 'fear', 'dream', 'idea', 'power', 'peace', 'truth',
  'freedom', 'justice', 'beauty', 'health', 'success', 'failure', 'problem', 'solution', 'question', 'answer',
  'reason', 'result', 'effect', 'cause', 'purpose', 'value', 'price', 'cost', 'level', 'degree',

  // Adjectives (100 words)
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

  // Adverbs (40 words)
  'well', 'still', 'also', 'back', 'even', 'just', 'only', 'most', 'very', 'much',
  'really', 'already', 'always', 'never', 'often', 'sometimes', 'usually', 'probably', 'perhaps', 'maybe',
  'actually', 'certainly', 'clearly', 'quickly', 'slowly', 'suddenly', 'finally', 'simply', 'exactly', 'nearly',
  'almost', 'especially', 'generally', 'recently', 'currently', 'directly', 'easily', 'hardly', 'naturally', 'obviously',

  // Technical/Modern words (40 words)
  'project', 'team', 'meeting', 'report', 'system', 'network', 'server', 'software', 'program', 'application',
  'function', 'method', 'process', 'analysis', 'research', 'study', 'develop', 'improve', 'organize', 'control',
  'verify', 'validate', 'confirm', 'modify', 'delete', 'copy', 'paste', 'save', 'restore', 'connect',
  'download', 'upload', 'share', 'publish', 'display', 'update', 'install', 'remove', 'setup', 'configure',

  // Additional common words (380 words)
  'action', 'activity', 'agency', 'agent', 'agreement', 'aircraft', 'album', 'amount', 'approach', 'area',
  'argument', 'army', 'article', 'aspect', 'attention', 'attitude', 'audience', 'author', 'balance', 'ball',
  'band', 'bank', 'base', 'basis', 'battle', 'benefit', 'bill', 'block', 'board', 'boat',
  'border', 'bottom', 'branch', 'brand', 'bridge', 'budget', 'button', 'cabinet', 'camera', 'campaign',
  'cancer', 'candidate', 'capital', 'captain', 'career', 'case', 'category', 'cell', 'center', 'central',
  'century', 'chain', 'challenge', 'chamber', 'champion', 'chance', 'channel', 'chapter', 'character', 'charge',
  'chart', 'check', 'chemical', 'chief', 'choice', 'circle', 'citizen', 'civil', 'class', 'classic',
  'climate', 'clock', 'club', 'coach', 'coast', 'code', 'cold', 'collection', 'college', 'color',
  'column', 'combat', 'command', 'comment', 'commercial', 'commission', 'committee', 'communication', 'community', 'company',
  'comparison', 'competition', 'complex', 'concept', 'concern', 'concert', 'condition', 'conference', 'conflict', 'congress',
  'connection', 'consequence', 'consumer', 'contact', 'content', 'context', 'contract', 'contribution', 'conversation', 'corner',
  'corporation', 'council', 'count', 'counter', 'couple', 'courage', 'course', 'court', 'cousin', 'coverage',
  'creation', 'credit', 'crime', 'criminal', 'crisis', 'critic', 'criticism', 'crowd', 'culture', 'currency',
  'cycle', 'damage', 'dance', 'danger', 'data', 'database', 'date', 'daughter', 'deal', 'dealer',
  'debate', 'debt', 'decade', 'decision', 'defense', 'definition', 'delay', 'delivery', 'demand', 'democracy',
  'department', 'deputy', 'description', 'design', 'designer', 'desire', 'desk', 'detail', 'development', 'device',
  'dialogue', 'diet', 'difference', 'difficulty', 'dimension', 'dinner', 'direction', 'discipline', 'discount', 'discovery',
  'discussion', 'disease', 'disk', 'distance', 'district', 'division', 'document', 'domain', 'double', 'doubt',
  'drama', 'drink', 'drug', 'dust', 'duty', 'economy', 'edge', 'edition', 'editor', 'education',
  'efficiency', 'effort', 'election', 'element', 'emergency', 'emotion', 'emphasis', 'employee', 'employer', 'employment',
  'energy', 'engine', 'engineer', 'enterprise', 'entertainment', 'enthusiasm', 'environment', 'episode', 'equipment', 'error',
  'escape', 'essay', 'estate', 'estimate', 'evidence', 'evolution', 'examination', 'example', 'exception', 'exchange',
  'excitement', 'executive', 'exercise', 'exhibition', 'existence', 'expansion', 'expectation', 'expense', 'experience', 'experiment',
  'expert', 'explanation', 'expression', 'extension', 'extent', 'external', 'extreme', 'facility', 'factor', 'factory',
  'faith', 'false', 'familiar', 'fashion', 'fate', 'fault', 'feature', 'feedback', 'feeling', 'fellow',
  'female', 'fence', 'festival', 'fiction', 'fight', 'fighter', 'figure', 'file', 'film', 'finance',
  'finding', 'finish', 'fishing', 'fitness', 'flag', 'flash', 'flight', 'flow', 'focus', 'folk',
  'football', 'force', 'forecast', 'foreign', 'formation', 'formula', 'fortune', 'forum', 'foundation', 'founder',
  'frame', 'framework', 'frequency', 'front', 'fruit', 'fuel', 'fund', 'funding', 'funeral', 'furniture',
  'gallery', 'game', 'gap', 'garage', 'gate', 'gender', 'generation', 'gentleman', 'giant', 'girl',
  'global', 'goal', 'gold', 'golden', 'golf', 'goods', 'government', 'governor', 'grade', 'graduate',
  'grain', 'grand', 'grandfather', 'grandmother', 'grant', 'green', 'ground', 'group', 'growth', 'guard',
  'guess', 'guest', 'guidance', 'guide', 'guideline', 'guitar', 'habit', 'hall', 'handle', 'hang',
  'harbor', 'harm', 'hate', 'headline', 'headquarters', 'heat', 'heavy', 'height', 'hell', 'help',
  'hero', 'highlight', 'highway', 'hill', 'hire', 'historian', 'hole', 'holiday', 'holy', 'honor',
  'horizon', 'horror', 'hospital', 'host', 'hotel', 'household', 'housing', 'huge', 'humor', 'hundred',
  'hunger', 'hunter', 'hunting', 'ice', 'ideal', 'identity', 'illness', 'image', 'imagination', 'impact',
  'implement', 'importance', 'impression', 'improvement', 'incident', 'income', 'increase', 'index', 'indication', 'individual',
  'industry', 'inflation', 'influence', 'initial', 'initiative', 'injury', 'inner', 'innocent', 'innovation', 'input',
  'inquiry', 'inside', 'inspector', 'instance', 'institution', 'instruction', 'instrument', 'insurance', 'intellectual', 'intelligence',
  'intention', 'interaction', 'interest', 'internal', 'internet', 'interpretation', 'interval', 'interview', 'introduction', 'investigation',
  'investment', 'investor', 'invitation', 'iron', 'item', 'jacket', 'joint', 'joke', 'journal', 'journey',
  'judge', 'judgment', 'juice', 'jump', 'jungle', 'junior', 'jury', 'kitchen', 'knowledge', 'label',
  'labor', 'lack', 'lady', 'lake', 'land', 'landscape', 'language', 'launch', 'lawn', 'layer',
  'layout', 'legacy', 'legend', 'length', 'lesson', 'library', 'license', 'limit', 'line', 'link',
  'list', 'literature', 'loan', 'location', 'logic', 'luxury', 'machine', 'magazine', 'magic', 'mail',
  'majority', 'mall', 'manner', 'manual', 'margin', 'marine', 'marriage', 'master', 'match', 'material',
  'matter', 'maximum', 'mayor', 'meal', 'meaning', 'measure', 'meat', 'mechanic', 'mechanism', 'media',
  'medical', 'medicine', 'medium', 'message', 'metal', 'midnight', 'military', 'milk', 'million', 'mine',
  'minimum', 'minister', 'ministry', 'minority', 'mirror', 'mission', 'mistake', 'mixture', 'mobile', 'mode',
  'model', 'modern', 'monitor', 'month', 'motion', 'motor', 'mountain', 'mouse', 'mouth', 'movement',
  'movie', 'muscle', 'museum', 'music', 'mystery', 'myth', 'nail', 'name', 'narrative', 'nation',
  'nature', 'navy', 'negative', 'neighbor', 'nerve', 'nest', 'news', 'noise', 'normal', 'north',
  'nose', 'note', 'notice', 'notion', 'novel', 'nurse', 'object', 'objective', 'obligation', 'observation',
  'observer', 'obstacle', 'occasion', 'occupation', 'offer', 'oil', 'opening', 'operation', 'operator', 'opinion',
  'opponent', 'opportunity', 'opposite', 'opposition', 'option', 'orange', 'orbit', 'order', 'ordinary', 'organ',
  'organization', 'origin', 'original', 'outcome', 'outline', 'output', 'outside', 'oven', 'overview', 'pain',
  'paint', 'painting', 'pair', 'palace', 'palm', 'panel', 'pants', 'parking', 'part', 'participant'
];
