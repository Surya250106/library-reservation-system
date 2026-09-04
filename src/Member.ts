import { Book } from "./Book";

/**
 * Representation of a book reservation.
 */
export interface Reservation {
  bookTitle: string;
  dueDate: Date;
}

/**
 * Abstract class representing a Library Member.
 * Acts as the Observer in the Observer Design Pattern.
 */
export abstract class Member {
  /**
   * The type of membership (e.g., standard, student, staff).
   */
  public abstract readonly type: string;

  /**
   * The maximum number of books the member can reserve.
   */
  public abstract readonly borrowingLimit: number;

  /**
   * List of active reservations for the member.
   */
  public activeReservations: Reservation[] = [];

  /**
   * Creates an instance of a Member.
   *
   * @param id The unique identifier of the member.
   * @param name The name of the member.
   */
  constructor(
    public readonly id: string,
    public readonly name: string
  ) {}

  /**
   * Receives notifications when a waitlisted book becomes available.
   *
   * @param book The book that has become available.
   */
  public update(book: Book): void {
    console.log(`Notification for ${this.name}: The book "${book.title}" is now available.`);
  }
}

/**
 * Represents a Standard Member with a limit of 3.
 */
export class StandardMember extends Member {
  public readonly type = "standard";
  public readonly borrowingLimit = 3;
}

/**
 * Represents a Student Member with a limit of 5.
 */
export class StudentMember extends Member {
  public readonly type = "student";
  public readonly borrowingLimit = 5;
}

/**
 * Represents a Staff Member with a limit of 10.
 */
export class StaffMember extends Member {
  public readonly type = "staff";
  public readonly borrowingLimit = 10;
}
