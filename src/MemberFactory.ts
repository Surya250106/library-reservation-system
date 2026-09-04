import { Member, StandardMember, StudentMember, StaffMember } from "./Member";

/**
 * Factory class for creating Member instances.
 * Implements the Factory Design Pattern.
 */
export class MemberFactory {
  private static memberIdCounter = 0;

  /**
   * Creates a Member subclass instance based on the provided type.
   *
   * @param type The membership type ("standard", "student", or "staff").
   * @param name The name of the member.
   * @returns A concrete instance of Member.
   * @throws Error if the provided member type is invalid.
   */
  public static createMember(type: string, name: string): Member {
    const id = `M-${++this.memberIdCounter}`;
    const normalizedType = type.toLowerCase().trim();

    switch (normalizedType) {
      case "standard":
        return new StandardMember(id, name);
      case "student":
        return new StudentMember(id, name);
      case "staff":
        return new StaffMember(id, name);
      default:
        throw new Error(`Invalid member type: "${type}". Supported types are: standard, student, staff.`);
    }
  }
}
