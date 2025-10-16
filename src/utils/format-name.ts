export function formatUserName(
  fullName: string | null | undefined,
  maxLength: number = 12
): string {
  if (!fullName) return "User";

  const firstName = fullName.split(" ")[0];

  if (firstName.length > maxLength) {
    return firstName.substring(0, maxLength) + "...";
  }

  return firstName;
}

export function getUserInitials(fullName: string | null | undefined): string {
  if (!fullName) return "U";

  const names = fullName.split(" ");
  if (names.length === 1) return names[0].charAt(0).toUpperCase();

  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
}
