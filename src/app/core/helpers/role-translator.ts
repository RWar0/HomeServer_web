const roleTranslations: Record<string, string> = {
  Admin: 'Administrator',
  Moderator: 'Moderator',
  User: 'Użytkownik',
};

/**
 * Translates a role name to a more user-friendly format.
 *
 * @param role - The role name to translate.
 * @returns string - The translated role name.
 *
 * @example
 * const translatedRole = translateRole('Admin');
 */
export function translateRole(role: string) {
  return roleTranslations[role] ?? role;
}
