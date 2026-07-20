const roleTranslations: Record<string, string> = {
  Admin: 'Administrator',
  Moderator: 'Moderator',
  User: 'Użytkownik',
};

export function translateRole(role: string) {
  return roleTranslations[role] ?? role;
}
