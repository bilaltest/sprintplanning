/**
 * Extrait l'userId depuis le token d'authentification
 * Format du token: token_userId_timestamp
 */
export function extractUserIdFromToken(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return null;
  }

  const tokenParts = token.split('_');
  if (tokenParts.length !== 3 || tokenParts[0] !== 'token') {
    return null;
  }

  return tokenParts[1];
}

/**
 * Retourne le nom d'affichage d'un utilisateur au format "Prenom N."
 */
export function getUserDisplayName(user) {
  if (!user) {
    return null;
  }

  return `${user.firstName} ${user.lastName.charAt(0)}.`;
}
